import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { openLobbyFeed } from "./openLobbyFeed";
import { openRoomHost } from "./openRoomHost";
import { ClientStore } from "./store/ClientStore";
import { sessionFromLink } from "./store/sessionFromLink";
import "./tokens.css";

const linkedSession = sessionFromLink(window.location.hash);
if (linkedSession !== null) {
  window.history.replaceState(null, "", window.location.pathname);
}
const store = new ClientStore(openRoomHost, openLobbyFeed);
if (linkedSession !== null) {
  void store.startFromSeatLink(linkedSession, () =>
    window.confirm(
      "Switch to this test room seat? Your current guest account cannot be logged back into.",
    ),
  );
}

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
