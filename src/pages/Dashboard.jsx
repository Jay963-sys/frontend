import { useState, useEffect } from "react";
import api from "../services/api";
import NewFaultForm from "../components/NewFaultForm";
import FaultList from "../components/FaultList";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";
import FaultCharts from "../components/FaultCharts";
import DashboardMetrics from "../components/DashboardMetrics";
import html2canvas from "html2canvas";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";

export default function Dashboard() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedFault, setSelectedFault] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showNewFaultModal, setShowNewFaultModal] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [user, setUser] = useState(null);

  const refreshDashboard = () => {
    fetchFaults();
    fetchMetrics();
    fetchCharts();
  };

  const fetchFaults = async ({
    status = activeTab,
    department = departmentFilter,
    severity = severityFilter,
    search = searchTerm,
  } = {}) => {
    try {
      setLoading(true);

      const params = {
        status: status.toLowerCase() === "all" ? "all" : status,
        department_id:
          department === "All" ? "all" : getDepartmentId(department),
        severity: severity === "All" ? "all" : severity,
        search: search.trim() || undefined,
        timeRange,
      };

      const res = await api.get("/faults", { params });
      setFaults(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch faults");
    } finally {
      setLoading(false);
    }
  };

  const [metricsData, setMetricsData] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/faults/metrics", {
        params: { timeRange },
      });
      setMetricsData(res.data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await api.get("/faults/charts", {
        params: { timeRange },
      });
      setChartData({
        faultsBySeverity: res.data.severityData,
        faultsByDepartment: res.data.departmentData,
      });
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
  };

  useEffect(() => {
    fetchFaults();
    fetchCharts();
    fetchMetrics();
    // eslint-disable-next-line
  }, [timeRange]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    fetchFaults();
    // eslint-disable-next-line
  }, [activeTab, departmentFilter, severityFilter, searchTerm, timeRange]);

  const handleRowClick = (fault) => {
    setSelectedFault(fault);
  };

  return (
    <ResponsiveDashboardLayout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>All Faults</h2>
          <button
            onClick={() => setShowNewFaultModal(true)}
            style={buttonStyle}
          >
            + Log New Fault
          </button>
        </div>

        {/* Status Tabs */}
        <div style={tabContainerStyle}>
          {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeTab === tab ? "#007bff" : "#e0e0e0",
                color: activeTab === tab ? "white" : "black",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div style={filterContainerStyle}>
          <input
            type="text"
            placeholder="Search by Ticket, Description, Company, Circuit ID, or Type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="All">All Departments</option>
            <option value="Field Engineers">Field Engineers</option>
            <option value="NOC">NOC</option>
            <option value="Service Delivery">Service Delivery</option>
            <option value="Network Department">Network Department</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={inputStyle}
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        {/* Dashboard Metrics Section */}
        {metricsData && <DashboardMetrics metrics={metricsData} />}

        {/* Charts Section */}
        <div id="chart-section">
          {chartData && <FaultCharts chartData={chartData} />}
        </div>

        {/* Export to Excel Button */}
        <button
          onClick={async () => {
            try {
              const response = await api.get("/faults/export", {
                params: {
                  status: activeTab.toLowerCase() === "all" ? "all" : activeTab,
                  department_id:
                    departmentFilter === "All"
                      ? "all"
                      : getDepartmentId(departmentFilter),
                  severity: severityFilter === "All" ? "all" : severityFilter,
                  search: searchTerm.trim() || undefined,
                },
                responseType: "blob",
              });

              const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });

              const downloadUrl = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = "faults_export.xlsx";
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error("Export failed:", error);
              alert("Failed to export faults.");
            }
          }}
          style={{
            marginBottom: "20px",
            padding: "8px 14px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📥 Export to Excel
        </button>

        <button
          onClick={async () => {
            try {
              const chartElement = document.getElementById("chart-section");

              let chartImage = null;
              if (chartElement) {
                const canvas = await html2canvas(chartElement);
                chartImage = canvas.toDataURL("image/png");
              }

              const response = await api.post(
                "/faults/export/pdf",
                {
                  chartImage,
                  status: activeTab.toLowerCase() === "all" ? "all" : activeTab,
                  department_id:
                    departmentFilter === "All"
                      ? "all"
                      : getDepartmentId(departmentFilter),
                  severity: severityFilter === "All" ? "all" : severityFilter,
                  search: searchTerm.trim() || undefined,
                  timeRange,
                },
                { responseType: "blob" }
              );

              const blob = new Blob([response.data], {
                type: "application/pdf",
              });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "faults_report_with_charts.pdf");
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error("PDF export failed:", error);
              alert("Failed to export PDF");
            }
          }}
          style={{
            marginBottom: "20px",
            padding: "8px 14px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          🧾 Export PDF
        </button>

        {/* Fault Table */}
        {loading ? (
          <p>Loading faults...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <FaultList
            faults={faults}
            onRowClick={handleRowClick}
            onRefresh={refreshDashboard}
          />
        )}

        {/* Fault Details Drawer */}
        {selectedFault && (
          <div
            className="drawer-overlay"
            onClick={(e) => {
              if (e.target.classList.contains("drawer-overlay")) {
                setSelectedFault(null); // close drawer on outside click
              }
            }}
          >
            <FaultDetailsDrawer
              fault={selectedFault}
              onClose={() => setSelectedFault(null)}
              refreshDashboard={refreshDashboard}
              user={user}
            />
          </div>
        )}

        {/* New Fault Modal */}
        {showNewFaultModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3>Log New Fault</h3>
              <NewFaultForm
                onSuccess={() => {
                  refreshDashboard();
                  setShowNewFaultModal(false);
                }}
              />

              <button
                onClick={() => setShowNewFaultModal(false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "gray",
                  marginTop: "10px",
                }}
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

const getDepartmentId = (name) => {
  switch (name) {
    case "NOC":
      return 1;
    case "Field Engineers":
      return 2;
    case "Service Delivery":
      return 3;
    case "Network Department":
      return 4;
    default:
      return "all";
  }
};

const containerStyle = {
  padding: "20px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const tabContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const tabButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const filterContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "8px",
  flex: "1",
  minWidth: "200px",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "400px",
  boxShadow: "0 0 10px rgba(0,0,0,0.25)",
};
