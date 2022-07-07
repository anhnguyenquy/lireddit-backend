declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_HOST: string;
      DB_PORT: string;
      REDIS_URL: string
      DB_PORT: string;
      REDIS_SECRET: string
      CORS_ORIGIN_LOCAL: string
      CORS_ORIGIN_APOLLO: string
      CORS_ORIGIN: string
      DOMAIN_SUFFIX: string;
    }
  }
}

export {}
