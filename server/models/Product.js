const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  date: String,
  reviewerName: String,
  reviewerEmail: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
  },
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: {
    type: String,
    default: 'In Stock',
  },
  reviews: [reviewSchema],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  images: [String],
  thumbnail: String,
  isPublished: {
    type: Boolean,
    default: true,
    index: true,
  },
}, { timestamps: true });

// Text index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
