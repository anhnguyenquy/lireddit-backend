import path from 'path'
import { DataSource } from 'typeorm'
import { __prod__ } from './constants'
import { Post, Updoot, User } from './entities'

export default new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  logging: true,
  synchronize: false,
  entities: [Post, User, Updoot],
  migrationsTableName: 'type_orm_migrations',
  migrations: [path.join(__dirname, './migrations/*')],
  cli: {
    migrationsDir: 'migrations'
  }
} as ConstructorParameters<typeof DataSource>[0])