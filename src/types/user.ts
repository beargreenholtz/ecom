import { Document } from 'mongoose';
import type { Request } from 'express';

enum UserEnum {
  'user',
  'admin',
  'moderator',
  'guest',
}

export type TUser = Document & {
  readonly _id: string;
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  password: string;
  readonly role: UserEnum;
  readonly orders: string[];
  readonly reviews: string[];
  readonly googleId: string;
  resetToken?: string;
  resetTokenExpiration?: number;
};

type TBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  otp?: string;
  newPassword?: string;
};

type TParams = {
  resetToken?: string;
};

export type TRequest = Request<TParams, {}, TBody>;
