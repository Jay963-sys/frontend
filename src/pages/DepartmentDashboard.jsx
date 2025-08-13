import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { formatPendingTime } from "../components/formatPendingTime";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { toast } from "react-toastify";

export default function DepartmentDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [faults, setFaults] = useState([]);
  const [selectedFault, setSelectedFault] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const refreshDashboard = () => {
    fetchFaults();
    fetchMetrics();
  };

  const fetchFaults = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, status: statusFilter, severity: severityFilter };
      const res = await api.get("/faults/department/dashboard", { params });
      setFaults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, severityFilter]);

  const fetchMetrics = async () => {
    const res = await api.get("/faults/department/charts");
    const statusCounts = {};
    const severityCounts = {};

    res.data.status?.forEach((s) => {
      statusCounts[s.status] = s.count;
    });

    const normalizedSeverityData = res.data.severity?.map((s) => {
      const normalizedKey =
        s.severity?.charAt(0).toUpperCase() +
        s.severity?.slice(1).toLowerCase();
      severityCounts[normalizedKey] = s.count;
      return {
        severity: normalizedKey,
        count: s.count,
      };
    });

    const total = Object.values(statusCounts).reduce(
      (sum, val) => sum + Number(val),
      0
    );

    setMetrics({ total, statusCounts, severityCounts });
    setChartsData({ ...res.data, severity: normalizedSeverityData });
  };

  useEffect(() => {
    fetchMetrics();
    fetchFaults();
  }, [fetchFaults]);

  const statusDropdownStyle = (status) => ({
    padding: "4px 8px",
    backgroundColor:
      status === "Open"
        ? "orange"
        : status === "In Progress"
        ? "#007bff"
        : status === "Resolved"
        ? "green"
        : status === "Closed"
        ? "gray"
        : "#ccc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
  });

  const handleStatusChange = async (e, fault) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    try {
      const res = await api.put(`/faults/${fault.id}`, {
        status: newStatus,
        note: `Status updated to ${newStatus}`,
      });

      toast.success(`Fault marked as ${newStatus}`);
      fetchFaults();
      fetchMetrics();

      if (selectedFault?.id === fault.id) {
        setSelectedFault(res.data.fault);
      }
    } catch (err) {
      toast.error("Failed to update fault status");
      console.error("Status update error", err);
    }
  };

  return (
    <ResponsiveDashboardLayout>
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Department Dashboard</h2>

        {metrics && (
          <div>
            <h3 style={{ marginBottom: "16px" }}>📊 Dashboard Metrics</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div style={cardStyle}>
                <h4>Total Faults</h4>
                <p
                  style={{ fontSize: "30px", fontWeight: "700", color: "#333" }}
                >
                  {metrics.total}
                </p>
              </div>

              <div style={cardStyle}>
                <h4>Status Counts</h4>
                {Object.entries(metrics.statusCounts).map(([status, count]) => (
                  <p
                    key={status}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{status}</span>
                    <span style={badge("#007bff")}>{count}</span>
                  </p>
                ))}
              </div>

              <div style={cardStyle}>
                <h4>Severity Counts</h4>
                {Object.entries(metrics.severityCounts).map(
                  ([severity, count]) => (
                    <p
                      key={severity}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{severity}</span>
                      <span
                        style={badge(
                          severity === "Critical"
                            ? "#dc3545"
                            : severity === "High"
                            ? "#fd7e14"
                            : severity === "Medium"
                            ? "#ffc107"
                            : "#28a745"
                        )}
                      >
                        {count}
                      </span>
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {chartsData?.severity?.length > 0 && (
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={cardStyle}>
              <h4 style={{ marginBottom: "10px" }}>📉 Faults by Severity</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartsData.severity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {chartsData.severity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.severity === "Low"
                            ? "#28a745"
                            : entry.severity === "Medium"
                            ? "#ffc107"
                            : entry.severity === "High"
                            ? "#fd7e14"
                            : "#dc3545"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search by Ticket #, Company, Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="all">All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="all">All Severity</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        {loading ? (
          <p>Loading faults...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={thStyle}>Ticket #</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Circuit ID</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Pending</th>
                <th style={thStyle}>Logged Time</th>
                {faults.some((f) => f.status === "Resolved") && (
                  <th style={thStyle}>Resolved At</th>
                )}
                {faults.some((f) => f.status === "Closed") && (
                  <th style={thStyle}>Closed At</th>
                )}
              </tr>
            </thead>
            <tbody>
              {faults.map((fault, idx) => (
                <tr
                  key={fault.id}
                  onClick={() => setSelectedFault(fault)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                    transition: "background-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#eef5ff";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      idx % 2 === 0 ? "#fff" : "#f9f9f9";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <td style={tdStyle}>{fault.ticket_number || fault.id}</td>
                  <td style={tdStyle}>
                    {fault.customer?.company || (
                      <i style={{ color: "#666" }}>General</i>
                    )}
                  </td>
                  <td style={tdStyle}>{fault.customer?.circuit_id || "-"}</td>
                  <td style={tdStyle}>{fault.type || "-"}</td>
                  <td style={tdStyle}>{fault.description}</td>
                  <td style={tdStyle}>{fault.location || "-"}</td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <select
                      value={fault.status}
                      onChange={(e) => handleStatusChange(e, fault)}
                      disabled={fault.status === "Closed"}
                      style={statusDropdownStyle(fault.status)}
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </td>

                  <td style={tdStyle}>
                    <span style={severityBadge(String(fault.severity))}>
                      {fault.severity || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {(() => {
                      if (fault.status === "Resolved") {
                        return (
                          <span
                            style={{
                              backgroundColor: "green",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "inline-block",
                            }}
                          >
                            Resolved
                          </span>
                        );
                      } else if (fault.status === "Closed") {
                        return (
                          <span
                            style={{
                              backgroundColor: "gray",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "inline-block",
                            }}
                          >
                            Closed
                          </span>
                        );
                      } else if (typeof fault.pending_hours === "number") {
                        const { text, color } = formatPendingTime(
                          fault.pending_hours,
                          fault.status
                        );
                        return (
                          <span
                            style={{
                              backgroundColor: color,
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "inline-block",
                            }}
                          >
                            {text}
                          </span>
                        );
                      } else {
                        return "-";
                      }
                    })()}
                  </td>

                  <td style={tdStyle}>{formatDateTime(fault.createdAt)}</td>
                  {faults.some((f) => f.status === "Resolved") && (
                    <td style={tdStyle}>{formatDateTime(fault.resolvedAt)}</td>
                  )}
                  {faults.some((f) => f.status === "Closed") && (
                    <td style={tdStyle}>{formatDateTime(fault.closedAt)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedFault && (
          <div
            className="drawer-overlay"
            onClick={(e) => {
              if (e.target.classList.contains("drawer-overlay")) {
                setSelectedFault(null);
              }
            }}
          >
            <FaultDetailsDrawer
              fault={selectedFault}
              onClose={() => setSelectedFault(null)}
              refreshDashboard={refreshDashboard}
            />
          </div>
        )}
      </div>
    </ResponsiveDashboardLayout>
  );
}

const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
  flex: 1,
};

const severityBadge = (severity) => {
  const colors = {
    Low: "#28a745",
    Medium: "#ffc107",
    High: "#fd7e14",
    Critical: "#dc3545",
  };
  return {
    backgroundColor: colors[severity] || "#ccc",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
  };
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

const cardStyle = {
  padding: "15px 20px",
  borderRadius: "10px",
  background: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  flex: 1,
  minWidth: "220px",
};

const badge = (backgroundColor) => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "12px",
  backgroundColor,
  color: "white",
  fontSize: "12px",
  marginLeft: "8px",
});

const thStyle = {
  padding: "12px 10px",
  textAlign: "left",
  backgroundColor: "#f0f4f8",
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
};

const tdStyle = {
  padding: "10px",
  fontSize: "14px",
  color: "#333",
};
