import { useEffect, useRef } from "react";
import { Button } from "../../components/Button";
import type { PrivacyContact } from "./PrivacyContact";
import styles from "./PrivacyNotice.module.css";
import { PrivacyNoticeParts } from "./PrivacyNoticeParts";
import { usePrivacyContact } from "./usePrivacyContact";

function contactTextOf(contact: PrivacyContact): string {
  switch (contact.kind) {
    case "loading":
      return "Loading the contact address.";
    case "known":
      return contact.address;
    case "unknown":
      return "The contact address could not be loaded. Try again later.";
  }
}

function goBack(): void {
  window.history.back();
}

function goBackOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.stopPropagation();
    goBack();
  }
}

export function PrivacyNoticePage() {
  const contact = usePrivacyContact();
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    pageRef.current?.focus();
    document.addEventListener("keydown", goBackOnEscape, { capture: true });
    return () => {
      document.removeEventListener("keydown", goBackOnEscape, { capture: true });
    };
  }, []);
  return (
    <div
      ref={pageRef}
      tabIndex={-1}
      className={styles["page"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <article className={styles["notice"]}>
        <div>
          <Button look="secondary" onClick={goBack}>
            Back
          </Button>
        </div>
        <h1 id="privacy-title">Privacy notice</h1>
        <section aria-labelledby="privacy-who" className={styles["part"]}>
          <h2 id="privacy-who">Who runs MarketLaw</h2>
          <p>
            MarketLaw is run by one person, reachable at the contact address:{" "}
            <strong>{contactTextOf(contact)}</strong>
          </p>
        </section>
        <PrivacyNoticeParts />
      </article>
    </div>
  );
}
