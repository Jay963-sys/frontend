import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import FaultDetailsDrawer from "../components/FaultDetailsDrawer";
import { formatPendingTime } from "../components/formatPendingTime";
import CustomRangeModal from "../components/CustomRangeModal";
import ResponsiveDashboardLayout from "../components/ResponsiveDashboardLayout";

export default function DepartmentFaultsPage() {
  const [faults, setFaults] = useState([]);
  const [selectedFault, setSelectedFault] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchFaults = useCallback(async () => {
    setLoading(true);
    const params = {
      search,
      status: statusFilter !== "all" ? statusFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
      timeRange: timeFilter !== "all" ? timeFilter : undefined,
      customStart:
        timeFilter === "custom" && customStartDate
          ? customStartDate.toISOString()
          : undefined,
      customEnd:
        timeFilter === "custom" && customEndDate
          ? customEndDate.toISOString()
          : undefined,
    };

    try {
      const res = await api.get("/faults/department/dashboard", { params });
      setFaults(res.data);
    } catch (err) {
      console.error("Error fetching faults", err);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    severityFilter,
    timeFilter,
    customStartDate,
    customEndDate,
  ]);

  useEffect(() => {
    fetchFaults();
  }, [fetchFaults]);

  const handleStatusChange = async (e, faultId) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    try {
      await api.put(`/faults/${faultId}`, { status: newStatus });
      setFaults((prev) =>
        prev.map((f) => (f.id === faultId ? { ...f, status: newStatus } : f))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const shouldShowResolved = faults.some((f) => f.status === "Resolved");
  const shouldShowClosed = faults.some((f) => f.status === "Closed");

  return (
    <ResponsiveDashboardLayout>
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Department Faults</h2>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by Ticket #, Company, Description..."
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

          <select
            value={timeFilter}
            onChange={(e) => {
              const value = e.target.value;
              setTimeFilter(value);
              if (value === "custom") {
                setShowDatePicker(true);
              } else {
                setCustomStartDate(null);
                setCustomEndDate(null);
                fetchFaults();
              }
            }}
            style={inputStyle}
          >
            <option value="all">All Time</option>
            <option value="day">Past Day</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <CustomRangeModal
          show={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          startDate={customStartDate}
          endDate={customEndDate}
          setStartDate={setCustomStartDate}
          setEndDate={setCustomEndDate}
          onApply={() => {
            if (customStartDate && customEndDate) {
              fetchFaults();
              setShowDatePicker(false);
            }
          }}
        />

        {/* Faults Table */}
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
                {shouldShowResolved && <th style={thStyle}>Resolved At</th>}
                {shouldShowClosed && <th style={thStyle}>Closed At</th>}
              </tr>
            </thead>
            <tbody>
              {faults.map((fault, idx) => (
                <tr
                  key={fault.id}
                  onClick={() => setSelectedFault(fault)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eef5ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      idx % 2 === 0 ? "#fff" : "#f9f9f9")
                  }
                >
                  <td style={tdStyle}>{fault.ticket_number || fault.id}</td>
                  <td style={tdStyle}>
                    {fault.customer?.company || (
                      <span style={{ fontStyle: "italic", color: "#666" }}>
                        General Fault
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>{fault.customer?.circuit_id || "-"}</td>
                  <td style={tdStyle}>{fault.type || "-"}</td>
                  <td style={tdStyle}>{fault.description}</td>
                  <td style={tdStyle}>{fault.location || "-"}</td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <select
                      value={fault.status}
                      onChange={(e) => handleStatusChange(e, fault.id)}
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
                  {shouldShowResolved && (
                    <td style={tdStyle}>{formatDateTime(fault.resolvedAt)}</td>
                  )}
                  {shouldShowClosed && (
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
              refreshTable={fetchFaults}
            />
          </div>
        )}
      </div>
    </ResponsiveDashboardLayout>
  );
}

// Styles and Helpers
const thStyle = { padding: "10px", textAlign: "left" };
const tdStyle = { padding: "10px" };

const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
  flex: 1,
};

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
