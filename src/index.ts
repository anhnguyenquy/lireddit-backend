import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver, PostResolver, UserResolver } from './resolvers'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { createClient } from 'redis'
import { Context } from './types'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up() // automatically runs the migration generated from mikro-orm migration:create

  const app = express()

  const RedisStore = connectRedis(session)
  const redisClient = createClient({ legacyMode: true })
  redisClient.connect().catch(console.error)

  app.set('trust proxy', !__prod__)

  /* 
    The session middleware checks for session cookie and:
  - If session cookie not there:
    + Generate a unique session ID
    + Create a new session cookie and store the generated ID inside it. Attach the cookie to the response object
    + Create an empty session object at req.session
  - If session cookie is there, then look in the session store for the session data for the current client and add that data to the request object.
  */
  app.use(
    session({
      name: 'qid', // name of the session ID cookie
      store: new RedisStore({
        client: redisClient, // telling express-session that we are using redis to store sessions
        disableTTL: true, // stops session from timing out
        disableTouch: true // stops automatically resetting ttl
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // prevents client-side javascript from accessing cookies
        sameSite: !__prod__ ? 'none' : 'lax', // prevents csrf
        secure: true /* only send cookie over https. 
                      usually this would be set to __prod__ 
                      but since Chrome allows http://localhost* to set a secure cookie, 
                      we can set it to true */
      },
      secret: process.env.REDIS_SECRET!,
      saveUninitialized: false, // don't save empty req.session objects to the store
      resave: false /* ensures express-session doesn't try to resave the session to redis
                    if it's not modified */
    })
  )

  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
  app.get('/', (req, res) => {
    res.send('hello world')
  })

  // Creates a GraphQL endpoint
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): Context => ({ em: orm.em, req, res }) // Makes the EntityManager (em) available in the resolvers
  })

  await apolloServer.start()

  // Bind the endpoint to an express server
  apolloServer.applyMiddleware({ app, cors: !__prod__ ? { credentials: true, origin: 'https://studio.apollographql.com' } : {} })

}

main().catch((err) => {
  console.error(err)
})