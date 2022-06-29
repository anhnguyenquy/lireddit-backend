import { DataSource } from 'typeorm'
import { Post, User } from './entities/TypeORM'
import path from 'path'

export default {
  type: 'postgres',
  database: 'lireddit2',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  synchronize: true, // create the tables automatically so we don't have to run migrations
  entities: [Post, User],
  migrationsTableName: 'type_orm_migrations',
  migrations: [path.join(__dirname, './migrations/*')],
  cli: {
    migrationsDir: 'migrations'
  }
} as ConstructorParameters<typeof DataSource>[0]