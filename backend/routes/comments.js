const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Order = require('../models/Order');

// POST - Add comment (only if user purchased the product)
router.post('/', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        // Step 1: Validate the rating is between 1 and 5
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
        }

        // Step 2: Verify the user actually purchased this product
        const Order = require('../models/Order');
        const purchased = await Order.findOne({
    user: userId,
    'items.productId': productId,
    status: 'Delivered'
});
if (!purchased) {
    return res.status(403).json({ error: 'You can only review products that have been delivered to you.' });
}

        // Step 3: All checks passed — save the comment
        const newComment = new Comment({ productId, userId, userName, rating, comment });
        await newComment.save();
        res.status(201).json({ message: 'Comment submitted! Waiting for approval.', comment: newComment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET approved comments for a product
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

// GET all pending comments
router.get('/pending', async (req, res) => {
    try {
        const comments = await Comment.find({ approved: false }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT approve comment
router.put('/:id/approve', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        res.json({ message: 'Comment approved!', comment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE reject comment
router.delete('/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Check if a user is eligible to review a product
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
// GET - Check if a user has purchased a specific product
router.get('/has-purchased/:userId/:productId', async (req, res) => {
    try {
        const Order = require('../models/Order');
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