import { Request, Response } from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import { DataSource } from 'typeorm'
import { createUpdootLoader, createUserLoader } from './loaders'

export type Context = {
  orm: DataSource
  req: Request & { session: session.Session & Partial<session.SessionData> & { userId?: number } }
  res: Response
  redis: Redis
  userLoader: ReturnType<typeof createUserLoader>
  updootLoader: ReturnType<typeof createUpdootLoader>
}