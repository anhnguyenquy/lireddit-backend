import { __prod__ } from './constants'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { Post } from './entities/Post'

export default {
  dbName: 'lireddit',
  user: 'postgres',
  password: 'postgres',
  debug: !__prod__,
  type: 'postgresql',
  entities: [Post], // Each entity describe the shape of a column of a specific table
  allowGlobalContext: true,
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pathTs: undefined, // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
  }
} as Parameters<typeof MikroORM.init>[0]