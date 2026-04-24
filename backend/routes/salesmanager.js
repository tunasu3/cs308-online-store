const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');


// APPLY DISCOUNT
router.put('/discount/:id', async (req, res) => {
    try {
        const { discount } = req.body;

        // Validation
        if (discount === undefined) {
            return res.status(400).json({ message: "Discount is required" });
        }

        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount must be between 0 and 100" });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.discount = discount;
        await product.save();

        res.json({
            message: "Discount applied successfully",
            product
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//REVENUE ANALYTICS
router.get('/revenue', async (req, res) => {
    try {
        const { start, end } = req.query;

        // Validation
        if (!start || !end) {
            return res.status(400).json({
                message: "Start and end dates are required"
            });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

    
        endDate.setHours(23, 59, 59, 999);

        // Aggregation
        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 } 
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1
                }
            }
        ]);

        // Format labels 
        const labels = result.map(r =>
            `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`
        );

        const data = result.map(r => r.revenue);
        const orderCounts = result.map(r => r.orders);

        const totalRevenue = data.reduce((a, b) => a + b, 0);

        
        if (labels.length === 0) {
            return res.json({
                totalRevenue: 0,
                labels: ["No Data"],
                data: [0],
                orders: [0]
            });
        }

        res.json({
            totalRevenue,
            labels,
            data,
            orders: orderCounts
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL ORDERS (Delivery List)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE ORDER STATUS
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const validFlow = {
            "Processing": "In-Transit",
            "In-Transit": "Delivered"
        };

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const current = order.status;
        const next = validFlow[current];

        if (status !== next) {
            return res.status(400).json({
                message: `Invalid status update. Must go from ${current} → ${next}`
            });
        }

        order.status = status;
        await order.save();

        res.json({ message: "Status updated", order });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;