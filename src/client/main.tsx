import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { openLobbyFeed } from "./openLobbyFeed";
import { openRoomHost } from "./openRoomHost";
import { keepPrivacyNoticeInsideApp } from "./screens/privacy/keepPrivacyNoticeInsideApp";
import { keepRecordPageInsideApp } from "./screens/records/keepRecordPageInsideApp";
import { ClientStore } from "./store/ClientStore";
import { emailLinkFrom } from "./store/emailLinkFrom";
import { sessionFromLink } from "./store/sessionFromLink";
import "./tokens.css";

const linkedSession = sessionFromLink(window.location.hash);
const emailLink = emailLinkFrom(window.location.hash);
if (linkedSession !== null || emailLink !== null) {
  window.history.replaceState(null, "", window.location.pathname);
}
keepPrivacyNoticeInsideApp();
keepRecordPageInsideApp();
const store = new ClientStore(openRoomHost, openLobbyFeed);
if (linkedSession !== null) {
  void store.startFromSeatLink(linkedSession, () =>
    window.confirm(
      "Switch to this test room seat? Your current guest account cannot be logged back into.",
    ),
  );
}
if (emailLink !== null) {
  void store.openEmailLink(emailLink);
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
