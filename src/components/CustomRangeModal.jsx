import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomRangeModal({
  show,
  onClose,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
}) {
  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains("modal-overlay")) onClose();
      }}
    >
      <div className="modal-content">
        <h3>Select Custom Date Range</h3>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            maxDate={new Date()}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="End Date"
            minDate={startDate}
            maxDate={new Date()}
          />
        </div>
        <div style={{ marginTop: "15px", textAlign: "right" }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onApply();
            }}
            disabled={!startDate || !endDate}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
