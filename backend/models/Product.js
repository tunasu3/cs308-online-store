const mongoose = require('mongoose');
const crypto = require('crypto');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: String,
    serial: { 
        type: String, 
        unique: true, 
        default: () => 'SRL-' + crypto.randomBytes(4).toString('hex').toUpperCase() 
    },
    description: String,
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    warranty: String,
    distributor: String,
    category: String,
    discount: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    waitingList: { type: [String], default: [] } 
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);