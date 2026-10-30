import * as v from "valibot";
import type { BotChooser } from "../../src/bots/BotChooser.ts";
import { chaosBot } from "../../src/bots/chaosBot.ts";
import type { ChaosMove } from "../../src/bots/ChaosMove.ts";
import { legalBot } from "../../src/bots/legalBot.ts";
import { randomForNextAction } from "../../src/rules/randomForNextAction.ts";
import { startSavedGame } from "../../src/rules/startSavedGame.ts";
import type { Identity } from "../../src/server/room/Identity.ts";
import { fireAlarm } from "../../src/server/room/fireAlarm.ts";
import { playersWhoseUpdateChanged } from "../../src/server/room/playersWhoseUpdateChanged.ts";
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
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";
import type { ServerMessage } from "../../src/shared/protocol/ServerMessage.ts";
import type { BotKind } from "./BotKind.ts";
import type { SeatUpdates } from "./SeatUpdates.ts";
import { scanTextOf } from "./scanTextOf.ts";
import type { SentToSeat } from "./SentToSeat.ts";
import type { SimulatedSeat } from "./SimulatedSeat.ts";
import { AwakeTally } from "./AwakeTally.ts";
import { newActionChecks } from "./newActionChecks.ts";
import { SimulatedAlarm } from "./SimulatedAlarm.ts";
import { whatSeatsSeeViolations } from "./whatSeatsSeeViolations.ts";

const MESSAGE_GAP_MS = 1_000;

function playerIdFor(seed: number, seat: number): PlayerId {
  const seedHex = (seed >>> 0).toString(16).padStart(8, "0");
  return v.parse(PlayerId, `${seedHex}-0000-4000-8000-${seat.toString(16).padStart(12, "0")}`);
}

export class GameSimulation {
  record: RoomRecord;
  readonly seats: SimulatedSeat[];
  readonly messages: string[] = [];
  readonly violations: string[] = [];
  readonly rowsPerAcceptedAction: number[] = [];
  readonly rowsPerOtherMessage: number[] = [];
  readonly statesAfterEachAction: string[] = [];
  firstViolationAt: number | null = null;
  readonly alarm = new SimulatedAlarm();
  readonly awake = new AwakeTally();
  private lastUpdates: SeatUpdates | null = null;
  private rowsWritten = 0;
  private nowMs = 0;
  private readonly storage: RoomStorage = {
    read: () => this.record,
    write: (record) => {
      this.record = this.stored(record);
      this.rowsWritten += 1;
    },
    remove: () => {
      throw new Error("the simulator never removes its room");
    },
  };

  readonly bot: BotKind;
  private readonly chooser: BotChooser;

  private readonly stored: (record: RoomRecord) => RoomRecord;

