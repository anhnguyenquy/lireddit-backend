import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Post } from './Post'

@ObjectType() // The ObjectType and Field decorators are used to tell TypeGraphQL how to render the User entity
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Date)
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt?: Date

  @Field()
  @Column({ unique: true })
  username!: string

  @Field()
  @Column({ unique: true })
  email!: string

  // no @Field() => Does not expose the password field to GraphQL => Does not allow user to query
  @Column()
  password!: string

  // One User is linked to Many Posts
  @OneToMany(() => Post, post => post.creator)
  posts!: Post[]
}