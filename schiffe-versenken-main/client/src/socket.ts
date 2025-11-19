// client/src/socket.ts
import { io, Socket } from "socket.io-client"

export const socket: Socket = io("http://localhost:3000", {
  autoConnect: false, // Verbindung erst aufbauen, beim einloggen
})

export const connectSocket = () => {
  if (!socket.connected) socket.connect()
}
