import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { openLobbyFeed } from "./openLobbyFeed";
import { openQueueFeed } from "./openQueueFeed";
import { openRoomHost } from "./openRoomHost";
import { openTutorialHost } from "./openTutorialHost";
import { keepCardSetInsideApp } from "./screens/cardSet/keepCardSetInsideApp";
import { keepPrivacyNoticeInsideApp } from "./screens/privacy/keepPrivacyNoticeInsideApp";
import { keepRecordPageInsideApp } from "./screens/records/keepRecordPageInsideApp";
import { keepRulesPageInsideApp } from "./screens/rules/keepRulesPageInsideApp";
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
keepRulesPageInsideApp();
keepCardSetInsideApp();
const store = new ClientStore(openRoomHost, openLobbyFeed, openQueueFeed, openTutorialHost);
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
