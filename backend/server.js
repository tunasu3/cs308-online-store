const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    }
});

app.set('io', io);
global.io = io;

io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
});

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
});

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
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Refund Rejected') {
            return res.status(400).json({ error: `Cannot modify status. This order is already ${order.status.toLowerCase()}.` });
        }
        
        order.status = status;
        await order.save();
        
        const socketIo = req.app.get('io') || global.io;
        if (socketIo) {
            const displayId = order._id.toString().substring(0, 6).toUpperCase();
            const textMessage = `The status of your order (ID: #${displayId}) has been updated to "${status}".`;

            socketIo.emit('orderStatusUpdated', { 
                orderId: order._id, 
                globalStatus: status, 
                message: textMessage 
            });
            
            if (order.user) {
                socketIo.emit(`notification-${order.user.toString()}`, {
                    message: textMessage
                });
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/update-product/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        const socketIo = req.app.get('io') || global.io;
        
        if (socketIo) {
            socketIo.emit('productUpdated');

            if (req.body.price || req.body.discountRate) {
                socketIo.emit('product-discounted', {
                    productId: updatedProduct._id,
                    productName: updatedProduct.name,
                    discountRate: updatedProduct.discountRate || 0,
                    newPrice: updatedProduct.price
                });
            }
            
            if (req.body.stockCount !== undefined && req.body.stockCount > 0) {
                socketIo.emit('product-restocked', {
                    productId: updatedProduct._id,
                    productName: updatedProduct.name
                });
            }
        }
        
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
        doc.fontSize(16).text(`TOTAL: ${order.totalPrice.toLocaleString()} $`, { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#999').text('Thank you for shopping with CS308 Gaming Store!', { align: 'center' });

        doc.end();

        await transporter.sendMail({
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
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});