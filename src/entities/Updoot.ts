import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Post, User } from '.'

// Many to Many relationship
// user <-> posts
// user -> updoot <- post

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field(() => Int)
  @Column({ type: 'int'})
  value!: number

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  // Many Updoots are linked to One User
  @ManyToOne(() => User, user => user.updoots)
  user: User

  @Field(() => Int)
  @PrimaryColumn()
  postId!: number

  @Field(() => Post)
  // Many Updoots are linked to One Post
  @ManyToOne(() => Post, post => post.updoots, {
    onDelete: 'CASCADE' // when a post is deleted, delete the updoots linked to it as well
  })
  post: Post

}