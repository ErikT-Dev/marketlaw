# Playthrough checklist

The playthrough version: 2 to 4 people, each on their own computer, play complete games on the
live site, https://marketlaw.mlawd.workers.dev, and write down what goes wrong. This list says
what to try and in which order. You do not need to know how the game is built; if something
looks wrong, write it down, even if you are not sure.

## Who and what you need

- **2 to 4 people**, each on their own desktop or laptop computer, with a browser window at
  least 1280 pixels wide (a maximized window on most laptops). Phones and tablets are not
  supported: below 1280 pixels the site asks for a larger screen.
- **The link.** The site has no lock at the moment (decision D22): anyone with the link can play.
  Share it only with your testers.
- **A way to talk to each other** while you play (a call or a chat), since the game has no chat
  yet.
- **Time:** about 30 minutes for part 1, and 1 to 2 hours for a full game (part 2). A turn's main
  phase lasts up to 3 minutes at the start and up to 5 minutes from turn 20 on, and a game lasts
  at most 40 turns.
- **The same browser all the time.** You play as a guest; your guest account lives in that
  browser. A private window, another browser or cleared browser data is a new guest with a new
  name, and the old one cannot be got back.

## What to write down

Keep one note per game, shared by everyone, for example:

```
Game 1 - date, time (UTC or your local time, say which)
Room code: ......            Players: 3
Ended in turn: ..            Why: end goal reached / turn limit (40) / last player left
Winner: ......               About how long it took: .. minutes
Problems:
- who, which turn, what they did, what they expected, what happened instead
```

- **The room code** (6 letters and digits, shown in the waiting room). With it Claude can replay
  the game exactly and find what went wrong, so write it down before the game starts.
- **Every problem:** a screen that looks broken, a button that does nothing, a number that seems
  wrong, a text that is unclear, a long wait after a click, anything that surprised you. Say who
  saw it, in which turn and phase, and what you clicked just before. A screenshot helps.
- **How many turns each game took**, whether someone reached the end goal (income 22 and all
  3 projects) or the game stopped at turn 40, and roughly how long it took. The game length may
  be changed after these games (decision D24).
- **What felt good or bad** about the game itself: too long, too short, too slow, unclear rules.

## Part 1: lobby and rooms (all players)

1. **Open the link.** The lobby shows the title MARKET LAW, the public rooms and the room-code
   field.
2. **Get a guest name.** The first time you create or join a room, the site asks you to choose a
   username, with a ready-made name filled in. Keep it or type your own. Try a name someone else
   already took: the site should say it is taken. There is a human check (a box from
   Cloudflare) before you continue.
3. **Create a room (one player).** Click Create room, choose a private room for 3 players, pass
   the human check. You are now in the waiting room and are its owner. Write down the room code;
   try Copy room code.
4. **Join with the code (the others).** Type the code into the room-code field and click Join
   with code. Also try a wrong code: the site should say no room has that code.
5. **Change the size (the owner).** While the room waits, set it to 4 players and back. Others
   cannot change it. It cannot be set below the number of players already in the room.
6. **Leave and come back.** One player clicks Leave room and joins again with the code.
7. **Refresh while waiting.** One player refreshes the page: they keep their place. Then one
   player closes their browser tab for more than 10 seconds: they are removed from the room.
8. **Accept and decline.** When the room is full, everyone gets "The room is full: accept the
   game?" with 20 seconds to answer, and sees who has accepted. Let one player click Decline:
   the game does not start, that player is back in the lobby with a message saying when they can
   join again (after 2 minutes), and everyone else stays. Try joining again before the 2 minutes
   are up, then after.
9. **Public rooms.** Create a public room: it appears in the lobby's Public rooms list of the
   other players, who can join it with one click. A full room or one whose game started should
   not be joinable.

## Part 2: a full game (2 to 4 players)

Start a room for everyone, write down its code, and everyone accepts. Then play a real game to
the end, trying the things below as they come up. Each player tries each point at least once.

**Turn 1 and the main phase**

