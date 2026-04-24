const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
        }

        const purchased = await Order.findOne({
            user: userId,
            'items.productId': productId,
            status: 'Delivered'
        });

        if (!purchased) {
            return res.status(403).json({ error: 'You can only review products that have been delivered to you.' });
        }

        const newComment = new Comment({ productId, userId, userName, rating, comment });
        await newComment.save();
        res.status(201).json({ message: 'Comment submitted! Waiting for approval.', comment: newComment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/product/:productId', async (req, res) => {
    try {
        const comments = await Comment.find({
            productId: req.params.productId,
            approved: true
        }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/pending', async (req, res) => {
    try {
        const comments = await Comment.find({ approved: false }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/approve', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );

        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const allApprovedComments = await Comment.find({
            productId: comment.productId,
            approved: true
        });

        let totalRating = 0;
        allApprovedComments.forEach(c => totalRating += c.rating);
        
        const averageRating = allApprovedComments.length > 0 ? (totalRating / allApprovedComments.length) : 0;

        await Product.findByIdAndUpdate(
            comment.productId,
            { rating: averageRating }
        );

        res.json({ message: 'Comment approved!', comment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        
        if (comment && comment.approved) {
            const allApprovedComments = await Comment.find({
                productId: comment.productId,
                approved: true
            });

            let totalRating = 0;
            allApprovedComments.forEach(c => totalRating += c.rating);
            
            const averageRating = allApprovedComments.length > 0 ? (totalRating / allApprovedComments.length) : 0;

            await Product.findByIdAndUpdate(
                comment.productId,
                { rating: averageRating }
            );
        }

        res.json({ message: 'Comment deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/eligibility/:productId/:userId', async (req, res) => {
    try {
        const { productId, userId } = req.params;
        
        const purchase = await Order.findOne({
            user: userId,
            'items.productId': productId
        });
        
        const alreadyReviewed = await Comment.findOne({ userId, productId });
        
        res.json({
            canReview: !!purchase && !alreadyReviewed,
            hasPurchased: !!purchase,
            alreadyReviewed: !!alreadyReviewed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/has-purchased/:userId/:productId', async (req, res) => {
    try {
        const order = await Order.findOne({
            user: req.params.userId,
            'items.productId': req.params.productId,
            status: 'Delivered'
        });
        res.json({ hasPurchased: !!order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;