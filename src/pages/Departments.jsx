import { useState, useEffect } from "react";
import api from "../services/api";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [editDept, setEditDept] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch departments.");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      await api.post("/departments", { name: newDeptName });
      setNewDeptName("");
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to add department.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete department.");
    }
  };

  const handleEdit = (dept) => {
    setEditDept(dept.id);
    setEditName(dept.name);
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/departments/${id}`, { name: editName });
      setEditDept(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Failed to update department.");
    }
  };

  return (
    <ResponsiveDashboardLayout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Department Management</h2>
        </div>

        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Add New Department</h3>
          <form onSubmit={handleAddDepartment} style={formStyle}>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Department Name"
              style={inputStyle}
            />
            <button className="primary-btn" type="submit" style={primaryBtn}>
              Add
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={subtitleStyle}>All Departments</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr
                  key={dept.id}
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
                  <td style={tdStyle}>
                    {editDept === dept.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          width: "100%",
                        }}
                      />
                    ) : (
                      dept.name
                    )}
                  </td>
                  <td style={tdStyle}>
                    {editDept === dept.id ? (
                      <>
                        <button
                          style={{ ...primaryBtn, marginRight: "6px" }}
                          onClick={() => handleUpdate(dept.id)}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditDept(null)}
                          style={secondaryBtn}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{ ...editBtnStyle, marginRight: "6px" }}
                          onClick={() => handleEdit(dept)}
                        >
                          Edit
                        </button>
                        <button
                          style={deleteBtnStyle}
                          onClick={() => handleDelete(dept.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

const subtitleStyle = {
  marginBottom: "10px",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const formStyle = {
  display: "flex",
  gap: "10px",
};

const inputStyle = {
  flex: "1",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
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
};

const primaryBtn = {
  backgroundColor: "#007bff",
  color: "#fff",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryBtn = {
  backgroundColor: "#6c757d",
  color: "#fff",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const editBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#17a2b8",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
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
