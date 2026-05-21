const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');


router.get('/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required." });
        }

        const invoices = await Invoice.find({
            createdAt: {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        }).populate('user', 'name email');

        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.get('/:id/pdf', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('user', 'name email');
        if (!invoice) return res.status(404).send('Invoice not found');

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice._id}.pdf`);
        doc.pipe(res);

        
        doc.fontSize(20).text('CS308 ONLINE STORE', { align: 'center' }).moveDown();
        doc.fontSize(14).text(`INVOICE LOG`, { underline: true }).moveDown();
        doc.fontSize(10).text(`Invoice ID: ${invoice._id}`);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
        doc.text(`Customer Name: ${invoice.user?.name || 'Guest'}`);
        doc.text(`Customer Email: ${invoice.user?.email || 'N/A'}`);
        doc.moveDown();

        doc.text('------------------------------------------------------------');
        doc.text('Items Purchased:', { bold: true }).moveDown(0.5);

        invoice.items.forEach(item => {
            doc.text(`${item.name} (Qty: ${item.quantity}) - $${item.price}`);
        });

        doc.text('------------------------------------------------------------');
        doc.moveDown();
        doc.fontSize(14).text(`Total Amount Paid: $${invoice.totalAmount}`, { align: 'right' });

        doc.end();
    } catch (err) {
        res.status(500).send('Could not generate PDF invoice');
    }
});

module.exports = router;