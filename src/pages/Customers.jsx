import { useState, useEffect } from "react";
import api from "../services/api";
import NewCustomerForm from "../components/NewCustomerForm";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <ResponsiveDashboardLayout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Customer Management</h2>
          <button style={addBtnStyle} onClick={() => setShowNewForm(true)}>
            + Add New Customer
          </button>
        </div>

        {loading ? (
          <p>Loading customers...</p>
        ) : error ? (
          <p style={errorStyle}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Circuit ID</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Owner</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eef5ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      idx % 2 === 0 ? "#fff" : "#f9f9f9")
                  }
                >
                  <td style={tdStyle}>{c.company}</td>
                  <td style={tdStyle}>{c.circuit_id}</td>
                  <td style={tdStyle}>{c.type}</td>
                  <td style={tdStyle}>{c.location}</td>
                  <td style={tdStyle}>{c.owner}</td>
                  <td style={tdStyle}>
                    <button
                      style={deleteBtnStyle}
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showNewForm && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3>Add New Customer</h3>
              <NewCustomerForm
                onSuccess={() => {
                  fetchCustomers();
                  setShowNewForm(false);
                }}
              />
              <button
                style={cancelBtnStyle}
                onClick={() => setShowNewForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveDashboardLayout>
  );
}

// -------------------- Styles --------------------
const containerStyle = {
  padding: "20px",
  fontFamily: "Poppins, sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
};

const addBtnStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
};

const thStyle = {
  padding: "12px",
  backgroundColor: "#f0f0f0",
  fontWeight: "600",
  fontSize: "15px",
  color: "#333",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
  color: "#000",
};

const deleteBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};

const errorStyle = {
  color: "red",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  width: "400px",
};

const cancelBtnStyle = {
  marginTop: "10px",
  padding: "8px 12px",
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
