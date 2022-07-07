declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URL: string;
      REDIS_URL: string;
      API_PORT: string;
      REDIS_SECRET: string
      CORS_ORIGIN: string
      DOMAIN_SUFFIX: string;
    }
  }
}

export {}
