const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robotics_ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const userSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  email: String,
  avatar: String,
  isAdmin: { type: Boolean, default: false },
  addresses: [{
    type: { type: String, enum: ['shipping', 'billing'] },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  discountPercentage: { type: Number, default: 0 },
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  stock: { type: Number, default: 0 },
  specifications: [{
    name: String,
    value: String
  }],
  variants: [{
    name: String,
    options: [String]
  }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  seoTitle: String,
  seoDescription: String,
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    isVerified: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    variant: String
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  discount: Number,
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingNumber: String,
  notes: String
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minimumAmount: Number,
  maximumDiscount: Number,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  validFrom: Date,
  validUntil: Date
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Coupon = mongoose.model('Coupon', couponSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin access
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility functions
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Routes

// GitHub OAuth callback
app.post('/api/auth/github', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.VITE_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ message: 'GitHub authentication failed' });
    }
    
    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
      },
    });
    
    const githubUser = await userResponse.json();
    
    // Check if user exists or create new user
    let user = await User.findOne({ githubId: githubUser.id.toString() });
    
    if (!user) {
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        avatar: githubUser.avatar_url,
        isAdmin: false // Set to true for specific GitHub accounts
      });
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      search,
      featured
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }
    if (featured === 'true') query.isFeatured = true;

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category')
      .populate('reviews.user', 'username avatar');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('parent');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order routes
app.post('/api/orders', async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      guestEmail
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant || ''
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode, 
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon && coupon.usedCount < coupon.usageLimit) {
        if (subtotal >= (coupon.minimumAmount || 0)) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maximumDiscount) {
              discount = Math.min(discount, coupon.maximumDiscount);
            }
          } else {
            discount = coupon.value;
          }
          
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping - discount;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: req.user?.id,
      guestEmail: guestEmail || req.user?.email,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress
    });

    await order.save();

    // Send confirmation emails
    const orderEmailHtml = `
      <h2>Order Confirmation - ${order.orderNumber}</h2>
      <p>Thank you for your order!</p>
      <h3>Order Details:</h3>
      <ul>
        ${orderItems.map(item => `<li>${item.quantity}x Product (${item.price})</li>`).join('')}
      </ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      <p>We'll send you tracking information once your order ships.</p>
    `;

    await sendEmail(
      guestEmail || req.user?.email,
      `Order Confirmation - ${order.orderNumber}`,
      orderEmailHtml
    );

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Order - ${order.orderNumber}`,
      `New order received: ${order.orderNumber} - Total: $${total.toFixed(2)}`
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
app.post('/api/admin/products', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    
    // Generate slug from name
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const product = new Product({
      ...productData,
      slug,
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    
    // Handle uploaded images
    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Merge existing images with new ones
    const images = [...(productData.existingImages || []), ...newImages];
    
    Object.assign(product, { ...productData, images });
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    await order.save();

    // Send status update email
    const statusEmailHtml = `
      <h2>Order Status Update - ${order.orderNumber}</h2>
      <p>Your order status has been updated to: <strong>${status}</strong></p>
      ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
    `;

    await sendEmail(
      order.guestEmail || order.user?.email,
      `Order Update - ${order.orderNumber}`,
      statusEmailHtml
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Categories admin routes
app.post('/api/admin/categories', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const category = new Category({
      name,
      slug,
      description,
      image,
      parent: parent || null
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coupons admin routes
app.post('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics routes
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coupon validation
app.post('/api/validate-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    if (subtotal < (coupon.minimumAmount || 0)) {
      return res.status(400).json({ 
        message: `Minimum order amount of $${coupon.minimumAmount} required` 
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maximumDiscount) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      discount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search suggestions
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') }
      ],
      isActive: true
    })
    .select('name slug')
    .limit(5);

    const categories = await Category.find({
      name: new RegExp(q, 'i'),
      isActive: true
    })
    .select('name slug')
    .limit(3);

    res.json({
      products,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});