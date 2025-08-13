import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Faults from "./pages/Faults";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import DepartmentDashboard from "./pages/DepartmentDashboard"; // ⬅️ Now the combined dashboard
import DepartmentFaults from "./pages/DepartmentFaultsPage"; // ⬅️ Standalone faults page
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SidebarLayout>
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="faults" element={<Faults />} />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SidebarLayout>
                <Customers />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SidebarLayout>
                <Users />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SidebarLayout>
                <Departments />
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        {/* DEPARTMENT ROUTES */}
        <Route
          path="/department/*"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <SidebarLayout>
                <Routes>
                  <Route path="dashboard" element={<DepartmentDashboard />} />
                  <Route path="faults" element={<DepartmentFaults />} />
                </Routes>
              </SidebarLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
