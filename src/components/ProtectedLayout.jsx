import Sidebar from "./Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Faults from "../pages/Faults";
import Customers from "../pages/Customers";
import Users from "../pages/Users";

export default function ProtectedLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "200px", padding: "20px", width: "100%" }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/faults" element={<Faults />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </div>
  );
}
