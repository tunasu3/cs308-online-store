const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const salesManagerRoutes = require('./routes/salesmanager');
const app = express();
const wishlistRoutes = require('./routes/wishlist');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

connectDB();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', salesManagerRoutes);
app.use('/api/wishlist', wishlistRoutes);

const Order = require('./models/Order');
const Product = require('./models/Product');

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/update-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('CS308 Online Store Backend ');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});