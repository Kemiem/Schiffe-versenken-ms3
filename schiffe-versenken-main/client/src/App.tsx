import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { GameStateForClient, ShipCell, Shot } from "./gameTypes";


const socket = io("http://localhost:3000");

type User = { id: string; name: string };
const GRID_SIZE = 8;

export default function App() {
  // Login
  const [nickname, setNickname] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const [players, setPlayers] = useState<User[]>([]);

  // Chat
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  // Status
  const [status, setStatus] = useState("");

  // Spiel
  const [game, setGame] = useState<GameStateForClient | null>(null);

  // Socket Events
  useEffect(() => {
    // Login OK
    socket.on("server.login.ok", (d: { you: User; users: User[] }) => {
      setMe(d.you);
      setPlayers(d.users);
      setIsLoggedIn(true);
      setStatus(`Angemeldet als ${d.you.name}`);
    });

    // Login Fehler
    socket.on(
      "server.login.fehler",
      (e: { code: string; message: string }) => {
        setStatus(`Login-Fehler (${e.code}): ${e.message}`);
      }
    );

    // Spielerliste
    socket.on("server.users.update", (d: { users: User[] }) => {
      setPlayers(d.users);
    });

    // Chat
    socket.on("lobby.chat.empfangen", (m: { von: string; text: string }) => {
      setMessages((prev) => [...prev, `${m.von}: ${m.text}`]);
    });
    socket.on("lobby.chat.ok", () => {
      setStatus("Nachricht gesendet.");
    });

    // Fehlermeldungen
    socket.on("error", (e: any) => {
      setStatus(`${e.code ?? "Fehler"}: ${e.message ?? ""}`);
    });

    // Spielzustand vom Server
    socket.on("game.state", (state: GameStateForClient) => {
      setGame(state);
    });

    return () => {
      socket.off("server.login.ok");
      socket.off("server.login.fehler");
      socket.off("server.users.update");
      socket.off("lobby.chat.empfangen");
      socket.off("lobby.chat.ok");
      socket.off("error");
      socket.off("game.state");
    };
  }, []);

  // Aktionen

  const anmelden = () => {
    const name = nickname.trim();
    if (!name) return setStatus("Bitte Nickname eingeben.");
    socket.emit("client.login.senden", { name });
  };

  const sendenChat = () => {
    const txt = chatText.trim();
    if (!txt) return;
    socket.emit("lobby.chat.senden", { text: txt });
    setChatText("");
  };

  const feuern = (x: number, y: number) => {
    if (!game || !me) return;
    if (game.phase !== "playing") {
      setStatus("Spiel ist noch nicht im Spielmodus.");
      return;
    }
    if (game.currentTurnPlayerId !== me.id) {
      setStatus("Nicht dein Zug.");
      return;
    }
    socket.emit("game.shoot", { x, y });
  };


  const hasShipAt = (ships: ShipCell[], x: number, y: number) =>
    ships.some((s) => s.x === x && s.y === y);

  const shotAt = (shots: Shot[], x: number, y: number) =>
    shots.find((s) => s.x === x && s.y === y);

  const renderOwnBoard = () => {
    if (!game) return null;

    const rows = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const cells = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const hasShip = hasShipAt(game.myShips, x, y);
        const enemyShot = shotAt(game.enemyShotsOnMe, x, y);

        let bg = hasShip ? "#ddd" : "#0050a0";
        let marker = "";
        let color = "white";

        if (enemyShot) {
          marker = enemyShot.hit ? "●" : "○";
          color = enemyShot.hit ? "red" : "white";
        }

        cells.push(
          <div
            key={x}
            style={{
              width: 26,
              height: 26,
              background: bg,
              border: "1px solid #ffffff33",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color,
            }}
          >
            {marker}
          </div>
        );
      }
      rows.push(
        <div key={y} style={{ display: "flex" }}>
          {cells}
        </div>
      );
    }

    return (
      <div>
        <h3>Dein Feld</h3>
        {rows}
      </div>
    );
  };

  const renderEnemyBoard = () => {
    if (!game) return null;

    const rows = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const cells = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const myShot = shotAt(game.myShots, x, y);

        let bg = "#0050a0";
        let marker = "";
        if (myShot) {
          marker = myShot.hit ? "●" : "○";
          bg = myShot.hit ? "#7a0000" : "#003070";
        }

        cells.push(
          <div
            key={x}
            onClick={() => feuern(x, y)}
            style={{
              width: 26,
              height: 26,
              background: bg,
              border: "1px solid #ffffff33",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "white",
              cursor: "pointer",
            }}
          >
            {marker}
          </div>
        );
      }
      rows.push(
        <div key={y} style={{ display: "flex" }}>
          {cells}
        </div>
      );
    }

    return (
      <div>
        <h3>Gegner</h3>
        {rows}
      </div>
    );
  };

  const renderGameInfo = () => {
    if (!game || !me) return null;

    let text = "";
    if (game.phase === "waiting") {
      text = "Warte auf zweite:n Spieler:in…";
    } else if (game.phase === "playing") {
      text =
        game.currentTurnPlayerId === me.id
          ? "🟢 Du bist am Zug"
          : "🔴 Gegner ist am Zug";
    } else if (game.phase === "finished") {
      if (game.winnerId === me.id) text = "🏆 Du hast gewonnen!";
      else text = "❌ Du hast verloren.";
    }

    return (
      <p style={{ marginTop: 8, fontWeight: "bold", color: "#b00" }}>{text}</p>
    );
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h1>⚓ Schiffe versenken – Meilenstein 3</h1>
      {status && <p>{status}</p>}

      {!isLoggedIn ? (
        <>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname eingeben…"
            onKeyDown={(e) => e.key === "Enter" && anmelden()}
            style={{ width: 260 }}
          />
          <button onClick={anmelden} style={{ marginLeft: 8 }}>
            Anmelden
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {/* Spielfeld */}
            <div>
              <h2>Spielfeld</h2>
              <div style={{ display: "flex", gap: 24 }}>
                {renderOwnBoard()}
                {renderEnemyBoard()}
              </div>
              {renderGameInfo()}
            </div>

            {/* Chat + Spielerliste */}
            <div style={{ minWidth: 260 }}>
              <h2>Chat</h2>
              <div
                style={{
                  background: "#eee",
                  padding: 8,
                  height: 200,
                  overflowY: "auto",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                {messages.map((m, i) => (
                  <div key={i}>{m}</div>
                ))}
              </div>
              <div>
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Nachricht…"
                  onKeyDown={(e) => e.key === "Enter" && sendenChat()}
                  style={{ width: 180 }}
                />
                <button onClick={sendenChat} style={{ marginLeft: 8 }}>
                  Senden
                </button>
              </div>

              <h2 style={{ marginTop: 16 }}>Spieler online</h2>
              <ul>
                {players.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {me && p.id === me.id ? " (du)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
