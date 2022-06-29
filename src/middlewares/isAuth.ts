import { TypeORMContext } from 'src/types'
import { MiddlewareFn } from 'type-graphql'

export const isAuth: MiddlewareFn<TypeORMContext> = async ({ context }, next) => {
  if (!context.req.session.userID) {
    throw new Error('Not authenticated.')
  }
  await next()
}