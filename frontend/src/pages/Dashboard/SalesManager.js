import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function SalesManager({ fetchData, products }) {
  const [discount, setDiscount] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [profitData, setProfitData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [invoiceStart, setInvoiceStart] = useState("");
  const [invoiceEnd, setInvoiceEnd] = useState("");

   
  const [localProducts, setLocalProducts] = useState(products);

  
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const updatePrice = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }
    if (newPrice === "") {
      alert("Please enter a price");
      return;
    }
    const priceValue = Number(newPrice);
    if (priceValue <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/products/${selectedProduct}`, {
        price: priceValue,
      });

      await fetchData();
      setNewPrice("");
      alert("Product price updated successfully by Sales Manager!");
    } catch (err) {
      console.error(err);
      alert("Error updating product price");
    }
  };

  const applyDiscount = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }
    if (discount === "") {
      alert("Please enter a discount");
      return;
    }
    const discountValue = Number(discount);
    if (discountValue < 1 || discountValue > 100) {
      alert("Enter a valid discount (1–100)");
      return;
    }
    const selectedProductData = localProducts.find((p) => p._id === selectedProduct);
    if (selectedProductData && selectedProductData.stock === 0) {
      alert("Cannot apply a discount to a sold out product");
      return;
    }
    try {
      await axios.put(
        `http://localhost:8000/api/sales/discount/${selectedProduct}`,
        { discount: discountValue }
      );
      const flags = JSON.parse(localStorage.getItem("wishlist_flags") || "{}");
      const prevDiscount = Number(
        localProducts.find((p) => p._id === selectedProduct)?.discount || 0
      );
      const newDiscountValue = Number(discount);
      if (newDiscountValue > prevDiscount) {
        flags[selectedProduct] = prevDiscount > 0 ? "increase" : "new";
        localStorage.setItem("wishlist_flags", JSON.stringify(flags));
        localStorage.setItem("wishlist_seen", "false");
      }
      await fetchData();
      setDiscount("");
      alert("Discount applied!");
    } catch (err) {
      alert("Error applying discount");
    }
  };

  const getRevenue = async () => {
  if (!start || !end) {
    alert("Please select start and end dates");
    return;
  }
  setRevenueLoading(true);
  try {
    const [, profitRes] = await Promise.all([
      axios.get(`http://localhost:8000/api/sales/revenue?start=${start}&end=${end}`),
      axios.get(`http://localhost:8000/api/sales/profit-loss?start=${start}&end=${end}`)
    ]);
    setTotalRevenue(profitRes.data.totalRevenue);
    setTotalCost(profitRes.data.totalCost);
    setTotalProfit(profitRes.data.totalProfit);
    setLabels(profitRes.data.labels.map(date => new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })));
    setData(profitRes.data.revenueData);
    setProfitData(profitRes.data.profitData);
    setCostData(profitRes.data.costData);
  } catch (err) {
    console.error(err);
    alert("Error fetching financial data");
  } finally {
    setRevenueLoading(false);
  }
};

  const getInvoices = async () => {
    if (!invoiceStart || !invoiceEnd) {
      alert("Please select start and end dates for invoices");
      return;
    }
    try {
      const res = await axios.get("http://localhost:8000/api/orders");
      const sDate = new Date(invoiceStart);
      sDate.setHours(0, 0, 0, 0);
      const eDate = new Date(invoiceEnd);
      eDate.setHours(23, 59, 59, 999);

      const filtered = res.data.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= sDate && orderDate <= eDate;
      });
      setInvoices(filtered);
    } catch (err) {
      console.error(err);
      alert("Error fetching invoices");
    }
  };

  const downloadBulkInvoices = () => {
    if (!invoiceStart || !invoiceEnd) {
      alert("Please select start and end dates for invoices");
      return;
    }
    window.open(`http://localhost:8000/api/orders/invoices/bulk?startDate=${invoiceStart}&endDate=${invoiceEnd}`, "_blank");
  };

  const downloadInvoicePDF = (id) => {
    window.open(`http://localhost:8000/api/orders/${id}/invoice`, "_blank");
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: data,
        borderColor: "#2c3e50",
        backgroundColor: "rgba(44, 62, 80, 0.1)",
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#2c3e50",
        pointRadius: 5,
      },
      {
        label: "Cost",
        data: costData,
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#e74c3c",
        pointRadius: 5,
      },
      {
        label: "Profit",
        data: profitData,
        borderColor: "#27ae60",
        backgroundColor: "rgba(39, 174, 96, 0.1)",
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#27ae60",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "#e5e7eb",
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Sales Manager Dashboard</h2>
        
        <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
          <h3>Select Product to Manage</h3>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{
              ...inputStyle,
              width: "100%",
              maxWidth: "400px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            <option value="">-- Choose Product --</option>
            {localProducts.map((p) => {
              const currentPrice = p.discount > 0 
                ? (p.price * (1 - p.discount / 100)).toFixed(2) 
                : p.price;
              return (
                <option key={p._id} value={p._id}>
                  {p.name} (Current Price: ${currentPrice})
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", marginBottom: "30px" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <h3>Update Price (Base Price)</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                style={{
                  ...inputStyle,
                  width: "130px",
                }}
                placeholder="New Price $"
                type="number"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <button
                onClick={updatePrice}
                disabled={!selectedProduct || !newPrice}
                style={{
                  padding: "8px 14px",
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "500",
                  opacity: !selectedProduct || !newPrice ? 0.6 : 1,
                  cursor: !selectedProduct || !newPrice ? "not-allowed" : "pointer",
                }}
              >
                Update Price
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "280px" }}>
            <h3>Apply Discount</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                style={{ ...inputStyle, width: "120px" }}
                placeholder="Discount %"
                type="number"
                min="1"
                max="100"
                value={discount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (Number(val) >= 1 && Number(val) <= 100)) setDiscount(val);
                }}
              />
              <button
                onClick={applyDiscount}
                disabled={!selectedProduct || !discount}
                style={{
                  padding: "8px 14px",
                  background: "#2c3e50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "500",
                  opacity: !selectedProduct || !discount ? 0.6 : 1,
                  cursor: !selectedProduct || !discount ? "not-allowed" : "pointer",
                }}
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h3>Discounted Products</h3>
          {localProducts.filter((p) => p.discount > 0).length === 0 ? (
            <p style={{ color: "#777" }}>No discounted products</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                  <th style={{ padding: "10px" }}>Product</th>
                  <th style={{ padding: "10px" }}>Price</th>
                  <th style={{ padding: "10px" }}>Discount</th>
                  <th style={{ padding: "10px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.filter((p) => p.discount > 0).map((p) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px" }}>{p.name}</td>
                    <td style={{ padding: "10px" }}>${p.price}</td>
                    <td style={{ padding: "10px", color: "#e74c3c", fontWeight: "500" }}>{p.discount}%</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={async () => {
                          try {
                            await axios.put(`http://localhost:8000/api/sales/discount/${p._id}`, { discount: 0 });
                            const flags = JSON.parse(localStorage.getItem("wishlist_flags") || "{}");
                            delete flags[p._id];
                            localStorage.setItem("wishlist_flags", JSON.stringify(flags));
                            await fetchData();
                          } catch (err) {
                            alert("Error removing discount");
                          }
                        }}
                        style={{ padding: "6px 10px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid #eee" }}>
          <h3>Invoices Manager</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
            <input type="date" style={inputStyle} onChange={(e) => setInvoiceStart(e.target.value)} />
            <input type="date" style={inputStyle} onChange={(e) => setInvoiceEnd(e.target.value)} />
            <button onClick={getInvoices} style={{ padding: "8px 14px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              View Invoices
            </button>
            <button onClick={downloadBulkInvoices} style={{ padding: "8px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}>
              Download All Invoices
            </button>
          </div>

          {invoices.length === 0 ? (
            <p style={{ color: "#777", fontSize: "14px" }}>No invoices found in this range.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee", background: "#f9f9f9" }}>
                  <th style={{ padding: "10px" }}>Invoice ID</th>
                  <th style={{ padding: "10px" }}>Customer</th>
                  <th style={{ padding: "10px" }}>Total</th>
                  <th style={{ padding: "10px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px", fontSize: "12px", color: "#555" }}>{inv._id}</td>
                    <td style={{ padding: "10px" }}>{inv.userName || inv.userEmail}</td>
                    <td style={{ padding: "10px", fontWeight: "500" }}>${inv.totalPrice?.toLocaleString()}</td>
                    <td style={{ padding: "10px" }}>
                      <button 
                        onClick={() => downloadInvoicePDF(inv._id)} 
                        style={{ padding: "6px 12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500", fontSize: "13px" }}
                      >
                        📄 Download / Print PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid #eee" }}>
          <h3>Revenue & Financial Reports</h3>
          <input type="date" style={{ ...inputStyle, marginRight: "10px" }} onChange={(e) => setStart(e.target.value)} />
          <input type="date" style={{ ...inputStyle, marginRight: "10px" }} onChange={(e) => setEnd(e.target.value)} />
          <button onClick={getRevenue} disabled={revenueLoading} style={{ padding: "8px 14px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "4px", cursor: revenueLoading ? "not-allowed" : "pointer", opacity: revenueLoading ? 0.7 : 1 }}>
  {revenueLoading ? "⏳ Compiling financial data..." : "Get Revenue"}
</button>
          {start && end && (
            <div style={{ marginTop: "12px", padding: "8px 12px", background: "#f1f2f6", borderRadius: "6px", fontSize: "14px", color: "#444", display: "block", width: "fit-content" }}>
              Showing Revenue from <strong>{formatDateLong(start)}</strong> to <strong>{formatDateLong(end)}</strong>
            </div>
          )}
          
          {totalRevenue !== null && (
            <>
              <h3 style={{ marginTop: "20px" }}>Total Revenue: ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              {totalCost !== null && <h3 style={{ marginTop: "10px", color: "#e74c3c" }}>Total Cost: ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>}
              {totalProfit !== null && <h3 style={{ marginTop: "10px", color: totalProfit >= 0 ? "#27ae60" : "#e74c3c" }}>{totalProfit >= 0 ? "Total Profit" : "Total Loss"}: ${Math.abs(totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>}
              <div style={{ width: "100%", maxWidth: "800px", margin: "20px auto" }}>
                <Line data={chartData} options={options} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesManager;