const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); 


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        
        
        if (categories.length === 0) {
            const defaultCategories = [
                { name: "GPU" }, { name: "Keyboard" }, { name: "Headset" },
                { name: "Monitor" }, { name: "Mouse" }, { name: "Audio" },
                { name: "Storage" }, { name: "RAM" }
            ];
            const seeded = await Category.insertMany(defaultCategories);
            return res.json(seeded);
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const trimmedName = String(name).trim();

       
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } 
        });
        
        if (existingCategory) {
            return res.status(400).json({ error: 'This category already exists' });
        }

        
        const newCategory = new Category({ name: trimmedName });
        const savedCategory = await newCategory.save();
        
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;