import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import type { GameStartRejection } from "../lobby/GameStartRejection";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { receiveCheckingGameStart } from "./receiveCheckingGameStart";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const NOW = v.parse(EpochMs, 5_000_000);
const ANN: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Ann" };
const BEA: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Bea" };

function roomOfAnnAndBea(): { storage: RoomStorage; current: () => RoomRecord | undefined } {
  const kept: { record?: RoomRecord } = {};
  const storage: RoomStorage = {
    read: () => kept.record,
    write: (record) => {
      kept.record = record;
    },
    remove: () => {
      delete kept.record;
    },
  };
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, NOW);
  joinRoomIn(storage, BEA, NOW, [ANN.playerId, BEA.playerId]);
  return { storage, current: () => kept.record };
}

async function acceptAs(
  storage: RoomStorage,
  sender: Identity,
  lobbyAnswer: GameStartRejection | null | Error,
) {
  const asked: Array<ReadonlyArray<PlayerId>> = [];
  const outcome = await receiveCheckingGameStart(
    storage,
    {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(
        JSON.stringify({
          protocolVersion: PROTOCOL_VERSION,
          token: "t",
          type: "room",
          action: { type: "accept_game" },
        }),
      ),
      sender,
      now: NOW,
      randomFor: randomForNextAction,
      gameStart: { seed: 3, now: NOW, seatOrder: (players) => players },
      livePlayers: [ANN.playerId, BEA.playerId],
    },
    async (players) => {
      asked.push(players);
      if (lobbyAnswer instanceof Error) {
        return Promise.reject(lobbyAnswer);
      }
      return Promise.resolve(lobbyAnswer);
    },
  );
  if (outcome.isRoomGone) {
    throw new Error("the room is gone");
  }
  return { outcome, asked };
}

describe("the daily limits when a game starts", () => {
  it("asks the lobby once with every player when the last player accepts and starts the game", async () => {
    const { storage, current } = roomOfAnnAndBea();
    expect((await acceptAs(storage, ANN, null)).asked).toEqual([]);
    const last = await acceptAs(storage, BEA, null);
    expect(last.asked).toEqual([[ANN.playerId, BEA.playerId]]);
    expect(current()?.game).not.toBeNull();
  });

  it("removes a player over their own limit without a rejoin wait and keeps the others waiting", async () => {
    const { storage, current } = roomOfAnnAndBea();
    await acceptAs(storage, ANN, null);
    const { outcome } = await acceptAs(storage, BEA, {
      kind: "players_over_limit",
      players: [{ playerId: ANN.playerId, reason: "daily_game_start_limit" }],
    });
    expect(outcome.removals).toEqual([
      { playerId: ANN.playerId, reason: "daily_game_start_limit", rejoinAt: null },
    ]);
    expect(outcome.reply.type).toBe("update");
    expect(current()?.players.map(({ name }) => name)).toEqual(["Bea"]);
    expect(current()?.waiting.asking).toBeNull();
    expect(current()?.waiting.rejoinBlocks).toEqual([]);
  });

  it("tells a player over their own limit who accepted last that they were removed", async () => {
    const { storage } = roomOfAnnAndBea();
    await acceptAs(storage, ANN, null);
    const { outcome } = await acceptAs(storage, BEA, {
      kind: "players_over_limit",
      players: [{ playerId: BEA.playerId, reason: "daily_action_limit" }],
    });
    expect(outcome.reply).toEqual({
      type: "removed",
      protocolVersion: PROTOCOL_VERSION,
      reason: "daily_action_limit",
      rejoinAt: null,
    });
    expect(outcome.removals).toEqual([]);
  });

  it("keeps everyone at the site limit, ends the asking and tells every player", async () => {
    const { storage, current } = roomOfAnnAndBea();
    await acceptAs(storage, ANN, null);
    const { outcome } = await acceptAs(storage, BEA, { kind: "site_game_limit" });
    expect(outcome.reply).toEqual({
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId: null,
      code: "site_game_limit",
    });
    expect(outcome.notices).toEqual([
      { playerId: ANN.playerId, notice: { kind: "site_game_limit" } },
    ]);
    expect(outcome.playersToUpdate).toEqual([ANN.playerId, BEA.playerId]);
    expect(current()?.game).toBeNull();
    expect(current()?.waiting.asking).toBeNull();
    expect(current()?.players).toHaveLength(2);
  });

  it("refuses the last acceptance with no_answer and keeps the asking when the lobby does not answer", async () => {
    const { storage, current } = roomOfAnnAndBea();
    await acceptAs(storage, ANN, null);
    const before = current();
    const { outcome } = await acceptAs(storage, BEA, new Error("the lobby is unreachable"));
    expect(outcome.reply).toEqual({
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId: null,
      code: "no_answer",
    });
    expect(outcome.removals).toEqual([]);
    expect(outcome.notices).toEqual([]);
    expect(outcome.playersToUpdate).toEqual([]);
    expect(current()).toEqual(before);
    expect(current()?.waiting.asking?.accepted).toEqual([ANN.playerId]);
    const retried = await acceptAs(storage, BEA, null);
    expect(retried.asked).toEqual([[ANN.playerId, BEA.playerId]]);
    expect(current()?.game).not.toBeNull();
  });
});
