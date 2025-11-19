# Schiffe versenken – Multiplayer Projekt

Dies ist ein Semesterprojekt im Rahmen des Moduls WebE.  
Es handelt sich um ein Multiplayer-Spiel „Schiffe versenken“, bei dem zwei Spieler:innen gegeneinander antreten.  
Der Server ist die „Source of Truth“ und verwaltet die komplette Spiellogik, während der Client nur für Anzeige und Interaktion zuständig ist.  
Die Kommunikation läuft in Echtzeit über WebSockets.

## Ziel des Projekts
- Entwicklung eines responsiven Frontends für Desktop und Mobile.
- Umsetzung der Spiellogik im Backend (Server).
- Persistenz aller Spielzüge, Chatnachrichten und Aktionen in einer Datenbank.
- Realtime-Chat pro Lobby.

## Technologien
- **Frontend:** TypeScript, React, Vite, Tailwind CSS, Socket.IO-Client
- **Backend:** Node.js (TypeScript), Express, Socket.IO, Zod
- **Datenbank:** SQLite + Prisma ORM
- **Qualität/Dev:** Prettier, ESLint, (optional Vitest/Jest)

## Ordnerstruktur

📦 schiffe-versenken  
 ┣ 📂 server – Node.js/TypeScript Backend (Socket.IO Server, index.ts, spätere Spiellogik)  
 ┣ 📂 client – React/TypeScript Frontend (Vite + Socket.IO Client, App.tsx)  
 ┣ 📂 docs – Projektunterlagen (Mockups, Gantt-Diagramm, Meilenstein-Dokumente)  
 ┃ ┗ 📂 mockups – Wireframes/Mockups für UI  
 ┣ 📜 README.md – Projektbeschreibung und Status  

### Kurzbeschreibung
- **server**: Enthält den Chat- und Spiel-Server. Läuft auf Node.js/TypeScript und kommuniziert per WebSockets (Socket.IO).  
- **client**: React/TypeScript-Frontend, das die UI darstellt und Nachrichten an den Server sendet.  
- **docs**: Dokumentation (Mockups, Gantt-Diagramm, Meilensteinberichte).  

## Status Meilenstein 1

- Projektstruktur erstellt (server, client, docs).
- README, Mockups und Gantt-Diagramm hinzugefügt.
- Erste Chat-Implementierung: Client kann Nachrichten an den Server senden, Server bestätigt / broadcastet.
- Technologien aufgesetzt: Node.js/TypeScript im Server, React/TypeScript im Client.



