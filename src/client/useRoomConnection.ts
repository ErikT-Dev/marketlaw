import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage } from "../shared/ClientMessage";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseServerMessage } from "../shared/parseServerMessage";
import type { RoomConnection } from "./RoomConnection";

const RECONNECT_DELAY_MS = 1000;

export function useRoomConnection(): RoomConnection {
  const [pressCount, setPressCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isActive = true;
    let reconnectTimer: number | undefined;

    function connect(): void {
      const socket = new WebSocket(roomUrl());
      socketRef.current = socket;
      socket.addEventListener("open", () => {
        setIsConnected(true);
        sendMessage(socket, { protocolVersion: PROTOCOL_VERSION, type: "resync" });
      });
      socket.addEventListener("message", (event: MessageEvent<unknown>) => {
        const message = typeof event.data === "string" ? parseServerMessage(event.data) : null;
        if (message !== null) {
          setPressCount(message.pressCount);
        }
      });
      socket.addEventListener("close", () => {
        setIsConnected(false);
        if (isActive) {
          reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      });
    }

    connect();
    return () => {
      isActive = false;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, []);

  const press = useCallback(() => {
    const socket = socketRef.current;
    if (socket !== null && socket.readyState === WebSocket.OPEN) {
      sendMessage(socket, { protocolVersion: PROTOCOL_VERSION, type: "press" });
    }
  }, []);

  return { pressCount, isConnected, press };
}

function sendMessage(socket: WebSocket, message: ClientMessage): void {
  socket.send(JSON.stringify(message));
}

function roomUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/room`;
}
