import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import 'dotenv-safe/config'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { COOKIE_NAME, __prod__ } from './constants'
import { createUpdootLoader, createUserLoader } from './loaders'
import { HelloResolver, PostResolver, UserResolver } from './resolvers'
import typeORMSource from './type-orm.source'
import { Context } from './types'

const main = async () => {
  const orm = await typeORMSource.initialize()
  await orm.runMigrations()
  const app = express()
  app.use(cors({
    credentials: true,
    origin: !__prod__ ? ['http://localhost:3000', 'https://studio.apollographql.com'] :
      process.env.CORS_ORIGIN
  }))

  const RedisStore = connectRedis(session)

  const redis = new Redis(process.env.REDIS_URL)
  app.set('trust proxy', !__prod__)
  app.set('proxy', 1)

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
      name: COOKIE_NAME,        // name of the session ID cookie
      store: new RedisStore({
        client: redis,          // telling express-session that we are using redis to store sessions
        disableTTL: true,       // stops session from timing out
        disableTouch: true      // stops automatically resetting ttl
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,                         // prevents client-side javascript from accessing cookies
        sameSite: __prod__ ? 'lax' : 'none',    // prevents csrf | for apollo to work, set this to 'none'
        secure: true,                           // only send cookie over https. 
        domain: __prod__ ? process.env.DOMAIN_SUFFIX : undefined
      },
      secret: process.env.REDIS_SECRET,
      saveUninitialized: false, // don't save empty req.session objects to the store
      resave: false             // ensures express-session doesn't try to resave the session to redis
    })                          // if it's not modified
  )

  app.listen(parseInt(process.env.API_PORT!), () => {
    console.log(`Rerver started on localhost:${process.env.API_PORT}.`)
  })
  app.get('/', (_, res) => {
    res.send('This is LiReddit\'s GraphQL API. Start querying at /graphql.')
  })

  // Creates a GraphQL endpoint
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),

    // context is the object that is passed to all resolvers
    context: ({ req, res }): Context => ({
      orm,
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader()
    })
  })

  await apolloServer.start()

  // Bind the endpoint to an express server
  apolloServer.applyMiddleware({ app, cors: false }) // if cors is set here, it only applies to the /graphql endpoint
}

main().catch(console.error)