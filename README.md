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
┣ 📂 server → Socket.IO Server (TypeScript)
┃ ┗ 📜 index.ts → Login-, Chat- und Verbindungslogik
┣ 📂 client → React Frontend (Vite)
┃ ┣ 📂 src
┃ ┃ ┣ 📂 components → UI-Komponenten (LoginForm, ChatPanel, SystemBar, MessageList)
┃ ┃ ┣ 📜 App.tsx → Hauptkomponente
┃ ┃ ┣ 📜 main.tsx → Einstiegspunkt React
┃ ┃ ┗ 📜 socket.ts → Verbindung zum Server (Socket.IO)
┣ 📂 docs → Projektunterlagen (Mockups, Meilensteinberichte)
┗ 📜 README.md → Projektbeschreibung

### Kurzbeschreibung
- **server**: Enthält den Chat- und Spiel-Server. Läuft auf Node.js/TypeScript und kommuniziert per WebSockets (Socket.IO).  
- **client**: React/TypeScript-Frontend, das die UI darstellt und Nachrichten an den Server sendet.  
- **docs**: Dokumentation (Mockups, Gantt-Diagramm, Meilensteinberichte).  

## Kurzanleitung
- Server starten (Server läuft dann auf http://localhost:3000/)
- Client starten

## Status Meilenstein 1

- Projektstruktur erstellt (server, client, docs).
- README, Mockups und Gantt-Diagramm hinzugefügt.
- Erste Chat-Implementierung: Client kann Nachrichten an den Server senden, Server bestätigt / broadcastet.
- Technologien aufgesetzt: Node.js/TypeScript im Server, React/TypeScript im Client.


## Status Meilenstein 2
- Login-System mit Nickname umgesetzt (inkl. Validierung).
- Echtzeit-Chat mit Socket.IO zwischen allen eingeloggten Benutzern implementiert.
- Anzeige der aktuellen Spielerliste mit automatischer Aktualisierung bei Login/Logout.
- Folgende Frontend-Komponenten erstellt:
   - LoginForm.tsx → Loginmaske mit Statusmeldungen
   - ChatPanel.tsx → Anzeige und Eingabe von Chatnachrichten
   - SystemBar.tsx → Verbindungsstatus (z. B. "Verbunden")
   - MessageList.tsx → Darstellung des Chatverlaufs
- Serverseitige Verwaltung der Benutzer in einer In-Memory-Liste.
- Chatnachrichten werden an alle Clients gesendet und direkt angezeigt.
- Verbindung zwischen Frontend (Port 5173) und Backend (Port 3000) funktioniert zuverlässig.
- Grundlage für die spätere Spiellogik ist vorbereitet.

## Status Meilenstein 3
- Vollständige Spiellogik auf dem Server (Treffer, Miss, Zugwechsel, Sieg)
- Server verwaltet den gesamten Spielstatus ("currentGame")
- Echtzeit-Synchronisation über das Event "game.state"
- Login mit Validierung (leer, zu lang, Name bereits vergeben)
- Spielstart, sobald zwei Spieler eingeloggt sind
- Visualisierung eigener Schiffe und gegnerischer Treffer
- Anzeige eigener Schüsse auf das gegnerische Feld
- Anzeige, wer am Zug ist
- Gewinneranzeige
- Lobby-Chat mit Fehlerbehandlung
- Disconnect beendet das Spiel korrekt
- Kommunikationsprotokoll in "docs/Kommunikation.md" dokumentiert
- Meilenstein-3-Dokumentation in "docs/" erstellt








