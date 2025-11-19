// client/src/gameTypes.ts
export type CellCoord = {
  x: number;
  y: number;
};

export type ShipCell = CellCoord;

export type Shot = CellCoord & {
  hit: boolean; // true = Treffer, false = daneben
};

export type GamePhase = "waiting" | "playing" | "finished";

export interface GameStateForClient {
  myShips: ShipCell[];

  myShots: Shot[];

  enemyShotsOnMe: Shot[];

  phase: GamePhase;

  currentTurnPlayerId: string | null;

  winnerId?: string | null;
}
