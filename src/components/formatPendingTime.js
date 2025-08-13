export function formatPendingTime(hours, status = "") {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "resolved") {
    return { text: "Resolved", color: "green" };
  }

  if (normalizedStatus === "closed") {
    return { text: "Closed", color: "gray" }; // Only use gray for closed faults
  }

  if (hours === 0) {
    return { text: "0 hrs", color: "#17a2b8" }; // blue for fresh faults
  }

  if (hours >= 24) {
    const days = Math.round(hours / 24);
    return {
      text: `${days} ${days === 1 ? "day" : "days"}`,
      color: hours >= 48 ? "#dc3545" : "#fd7e14", // red for >= 2 days, orange for 1 day
    };
  }

  const roundedHours = Math.round(hours);
  return {
    text: `${roundedHours} ${roundedHours === 1 ? "hr" : "hrs"}`,
    color: "#007bff", // blue for active but < 1 day
  };
}

export const pendingBadgeStyle = (hours) => {
  if (typeof hours !== "number")
    return {
      backgroundColor: "#ccc",
      color: "#fff",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "0.85rem",
    };

  let backgroundColor = "#ccc";
  if (hours < 12) backgroundColor = "#28a745"; // Green
  else if (hours < 24) backgroundColor = "#ffc107"; // Yellow
  else if (hours < 72) backgroundColor = "#fd7e14"; // Orange
  else backgroundColor = "#dc3545"; // Red

  return {
    backgroundColor,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
  };
};
