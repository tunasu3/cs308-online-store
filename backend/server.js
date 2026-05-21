const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'YES' : 'NO');
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err?.message || err);
});
const connectDB = require('./config/db');
const salesManagerRoutes = require('./routes/salesmanager');
const app = express();
const wishlistRoutes = require('./routes/wishlist');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

connectDB();
const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: "587",
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

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

app.post('/api/orders/mail-invoice/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const doc = new PDFDocument({ margin: 50 });

        /* try {
            await transporter.verify();
            console.log("Server is ready to take our messages");
        } catch (err) {
            console.log(err);
        } */

        doc.fontSize(24).text('CS308 GAMING STORE', { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(12).fillColor('#000');
        doc.text(`Invoice ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
        doc.text(`Customer: ${order.userName}`);
        doc.text(`Email: ${order.userEmail}`);
        doc.text(`Delivery Address: ${order.deliveryAddress}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(14).text('Items:', { underline: true });
        doc.moveDown(0.5);

        order.items.forEach(item => {
            doc.fontSize(12).text(
                `${item.name} x${item.quantity}  —  ${(item.price * item.quantity).toLocaleString()} TL`
            );
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(16).text(`TOTAL: ${order.totalPrice.toLocaleString()} TL`, { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#999').text('Thank you for shopping with CS308 Gaming Store!', { align: 'center' });

        doc.end();

        const info = transporter.sendMail({
            from: '"CS308 Online Store" <ccs308-online-store@sandbox37580d67384143948170a80a4bbb4c32.mailgun.org>',
            to: `"${order.userName}" <${order.userEmail}>`,
            subject: "Your Invoice",
            text: `Hi ${order.userName},\n\nYou are receiving this email because of your request for your invoice. You may find it attached to this email.\n\nThank you for your patronage!\n\nCS308 Online Store Team`,
            attachments: [{
                filename: "invoice.pdf",
                content: doc
            }]
        });

        res.status(201).json({ message: 'Invoice sent!' });
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