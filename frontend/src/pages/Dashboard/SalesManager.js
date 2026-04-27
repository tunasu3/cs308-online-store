import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function SalesManager() {
  const [discount, setDiscount] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [totalRevenue, setTotalRevenue] = useState(null);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  
  useEffect(() => {
    axios.get("http://localhost:8000/api/products")
    .then(res => setProducts(res.data))
    .catch(err => console.error(err));
  }, []);

  
  // APPLY DISCOUNT
  const applyDiscount = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/sales/discount/${selectedProduct}`,
        { discount: Number(discount) }
      );
      alert("Discount applied!");
    } catch (err) {
      alert("Error applying discount");
    }
  };

  // GET REVENUE 
  const getRevenue = async () => {
    if (!start || !end) {
      alert("Please select start and end dates");
      return;
    }
    
    try {
      const res = await axios.get(
        `http://localhost:8000/api/sales/revenue?start=${start}&end=${end}`
      );
      
      setTotalRevenue(res.data.totalRevenue);
      setLabels(
        res.data.labels.map(date =>
          new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })
        )
      );
      setData(res.data.data);
    
    } catch (err) {
      console.error(err);
      alert("Error fetching revenue");
    }
  };

  // CHART DATA
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: data,
        borderColor: "#2c3e50",     // dark blue/black
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(44, 62, 80, 0.7)");
          gradient.addColorStop(1, "rgba(44, 62, 80, 0.05)");
          
          return gradient;
        },

        tension: 0.4,
        fill: true,

        pointBackgroundColor: "#2c3e50",
        pointBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      }
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
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Sales Manager Dashboard</h2>

        {/* ================= APPLY DISCOUNT ================= */}
        <div style={{ marginBottom: "30px" }}>
          <h3>Apply Discount</h3>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              }}
              >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                  </option>
                ))}
                </select>

            <input
            style={inputStyle}
            placeholder="Discount %"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            />

            <button
              onClick={applyDiscount}
              style={{
                padding: "8px 14px",
                background: "#2c3e50",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* ================= REVENUE ================= */}
        <div style={{ marginTop: "30px" }}>
          <h3>Revenue</h3>

          <input
          type="date"
          style={{ ...inputStyle, marginRight: "10px" }}
          onChange={(e) => setStart(e.target.value)}
          />
          
          <input
          type="date"
          style={{ ...inputStyle, marginRight: "10px" }}
          onChange={(e) => setEnd(e.target.value)}
          />

          <button
            onClick={getRevenue}
            style={{
              padding: "8px 14px",
              background: "#2c3e50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Get Revenue
          </button>

          {/* Date display */}
          {start && end && (
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "#f1f2f6",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#444",
                display: "block",
                width: "fit-content"
              }}
            >
              Showing Revenue from <strong>{formatDateLong(start)}</strong> to <strong>{formatDateLong(end)}</strong>
            </div>
          )}

          {/* Revenue + Chart */}
          {totalRevenue !== null && (
            <>
              <h3 style={{ marginTop: "20px" }}>
                Total Revenue: ${totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  })}
              </h3>

              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  margin: "20px auto",
                }}
              >
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