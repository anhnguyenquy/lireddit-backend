
import { Post } from '../entities/Post'
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { Context } from '../types'

@Resolver()
export class PostResolver {
  @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
  post(
    @Ctx() ctx: Context,
    @Arg('id', () => Int) id: number, // Arg validates the type of the argument else it throws an error
  ): Promise<Post | null> {
    return ctx.em.findOne(Post, { id })
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


  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Ctx() ctx: Context,
    @Arg('title', () => String) title: string,
  ): Promise<Post | null> {
    const post = ctx.em.create(Post, { title })
    await ctx.em.persistAndFlush(post) // commit the changes to the database
    return post
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
    @Ctx() ctx: Context,
    @Arg('title', () => String) title: string,
    @Arg('id', () => Int) id: number,
  ): Promise<Post | null> { 
    const post = await ctx.em.findOne(Post, { id }) // the second parameter is the where clause
    if (!post) {       // use find() to get many posts that matches the where clause 
      return null
    }
    if (typeof title !== 'undefined') {
      post.title = title
      await ctx.em.persistAndFlush(post)
    }
    return post
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(
    @Ctx() ctx: Context,
    @Arg('id', () => Int) id: number
  ): Promise<boolean> {
    try {
      const post = await ctx.em.nativeDelete(Post, { id })
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