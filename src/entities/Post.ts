import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Updoot, User } from '.'

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
  
  @Field()
  @Column()
  text!: string

  @Field(() => Int)
  @Column()
  creatorId!: number // Foreign key to User.id

  @Field(() => User)
  // Many Posts are linked to One User
  @ManyToOne(() => User, user => user.posts)
  creator!: User

  @OneToMany(() => Updoot, updoot => updoot.post)
  updoots?: Updoot[]

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points!: number

  @Field(() => Int, { nullable: true })
  voteStatus?: number
}