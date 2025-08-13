import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  Wrench,
  Building,
  Users,
  Landmark,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function SidebarLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "64px" : "220px",
          background: "#1e293b",
          color: "#fff",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Toggle */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
            }}
            title="Toggle sidebar"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <SidebarLink
            to={isAdmin ? "/dashboard" : "/department/dashboard"}
            icon={<BarChart2 size={18} />}
            label="Dashboard"
            collapsed={collapsed}
            active={
              isAdmin
                ? location.pathname === "/dashboard"
                : location.pathname === "/department/dashboard"
            }
          />

          <SidebarLink
            to={isAdmin ? "/dashboard/faults" : "/department/faults"}
            icon={<Wrench size={18} />}
            label="Faults"
            collapsed={collapsed}
            active={
              isAdmin
                ? location.pathname.startsWith("/dashboard/faults")
                : location.pathname === "/department/faults"
            }
          />

          {/* Divider */}
          {isAdmin && (
            <div
              style={{
                height: "1px",
                background: "#334155",
                margin: "8px 12px",
              }}
            />
          )}

          {isAdmin && (
            <>
              <SidebarLink
                to="/customers"
                icon={<Building size={18} />}
                label="Customers"
                collapsed={collapsed}
                active={isActive("/customers")}
              />
              <SidebarLink
                to="/users"
                icon={<Users size={18} />}
                label="Users"
                collapsed={collapsed}
                active={isActive("/users")}
              />
              <SidebarLink
                to="/departments"
                icon={<Landmark size={18} />}
                label="Departments"
                collapsed={collapsed}
                active={isActive("/departments")}
              />
            </>
          )}
        </nav>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div
          style={{
            background: "#f0f0ff",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}
          >
            {isAdmin ? "NOC Fault Logger Admin" : "Department Dashboard"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isAdmin && (
              <h2 style={{ fontSize: "16px", color: "#334155", margin: 0 }}>
                {user?.department?.name?.includes("Department")
                  ? user.department.name
                  : `${user?.department?.name || "Department"} Department`}
              </h2>
            )}

            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
              }}
              title={user?.username || "User"}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#f8f8ff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, collapsed, active }) {
  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: active ? "#2563eb" : "transparent",
        color: active ? "#fff" : "#cbd5e1",
        textDecoration: "none",
        fontWeight: active ? "600" : "400",
        borderRadius: "6px",
        margin: "0 8px",
        transition: "background-color 0.2s ease",
      }}
    >
      <span
        style={{
          marginRight: collapsed ? "0" : "10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
