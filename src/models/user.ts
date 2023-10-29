import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { passowrdvaliteregex } from '../utils/password-validate';
import { TUser } from 'src/types/user';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password: string) => {
        return passowrdvaliteregex.test(password);
      },
      message:
        'Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 special character.',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'guest'],
    default: 'user',
    required: false,
  },
  resetToken: { type: String, required: false },
  resetTokenExpiration: { Number: String, required: false },
  orders: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Order' }],
  reviews: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Review' }],
});

userSchema.plugin(uniqueValidator);

export default mongoose.model<TUser>('User', userSchema);
