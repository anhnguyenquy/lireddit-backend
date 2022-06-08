import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType() // The ObjectType and Field decoraters are used to convert TypeScript types into a TypeGraphQL types
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey({ type: 'number' })
  id!: number

  @Field(() => Date)
  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt: Date

  @Field(() => Date)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date

  @Field()
  @Property({ type: 'text' })
  title!: string
}