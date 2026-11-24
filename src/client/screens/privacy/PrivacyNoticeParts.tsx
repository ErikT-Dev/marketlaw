import { PictureCredits } from "./PictureCredits";
import styles from "./PrivacyNotice.module.css";

export function PrivacyNoticeParts() {
  return (
    <>
      <section aria-labelledby="privacy-stored" className={styles["part"]}>
        <h2 id="privacy-stored">What is stored and why</h2>
        <ul>
          <li>Your username, your player icon and account, to know who is playing.</li>
          <li>
            For registered users: your email address (and a new one waiting for confirmation), only
            to confirm it and to send password resets, and a one-way hash of your password, to log
            you in. Your password itself is never stored.
          </li>
          <li>
            A one-way code for each browser you are logged in in, with its last day of use, to keep
            you logged in. Your browser keeps the login itself; the site sets no tracking cookies,
            shows no adverts and uses no analytics.
          </li>
          <li>The times of failed logins, to ask for the human check.</li>
          <li>
            How many emails were sent today for your account and to your address (the address kept
            only as a one-way code), for the daily email limits; and your counts of actions and game
            starts today, for the daily limits.
          </li>
          <li>
            Your games: the room&apos;s chat, the moves of every game (to replay it) and the game
            records and ratings shown in match histories and the ranking table.
          </li>
        </ul>
      </section>
      <section aria-labelledby="privacy-how-long" className={styles["part"]}>
        <h2 id="privacy-how-long">How long</h2>
        <p>
          An account until it is deleted, a guest account until it has not been used for 90 days; a
          login until 90 days without use or logging out; failed logins for 15 minutes; daily counts
          for 2 days; email links until they expire; room chat until the room is deleted; the moves
          of a game for 30 days; game records and ratings for good, showing &quot;Deleted
          player&quot; once the account is deleted.
        </p>
      </section>
      <section aria-labelledby="privacy-others" className={styles["part"]}>
        <h2 id="privacy-others">Who else handles it</h2>
        <p>
          Cloudflare runs the site and the human check (Turnstile), which sees your IP address;
          MarketLaw does not store it. Cloudflare keeps request logs for at most 3 days. The email
          service sends the emails and sees your email address.
        </p>
      </section>
      <PictureCredits />
      <section aria-labelledby="privacy-choices" className={styles["part"]}>
        <h2 id="privacy-choices">Your choices</h2>
        <p>
          See and change your username, player icon and email address in account settings, and
          delete your account there: your email address and password hash are removed at once. For
          anything else, write to the contact address.
        </p>
      </section>
    </>
  );
}
