import { useState, useEffect } from "react";
import api from "../services/api";
import { formatPendingTime } from "./formatPendingTime";

export default function FaultList({ faults, onRowClick, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (faultId, newStatus) => {
    setUpdatingId(faultId);
    try {
      const fault = faults.find((f) => f.id === faultId);
      await api.put(`/faults/${faultId}`, {
        status: newStatus,
        assigned_to_id: fault.assigned_to_id,
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!Array.isArray(faults) || faults.length === 0)
    return <p>No faults found.</p>;

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Ticket #</th>
          <th style={thStyle}>Company</th>
          <th style={thStyle}>Circuit ID</th>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Description</th>
          <th style={thStyle}>Location</th>
          <th style={thStyle}>Owner</th>
          <th style={thStyle}>Department</th>
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
        {faults.map((fault, idx) => {
          const isGeneral = !fault.customer;
          const createdAt = new Date(fault.createdAt);
          const resolvedAt = fault.resolvedAt
            ? new Date(fault.resolvedAt)
            : null;
          const closedAt = fault.closedAt ? new Date(fault.closedAt) : null;

          let pendingDisplay = "N/A";
          if (fault.status === "Resolved") {
            pendingDisplay = <span style={badgeStyle("green")}>Resolved</span>;
          } else if (fault.status === "Closed") {
            pendingDisplay = <span style={badgeStyle("gray")}>Closed</span>;
          } else {
            const diffMs = currentTime - createdAt.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const { text, color } = formatPendingTime(diffHours, fault.status);
            pendingDisplay = <span style={badgeStyle(color)}>{text}</span>;
          }

          return (
            <tr
              key={fault.id}
              style={{
                ...rowStyle,
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
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.ticket_number || fault.id}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {isGeneral ? (
                  <span style={{ fontStyle: "italic", color: "#666" }}>
                    General Fault
                  </span>
                ) : (
                  fault.customer.company
                )}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {isGeneral ? (
                  <span style={{ fontStyle: "italic", color: "#666" }}>—</span>
                ) : (
                  fault.customer.circuit_id
                )}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.type || "N/A"}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.description}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.location || "N/A"}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.owner || "N/A"}
              </td>
              <td style={clickableCellStyle} onClick={() => onRowClick(fault)}>
                {fault.department?.name || "N/A"}
              </td>

              <td style={tdStyle}>
                <select
                  value={fault.status}
                  onChange={(e) => handleStatusChange(fault.id, e.target.value)}
                  disabled={updatingId === fault.id}
                  style={{
                    padding: "4px 8px",
                    backgroundColor:
                      fault.status === "Open"
                        ? "orange"
                        : fault.status === "In Progress"
                        ? "#007bff"
                        : fault.status === "Resolved"
                        ? "green"
                        : fault.status === "Closed"
                        ? "gray"
                        : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>

              <td style={tdStyle}>
                <span
                  style={badgeStyle(
                    fault.severity === "Low"
                      ? "#28a745"
                      : fault.severity === "Medium"
                      ? "#ffc107"
                      : fault.severity === "High"
                      ? "#fd7e14"
                      : fault.severity === "Critical"
                      ? "#dc3545"
                      : "#6c757d"
                  )}
                >
                  {fault.severity || "N/A"}
                </span>
              </td>

              <td style={tdStyle}>{pendingDisplay}</td>
              <td style={timestampCellStyle}>{createdAt.toLocaleString()}</td>

              {faults.some((f) => f.status === "Resolved") && (
                <td style={timestampCellStyle}>
                  {resolvedAt ? resolvedAt.toLocaleString() : "—"}
                </td>
              )}
              {faults.some((f) => f.status === "Closed") && (
                <td style={timestampCellStyle}>
                  {closedAt ? closedAt.toLocaleString() : "—"}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  fontSize: "14px",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f0f0f0",
  textAlign: "left",
  fontSize: "15px",
  fontWeight: "600",
  color: "#333",
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
};

const clickableCellStyle = {
  ...tdStyle,
  cursor: "pointer",
  fontWeight: "500",
  color: "#000",
};

const rowStyle = {
  transition: "background-color 0.2s",
};

const badgeStyle = (color) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  backgroundColor: color,
  color: "#fff",
  fontSize: "12px",
  fontWeight: "500",
  display: "inline-block",
});

const timestampCellStyle = {
  ...tdStyle,
  color: "#666",
  fontSize: "12.5px",
  fontWeight: "400",
};
