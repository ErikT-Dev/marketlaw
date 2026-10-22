import { DurableObject } from "cloudflare:workers";
import type { ServerMessage } from "../shared/ServerMessage";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../shared/parseClientMessage";
import { parseJsonObject } from "../shared/parseJsonObject";
import { recordPressInHistory } from "./recordPressInHistory";
import type { StoredRoomState } from "./StoredRoomState";

const SCHEMA_VERSION = 1;

const INITIAL_STATE: StoredRoomState = { schemaVersion: SCHEMA_VERSION, version: 0, pressCount: 0 };

type RoomStateRow = { schema_version: number; version: number; state_json: string };

export class CounterRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS room_state (id INTEGER PRIMARY KEY, schema_version INTEGER NOT NULL, version INTEGER NOT NULL, state_json TEXT NOT NULL)",
    );
  }

  override fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket upgrade", { status: 426 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") {
      return;
    }
    const clientMessage = parseClientMessage(message);
    if (clientMessage === null) {
      return;
    }
    switch (clientMessage.type) {
      case "resync":
        socket.send(JSON.stringify(toServerMessage(this.readState())));
        return;
      case "press": {
        const state = this.recordPress();
        await recordPressInHistory(this.env.DB, { pressNumber: state.pressCount, pressedAtEpochMs: Date.now() });
        this.broadcast(state);
        return;
      }
      default: {
        const unhandled: never = clientMessage;
        throw new Error(`Unhandled client message: ${JSON.stringify(unhandled)}`);
      }
    }
  }

  private recordPress(): StoredRoomState {
    const current = this.readState();
    const next: StoredRoomState = {
      schemaVersion: SCHEMA_VERSION,
      version: current.version + 1,
      pressCount: current.pressCount + 1,
    };
    this.ctx.storage.sql.exec(
      "INSERT INTO room_state (id, schema_version, version, state_json) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET schema_version = excluded.schema_version, version = excluded.version, state_json = excluded.state_json",
      next.schemaVersion,
      next.version,
      JSON.stringify({ pressCount: next.pressCount }),
    );
    return next;
  }

  private readState(): StoredRoomState {
    const row = this.ctx.storage.sql
      .exec<RoomStateRow>("SELECT schema_version, version, state_json FROM room_state WHERE id = 1")
      .toArray()[0];
    if (row === undefined) {
      return INITIAL_STATE;
    }
    const pressCount = parseJsonObject(row.state_json)?.["pressCount"];
    if (!Number.isSafeInteger(pressCount)) {
      throw new Error("Stored room state is corrupt");
    }
    return { schemaVersion: row.schema_version, version: row.version, pressCount: Number(pressCount) };
  }

  private broadcast(state: StoredRoomState): void {
    const payload = JSON.stringify(toServerMessage(state));
    for (const socket of this.ctx.getWebSockets()) {
      socket.send(payload);
    }
  }
}

function toServerMessage(state: StoredRoomState): ServerMessage {
  return {
    protocolVersion: PROTOCOL_VERSION,
    type: "pressCount",
    version: state.version,
    pressCount: state.pressCount,
  };
}
