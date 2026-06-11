const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS  
    }
});

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

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">x${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${(item.price * item.quantity).toLocaleString()} TL</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"CS308 Gaming Store" <${process.env.EMAIL_USER}>`,
            to: userEmail, 
            subject: `Invoice for Your Order #${savedOrder._id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="text-align: center; color: #1f2937;">CS308 GAMING STORE</h2>
                    <p style="text-align: center; color: #6b7280;">Official Invoice / Order Confirmation</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
                    <p><strong>Dear ${userName},</strong></p>
                    <p>Thank you for shopping with us! Your order has been successfully placed. Below are your invoice details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 8px; text-align: left;">Item</th>
                                <th style="padding: 8px; text-align: center;">Qty</th>
                                <th style="padding: 8px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <h3 style="text-align: right; margin-top: 20px; color: #111827;">TOTAL: ${totalPrice.toLocaleString()} TL</h3>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
                    <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
                    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
                        Thank you for your business! If you have any questions, please reply to this email.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log('Invoice email error:', error);
            else console.log('Invoice email sent:', info.response);
        });

        const io = req.app.get('io') || global.io;
        if (io) io.emit('stockUpdated', { reason: 'purchase' });

        res.status(201).json({ message: 'Order placed!', id: savedOrder.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/refund-evaluate', async (req, res) => {
    try {
        const { action } = req.body; 
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (action === 'approve') {
            order.status = 'Refunded';
            
            const refundMailOptions = {
                from: `"CS308 Gaming Store" <${process.env.MAIL_USER}>`,
                to: order.userEmail, 
                subject: `✅ Refund Approved for Order #${order._id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #10B981; text-align: center;">Refund Approved</h2>
                        <p>Dear <strong>${order.userName}</strong>,</p>
                        <p>Your refund request for order <strong>#${order._id}</strong> has been successfully approved by our Sales Manager.</p>
                        <p>The total amount of <strong>${order.totalPrice.toLocaleString()} TL</strong> has been credited back to your payment method. It may take a few business days to reflect in your account.</p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="text-align: center; color: #9ca3af; font-size: 12px;">Thank you for your patience. CS308 Gaming Store</p>
                    </div>
                `
            };

            transporter.sendMail(refundMailOptions, (err, info) => {
                if (err) console.log('Refund approval email error:', err);
                else console.log('Refund approval email sent to customer:', order.userEmail);
            });
           
            for (let item of order.items) {
                if (item.productId) { 
                    const product = await Product.findById(item.productId);
                    if (product) {
                        const oldStock = product.stock;
                        product.stock += item.quantity;
                        
                        if (oldStock === 0 && product.stock > 0 && product.waitingList && product.waitingList.length > 0) {
                            const targetEmails = product.waitingList.filter(email => email && email.trim() !== '');
                            
                            if (targetEmails.length > 0) {
                                const stockMailOptions = {
                                    from: `"CS308 Gaming Store" <${process.env.MAIL_USER}>`,
                                    to: targetEmails.join(', '), 
                                    subject: `🔥 Good News! ${product.name} is Back in Stock!`,
                                    html: `<p>Hello, the product <strong>${product.name}</strong> you've been waiting for is back in stock! Grab it before it sells out again!</p>`
                                };

                                transporter.sendMail(stockMailOptions, (err, info) => {
                                    if (err) console.log('Stock notification email error:', err);
                                    else console.log('Stock notification sent to waiting list:', info.response);
                                });
                            }

                            product.waitingList = []; 
                        }

                        await product.save();
                    }
                }
            }
        } else if (action === 'reject') {
            order.status = 'Refund Rejected';
        } else {
            return res.status(400).json({ error: 'Invalid action.' });
        }

        await order.save();

        const io = req.app.get('io') || global.io;
        if (io) {
            const displayId = order._id.toString().substring(0, 6).toUpperCase();
            io.emit('stockUpdated', { reason: 'refund', orderId: order._id });
            io.emit('orderStatusUpdated', { orderId: order._id, globalStatus: order.status, message: `Order status updated to ${order.status}!` });
            if (order.user) {
                io.emit(`notification-${order.user}`, { 
                    message: `Your refund request has been ${action === 'approve' ? 'approved' : 'rejected'}. (Order ID: #${displayId})` 
                });
            }
        }

        res.json({ message: `Refund successfully ${action}d!`, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/invoices/bulk', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate && startDate !== '' && endDate !== '' && startDate !== 'undefined') {
            query.createdAt = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).send('No orders found in this date range to download.');
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        
        const fileName = startDate && endDate 
            ? `bulk-invoices-${startDate}-to-${endDate}.pdf` 
            : `all-invoices.pdf`;
            
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        doc.pipe(res);

        orders.forEach((order, index) => {
            if (index > 0) doc.addPage();

            doc.fontSize(22).text('CS308 GAMING STORE', { align: 'center' });
            doc.fontSize(12).fillColor('#666').text('Official Bulk Invoice', { align: 'center' });
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
            doc.fontSize(10).fillColor('#999').text(`Page ${index + 1} of ${orders.length} - CS308 Gaming Store Manager Export`, { align: 'center' });
        });

        doc.end();
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
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Refund Rejected') {
            return res.status(400).json({ error: `Cannot modify status. This order is already ${order.status.toLowerCase()}.` });
        }
        
        order.status = status;
        await order.save();
        
        const io = req.app.get('io') || global.io;
        if (io) {
            const displayId = order._id.toString().substring(0, 6).toUpperCase();
            const textMessage = `The status of your order (ID: #${displayId}) has been updated to "${status}".`;
            
            io.emit('orderStatusUpdated', { orderId: req.params.id, globalStatus: status, message: textMessage });
            if (order.user) {
                io.emit(`notification-${order.user}`, { 
                    message: textMessage 
                });
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sales/refund-requests', async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { status: 'Refund Requested' },
                { 'items.refundStatus': 'Refund Requested' }
            ]
        }).sort({ updatedAt: -1 });
        res.json(orders);
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

