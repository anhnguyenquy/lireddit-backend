import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@ObjectType() // The ObjectType and Field decorators use TypeScript to define GraphQL types.
@Entity()
export class Post extends BaseEntity {
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
  @Column()
  title!: string

  @Field(() => Int)
  @Column()
  creatorId!: number // Foreign key to User.id

  // Many Posts are linked to One User
  @ManyToOne(() => User, user => user.posts)
  creator!: User

  @Field()
  @Column()
  text!: string

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number
}