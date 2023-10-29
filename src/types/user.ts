import { Document } from 'mongoose';

enum UserEnum {
  'user',
  'admin',
  'moderator',
  'guest',
}

export type TUser = Document & {
  readonly _id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  password: string;
  readonly role: UserEnum;
  readonly orders: string[];
  readonly reviews: string[];
  resetToken?: string;
  resetTokenExpiration?: number;
};
