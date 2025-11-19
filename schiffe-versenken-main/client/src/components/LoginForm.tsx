import React, { useState } from "react"
import { socket, connectSocket } from "../socket"

export const LoginForm: React.FC<{ onLoggedIn: (user: { userId: string; name: string }) => void }> = ({ onLoggedIn }) => {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Bitte einen Nicknamen eingeben.")
      return
    }

    setLoading(true)
    connectSocket()
    socket.emit("client.login.senden", { name })

    const onOk = (payload: { userId: string; name: string }) => {
      socket.off("server.login.fehler", onErr)
      setLoading(false)
      onLoggedIn(payload)
    }
    const onErr = (payload: { message: string }) => {
      socket.off("server.login.ok", onOk)
      setLoading(false)
      setError(payload?.message ?? "Login fehlgeschlagen")
    }

    socket.once("server.login.ok", onOk)
    socket.once("server.login.fehler", onErr)
  }

  return (
    <form
      onSubmit={handleLogin}
      style={{
        display: "grid",
        gap: 12,
        maxWidth: 360,
        margin: "12vh auto",
        fontFamily: "system-ui, sans-serif",
        background: "white",
        padding: 16,
        borderRadius: 8,
        boxShadow: "0 6px 24px rgba(0,0,0,.08)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 20 }}>Anmeldung</h1>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Nickname</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Admiral_7"
          style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
        />
      </label>
      <button
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid #2563eb",
          background: loading ? "#93c5fd" : "#3b82f6",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Verbinde…" : "Einloggen"}
      </button>
      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
    </form>
  )
}
