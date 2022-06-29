import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { Post } from '../../entities/TypeORM'
import { PostInput } from '../../interfaces'
import { isAuth } from '../../middlewares'
import { TypeORMContext } from '../../types'

@Resolver(Post)
export class PostResolver {

  @FieldResolver(() => String)
  textSnippet( // A field resolver is available for every query/mutation of the type passed into @Resolver, in this case Post.
    @Root() root: Post
  ) {
    return root.text.slice(0, 50)
  }
  /*
    If a resolver returns ansynchronous data i.e. a Promise or data got by resolving a promise (await ...),
    the Typescript return type should be wrapped in a Promise. The resolver function needs to be async 
    when await is specified in the function body or if 
    (the return type is wrapped inside a Promise and 
    data that is not the result of a resolved Promise is returned).
  */
  @Query(() => [Post])
  posts(
    @Ctx() { orm }: TypeORMContext,
    @Arg('limit', () => Int) limit: number,

    // offset -> exclude the first n elements; cursor -> all items after a specific value
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    // DESC: latest to oldest; ASC: oldest to latest
    const realLimit = Math.min(limit, 50)
    const query = orm.getRepository(Post)
      .createQueryBuilder('p')
      .orderBy('"createdAt"', 'DESC') // in postgres, the quotes are necessary if the name of column contains upper case character(s)
      .take(realLimit)                // when doing pagination, use take instead of limit
    if (cursor) {
      query.where('"createdAt" < :cursor', { // all posts created before and including cursor
        cursor: new Date(cursor)
      }) 
    }
    return query.getMany()
    /*
      SELECT * FROM post p ORDER BY "createdAt" DESC LIMIT 10;
    */
  }

  @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
  post(
    @Arg('id', () => Int) id: number,    // Arg validates the type of the argument else it throws an error
  ): Promise<Post | null> {
    return Post.findOneBy({ id })
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
    @Ctx() { req }: TypeORMContext,
    @Arg('input', () => PostInput) input: PostInput,
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userID
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
  async deletePost(
    @Arg('id', () => Int) id: number
  ): Promise<boolean> {
    try {
      await Post.delete(id)
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