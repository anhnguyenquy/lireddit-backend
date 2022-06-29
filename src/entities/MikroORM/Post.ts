// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
// import { Field, Int, ObjectType } from 'type-graphql'

// @ObjectType() // The ObjectType and Field decorators use TypeScript to define GraphQL types.
// @Entity()
// export class Post {
//   @Field(() => Int)
//   @PrimaryKey({ type: 'number' })
//   id!: number

//   @Field(() => Date)
//   @Property({ type: 'date', nullable: true })
//   createdAt?: Date = new Date()

//   @Field(() => Date)
//   @Property({ type: 'date', nullable: true, onUpdate: () => new Date() })
//   updatedAt?: Date = new Date()

//   @Field()
//   @Property({ type: 'text' })
//   title!: string
// }