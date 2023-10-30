import { UserDocument } from '../../src/models/user';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DB_CONNECTION_STRING: string;
      readonly PORT: string;
      readonly JWT_SECRET: string;
      readonly MAIL_HOST: string;
      readonly MAIL_USER: string;
      readonly MAIL_PASS: string;
      readonly CLIENT_ID: string;
      readonly CLIENT_SECRET: string;
      readonly REDIRECT_URI: string;
      readonly SESSION_SECRET: string;
    }
  }
  namespace Express {
    interface User extends UserDocument {
      readonly id: string;
      readonly displayName?: string;
      readonly email?: string;
      readonly _id?: string;
    }
  }
}

export {};
