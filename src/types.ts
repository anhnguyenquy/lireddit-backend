import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core'
import { Request, Response } from 'express'
import session from 'express-session'

export type Context = {
  em: EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session: session.Session & Partial<session.SessionData> & { userID?: number } }
  // req: Request
  res: Response
}