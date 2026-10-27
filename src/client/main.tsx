import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { openRoomHost } from "./openRoomHost";
import { ClientStore } from "./store/ClientStore";
import "./tokens.css";

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App store={new ClientStore(openRoomHost)} />
  </StrictMode>,
);
