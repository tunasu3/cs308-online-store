const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    try {
        
        const categories = [
            { _id: "1", name: "GPU" },
            { _id: "2", name: "Keyboard" },
            { _id: "3", name: "Headset" },
            { _id: "4", name: "Monitor" },
            { _id: "5", name: "Mouse" },
            { _id: "6", name: "Audio" },
            { _id: "7", name: "Storage" },
            { _id: "8", name: "RAM" }
        ];
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;