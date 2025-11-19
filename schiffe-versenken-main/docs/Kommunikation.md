# Kommunikationsprotokoll – Schiffe Versenken (Meilenstein 3)

Dieses Dokument beschreibt alle zwischen Client und Server übertragenen WebSocket-Events.
Alle Events werden über Socket.IO gesendet.

---

## Übersicht der Events

| Event                    | Richtung           | Beschreibung                                                                                      |
|--------------------------|--------------------|--------------------------------------------------------------------------------------------------|
| `client.login.senden`    | Client → Server    | Spieler:in sendet gewünschten Nicknamen an den Server.                                           |
| `server.login.ok`        | Server → Client    | Server bestätigt Login und sendet eigene User-Daten + Spielerliste.                             |
| `server.login.fehler`    | Server → Client    | Login fehlgeschlagen (leer, zu lang, bereits vergeben).                                         |
| `server.users.update`    | Server → Clients   | Aktualisierte Liste der eingeloggten Spieler:innen.                                             |
| `lobby.chat.senden`      | Client → Server    | Spieler:in sendet Chatnachricht in die Lobby.                                                   |
| `lobby.chat.ok`          | Server → Client    | Server bestätigt, dass die Nachricht empfangen wurde.                                           |
| `lobby.chat.empfangen`   | Server → Clients   | Broadcast einer Chatnachricht an alle verbundenen Spieler:innen.                                |
| `game.shoot`             | Client → Server    | Spieler:in versucht, einen Schuss auf das gegnerische Feld abzugeben.                           |
| `game.state`             | Server → Client    | Server sendet kompletten, personalisierten Spielzustand.                                        |
| `error`                  | Server → Client    | Fehler bei ungültigen Aktionen (z. B. nicht am Zug, Koordinate ungültig).                        |

---

## Event-Details

---

### `client.login.senden`  
**Client → Server**

```json
{
  "name": "Kuensel"
}
