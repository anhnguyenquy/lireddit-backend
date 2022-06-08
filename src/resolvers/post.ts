
import { Post } from '../entities/Post'
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { MyContext } from 'src/types'

@Resolver()
export class PostResolver {
  @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
  post(
    @Ctx() ctx: MyContext,
    @Arg('id', () => Int) id: number,
  ): Promise<Post | null> {
    return ctx.em.findOne(Post, { id })
  }
  @Mutation(() => Post)
  async createPost(
    @Ctx() ctx: MyContext,
    @Arg('title') title: string,
  ): Promise<Post> {
    const post = ctx.em.create(Post, { title, createdAt: new Date(), updatedAt: new Date() })
    await ctx.em.persistAndFlush(post)
    return post
  }
}