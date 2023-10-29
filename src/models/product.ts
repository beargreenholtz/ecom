import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  reviews: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Review' }],
});

export default mongoose.model('Product', productSchema);
