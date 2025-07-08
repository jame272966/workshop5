var express = require('express');
var router = express.Router();
var userSchema = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    // เช็คเมลซ้ำ
    const existingUser = await userSchema.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: ' สมัครไม่สำเร็จ มี Email นี้ในระบบแล้ว' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new userSchema({
      email: req.body.email,
      password: hashedPassword
    });
    
    await newUser.save();
    res.status(201).json({ message: 'สมัครสำเร็จรอ approve' });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดระหว่างการสมัคร :", error);
    res.status(500).json({ error: 'ไม่ทราบสาเหตุ' });
  }
});

router.post('/login', async (req, res) => { 
  try {
    console.log("Request body:", req.body);

    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: 'กรุณาส่ง email และ password ด้วย' });
    }

    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'ไม่เจอผู้ใช้' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'ยังไม่ได้รับการ approve' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'ถูกปฏิเสธ' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'รหัสผิด' });
    }

    const token = jwt.sign(
      { email: user.email }, 
      process.env.JWT_KEY,
      { expiresIn: '48h' }
    );

    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ไม่ทราบสาเหตุ' });
  }
});

// PUT /users/:id/approved
router.put('/users/:id/approved', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'format user ID ไม่ถูกต้อง' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'การ approval status ควรจะมีแค่ "approved" หรือ "rejected"' });
    }

    const userToApprove = await userSchema.findById(id);
    if (!userToApprove) {
      return res.status(404).json({ error: 'ไม่เจอข้อมูล User' });
    }

    userToApprove.status = status;
    userToApprove.approvedAt = new Date(); 

    
    await userToApprove.save();

    
    res.status(200).json({
      message: `User ${status} สำเร็จ`,});


  } catch (error) {
    console.error("Error ในการ approve user:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


module.exports = router;