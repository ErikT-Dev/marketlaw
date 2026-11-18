import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import type { TimedAction } from "../../rules/TimedAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { dayOf } from "../lobby/dayOf";
import { EMPTY_LOBBY } from "../lobby/EMPTY_LOBBY";
import { withActionsAdded } from "../lobby/withActionsAdded";
import { actionsAddedBetween } from "./actionsAddedBetween";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";

const NOW = v.parse(EpochMs, 1_761_436_800_000);
function identityNamed(name: string): Identity {
  return { playerId: v.parse(PlayerId, crypto.randomUUID()), name };
}

const ANN = identityNamed("Ann");
const BEA = identityNamed("Bea");
const CID = identityNamed("Cid");
const PLAYERS = [ANN, BEA, CID];
const LIVE = PLAYERS.map(({ playerId }) => playerId);

function storageOf(): RoomStorage & { readonly stored: () => RoomRecord } {
  let stored: RoomRecord | undefined;
  return {
    read: () => stored,
    write: (record) => {
      stored = record;
    },
    remove: () => {
      stored = undefined;
    },
    stored: () => {
      if (stored === undefined) {
        throw new Error("the room is gone");
      }
      return stored;
    },
  };
}

function send(storage: RoomStorage, sender: Identity, message: Readonly<Record<string, unknown>>) {
  receiveMessage(storage, {
    connection: { identity: sender, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...message }),
    ),
    sender,
    now: NOW,
    randomFor: randomForNextAction,
    gameStart: {
      seed: 1,
      now: NOW,
      seatOrder: (players) => players,
      limitRejectionFor: () => null,
    },
    livePlayers: LIVE,
    chat: NO_CHAT_CONTEXT,
  });
}

function leaveGame(storage: ReturnType<typeof storageOf>, sender: Identity): RoomRecord {
  const seat = storage.stored().game?.seats.find(({ playerId }) => playerId === sender.playerId);
  send(storage, sender, {
    type: "action",
    actionId: `leave-${sender.name}`,
    stateVersion: seat?.stateVersion ?? 0,
    action: { type: "leave_game" },
  });
  return storage.stored();
}

function runningGame(): ReturnType<typeof storageOf> {
  const storage = storageOf();
  const [owner, ...others] = PLAYERS;
  if (owner === undefined) {
    throw new Error("no players");
  }
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 3, isPublic: true }, owner, NOW);
  for (const player of others) {
    joinRoomIn(storage, player, NOW, LIVE);
  }
  for (const player of PLAYERS) {
    send(storage, player, { type: "room", action: { type: "accept_game" } });
  }
  return storage;
}

function withLogBefore(record: RoomRecord, entries: ReadonlyArray<TimedAction>): RoomRecord {
  const { game } = record;
  return game === null
    ? record
    : {
        ...record,
        game: {
          ...game,
          saved: { ...game.saved, actionLog: [...entries, ...game.saved.actionLog] },
        },
      };
}

function seatOf(record: RoomRecord, player: Identity) {
  const seat = record.game?.seats.find(({ playerId }) => playerId === player.playerId)?.seat;
  if (seat === undefined) {
    throw new Error("no seat");
  }
  return seat;
}

describe("the actions added to the daily count", () => {
  it("adds a leaver's own moves and leaving, but not time-outs, pauses or resumes", () => {
    const storage = runningGame();
    const seat = seatOf(storage.stored(), ANN);
    const earlier: ReadonlyArray<TimedAction> = [
      { action: { type: "end_turn", seat }, at: NOW },
      { action: { type: "undo", seat }, at: NOW },
      { action: { type: "time_out", seat }, at: NOW },
      { action: { type: "pause_game", seat }, at: NOW },
      { action: { type: "resume_game", seat }, at: NOW },
      { action: { type: "end_turn", seat: seatOf(storage.stored(), BEA) }, at: NOW },
    ];
    const before = withLogBefore(storage.stored(), earlier);
    const after = withLogBefore(leaveGame(storage, ANN), earlier);
    expect(actionsAddedBetween(before, after)).toEqual([{ playerId: ANN.playerId, actions: 3 }]);
  });

  it("adds nothing while every seat is still in the game", () => {
    const storage = runningGame();
    expect(actionsAddedBetween(null, storage.stored())).toEqual([]);
    expect(actionsAddedBetween(storage.stored(), storage.stored())).toEqual([]);
  });

  it("adds every seat still in the game when it ends, and not the one who left before", () => {
    const storage = runningGame();
    leaveGame(storage, ANN);
    const before = storage.stored();
    const ended = leaveGame(storage, BEA);
    expect(ended.game?.saved.state.phase).toBe("ended");
    expect(actionsAddedBetween(before, ended)).toEqual([
      { playerId: BEA.playerId, actions: 1 },
      { playerId: CID.playerId, actions: 0 },
    ]);
    expect(actionsAddedBetween(ended, ended)).toEqual([]);
  });

  it("adds nothing for a test room started from a given state", () => {
    const storage = runningGame();
    const running = storage.stored();
    const game = running.game;
    const testRoom =
      game === null
        ? running
        : {
            ...running,
            game: { ...game, saved: { ...game.saved, startingState: game.saved.state } },
          };
    const left = leaveGame(storage, ANN);
    const leftGame = left.game;
    const leftTestRoom =
      leftGame === null
        ? left
        : {
            ...left,
            game: {
              ...leftGame,
              saved: { ...leftGame.saved, startingState: leftGame.saved.state },
            },
          };
    expect(actionsAddedBetween(testRoom, leftTestRoom)).toEqual([]);
  });
});

describe("adding actions to the lobby's counts", () => {
  const annId = v.parse(PlayerId, crypto.randomUUID());
  const beaId = v.parse(PlayerId, crypto.randomUUID());
  const today = {
    ...EMPTY_LOBBY,
    today: {
      day: dayOf(NOW),
      players: [{ playerId: annId, actions: 1990, gameStarts: 2 }],
      siteGameStarts: 5,
      siteChatMessages: 0,
      siteEmails: 0,
      siteTutorialStarts: 0,
    },
  };

  it("adds to today's counts and keeps the game starts", () => {
    const added = withActionsAdded(
      today,
      [
        { playerId: annId, actions: 15 },
        { playerId: beaId, actions: 4 },
      ],
      NOW,
    );
    expect(added.today).toEqual({
      day: dayOf(NOW),
      players: [
        { playerId: annId, actions: 2005, gameStarts: 2 },
        { playerId: beaId, actions: 4, gameStarts: 0 },
      ],
      siteGameStarts: 5,
      siteChatMessages: 0,
      siteEmails: 0,
      siteTutorialStarts: 0,
    });
  });

  it("starts from zero on a new day", () => {
    const tomorrow = v.parse(EpochMs, NOW + 86_400_000);
    expect(withActionsAdded(today, [{ playerId: annId, actions: 15 }], tomorrow).today).toEqual({
      day: dayOf(tomorrow),
      players: [{ playerId: annId, actions: 15, gameStarts: 0 }],
      siteGameStarts: 0,
      siteChatMessages: 0,
      siteEmails: 0,
      siteTutorialStarts: 0,
    });
  });

  it("leaves the record unchanged when nothing is added", () => {
    expect(withActionsAdded(today, [], NOW)).toBe(today);
  });
});
