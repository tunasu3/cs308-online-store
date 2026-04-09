const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: String,
    serial: { type: String, unique: true },
    description: String,
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    warranty: String,
    distributor: String,
    category: String,
    discount: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);