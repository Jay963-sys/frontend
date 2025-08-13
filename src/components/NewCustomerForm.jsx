import { useState } from "react";
import api from "../services/api";

export default function NewCustomerForm({ onSuccess }) {
  const [company, setCompany] = useState("");
  const [circuitId, setCircuitId] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [popSite, setPopSite] = useState("");
  const [email, setEmail] = useState("");
  const [switchInfo, setSwitchInfo] = useState("");
  const [owner, setOwner] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!company || !circuitId || !ipAddress || !popSite) {
      setError("Company, Circuit ID, IP Address, and POP Site are required.");
      return;
    }

    try {
      await api.post("/customers", {
        company,
        circuit_id: circuitId,
        type,
        location,
        ip_address: ipAddress,
        pop_site: popSite,
        email,
        switch_info: switchInfo,
        owner,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to add customer. Check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Company *"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Circuit ID *"
        value={circuitId}
        onChange={(e) => setCircuitId(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="IP Address *"
        value={ipAddress}
        onChange={(e) => setIpAddress(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="POP Site *"
        value={popSite}
        onChange={(e) => setPopSite(e.target.value)}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Switch Info"
        value={switchInfo}
        onChange={(e) => setSwitchInfo(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Owner"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>
        Add Customer
      </button>
    </form>
  );
}

const inputStyle = {
  display: "block",
  marginBottom: "10px",
  width: "100%",
  padding: "8px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
