declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URL: string;
      REDIS_URL: string
      REDIS_SECRET: string
      API_PORT: string;
      CORS_ORIGIN: string
      DOMAIN_SUFFIX: string;
    }
  }
}

export {}
