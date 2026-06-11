const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// YENİ ÜRÜN EKLEME
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        // >>> EKLENEN KOD: Yeni ürün eklenince listeyi yenile
        const io = req.app.get('io');
        if (io) io.emit('stockUpdated', { reason: 'new_product' });

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/:id/notify-me', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!product.waitingList.includes(email)) {
            product.waitingList.push(email);
            await product.save();
        }

        res.status(200).json({ message: 'Successfully subscribed to waiting list.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ÜRÜN GÜNCELLEME (ADMİN STOK DEĞİŞTİRİNCE BURASI ÇALIŞIR)
router.put('/:id', async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) return res.status(404).json({ error: 'Product not found' });

        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdated', { reason: 'admin_update', productId: req.params.id });
            io.emit('productUpdated', { productId: req.params.id });

            if (req.body.price < oldProduct.price || (req.body.discountRate && req.body.discountRate > (oldProduct.discountRate || 0))) {
                io.emit('product-discounted', {
                    productId: updated._id,
                    productName: updated.name,
                    discountRate: updated.discountRate || 0,
                    newPrice: updated.price
                });
            }

            if ((oldProduct.stock === 0 || oldProduct.stock === undefined) && updated.stock > 0) {
                io.emit('product-restocked', {
                    productId: updated._id,
                    productName: updated.name
                });

                if (updated.waitingList && updated.waitingList.length > 0) {
                    const targetEmails = updated.waitingList.filter(email => email && email.trim() !== '');
                    if (targetEmails.length > 0) {
                        const nodemailer = require('nodemailer');
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.MAIL_USER,
                                pass: process.env.MAIL_PASS
                            }
                        });
                        const stockMailOptions = {
                            from: `"CS308 Gaming Store" <${process.env.MAIL_USER}>`,
                            to: targetEmails.join(', '),
                            subject: `🔥 Good News! ${updated.name} is Back in Stock!`,
                            html: `<p>Hello, the product <strong>${updated.name}</strong> you've been waiting for is back in stock! Grab it before it sells out again!</p>`
                        };
                        transporter.sendMail(stockMailOptions, (err, info) => {});
                    }
                    updated.waitingList = [];
                    await updated.save();
                }
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ÜRÜN SİLME
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        // >>> EKLENEN KOD: Ürün silindiğinde vitrinden anlık kalksın
        const io = req.app.get('io');
        if (io) io.emit('stockUpdated', { reason: 'product_deleted' });

        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;