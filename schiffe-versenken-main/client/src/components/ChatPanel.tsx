import React, { useEffect, useRef, useState } from "react"
import { socket } from "../socket"

type ChatMessage = { id: string; user: string; text: string; createdAt: string }

export const ChatPanel: React.FC<{ userName: string }> = ({ userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMsg = (m: ChatMessage) => setMessages((prev) => [...prev, m])
    socket.on("lobby.chat.empfangen", onMsg)
    return () => socket.off("lobby.chat.empfangen", onMsg)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    setSending(true)
    socket.emit("lobby.chat.senden", { text })
    const onOk = () => {
      setSending(false)
      setText("")
      socket.off("lobby.chat.ok", onOk)
    }
    socket.once("lobby.chat.ok", onOk)
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", height: "100%", gap: 10 }}>
      <div ref={listRef} style={{ overflow: "auto", paddingRight: 4 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 8,
                padding: 10,
                fontFamily: "system-ui,sans-serif",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {new Date(m.createdAt).toLocaleTimeString()} • <strong>{m.user}</strong>
              </div>
              <div style={{ marginTop: 4 }}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Nachricht als ${userName}`}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <button
          onClick={send}
          disabled={sending}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #2563eb",
            background: sending ? "#93c5fd" : "#3b82f6",
            color: "white",
            cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          Senden
        </button>
      </div>
    </div>
  )
}
