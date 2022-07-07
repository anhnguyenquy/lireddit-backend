import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { Post, Updoot, User } from '../entities'
import { PaginatedPosts, PostInput } from '../graphql-types'
import { isAuth } from '../middlewares'
import { Context } from '../types'

@Resolver(Post)
export class PostResolver {

  // A field resolver is available for every query/mutation
  // of the types passed into @Resolver decorators, in this case Post.
  @FieldResolver(() => User)
  creator(
    @Root() root: Post,
    @Ctx() { userLoader }: Context
  ) {
    // return User.findOne({ where: { id: root.creatorId } })

    // The idea behind userLoader is that instead of generating a query for the creator in every post,
    // dataLoader batches all the userIds into an array, removes the duplicates
    //  and then generates a query for all of them at once.
    return userLoader.load(root.creatorId)
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() root: Post,
    @Ctx() { req, updootLoader }: Context
  ) {
    return req.session?.userId ?
      (await updootLoader.load({ postId: root.id, userId: req.session.userId }))?.value
      :
      null
  }

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
    @Ctx() { 
      orm,
      // req
    }: Context,
    @Arg('limit', () => Int) limit: number,

    // offset -> exclude the first n elements; cursor -> all items after a specific value
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // const { userId } = req.session
    // DESC: latest to oldest; ASC: oldest to latest
    const realLimit = Math.min(limit, 50)
    const realLimitPlusOne = realLimit + 1

    // This is unnecessary if the creator and voteStatus FieldResolvers are used
    // const posts = await orm.query(`
    //   SELECT 
    //     p.*,
    //     json_build_object('id', u.id, 'username', u.username) creator,
    //     ${userId ?
    //     `(SELECT value FROM updoot WHERE "userId" = ${userId} AND "postId" = p.id) "voteStatus"` :
    //     'null as "voteStatus"'}
    //   FROM post p INNER JOIN "user" u ON p."creatorId" = u.id
    //   ${cursor ? `WHERE p."createdAt" < '${(new Date(cursor)).toISOString()}'` : 'WHERE true'} 
    //   ORDER BY p."createdAt" DESC
    //   LIMIT ${realLimitPlusOne}
    // `)

    const posts = await orm.query(`
      SELECT *
      FROM post p
      ${cursor ? `WHERE p."createdAt" < '${(new Date(cursor)).toISOString()}'` : 'WHERE true'} 
      ORDER BY p."createdAt" DESC
      LIMIT ${realLimitPlusOne}
    `)

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length - 1 == realLimit
    }
  }

  @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
  async post(
    @Arg('id', () => Int) id: number,    // Arg validates the type of the argument else it throws an error
    // @Ctx() { orm }: Context
  ): Promise<Post | null> {

    // This is unnecessary if the creator FieldResolver is used
    // const post = (await Post.find({ where: { id }, relations: ['creator'] }))[0]
    // if (post) {
    //   delete post.creator.password
    //   delete post.creator.email
    //   delete post.creator.createdAt
    //   delete post.creator.updatedAt
    // }

    const post = (await Post.find({ where: { id } }))[0]
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('text', () => String, { nullable: true }) text: string,
    @Ctx() { orm, req }: Context
  ): Promise<Post | null> {
    // const post = await Post.findOneBy({ id, creatorId: req.session.userId })
    // if (!post) {
    //   throw new Error('Not authorised!')
    // }
    // if (typeof title != 'undefined' && title != null) {
    //   post.title = title
    // }
    // if (typeof text != 'undefined' && text != null) {
    //   post.text = text
    // }
    // await post.save()
    // return post
    const params: any = {}
    if (typeof title != 'undefined' && title != null) {
      params.title = title
    }
    if (typeof text != 'undefined' && text != null) {
      params.text = text
    }
    const updateResult = (await orm.createQueryBuilder()
      .update(Post)
      .set(params)
      .where('id = :id AND "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning('*')
      .execute())
      .raw[0]
    if (updateResult) {
      return updateResult
    }
    else {
      throw new Error('Not authorised!')
    }
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

      // Non-cascading way
      // await Updoot.delete({ postId: id })
      // await Post.delete({ id })

      // Cascading way
      await post.remove()
      return true
    }
    catch (err) {
      console.error(err)
      return false
    }

    /*
    mutation {
      deletePost(id: 1)
    }
    */
  }
}