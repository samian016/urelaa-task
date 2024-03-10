/* title, category, purchasePrice, salePrice, currentStock */

import { Schema, model } from 'mongoose';
const paginate = require('mongoose-paginate-v2');


const schema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    unique:true,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  currentStock: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    trim: true,
    default:'',
  },
}, { timestamps: true });


schema.plugin(paginate);
schema.methods.toJSON = function () {
  const prod = this;
  const product = prod.toObject();
  delete product.__v;
  delete product.createdAt;
  delete product.updatedAt;
  return JSON.parse(JSON.stringify(product).replace(/_id/g, 'id'));
};

export default model('Product', schema);