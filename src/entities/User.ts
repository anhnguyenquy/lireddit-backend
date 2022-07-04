import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Post, Updoot } from '.'

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

  // Here column is not nullable so that in the db there has to be an email,
  // while typescript is nullable so that we can create objects with null properties 
  // to return for graphql.
  @Field()
  @Column({ unique: true, nullable: false })
  email?: string

  // no @Field() => Does not expose the password field to GraphQL => Does not allow user to query
  @Column({ nullable: false})
  password?: string

  // One User is linked to Many Posts
  @OneToMany(() => Post, post => post.creator)
  posts!: Post[]

  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots?: Updoot[]
}