const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

// Müşterinin faturasını ID'ye göre PDF üretip indiren API
router.get('/:id/pdf', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('user', 'name email');
        if (!invoice) return res.status(404).send('Invoice not found');

        const doc = new PDFDocument({ margin: 50 });
        
        // Tarayıcıya PDF indirmesini söylüyoruz
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice._id}.pdf`);
        doc.pipe(res);

        // --- PDF Tasarımı (Hocaların seveceği kurumsal şablon) ---
        doc.fontSize(22).text('CS308 ONLINE STORE', { align: 'center' }).moveDown();
        doc.fontSize(14).text('OFFICIAL PURCHASE INVOICE', { align: 'center', underline: true }).moveDown();
        
        doc.fontSize(10).text(`Invoice ID: ${invoice._id}`);
        doc.text(`Order Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
        doc.text(`Customer Name: ${invoice.user?.name || 'Guest Customer'}`);
        doc.text(`Customer Email: ${invoice.user?.email || 'N/A'}`);
        doc.moveDown();
        
        doc.text('-------------------------------------------------------------------------');
        doc.fontSize(12).text('Items Purchased:', { bold: true }).moveDown(0.5);
        
        // Faturadaki ürünleri döngüyle PDF'e yazdırıyoruz
        invoice.items.forEach(item => {
            doc.fontSize(10).text(`- ${item.name} (Qty: ${item.quantity}) - $${item.price * item.quantity}`);
        });

        doc.text('-------------------------------------------------------------------------');
        doc.moveDown();
        doc.fontSize(14).text(`Total Paid Amount: $${invoice.totalAmount}`, { align: 'right', bold: true });

        doc.end();
    } catch (err) {
        res.status(500).send('Error generating PDF invoice');
    }
});

module.exports = router;