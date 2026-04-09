const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// POST - Add comment
router.post('/', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;
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

module.exports = router;