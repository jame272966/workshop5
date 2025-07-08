var express = require('express');
var router = express.Router();
var productSchema = require('../models/product.model');
const orderSchema = require('../models/order.model');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');


router.get('/product', async function(req, res, next) {
  
    let product = await productSchema.find({});
    res.send(product);
  
});


// แสดง product ตาม  

router.get('/product/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productSchema.findById(id);
    
    if (!product) { 
      return res.status(404).json({ error: 'ไม่เจอ Product' });
    }
    
    res.status(200).json(product);
  }
  catch (error) {
    console.error("eror fetching product:", error);  
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// เพิ่ม product ใหม่

router.post('/product', async (req, res) => {
  try {
    const { name, price} = req.body;
    if (!name || !price ) {
      return res.status(400).json({ error: 'จำเป็นต้องกรอก Name, price' });
    }

    const newProduct = new productSchema({ name, price});
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// อัพเดท product เฉพาะ :id ที่ต้องการ

router.put('/product/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price} = req.body;

    if (!name && !price ) {
      return res.status(400).json({ error: 'ต้องแก้ไขอย่างน้อย 1 อย่าง (name, price) ' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = price;

    const updatedProduct = await productSchema.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'ไม่เจอ Product' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ลบรายการ product เฉพาะ :id ที่ต้องการ

router.delete('/product/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productSchema.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'ไม่เจอ Product' });
    }

    res.status(200).json({ message: 'ลบ Product สำเร็จ' });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;