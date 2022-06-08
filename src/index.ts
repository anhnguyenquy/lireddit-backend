import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up() // automatically runs the migration generated from mikro-orm migration:create

  const app = express()
  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
  app.get('/', (req, res) => {
    res.send('hello world')
  })

  // Creates a GraphQL endpoint
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em }) // Makes the EntityManager (em) available in the resolvers
  })

  await apolloServer.start()

  // Bind the endpoint to an express server
  apolloServer.applyMiddleware({ app })

  // const post = orm.em.create(Post, {
  //   title: 'my first post',
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  // })

  // await orm.em.persistAndFlush(post) // commit the changes to the database

  // const posts = await orm.em.find(Post, {}) // the second parameter is the where clause
  // console.log(posts)
}

main().catch((err) => {
  console.error(err)
})