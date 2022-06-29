// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
// import { Field, Int, ObjectType } from 'type-graphql'

// @ObjectType() // The ObjectType and Field decorators are used to tell TypeGraphQL how to render the User entity
// @Entity()
// export class User {
//   @Field(() => Int)
//   @PrimaryKey({ type: 'number' })
//   id!: number

//   @Field(() => Date)
//   @Property({ type: 'date', nullable: true })
//   createdAt?: Date = new Date()

//   @Field(() => Date)
//   @Property({ type: 'date', onUpdate: () => new Date() }) // ? makes it possible to create a new user without passing in updatedAt
//   updatedAt?: Date = new Date()

//   @Field()
//   @Property({ type: 'text', unique: true })
//   username!: string

//   @Field()
//   @Property({ type: 'text', unique: true })
//   email!: string

//   // no @Field() => Does not expose the password field to GraphQL => Does not allow user to query
//   @Property({ type: 'text' })
//   password!: string
// }