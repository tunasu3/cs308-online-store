const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB Atlas Connected! ');
        seedProducts();
    })
    .catch(err => console.error('Database Connection Error: ', err));


const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    model: String,
    serial: { type: String, unique: true },
    description: String,
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    warranty: String,
    distributor: String,
    category: String,
    discount: { type: Number, default: 0 }
}));

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    taxID: String,
    homeAddress: String,
    role: { type: String, enum: ['Customer', 'Manager'], default: 'Customer' }
}));


const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany([
                { 
                    name: "ASUS ROG B650-A", model: "B650-A", serial: "SN-AS-001", 
                    description: "High-end AM5 Motherboard", stock: 10, price: 9400, 
                    warranty: "2 Years", distributor: "Asus Turkey", category: "Motherboard" 
                },
                { 
                    name: "MSI RTX 4060", model: "Ventus 2X", serial: "SN-MSI-002", 
                    description: "8GB GDDR6 Graphics Card", stock: 5, price: 12500, 
                    warranty: "3 Years", distributor: "MSI Global", category: "GPU" 
                },
                { 
                    name: "Corsair Vengeance 32GB", model: "V-DDR5", serial: "SN-COR-003", 
                    description: "6000MHz CL36 RAM Kit", stock: 15, price: 5200, 
                    warranty: "Lifetime", distributor: "Corsair", category: "RAM" 
                }
            ]);
            console.log("Database successfully seeded with sample products! ");
        }
    } catch (err) {
        console.log("Seeding error:", err);
    }
};


app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});


app.post('/api/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.put('/api/admin/update-product/:id', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Update successful", updated });
    } catch (err) {
        res.status(400).json({ error: "Update failed: " + err.message });
    }
});


app.post('/api/auth/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Registration failed: " + err.message });
    }
});


app.post('/api/checkout', async (req, res) => {
    const { cart } = req.body;
    try {
        for (let item of cart) {
            const product = await Product.findById(item.id);
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
        }
        res.json({ message: "Payment successful, stocks updated! " });
    } catch (err) {
        res.status(500).json({ error: "Transaction failed" });
    }
});


app.get('/', (req, res) => {
    res.send('CS308 Online Store Backend with MongoDB');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});