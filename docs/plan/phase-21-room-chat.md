# Phase 21: Room chat

Status: approved
Milestone: 4 Together

## Goal

One chat per room, in the waiting room, during the game and after it, with limits and muting.

## Depends on

Phase 20.

## Covers

- Rules: A11, A9.6's chat cap, M8.2's "chat deleted with the room", M6.7 and M2.2's chat parts.
- Budgets: B7 (one row per chat message, including the site-wide count, as designed in O6); B4,
  B5 and B18 still within limits with chat in use.
- Screens: S7.1 (chat tab with unread count), S7.3, S7.4, the chat column of S11.1. Design boards
  "Game: chat", "Game: chat limit", "Chat message", the waiting room's chat column.

## Builds

1. **Chat in the room:** saved before shown, seen by everyone who joined before, except players
   who muted the sender; grey lines for joins and leaves; notifications.
2. **Message rules and limits:** one line, 1 to 200 characters as seen, at most 800 bytes; one
   message every 2 seconds; 100 per player per room; the site-wide daily cap.
3. **Mute and unmute,** known only to the player who muted.

## Known gaps after this phase

- No votes, rematches, accounts, records, ranking, menu or tutorial.

## What you can see when it's done

Chat in the waiting room and during a game across several windows; a mute hides that player only
for the one who muted.

## Exit criteria

- B7 within its limit.

## Open points

- None.

## Required scenarios

These 14 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `chat` #1: a message is seen by everyone in the room and notifies the others
- `chat` #2: a player sees only messages sent since they joined
- `chat` #3: spaces at the ends are removed and line breaks become spaces
- `chat` #4: rejects an empty message
- `chat` #5: rejects a message over 200 characters
- `chat` #6: an emoji counts as one character
- `chat` #7: rejects a message over 800 bytes even under 200 characters
- `chat` #8: rejects a second message within 2 seconds
- `chat` #9: rejects the 101st message from a player in one room
- `chat` #10: muting hides a player's messages only for the one who muted
- `chat` #11: after unmuting a player their new messages are shown again
- `chat` #12: chat continues after the game and is deleted with the room
- `connections-and-leaving` #14: a leaver stays in the room and its chat and can join another room straight away
- `lobby-queue-and-limits` #30: after 2000 chat messages on the site today no more messages are sent
