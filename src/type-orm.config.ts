import path from 'path'
import { DataSource } from 'typeorm'
import { Post, Updoot, User } from './entities'

export default {
  type: 'postgres',
  url: process.env.DB_URL,
  logging: true,
  synchronize: false, // do not create the tables automatically and instead use the Initial migration
  entities: [Post, User, Updoot],
  migrationsTableName: 'type_orm_migrations',
  migrations: [path.join(__dirname, './migrations/*')],
  cli: {
    migrationsDir: 'migrations'
  }
} as ConstructorParameters<typeof DataSource>[0]