import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { openRoomHost } from "./openRoomHost";
import { ClientStore } from "./store/ClientStore";
import { sessionFromLink } from "./store/sessionFromLink";
import { writeSession } from "./store/writeSession";
import "./tokens.css";

const linkedSession = sessionFromLink(window.location.hash);
if (linkedSession !== null) {
  writeSession(linkedSession);
  window.history.replaceState(null, "", window.location.pathname);
}

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App store={new ClientStore(openRoomHost)} />
  </StrictMode>,
);
