# VYPER-VENOM stream kit

Everything for the VYPER-VENOM stream in one place: the TikTok alert overlay (runs in OBS / Aitum Vertical)
plus a backup of every exported asset.

## What's where

```
index.html               TikTok alert overlay (OBS Browser Source, 1080 x 1920)
alerts/                  the three alert videos the overlay plays
  ALERT_FOLLOW.webm        1080x400, 4 s, transparent, with sound
  ALERT_SHARE.webm         1080x400, 4 s, transparent, with sound
  ALERT_LIKE.webm          1080x300, 4 s, transparent, with sound
fonts/                   Orbitron + Chakra Petch (used by the overlay)

assets/                  backups, not used by the overlay
  stinger/                 STINGER_TW.webm (Twitch), STINGER_TT.webm (TikTok): OBS transition point 600 ms
  loops/                   BG_LOOP_TW.mp4, BG_LOOP_TT.mp4: 10 s seamless backgrounds (Media Source, Loop on)
  logo/                    LOGO_REVEAL.webm
  overlays/                10 transparent scene overlays (Twitch_*.png 1920x1080, TikTok_*.png 1080x1920)
  profile-pic/             profile picture for Twitch and TikTok (1000x1000)
  sounds/                  stinger and alert sound effects (WAV)
  after-effects/           build script (VYPER-VENOM_Build.jsx), alert layout fix (VYPER-VENOM_Alerts_Fix.jsx)
                           and the portrait used in RING
```

## Use the alert overlay

1. On this page: **Code > Download ZIP**, unzip it somewhere permanent on the streaming PC.
   (Use a downloaded copy, not the github.io address: a page loaded from the web can be blocked from talking to TikFinity.)
2. In OBS, in every **vertical** (Aitum) scene: add a **Browser** source.
   - Tick **Local file** and pick `index.html`.
   - Width **1080**, Height **1920**. Put it at the top of the source list.
   - Optional: tick **Control audio via OBS** to give the alert sounds their own volume slider.
3. Keep **TikFinity** open and connected while streaming. Don't add TikFinity's own alert overlay too, or alerts play twice.

Events come from TikFinity's local connection at `ws://127.0.0.1:21213/`.

## Test it

- `index.html?demo`: plays a follow, share and like alert on a loop with fake names.
- `index.html?debug`: shows a log of what TikFinity sends. Use this if a real follow doesn't trigger an alert.

In OBS, add these to the end of the Local file path, then remove them before going live.

## Change settings

Open `index.html` in a text editor and edit the `CONFIG` block near the top:
- `alertTop`: how far down the screen the alerts sit (px). 160 keeps clear of TikTok's top bar.
- `likeStep`: likes between like alerts (default 100).
- `nameY` (per alert): nudge the viewer's name up or down inside the tag.

## Updating

When something changes here, download the ZIP again and replace the old folder (keep the same location so OBS still finds `index.html`).
