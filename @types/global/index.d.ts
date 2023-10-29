declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DB_CONNECTION_STRING: string;
      readonly PORT: string;
      readonly JWT_SECRET: string;
      readonly MAIL_HOST: string;
      readonly MAIL_USER: string;
      readonly MAIL_PASS: string;
      readonly CLIENT_URL: string;
      readonly GOOGLE_OAUTH_SECRET: string;
    }
  }
}

export {};
