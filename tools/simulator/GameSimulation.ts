import { randomUUID } from "node:crypto";
import * as v from "valibot";
import type { BotChooser } from "../../src/bots/BotChooser.ts";
import { chaosBot } from "../../src/bots/chaosBot.ts";
import type { ChaosMove } from "../../src/bots/ChaosMove.ts";
import { legalBot } from "../../src/bots/legalBot.ts";
import { invariantViolations } from "../../src/rules/invariantViolations.ts";
import { randomForNextAction } from "../../src/rules/randomForNextAction.ts";
import { startSavedGame } from "../../src/rules/startSavedGame.ts";
import type { Identity } from "../../src/server/room/Identity.ts";
import { receiveMessage } from "../../src/server/room/receiveMessage.ts";
import { ROOM_SCHEMA_VERSION } from "../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import type { RoomStorage } from "../../src/server/room/RoomStorage.ts";
import { updateFor } from "../../src/server/room/updateFor.ts";
import { EpochMs } from "../../src/shared/EpochMs.ts";
import { PlayerId } from "../../src/shared/PlayerId.ts";
import { PROTOCOL_VERSION } from "../../src/shared/PROTOCOL_VERSION.ts";
import { parseClientMessage } from "../../src/shared/protocol/parseClientMessage.ts";
import { RoomCode } from "../../src/shared/RoomCode.ts";
import type { BotKind } from "./BotKind.ts";
import type { SimulatedSeat } from "./SimulatedSeat.ts";

const MESSAGE_GAP_MS = 1_000;

export class GameSimulation {
  record: RoomRecord;
  readonly seats: SimulatedSeat[];
  readonly messages: string[] = [];
  readonly violations: string[] = [];
  readonly rowsPerAcceptedAction: number[] = [];
  readonly rowsPerOtherMessage: number[] = [];
  readonly statesAfterEachAction: string[] = [];
  private rowsWritten = 0;
  private nowMs = 0;
  private readonly storage: RoomStorage = {
    read: () => this.record,
    write: (record) => {
      this.record = record;
      this.rowsWritten += 1;
    },
    remove: () => {
      throw new Error("the simulator never removes its room");
    },
  };

  readonly bot: BotKind;
  private readonly chooser: BotChooser;

  constructor(seed: number, players: 2 | 3 | 4, bot: BotKind, chooser: BotChooser) {
    this.bot = bot;
    this.chooser = chooser;
    const saved = startSavedGame({ players }, seed);
    const identities: ReadonlyArray<Identity> = saved.state.seats.map((seat) => ({
      playerId: v.parse(PlayerId, randomUUID()),
      name: `Bot ${String(seat.seat)}`,
    }));
    this.seats = saved.state.seats.map((seat, index) => ({
      seat: seat.seat,
      identity: identities[index] ?? { playerId: v.parse(PlayerId, randomUUID()), name: "Bot" },
      connection: { identity: null, rejectionTimes: [] },
      view: null,
      stateVersion: 0,
    }));
    this.record = {
      schemaVersion: ROOM_SCHEMA_VERSION,
      code: v.parse(RoomCode, "SMQ2AB"),
      size: players,
      players: identities,
      game: {
        saved,
        seats: this.seats.map((seat) => ({
          seat: seat.seat,
          playerId: seat.identity.playerId,
          stateVersion: 0,
          acceptedActionIds: [],
        })),
      },
    };
  }

  connectEveryone(): void {
    for (const seat of this.seats) {
      this.send(seat, this.envelope(seat, { type: "resync" }));
    }
  }

  takeTurnFor(seat: SimulatedSeat): void {
    if (seat.view === null) {
      return;
    }
    const move: ChaosMove =
      this.bot === "chaos"
        ? chaosBot(seat.view, this.chooser)
        : { kind: "intent", intent: legalBot(seat.view, this.chooser) ?? { type: "end_turn" } };
    this.send(seat, this.textOf(seat, move));
  }

  private textOf(seat: SimulatedSeat, move: ChaosMove): string {
    if (move.kind === "raw") {
      return move.text;
    }
    const stateVersion = move.kind === "stale" ? seat.stateVersion + 1 : seat.stateVersion;
    return this.envelope(seat, {
      type: "action",
      actionId: `a${String(this.messages.length + 1)}`,
      stateVersion,
      action: move.intent,
    });
  }

  private envelope(seat: SimulatedSeat, body: Readonly<Record<string, unknown>>): string {
    return JSON.stringify({
      protocolVersion: PROTOCOL_VERSION,
      token: seat.identity.playerId,
      ...body,
    });
  }

  private send(seat: SimulatedSeat, text: string): void {
    this.messages.push(text);
    this.nowMs += MESSAGE_GAP_MS;
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk ? this.identityByToken(parsed.value.token) : null;
    const before = this.record;
    const viewsBefore = this.viewsText(before);
    const rowsBefore = this.rowsWritten;
    const outcome = receiveMessage(this.storage, {
      connection: seat.connection,
      parsed,
      sender,
      now: v.parse(EpochMs, this.nowMs),
      randomFor: randomForNextAction,
    });
    if (outcome.isRoomGone) {
      throw new Error("the simulated room is gone");
    }
    const isAccepted = outcome.reply.type === "update" && outcome.reply.acceptedActionId !== null;
    (isAccepted ? this.rowsPerAcceptedAction : this.rowsPerOtherMessage).push(
      this.rowsWritten - rowsBefore,
    );
    this.check(before, viewsBefore, isAccepted);
    seat.connection = outcome.shouldClose
      ? { identity: null, rejectionTimes: [] }
      : outcome.connection;
    this.refreshViews();
  }

  private check(before: RoomRecord, viewsBefore: string, isAccepted: boolean): void {
    const beforeGame = before.game;
    const afterGame = this.record.game;
    if (beforeGame === null || afterGame === null) {
      return;
    }
    const beforeState = beforeGame.saved.state;
    const lastAction = afterGame.saved.actionLog.at(-1);
    if (isAccepted && lastAction !== undefined && afterGame !== beforeGame) {
      this.statesAfterEachAction.push(JSON.stringify(afterGame.saved.state));
      this.addViolations(
        invariantViolations({
          before: beforeState,
          beforeAsText: JSON.stringify(beforeState),
          action: lastAction,
          outcome: { isOk: true, value: afterGame.saved.state },
        }),
      );
      return;
    }
    if (this.viewsText(this.record) !== viewsBefore) {
      this.addViolations(["I27: a rejected or repeated message changed a view or a state version"]);
    }
  }

  private addViolations(found: ReadonlyArray<string>): void {
    this.violations.push(...found);
  }

  private viewsText(record: RoomRecord): string {
    return JSON.stringify(this.seats.map((seat) => updateFor(record, seat.identity.playerId)));
  }

  private refreshViews(): void {
    for (const seat of this.seats) {
      const update = updateFor(this.record, seat.identity.playerId);
      seat.view = update.game?.view ?? null;
      seat.stateVersion = update.game?.stateVersion ?? 0;
    }
  }

  private identityByToken(token: string): Identity | null {
    return this.seats.find((seat) => seat.identity.playerId === token)?.identity ?? null;
  }
}
