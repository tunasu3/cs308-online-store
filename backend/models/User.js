const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    taxID: { type: String, default: '' },
    homeAddress: { type: String, default: '' },
    role: { type: String, enum: ['Customer', 'SalesManager', 'ProductManager'], default: 'Customer' }
}, { timestamps: true });

wishlist: [
  {
    type: require("mongoose").Schema.Types.ObjectId,
    ref: "Product",
  },
],

module.exports = mongoose.model('User', UserSchema);