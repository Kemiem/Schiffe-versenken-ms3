import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

// Typen
type GamePhase = "waiting" | "playing" | "finished";

interface User {
  id: string; // socket.id
  name: string;
}

interface BoardCell {
  hasShip: boolean;
  hit: boolean;
}

interface Shot {
  x: number;
  y: number;
  byId: string;
  hit: boolean;
}

interface Game {
  playerIds: string[];
  boards: Record<string, BoardCell[][]>; // pro Spieler ein Board
  currentTurnPlayerId: string | null;
  phase: GamePhase;
  winnerId?: string;
  shots: Shot[];
}

// GameState -> Client
interface ShipCell {
  x: number;
  y: number;
  hit: boolean;
}

interface ClientShot {
  x: number;
  y: number;
  hit: boolean;
}

interface GameStateForClient {
  phase: GamePhase;
  you: { id: string; name: string };
  opponent: { id: string; name: string } | null;
  currentTurnPlayerId: string | null;
  myShips: ShipCell[];
  enemyShotsOnMe: ClientShot[];
  myShots: ClientShot[];
  winnerId?: string;
}

// In-Memory-Status
const users: User[] = [];
let currentGame: Game | null = null;

// Board-Funktionen
function createEmptyBoard(size = 8): BoardCell[][] {
  const board: BoardCell[][] = [];
  for (let y = 0; y < size; y++) {
    const row: BoardCell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({ hasShip: false, hit: false });
    }
    board.push(row);
  }
  return board;
}

function createDemoBoard(size = 8): BoardCell[][] {
  const board = createEmptyBoard(size);

  // 3-Zellen-horizontales-Schiff
  board[1][1].hasShip = true;
  board[1][2].hasShip = true;
  board[1][3].hasShip = true;

  // 2-Zellen-vertikales-Schiff
  board[4][5].hasShip = true;
  board[5][5].hasShip = true;

  // 1-Zellen-Schiff
  board[6][2].hasShip = true;

  return board;
}

function findUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

// Spiel starten
function startGameIfPossible() {
  if (currentGame) return;
  if (users.length < 2) return;

  const [p1, p2] = users;

  currentGame = {
    playerIds: [p1.id, p2.id],
    boards: {
      [p1.id]: createDemoBoard(),
      [p2.id]: createDemoBoard(),
    },
    currentTurnPlayerId: p1.id,
    phase: "playing",
    shots: [],
  };

  console.log("Neues Spiel gestartet:", p1.name, "gegen", p2.name);
  broadcastGameState();
}

// GameState -> Client
function buildGameStateFor(userId: string): GameStateForClient | null {
  if (!currentGame) {
    const me = findUser(userId);
    if (!me) return null;

    return {
      phase: "waiting",
      you: { id: me.id, name: me.name },
      opponent: null,
      currentTurnPlayerId: null,
      myShips: [],
      enemyShotsOnMe: [],
      myShots: [],
    };
  }

  const me = findUser(userId);
  if (!me) return null;

  const opponentId = currentGame.playerIds.find((id) => id !== userId);
  const opponent = opponentId ? findUser(opponentId) ?? null : null;

  const myBoard = currentGame.boards[userId];
  if (!myBoard) return null;

  const myShips: ShipCell[] = [];
  myBoard.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell.hasShip) {
        myShips.push({ x, y, hit: cell.hit });
      }
    })
  );

  const myShots: ClientShot[] = currentGame.shots
    .filter((s) => s.byId === userId)
    .map((s) => ({ x: s.x, y: s.y, hit: s.hit }));

  const enemyShotsOnMe: ClientShot[] = currentGame.shots
    .filter((s) => s.byId !== userId)
    .map((s) => ({ x: s.x, y: s.y, hit: s.hit }));

  return {
    phase: currentGame.phase,
    you: { id: me.id, name: me.name },
    opponent: opponent ? { id: opponent.id, name: opponent.name } : null,
    currentTurnPlayerId: currentGame.currentTurnPlayerId,
    myShips,
    enemyShotsOnMe,
    myShots,
    winnerId: currentGame.winnerId,
  };
}

function sendGameStateTo(userId: string) {
  const state = buildGameStateFor(userId);
  if (!state) return;
  io.to(userId).emit("game.state", state);
}

function broadcastGameState() {
  if (!currentGame) return;
  for (const pid of currentGame.playerIds) {
    sendGameStateTo(pid);
  }
}

