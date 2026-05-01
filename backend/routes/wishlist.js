const express = require('express');
const router = express.Router();
const User = require('../models/User');

//Get wishlist
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Add to wishlist
router.post('/:userId/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user.wishlist.includes(req.params.productId)) {
            user.wishlist.push(req.params.productId);
            await user.save();
        }

        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Remove from wishlist
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== req.params.productId
        );

        await user.save();
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;