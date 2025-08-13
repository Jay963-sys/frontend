import { useState, useEffect } from "react";
import api from "../services/api";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    department_id: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      const activeUsers = res.data.filter((user) => user.is_active !== false); // <-- Only active
      setUsers(activeUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("Username, email, and password are required.");
      return;
    }

    try {
      await api.post("/users", {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        department_id: newUser.department_id || null,
      });
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "user",
        department_id: "",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      department_id: user.department?.id || "",
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser.id}`, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        department_id: editingUser.department_id || null,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  return (
    <ResponsiveDashboardLayout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>User Management</h2>
        </div>

        <div style={formCard}>
          <h3 style={subtitleStyle}>
            {editingUser ? "Edit User" : "Create New User"}
          </h3>
          {error && <p style={errorStyle}>{error}</p>}
          <form
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            style={formStyle}
          >
            <input
              type="text"
              name="username"
              placeholder="Username *"
              value={editingUser ? editingUser.username : newUser.username}
              onChange={handleInputChange}
              style={inputStyle}
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={editingUser ? editingUser.email : newUser.email}
              onChange={handleInputChange}
              style={inputStyle}
            />
            {!editingUser && (
              <input
                type="password"
                name="password"
                placeholder="Password *"
                value={newUser.password}
                onChange={handleInputChange}
                style={inputStyle}
              />
            )}
            <select
              name="role"
              value={editingUser ? editingUser.role : newUser.role}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              name="department_id"
              value={
                editingUser
                  ? editingUser.department_id || ""
                  : newUser.department_id
              }
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button style={primaryBtn} type="submit">
              {editingUser ? "Update User" : "Add User"}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={secondaryBtn}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div style={formCard}>
          <h3 style={subtitleStyle}>All Users</h3>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr
                    key={u.id}
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
                    <td style={tdStyle}>{u.username}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.role}</td>
                    <td style={tdStyle}>
                      {u.department ? u.department.name : "N/A"}
                    </td>
                    <td style={tdStyle}>
                      <button
                        style={editBtnStyle}
                        onClick={() => handleEditUser(u)}
                      >
                        Edit
                      </button>
                      <button
                        style={deleteBtnStyle}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

const errorStyle = {
  color: "red",
};

const formCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const formStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const inputStyle = {
  flex: "1",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
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
  color: "#000",
};

const editBtnStyle = {
  marginRight: "6px",
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
