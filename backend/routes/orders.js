const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');


router.post('/', async (req, res) => {
    const { userId, userName, userEmail, items, totalPrice, deliveryAddress } = req.body;
    try {
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ error: `Product not found` });
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({ user: userId, userName, userEmail, items, totalPrice, deliveryAddress });
        const savedOrder = await order.save();

        res.status(201).json({ message: 'Order placed!', id: savedOrder.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/user/:userId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { user: req.params.userId };

        
        if (startDate && endDate && startDate !== '' && endDate !== '' && startDate !== 'undefined') {
            query.createdAt = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/user/:userId/invoices/download', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { user: req.params.userId };

        if (startDate && endDate && startDate !== '' && endDate !== '' && startDate !== 'undefined') {
            query.createdAt = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).send('No orders found to download.');
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=all-invoices.pdf`);
        doc.pipe(res);

        orders.forEach((order, index) => {
            
            if (index > 0) doc.addPage();

            doc.fontSize(22).text('CS308 GAMING STORE', { align: 'center' });
            doc.fontSize(12).fillColor('#666').text('Official Invoice', { align: 'center' });
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
            doc.fontSize(10).fillColor('#999').text(`Page ${index + 1} of ${orders.length} - Thank you for shopping with CS308 Gaming Store!`, { align: 'center' });
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/:id/invoice', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
        doc.pipe(res);

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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;