10. **The screen.** At the top: the turn number ("Turn 1 of 40"), the phase, the player order,
    your clock and time bank, and Leave game. Check that everything fits on your screen without
    scrolling sideways.
11. **Your hand.** Click a card: the big card shows its real cost and why. Play a card you can
    afford (only tier 1 cards until turn 5). Sell a card for 1 fund.
12. **Undo.** Play a card, then click Undo: the card is back in your hand and the funds are back.
    Selling cannot be undone.
13. **End turn.** After End turn you see that you are done and who the turn is waiting for. The
    next turn starts when everyone is done or out of time.
14. **Opponents.** You see the others as they were at the start of the main phase; what they do
    shows only when the main phase ends. Click an opponent's card to open their board.

**From turn 2 on**

15. **Market phase.** Every player has one market go, one after another (30 seconds, 45 for the
    first player). Either take a marketplace card (you also get one card of the same sector from
    the deck) or choose a sector and draw 2 cards. Watch the draw log list the draws. Let your
    market time run out once: you get 2 cards of a random sector.
16. **Combos.** When a combo is ready, Claim all claims every ready combo; the pop-up shows the
    rewards first.
17. **Influence.** Use influence: try a trade, buy a build pass and play a second card in the same
    turn, try Skip build, and a draw action (draw a card of a chosen kind and tier).
18. **Projects.** When you have 8 quality, 8 satisfaction or 8 workforce (and none of the three is
    below zero), complete a project. The first player to complete a project gets +2 funds at the
    end of the turn.
19. **Quests.** When you meet a quest's requirement, a Complete button appears on it. Quests
    leave the table after 5 turns, or at the end of the turn in which someone completed them.
20. **Income.** With at least 1 product and 1 distribution, income goes up by itself and you draw
    a card.
21. **Tier 2 and 3 cards** can be played from turn 5.
22. **Clocks.** Each main phase starts with 45 seconds of free time; after that your time bank
    (15 minutes for the whole game) runs down. Watch everyone's bank count down live.

**Connections, during the game**

23. **Refresh.** Refresh the page in the middle of a turn: you are back in the game where you
    were.
24. **Close and reopen.** One player closes their window for a minute: the others see them as
    away. When they open the link again they are back in the game.
25. **A second tab.** Open the link in a second tab of the same browser: the game moves there, and
    the first tab says the game is open in another tab, with Play here instead.

**The end**

26. **The end screen.** When someone reaches the end goal, or after turn 40, every player sees
    the end screen: the winner, why the game ended, and a table with each player's place and
    score. Write down the turn it ended in.

## Part 3: short games for time-outs and leaving

Use quick 2-player games for these, because they end or change a game.

27. **Running out of time.** In the main phase, one player does nothing until their time runs out
    (3 minutes in turn 1): they are made done, with a message "This was 1 of 3". Do it 3 turns in
    a row: that player is treated as having left the game.
28. **Pause.** Everyone closes their windows while someone's time is running. Wait until that
    time would have run out, then one player opens the link again: the game was paused, goes on,
    and a message says who gets free time.
29. **Leave game.** In a 3-player game, one player clicks Leave game. The pop-up explains what
    happens; after confirming, they see "You left the game" and Exit to lobby, and the game goes
    on without them. Once only one player is left, the game ends and that player wins. A player
    who left and stayed in the room sees the result when the game ends.

## Part 4: the daily limits (optional)

The site has daily limits so it stays on Cloudflare's free plan. They reset at 00:00 UTC.

30. **10 games a day per player.** Two players start 10 games today (2-player rooms; one player
    leaves each game straight away, which ends it). Then the player who creates or joins the next
    room sees "You have started 10 games today, the most per day. Try again after 00:00 UTC."
    This uses 10 of the site's 50 games for today.
31. The other limits (2,000 game actions per player a day, and 50 games a day on the whole site)
    are too large to reach by hand; the automatic browser tests check their messages.

## When you are done

Send Claude your notes. Then either accept the playthrough version (milestone 3), or list the
problems that must be fixed first. Findings become spec changes (with your approval) or new
phases before milestone 4 starts.
