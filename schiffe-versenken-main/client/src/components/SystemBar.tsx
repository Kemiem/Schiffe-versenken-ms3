import React from "react"

export const SystemBar: React.FC<{ status: string }> = ({ status }) => (
  <div
    style={{
      fontFamily: "system-ui,sans-serif",
      fontSize: 12,
      background: "#f3f4f6",
      borderBottom: "1px solid #e5e7eb",
      padding: "6px 10px",
      color: "#374151",
    }}
  >
    Status: {status}
  </div>
)
