import { __prod__ } from './src/constants'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { Post } from 'src/entities/Post'

export default {
  dbName: 'lireddit',
  user: 'postgres',
  password: 'postgres',
  debug: !__prod__,
  type: 'postgresql',
  entities: [Post],
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pathTs: undefined, // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
  }
} as Parameters<typeof MikroORM.init>[0]