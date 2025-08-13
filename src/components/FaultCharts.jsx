import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function FaultCharts({ chartData }) {
  // Provide default empty structure if chartData is undefined
  const { faultsBySeverity = {}, faultsByDepartment = {} } = chartData || {};

  const severityData = Object.entries(faultsBySeverity).map(
    ([severity, count]) => ({ severity, count })
  );

  const departmentData = Object.entries(faultsByDepartment).map(
    ([department, count]) => ({ department, count })
  );

  return (
    <div id="chart-section">
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h4>Faults by Severity</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, minWidth: "300px" }}>
          <h4>Faults by Department</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
