var express = require('express');
var router = express.Router();
const Order = require('../models/order.model');
const tokenMiddleware = require('../middleware/token.middleware');

router.post('/product/:id/order', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, quantity } = req.body;

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'จำนวนสินค้าต้องมากกว่า 0' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'ไม่เจอสินค้า' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ error: 'จำนวน stock ไม่เพียงพอ' });
    }

    const newOrder = new Order({
      userId,
      products: [{ productId: id, quantity }]
    });

    await newOrder.save();

    product.stock -= quantity;
    await product.save();

    res.status(201).json({
      message: 'succee',
      order: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/order', tokenMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('products.productId', 'name')
      .select('userId products');

    const result = orders.map(order => ({
      userId: order.userId,
      products: order.products.map(p => ({
        productName: p.productId?.name,
        quantity: p.quantity
      }))
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("ล้มเหลวในการค้นหา orders ทั้งหมด:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;