router.post('/:id/refund-request', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be refunded' });
    }
    const daysSince = (Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSince > 30) {
      return res.status(400).json({ message: 'Refund window has expired (30-day limit)' });
    }
    if (order.status === 'Refund Requested') {
      return res.status(400).json({ message: 'Refund already requested for this order' });
    }

    order.status = 'Refund Requested';
    order.refundRequestedAt = new Date();
    await order.save();

    const io = req.app.get('io') || global.io;
    if (io) {
        io.emit('orderStatusUpdated', { orderId: order._id, globalStatus: order.status, message: 'A new refund request has been created.' });
    }

    res.json({ message: 'Refund request submitted successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status !== 'Processing') {
            return res.status(400).json({ error: 'Only orders in "Processing" status can be cancelled.' });
        }

        order.status = 'Cancelled';
        await order.save();

        for (let item of order.items) {
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }
        const io = req.app.get('io') || global.io;
        if (io) {
            io.emit('stockUpdated', { reason: 'cancel', orderId: order._id });
            io.emit('orderStatusUpdated', { orderId: order._id, globalStatus: order.status, message: 'Order has been cancelled.' });
        }

        res.json({ message: 'Order cancelled successfully and stocks reverted.', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:orderId/items/:itemId', async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { itemStatus } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Refund Rejected') {
            return res.status(400).json({ error: `Cannot update items. This order is already ${order.status.toLowerCase()}.` });
        }

        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in this order' });
        }

        item.itemStatus = itemStatus;

        const statuses = order.items.map(i => i.itemStatus || 'Processing');
        const allSame = statuses.every(s => s === statuses[0]);

        if (allSame) {
            order.status = statuses[0];
        } else if (statuses.includes('Processing')) {
            order.status = 'Processing';
        } else if (statuses.includes('In-Transit')) {
            order.status = 'In-Transit';
        } else {
            order.status = 'Delivered'; 
        }

        await order.save();

        const io = req.app.get('io') || global.io;
        if (io) {
            const textMessage = `The delivery status of "${item.name}" in your order has been updated to "${itemStatus}".`;
            
            io.emit('orderStatusUpdated', { orderId: order._id, globalStatus: order.status, message: textMessage });
            if (order.user) {
                io.emit(`notification-${order.user}`, { 
                    message: textMessage 
                });
            }
        }

        res.json({ message: 'Item and global status updated successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;