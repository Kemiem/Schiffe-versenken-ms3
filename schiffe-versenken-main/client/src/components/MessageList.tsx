import React from "react"

export const MessageList: React.FC<{ messages: string[] }> = ({ messages }) => (
  <div style={{ display: "grid", gap: 6 }}>
    {messages.map((m, i) => (
      <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: 6 }}>
        {m}
      </div>
    ))}
  </div>
)
