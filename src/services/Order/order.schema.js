import { Schema, model } from 'mongoose';
const paginate = require('mongoose-paginate-v2');

const schema = new Schema({
  items: [{
    _id: false,
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required:true
    },
    quantity: {
      type: Number,
      required:true
    },
    itemTotal: {
      type: Number,
      required:true,
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const order = this;
  const newOrder = order.toObject();
  delete newOrder.__v;
  delete newOrder.createdAt;
  delete newOrder.updatedAt;
  return JSON.parse(JSON.stringify(newOrder).replace(/_id/g, 'id'));
};

export default model('Order', schema);
