import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { TUser } from 'src/types/user';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
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
