import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { Post, Updoot } from '../entities'
import { PaginatedPosts, PostInput } from '../graphql-types'
import { isAuth } from '../middlewares'
import { Context } from '../types'

@Resolver(Post)
export class PostResolver {

  // A field resolver is available for every query/mutation
  // of the types passed into @Resolver decorators, in this case Post.
  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50)
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async doot(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req, orm }: Context
  ) {
    const { userId } = req.session
    if (value == 0) return false
    const realValue = value > 0 ? 1 : value < 0 ? -1 : 0

    const updoot = await Updoot.findOne({ where: { postId, userId } })

    if (updoot) {
      if (updoot.value == realValue) { // user is undoing their vote
        await updoot.remove()
        const post = await Post.findOne({ where: { id: postId } })
        if (post) {
          post.points = post.points + (realValue == 1 ? -1 : 1)
          await post.save()
        }
      }
      else { // user is changing their vote
        await orm.transaction(async transactionalEntityManager => {
          updoot.value = realValue
          await transactionalEntityManager.save(updoot)
          await transactionalEntityManager.increment(Post, { id: postId }, 'points', realValue == -1 ? -2 : 2)
        })
      }
    }
    else if (!updoot) { // user has never voted
      await orm.transaction(async transactionalEntityManager => {
        const newUpdoot = new Updoot()
        newUpdoot.userId = userId!
        newUpdoot.postId = postId
        newUpdoot.value = realValue
        await transactionalEntityManager.save(newUpdoot)
        await transactionalEntityManager.increment(Post, { id: postId }, 'points', realValue)
      })
    }

    return true
  }

  /*
    If a resolver returns ansynchronous data i.e. a Promise or data got by resolving a promise (await ...),
    the Typescript return type should be wrapped in a Promise. The resolver function needs to be async 
    when await is specified in the function body or if 
    (the return type is wrapped inside a Promise and 
    data that is not the result of a resolved Promise is returned).
  */
  @Query(() => PaginatedPosts)
  async posts(
    @Ctx() { orm, req }: Context,
    @Arg('limit', () => Int) limit: number,

    // offset -> exclude the first n elements; cursor -> all items after a specific value
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const { userId } = req.session
    // DESC: latest to oldest; ASC: oldest to latest
    const realLimit = Math.min(limit, 50)
    const realLimitPlusOne = realLimit + 1
    const posts = await orm.query(`
      SELECT 
        p.*,
        json_build_object('id', u.id, 'username', u.username) creator,
        ${userId ?
        `(SELECT value FROM updoot WHERE "userId" = ${userId} AND "postId" = p.id) "voteStatus"` :
        'null as "voteStatus"'}
      FROM post p INNER JOIN "user" u ON p."creatorId" = u.id
      ${cursor ? `WHERE p."createdAt" < '${(new Date(cursor)).toISOString()}'` : 'WHERE true'} 
      ORDER BY p."createdAt" DESC
      LIMIT ${realLimitPlusOne}
    `)

    // const query = orm.getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect(
    //     'p.creator',
    //     'u', // alias of the joined data
    //     'u.id = p."creatorId"'
    //   )
    // .orderBy('p."createdAt"', 'DESC')        // in postgres, the quotes are necessary if the name of column contains upper case character(s)
    //   .take(realLimitPlusOne)                // when doing pagination, use take instead of limit
    // if (cursor) {
    //   query.where('p."createdAt" < :cursor', { // all posts created before and including cursor
    //     cursor: new Date(cursor)
    //   }) 
    // }
    // const posts = await query.getMany()
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length - 1 === realLimit
    }
  }

  @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
  async post(
    @Arg('id', () => Int) id: number,    // Arg validates the type of the argument else it throws an error
    @Ctx() { orm }: Context
  ): Promise<Post | null> {
    const post = (await Post.find({ where: { id }, relations: ['creator'] }))[0]
    if (post) {
      delete post.creator.password
      delete post.creator.email
      delete post.creator.createdAt
      delete post.creator.updatedAt
    }
    // const post = (await orm.query(`
    //   SELECT
    //     p.*,
    //     json_build_object('id', u.id, 'username', u.username) creator
    //   FROM post p INNER JOIN "user" u ON p."creatorId" = u.id
    //   WHERE p.id = ${id}
    // `))[0]
    return post
  }

  /* 
  {
    post(id: 1) {
      id,
      createdAt,
      updatedAt,
      title 
    }
  }
  */


  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(
    @Ctx() { req }: Context,
    @Arg('input', () => PostInput) input: PostInput,
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save()
  }

  /* 
  mutation {
    createPost(title: "my first post") { 
      id,
      createdAt,
      updatedAt,
      title 
    }
  }
  */

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('title', () => String) title: string,
    @Arg('id', () => Int) id: number,
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id })
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      post.title = title
      await Post.update({ id }, { title })
    }
    return post
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    try {
      const post = await Post.findOneBy({ id })
      if (!post) {
        return false
      }
      if (post.creatorId != req.session.userId) {
        throw new Error('Not authorised!')
      }
      await Updoot.delete({ postId: id })
      await Post.delete({ id })
      return true
    }
    catch (err) {
      return false
    }

    /*
    mutation {
      deletePost(id: 1)
    }
    */

  }
}