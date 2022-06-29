// import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core'
import { Request, Response } from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import { DataSource } from 'typeorm'

// export type MikroORMContext = {
//   em: EntityManager<IDatabaseDriver<Connection>>
//   req: Request & { session: session.Session & Partial<session.SessionData> & { userID?: number } }
//   res: Response
//   redis: Redis
// }

export type TypeORMContext = {
  orm: DataSource
  req: Request & { session: session.Session & Partial<session.SessionData> & { userID?: number } }
  res: Response
  redis: Redis
}