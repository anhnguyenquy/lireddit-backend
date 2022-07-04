import argon2 from 'argon2'
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import { v4 } from 'uuid'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities'
import { EmailUsernamePasswordInput, ForgotPasswordResponse, LoginInputs, UserResponse } from '../graphql-types'
import { Context } from '../types'
import { isValidEmail, sendEmail, validateLogin, validateRegister } from '../utils'

@Resolver(User)
export class UserResolver {

  @FieldResolver(() => String)
  email(
    @Root() user: User,
    @Ctx() { req }: Context
  ): string | null {
    if (req.session.userId === user.id) {
      return user.email!
    }
    return ''
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: Context
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [{
          field: 'newPassword',
          message: 'Password must be at least 8 characters.'
        }]
      }
    }
    if (newPassword.length > 128) {
      return {
        errors: [{
          field: 'newPassword',
          message: 'Password must not be longer than 128 characters.'
        }]
      }
    }

    const redisKey = FORGET_PASSWORD_PREFIX + token

    const userId = await redis.get(redisKey)
    if (!userId) { // Assuming the user doesn't tamper with the token, if the token is not found in redis, it means it has expired.
      return {
        errors: [{
          field: 'token',
          message: 'Token invalid/expired.'
        }]
      }
    }
    const id = parseInt(userId)
    const user = await User.findOneBy({ id })

    if (!user) {
      return {
        errors: [{
          field: 'token',
          message: 'User no longer exists.'
        }]
      }
    }

    await User.update({ id }, { password: await argon2.hash(newPassword) })
    await redis.del(redisKey)    // deletes the token from redis so that the link can only be used once

    req.session.userId = user.id // logs in after changing password

    return { user }
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: Context
  ): Promise<ForgotPasswordResponse> {
    if (!isValidEmail(email)) {
      return {
        errors: [{
          field: 'email',
          message: 'Invalid email.'
        }],
        success: false
      }
    }

    const user = await User.findOneBy({ email })
    if (!user) {               // if email not in db, do nothing and not notify the user about it for security
      return { success: true }
    }

    const token = v4()         // expires (automatically gets deleted from redis) in 3 days
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 3)

    await sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`
    )
    return { success: true }
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | null> {
    // user not logged in
    if (!req.session.userId) {
      return null
    }
    return User.findOneBy({ id: req.session.userId })
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => EmailUsernamePasswordInput)
    options: EmailUsernamePasswordInput,
    @Ctx() { orm, req }: Context
  ): Promise<UserResponse> {
    const { email, username, password } = options
    const errors = validateRegister(email, username, password)
    if (errors) {
      return { errors }
    }
    const hashedPassword = await argon2.hash(password)
    let user
    try {
      const result = await orm.createQueryBuilder().insert().into(User).values({
        email,
        username,
        password: hashedPassword
      }).returning('*').execute()
      user = result.raw[0]
    }
    catch (err) {
      if (err.code == '23505') {
        const erroneousField: string = err.detail.slice(err.detail.indexOf('(') + 1, err.detail.indexOf(')'))
        return {
          errors: [{
            field: erroneousField,
            message: `${erroneousField.charAt(0).toUpperCase() + erroneousField.slice(1)} already taken.`
          }]
        }
      }
      console.error(err)
    }
    req.session.userId = user.id // automatically initialise a session when registered successfully
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
    @Arg('options', () => LoginInputs)
    options: LoginInputs,
    @Ctx() { req }: Context
  ): Promise<UserResponse> {
    const { emailOrUsername, password } = options
    const { input, errors } = validateLogin(emailOrUsername, password)
    if (errors) {
      return { errors }
    }
    let user: User | null
    try {
      user = await User.findOneBy(
        input == 'Email' ? { email: emailOrUsername } : { username: emailOrUsername }
      )
      if (!user) {
        return {
          errors: [{
            field: 'emailOrUsername',
            message: `${input} doesn\'t exist.`
          }]
        }
      }
    }
    catch (err) {
      return {
        errors: [{
          field: 'emailOrUsername',
          message: 'Internal server error.'
        }]
      }
    }
    const valid = await argon2.verify(user!.password!, password) // validates whether user input matches hashed password
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'Incorrect password!'
        }]
      }
    }

    /*
      When logged in succesfully:
      - Initialise the req.session object by setting the userId property to the user.id. 
      The req.session object will then be saved to the store (in this case redis).
      - Because req.session has just been initialised,
      a new cookie with a newly generated session ID will be sent to the client and set to the browser.
      
      The cookie will be stored in the browser and will be sent back to the server on each request.
      When the server sees a valid session cookie, it fetches the session data from the store using
      the session ID and attaches that data to the request object.
    */
    req.session.userId = user.id

    return { user }
  }

  /*
    mutation {
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {

    /* 
      Here we use Promise instead of async/await because 
      req.session.destroy is not an asynchronous function and instead requires a callback.
      What is passed into resolve is the return value of the logout resolver function.
    */
    return new Promise((resolve) => {
      req.session.destroy(err => {    // empties req.session and deletes the session from redis
        res.clearCookie(COOKIE_NAME,  // unsets the cookie
          { // enable the options for it to work in apollo
            // sameSite: 'none', 
            // secure: true
          }
        )
        if (err) {
          console.error(err)
          resolve(false)
        }
        else {
          resolve(true)
        }
      })
    })
  }
} 