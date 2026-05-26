const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

router.put('/discount/:id', async (req, res) => {
    try {
        const { discount } = req.body;

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

        if (req.app && req.app.get('io') && discount > 0) {
            const calculatedNewPrice = product.price * (1 - discount / 100);
            req.app.get('io').emit('productDiscount', {
                productId: product._id,
                productName: product.name,
                newPrice: calculatedNewPrice.toFixed(2),
                discountRate: discount
            });
        }

        res.json({
            message: "Discount applied successfully",
            product
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/revenue', async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                message: "Start and end dates are required"
            });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        endDate.setHours(23, 59, 59, 999);

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

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.get('/profit-loss', async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('items.productId');

        const dailyMap = {};

        for (const order of orders) {
            const day = order.createdAt.toISOString().split('T')[0];
            if (!dailyMap[day]) dailyMap[day] = { revenue: 0, cost: 0 };

            dailyMap[day].revenue += order.totalPrice;

            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                const cost = product ? (product.cost || 0) : 0;
                dailyMap[day].cost += cost * item.quantity;
            }
        }

        const labels = Object.keys(dailyMap).sort();
        const revenueData = labels.map(d => dailyMap[d].revenue);
        const costData = labels.map(d => dailyMap[d].cost);
        const profitData = labels.map((d, i) => revenueData[i] - costData[i]);

        const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
        const totalCost = costData.reduce((a, b) => a + b, 0);
        const totalProfit = totalRevenue - totalCost;

        res.json({
            labels,
            revenueData,
            costData,
            profitData,
            totalRevenue,
            totalCost,
            totalProfit
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;