  constructor(
    seed: number,
    players: 2 | 3 | 4,
    options: {
      readonly bot: BotKind;
      readonly chooser: BotChooser;
      readonly stored: (record: RoomRecord) => RoomRecord;
    },
  ) {
    this.bot = options.bot;
    this.chooser = options.chooser;
    this.stored = options.stored;
    const saved = startSavedGame({ players, startedAt: v.parse(EpochMs, 0) }, seed);
    const identities: ReadonlyArray<Identity> = saved.state.seats.map((seat) => ({
      playerId: playerIdFor(seed, seat.seat),
      name: `Bot ${String(seat.seat)}`,
    }));
    this.seats = saved.state.seats.map((seat, index) => ({
      seat: seat.seat,
      identity: identities[index] ?? { playerId: playerIdFor(seed, seat.seat), name: "Bot" },
      connection: { identity: null, rejectionTimes: [] },
      view: null,
      stateVersion: 0,
      lastActionText: null,
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
    if (move.kind === "repeat") {
      return seat.lastActionText ?? this.envelope(seat, { type: "resync" });
    }
    const stateVersion = move.kind === "stale" ? seat.stateVersion + 1 : seat.stateVersion;
    const text = this.envelope(seat, {
      type: "action",
      actionId: `a${String(this.messages.length + 1)}`,
      stateVersion,
      action: move.intent,
    });
    seat.lastActionText = text;
    return text;
  }

  private envelope(seat: SimulatedSeat, body: Readonly<Record<string, unknown>>): string {
    return JSON.stringify({
      protocolVersion: PROTOCOL_VERSION,
      token: seat.identity.playerId,
      ...body,
    });
  }

  private fireDueAlarms(): void {
    for (let at = this.alarm.at; at !== null && at <= this.nowMs; at = this.alarm.at) {
      this.alarm.fired();
      this.awake.event();
      const before = this.record;
      const updatesBefore = this.lastUpdates ?? this.updatesNow();
      const fired = fireAlarm(before, v.parse(EpochMs, at), randomForNextAction);
      if (fired !== before) {
        const rowsBefore = this.rowsWritten;
        this.storage.write(fired);
        this.rowsPerAcceptedAction.push(this.rowsWritten - rowsBefore);
        const after = this.updatesNow();
        this.check(before, updatesBefore.allText === after.allText, true);
        const timedOut = (fired.game?.saved.actionLog ?? [])
          .slice(before.game?.saved.actionLog.length ?? 0)
          .map(({ action }) => action.seat);
        this.addViolations(
          whatSeatsSeeViolations(
            before,
            fired,
            { seats: timedOut, isAccepted: true },
            this.sentTo(
              null,
              { reply: null, playersToUpdate: playersWhoseUpdateChanged(before, fired) },
              { before: updatesBefore, after },
            ),
          ),
        );
        this.refreshViews(after);
        this.lastUpdates = after;
      }
      this.alarm.sync(this.record);
    }
  }

  private send(seat: SimulatedSeat, text: string): void {
    this.messages.push(text);
    this.nowMs += MESSAGE_GAP_MS;
    this.fireDueAlarms();
    this.awake.event();
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk ? this.identityByToken(parsed.value.token) : null;
    const before = this.record;
    const updatesBefore = this.lastUpdates ?? this.updatesNow();
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
    const isAccepted =
      (this.record.game?.saved.actionLog.length ?? 0) > (before.game?.saved.actionLog.length ?? 0);
    (isAccepted ? this.rowsPerAcceptedAction : this.rowsPerOtherMessage).push(
      this.rowsWritten - rowsBefore,
    );
    const after = this.updatesNow();
    this.check(before, updatesBefore.allText === after.allText, isAccepted);
    this.addViolations(
      whatSeatsSeeViolations(
        before,
        this.record,
        { seats: [seat.seat], isAccepted },
        this.sentTo(seat, outcome, { before: updatesBefore, after }),
      ),
    );
    seat.connection = outcome.shouldClose
      ? { identity: null, rejectionTimes: [] }
      : outcome.connection;
    this.refreshViews(after);
    this.lastUpdates = after;
    this.alarm.sync(this.record);
  }

  private updatesNow(): SeatUpdates {
    const updates = this.seats.map((seat) => updateFor(this.record, seat.identity.playerId));
    const texts = updates.map((update) => JSON.stringify(update));
    return { updates, texts, allText: `[${texts.join(",")}]` };
  }

  private sentTo(
    sender: SimulatedSeat | null,
    outcome: {
      readonly reply: ServerMessage | null;
      readonly playersToUpdate: ReadonlyArray<PlayerId>;
    },
    updates: { readonly before: SeatUpdates; readonly after: SeatUpdates },
  ): ReadonlyMap<SeatNumber, SentToSeat> {
    const reply = outcome.reply;
    const replyText = reply?.type === "update" ? scanTextOf(reply.update) : JSON.stringify(reply);
    const isSenderUpdated = reply?.type === "rejected";
    return new Map(
      this.seats.map((seat, index) => {
        const update = updates.after.updates[index];
        const scanned = update === undefined ? "" : scanTextOf(update);
        return [
          seat.seat,
          {
            text: seat === sender ? `${scanned}${replyText}` : scanned,
            view: update?.game?.view,
            isFrameSent:
              (seat !== sender || isSenderUpdated) &&
              outcome.playersToUpdate.includes(seat.identity.playerId),
            isUnchanged: updates.before.texts[index] === updates.after.texts[index],
          },
        ];
      }),
    );
  }

  private check(before: RoomRecord, isViewUnchanged: boolean, isAccepted: boolean): void {
    const beforeGame = before.game;
    const afterGame = this.record.game;
    if (beforeGame === null || afterGame === null) {
      return;
    }
    if (isAccepted && afterGame !== beforeGame) {
      const checked = newActionChecks(beforeGame.saved, afterGame.saved);
      this.statesAfterEachAction.push(...checked.states);
      this.addViolations(checked.violations);
      return;
    }
    if (!isViewUnchanged) {
      this.addViolations(["I27: a rejected or repeated message changed a view or a state version"]);
    }
  }

  private addViolations(found: ReadonlyArray<string>): void {
    if (found.length > 0 && this.firstViolationAt === null) {
      this.firstViolationAt = this.messages.length;
    }
    this.violations.push(...found);
  }

  private refreshViews(after: SeatUpdates): void {
    for (const [index, seat] of this.seats.entries()) {
      const update = after.updates[index];
      seat.view = update?.game?.view ?? null;
      seat.stateVersion = update?.game?.stateVersion ?? 0;
    }
  }

  private identityByToken(token: string): Identity | null {
    return this.seats.find((seat) => seat.identity.playerId === token)?.identity ?? null;
  }
}
