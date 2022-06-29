
// import { Post } from '../../entities/MikroORM'
// import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
// import { MikroORMContext } from '../../types'

// @Resolver()
// export class PostResolver {

//   /*
//     If a resolver returns ansynchronous data i.e. a Promise or data got by resolving a promise (await ...),
//     the Typescript return type should be wrapped in a Promise. The resolver function needs to be async 
//     when await is specified in the function body or if 
//     (the return type is wrapped inside a Promise and 
//     data that is not the result of a resolved Promise is returned).
//   */
//   @Query(() => [Post])
//   posts(@Ctx() ctx: MikroORMContext): Promise<Post[]> {
//     return ctx.em.find(Post, {})
//   }

//   @Query(() => Post, { nullable: true }) // nullable controls whether null can be returned
//   post(
//     @Ctx() ctx: MikroORMContext,
//     @Arg('id', () => Int) id: number, // Arg validates the type of the argument else it throws an error
//   ): Promise<Post | null> {
//     return ctx.em.findOne(Post, { id })
//   }

//   /* 
//   {
//     post(id: 1) {
//       id,
//       createdAt,
//       updatedAt,
//       title 
//     }
//   }
//   */


//   @Mutation(() => Post)
//   async createPost(
//     @Ctx() ctx: MikroORMContext,
//     @Arg('title', () => String) title: string,
//   ): Promise<Post> {
//     const post = ctx.em.create(Post, { title })
//     await ctx.em.persistAndFlush(post) // commit the changes to the database
//     return post
//   }

//   /* 
//   mutation {
//     createPost(title: "my first post") { 
//       id,
//       createdAt,
//       updatedAt,
//       title 
//     }
//   }
//   */

//   @Mutation(() => Post, { nullable: true })
//   async updatePost(
//     @Ctx() ctx: MikroORMContext,
//     @Arg('title', () => String) title: string,
//     @Arg('id', () => Int) id: number,
//   ): Promise<Post | null> { 
//     const post = await ctx.em.findOne(Post, { id }) // the second parameter is the where clause
//     if (!post) {       // use find() to get many posts that matches the where clause 
//       return null
//     }
//     if (typeof title !== 'undefined') {
//       post.title = title
//       await ctx.em.persistAndFlush(post)
//     }
//     return post
//   }

//   @Mutation(() => Boolean)
//   async deletePost(
//     @Ctx() ctx: MikroORMContext,
//     @Arg('id', () => Int) id: number
//   ): Promise<boolean> {
//     try {
//       await ctx.em.nativeDelete(Post, { id })
//       return true
//     }
//     catch (err) {
//       return false
//     }

//     /*
//     mutation {
//       deletePost(id: 1)
//     }
//     */

//   }
// }