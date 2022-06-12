import { User } from '../entities'
import { Context } from 'src/types'
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql'
import argon2 from 'argon2'

@InputType() // InputType is for input arguments
class UsernamePasswordInput {
  @Field()
  username: string
  @Field(() => String)
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType() // ObjectType is for return values
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { em, req }: Context
  ) {
    // user not logged in
    if (!req.session.userID) {
      return null
    }
    const user = await em.findOne(User, { id: req.session.userID })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput)
    options: UsernamePasswordInput,
    @Ctx() { em, req }: Context
  ): Promise<UserResponse> {
    const { username, password } = options
    if (username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'Username must be longer than 2 characters.'
        }]
      }
    }
    if (password.length <= 5) {
      return {
        errors: [{
          field: 'password',
          message: 'Password must be longer than 5 characters.'
        }]
      }
    }
    const hashedPassword = await argon2.hash(password)
    const user = em.create(User, { username, password: hashedPassword })
    try {
      await em.persistAndFlush(user)
    }
    catch (err) {
      if (err.code == '23505') { // duplicate username error
        return {
          errors: [{
            field: 'username',
            message: 'Username already taken.'
          }]
        }
      }
      console.log('Message', err)
    }
    req.session.userID = user.id // automatically initialise a session when registered successfully
    return { user }
  }
  /*
  mutation {
    register(options: { username: "mikro", password: "password" }) { 
      id,
      username,
      createdAt,
      updatedAt
    }
  }
  */

  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput)
    options: UsernamePasswordInput,
    @Ctx() { em, req }: Context
  ): Promise<UserResponse> {
    const { username, password } = options
    if (username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'Username must be longer than 2 characters.'
        }]
      }
    }
    if (password.length <= 5) {
      return {
        errors: [{
          field: 'password',
          message: 'Password must be longer than 5 characters.'
        }]
      }
    }
    const user = await em.findOneOrFail(User, { username })
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'That username doesn\'t exist'
        }]
      }
    }
    const valid = await argon2.verify(user.password!, password) // validates whether user input matches hashed password
    if (!valid) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Incorrect password!'
          }
        ]
      }
    }

    /*
      When logged in succesfully:
      - Initialise the req.session object by setting the userID property to the user.id. 
      The req.session object will then be saved to the store (in this case redis).
      - Because req.session has just been initialised,
      a new cookie with a newly generated session ID will be sent to the client and set to the browser.
      
      The cookie will be stored in the browser and will be sent back to the server on each request.
      When the server sees a valid session cookie, it fetches the session data from the store using
      the session ID and attaches that data to the request object.
    */
    req.session.userID = user.id

    return { user }
  }
  /*
    {
      login(options: {
        username: "admin",
        password: "123456"
      }) {
        errors {
          field
          message
        }
        user {
          id 
          createdAt
          updatedAt
          username
        }
      }
    }
  */
} 
