import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