// Schüsse verarbeiten
function handleShot(shooterId: string, x: number, y: number) {
  if (!currentGame) {
    io.to(shooterId).emit("error", {
      code: "KEIN_SPIEL",
      message: "Es läuft aktuell kein Spiel.",
    });
    return;
  }

  if (currentGame.phase !== "playing") {
    io.to(shooterId).emit("error", {
      code: "NICHT_SPIELPHASE",
      message: "Es können nur in der Spielphase Schüsse abgegeben werden.",
    });
    return;
  }

  if (!currentGame.playerIds.includes(shooterId)) return;

  if (currentGame.currentTurnPlayerId !== shooterId) {
    io.to(shooterId).emit("error", {
      code: "NICHT_DRAN",
      message: "Du bist nicht am Zug.",
    });
    return;
  }

  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x >= 8 ||
    y < 0 ||
    y >= 8
  ) {
    io.to(shooterId).emit("error", {
      code: "KOORD_UNGUELTIG",
      message: "Koordinaten ungültig.",
    });
    return;
  }

  const opponentId = currentGame.playerIds.find((id) => id !== shooterId);
  if (!opponentId) return;

  const enemyBoard = currentGame.boards[opponentId];
  const cell = enemyBoard[y][x];

  if (cell.hit) {
    io.to(shooterId).emit("error", {
      code: "BEREITS_GETROFFEN",
      message: "Dieses Feld wurde bereits beschossen.",
    });
    return;
  }

  cell.hit = true;
  const hit = cell.hasShip;

  currentGame.shots.push({ x, y, byId: shooterId, hit });

  const opponentHasShipsLeft = enemyBoard.some((row) =>
    row.some((c) => c.hasShip && !c.hit)
  );

  if (!opponentHasShipsLeft) {
    currentGame.phase = "finished";
    currentGame.winnerId = shooterId;
    console.log("Spiel beendet. Gewinner:", shooterId);
    broadcastGameState();
    return;
  }

  currentGame.currentTurnPlayerId = opponentId;
  broadcastGameState();
}

// Socket.IO-Logik
io.on("connection", (socket) => {
  console.log("Verbunden:", socket.id);

  // Login
  socket.on("client.login.senden", ({ name }: { name?: string }) => {
    const nickname = String(name ?? "").trim();

    if (!nickname) {
      socket.emit("server.login.fehler", {
        code: "NAME_LEER",
        message: "Name darf nicht leer sein.",
      });
      return;
    }

    if (nickname.length > 20) {
      socket.emit("server.login.fehler", {
        code: "NAME_ZU_LANG",
        message: "Max. 20 Zeichen.",
      });
      return;
    }

    // Name schon vergeben
    const nameSchonVergeben = users.some(
      (u) => u.name.toLowerCase() === nickname.toLowerCase()
    );
    if (nameSchonVergeben) {
      socket.emit("server.login.fehler", {
        code: "NAME_BEREITS_VERGEBEN",
        message: "Dieser Nickname ist bereits belegt.",
      });
      return;
    }

    const user: User = { id: socket.id, name: nickname };
    users.push(user);

    socket.emit("server.login.ok", { you: user, users });
    socket.broadcast.emit("server.users.update", { users });

    console.log(`${nickname} angemeldet.`);
    startGameIfPossible();
    sendGameStateTo(socket.id);
  });

  // Chat
  socket.on("lobby.chat.senden", ({ text }: { text?: string }) => {
    const u = users.find((u) => u.id === socket.id);
    if (!u) {
      socket.emit("error", {
        code: "NICHT_EINGELOGGT",
        message: "Bitte zuerst einloggen.",
      });
      return;
    }

    const msg = String(text ?? "").trim();
    if (!msg) {
      socket.emit("error", {
        code: "CHAT_LEER",
        message: "Nachricht darf nicht leer sein.",
      });
      return;
    }

    io.emit("lobby.chat.empfangen", {
      von: u.name,
      text: msg,
    });

    socket.emit("lobby.chat.ok", { received: true });
  });

  // Schüsse
  socket.on("game.shoot", ({ x, y }: { x?: number; y?: number }) => {
    handleShot(socket.id, Number(x), Number(y));
  });

  // Disconnect
  socket.on("disconnect", () => {
    const idx = users.findIndex((u) => u.id === socket.id);
    if (idx >= 0) {
      const [u] = users.splice(idx, 1);
      console.log(`${u.name} getrennt.`);
      io.emit("server.users.update", { users });
    } else {
      console.log(`Socket getrennt: ${socket.id}`);
    }

    if (currentGame && currentGame.phase === "playing") {
      if (currentGame.playerIds.includes(socket.id)) {
        const remaining = currentGame.playerIds.find((id) => id !== socket.id);
        if (remaining) {
          currentGame.phase = "finished";
          currentGame.winnerId = remaining;
          console.log(
            "Spiel wegen Disconnect beendet. Gewinner:",
            remaining
          );
          broadcastGameState();
        }
      }
    }
  });
});

httpServer.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
