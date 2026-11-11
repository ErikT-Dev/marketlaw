import { alarmChangeFor } from "../../src/server/room/alarmChangeFor.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";

export class SimulatedAlarm {
  at: number | null = null;
  mostChangesOverAllowance = 0;
  changes = 0;
  private turn = 1;
  private changesThisTurn = 0;
  private allowanceThisTurn = 0;

  sync(record: RoomRecord): void {
    const state = record.game?.saved.state;
    if (state !== undefined && state.turn !== this.turn) {
      this.closeTurn();
      this.turn = state.turn;
    }
    const playersInGame = state?.seats.filter((seat) => seat.departure === null).length ?? 0;
    const marketGoes = this.turn === 1 ? 0 : playersInGame;
    this.allowanceThisTurn = Math.max(this.allowanceThisTurn, marketGoes + playersInGame + 2);
    const change = alarmChangeFor(this.at, record);
    if (change.kind === "keep") {
      return;
    }
    this.at = change.kind === "set" ? change.at : null;
    this.changesThisTurn += 1;
    this.changes += 1;
  }

  fired(): void {
    this.at = null;
  }

  finish(): void {
    this.closeTurn();
  }

  private closeTurn(): void {
    this.mostChangesOverAllowance = Math.max(
      this.mostChangesOverAllowance,
      this.changesThisTurn - this.allowanceThisTurn,
    );
    this.changesThisTurn = 0;
    this.allowanceThisTurn = 0;
  }
}
