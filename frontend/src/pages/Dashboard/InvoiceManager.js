import React, { useState } from 'react';

export default function InvoiceManager() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoices, setInvoices] = useState([]);

    const handleSearch = async () => {
        if (!startDate || !endDate) return alert("Select both dates!");
        try {
            const res = await fetch(`http://localhost:5000/api/invoices/range?startDate=${startDate}&endDate=${endDate}`);
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkDownload = () => {
        if (!startDate || !endDate) return alert("Select both dates!");
        window.open(`http://localhost:5000/api/invoices/bulk?startDate=${startDate}&endDate=${endDate}`, '_blank');
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
            <h3>Invoice Range Viewer (Sales Manager Task)</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button onClick={handleSearch} style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '5px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Filter Invoices
                </button>
                <button onClick={handleBulkDownload} style={{ backgroundColor: '#10b981', color: '#fff', padding: '5px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Download All Invoices
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                        <th>Invoice ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv._id}>
                            <td>{inv._id}</td>
                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td>${inv.totalAmount}</td>
                            <td>
                                <button 
                                    onClick={() => window.open(`http://localhost:5000/api/invoices/${inv._id}/pdf`)}
                                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '3px 8px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Download PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}