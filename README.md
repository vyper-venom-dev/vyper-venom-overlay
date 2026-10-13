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

The overlay is live on GitHub Pages: **https://vyper-venom-dev.github.io/vyper-venom-overlay/**

1. In Aitum Vertical, in every **vertical** scene: add a **Browser** source (create it once, then **Add Existing** in the other scenes).
   - Leave **Local file** unticked and paste the address above as the URL.
   - Width **1080**, Height **1920**. Put it at the top of the source list.
   - Untick **Shutdown source when not visible** and **Refresh browser when scene becomes active**.
   - Optional: tick **Control audio via OBS** to give the alert sounds their own volume slider.
2. Keep **TikFinity** open and connected while streaming. Don't add TikFinity's own alert overlay too, or alerts play twice.

Events come from TikFinity's local connection at `ws://127.0.0.1:21213/`.
If the online version can't reach TikFinity (`?debug` never says "connected"), use a downloaded copy instead:
**Code > Download ZIP**, unzip, tick **Local file** and pick `index.html`.

## Test it

- `?demo` on the end of the address: plays a follow, share and like alert on a loop with fake names.
- `?debug` on the end of the address: shows a log of what TikFinity sends. Use this if a real follow doesn't trigger an alert.

Remove them before going live.

## Change settings

Open `index.html` in a text editor and edit the `CONFIG` block near the top:
- `alertTop`: how far down the screen the alerts sit (px). 160 keeps clear of TikTok's top bar.
- `likeStep`: likes between like alerts (default 100).
- `nameY` (per alert): nudge the viewer's name up or down inside the tag.

## Updating

Changes pushed here go live on the Pages address in about a minute. Then right-click the Browser source in OBS > **Refresh**.
