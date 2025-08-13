import React from "react";

export default function DashboardMetrics({ metrics }) {
  if (!metrics) return null;

  const { total, statusCounts, severityCounts, departmentCounts } = metrics;

  const cardStyle = {
    padding: "15px 20px",
    borderRadius: "10px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    flex: 1,
    minWidth: "220px",
  };

  const sectionStyle = {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "20px",
    marginBottom: "30px",
  };

  const badge = (color) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    backgroundColor: color,
    color: "white",
    fontSize: "12px",
    marginLeft: "8px",
  });

  return (
    <div>
      <h3 style={{ marginBottom: "10px" }}>📊 Dashboard Metrics</h3>
      <div style={sectionStyle}>
        <div style={cardStyle}>
          <h4>Total Faults</h4>
          <p style={{ fontSize: "26px", fontWeight: "bold" }}>{total}</p>
        </div>

        <div style={cardStyle}>
          <h4>Status Counts</h4>
          {Object.entries(statusCounts).map(([status, count]) => (
            <p key={status}>
              {status}
              <span style={badge("#007bff")}>{count}</span>
            </p>
          ))}
        </div>

        <div style={cardStyle}>
          <h4>Severity Counts</h4>
          {Object.entries(severityCounts).map(([severity, count]) => (
            <p key={severity}>
              {severity}
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
          ))}
        </div>

        <div style={cardStyle}>
          <h4>Department Counts</h4>
          {Object.entries(departmentCounts).map(([dept, count]) => (
            <p key={dept}>
              {dept}
              <span style={badge("#6c757d")}>{count}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
