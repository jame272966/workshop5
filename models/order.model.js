const mongoose = require('mongoose');
const { Schema } = mongoose ;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports =mongoose.model('order', orderSchema) ;