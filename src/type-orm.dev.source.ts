import path from 'path'
import { DataSource } from 'typeorm'
import { __prod__ } from './constants'
import { Post, Updoot, User } from './entities'

export default new DataSource({
  type: 'postgres',
  username: 'postgres',
  password: 'postgres',
  database: 'lireddit3',
  host: 'localhost',
  port: 5432,
  logging: true,
  synchronize: false,
  entities: [Post, User, Updoot],
  migrationsTableName: 'type_orm_migrations',
  migrations: [path.join(__dirname, './migrations/*')],
  cli: {
    migrationsDir: 'migrations'
  }
} as ConstructorParameters<typeof DataSource>[0])