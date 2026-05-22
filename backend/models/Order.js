const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number
    }],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Processing', 'In-Transit', 'Delivered', 'Refund Requested', 'Refunded', 'Refund Rejected'],
        default: 'Processing'
    },
    deliveryAddress: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Credit Card' },
    refundRequestedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);