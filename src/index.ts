import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import mikroOrmConfig from '../mikro-orm.config'

const main = async () => {

  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up() // automatically runs the migration

  // const post = orm.em.create(Post, {
  //   title: 'my first post',
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  // })

  // await orm.em.persistAndFlush(post) // commit the changes to the database

  const posts = await orm.em.find(Post, {}) // the second parameter is the where clause
  console.log(posts)
}

main()