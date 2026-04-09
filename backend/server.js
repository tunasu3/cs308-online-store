const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "YOUR_MONGODB_URI_HERE";
mongoose.connect(MONGO_URI).then(() => console.log('DB Connected'));


const productSchema = new mongoose.Schema({
    name: String, price: Number, stock: Number, 
    warrantyStatus: { type: String, default: "2 Years Standard" }
});

const userSchema = new mongoose.Schema({ 
    username: { type: String, unique: true }, 
    password: { type: String }, 
    fullName: String, email: String, address: String, taxId: String, 
    role: { type: String, default: 'Product Manager' } 
});

const orderSchema = new mongoose.Schema({
    customerName: String, address: String, status: { type: String, default: "Processing" },
    items: [{ name: String, qty: Number }], totalAmount: Number
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);


app.post('/api/auth/register', async (req, res) => {
    try { const user = new User(req.body); await user.save(); res.status(201).json({ message: "OK" }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) res.json({ user });
    else res.status(401).json({ message: "Invalid credentials" });
});


app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.put('/api/admin/update-product/:id', async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.get('/api/admin/orders', async (req, res) => res.json(await Order.find()));
app.put('/api/admin/update-order/:id', async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Updated" });
});

app.listen(5000, () => console.log('API Running on 5000'));