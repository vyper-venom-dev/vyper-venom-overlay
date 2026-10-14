# VYPER-VENOM stream kit

Everything for the VYPER-VENOM stream in one place: the alert overlay for Twitch and TikTok (runs from GitHub Pages)
plus every asset the OBS scenes use.

- Twitch canvas: OBS, 1920 x 1080, 60 fps
- TikTok canvas: Aitum Vertical, 1080 x 1920, 60 fps

## What's where

```
index.html                 alert overlay, live at https://vyper-venom-dev.github.io/vyper-venom-overlay/
alerts/                    the alert videos the overlay plays (VP9 WebM, transparent, 4 s, with sound)
  ALERT_FOLLOW.webm          1080x400   TikTok + Twitch follow
  ALERT_SHARE.webm           1080x400   TikTok share
  ALERT_LIKE.webm            1080x300   TikTok like goal
  ALERT_SUB.webm             1080x400   Twitch sub / resub / gift
  ALERT_BITS.webm            1080x400   Twitch bits
  ALERT_RAID.webm            1080x300   Twitch raid
fonts/                     Orbitron + Chakra Petch (used by the overlay; install them on the PC for OBS text too), with their OFL licences

assets/                    used by OBS from a downloaded copy of this repo
  overlays/                  10 transparent scene overlays: Twitch_*.png (1920x1080), TikTok_*.png (1080x1920)
  loops/                     BG_LOOP_TW.mp4, BG_LOOP_TT.mp4: 10 s seamless backgrounds (Media Source, Loop on)
  stinger/                   STINGER_TW.webm, STINGER_TT.webm: Stinger transition, Transition Point 600 ms
  obs/                       VV_countdown.lua: Starting Soon countdown as MM:SS (Tools > Scripts > +)
                             VYPER-VENOM_OBS_scenes.json: OBS scene collection backup (Scene Collection > Import)
  profile-pic/               profile picture for Twitch and TikTok (1000x1000; use the non-transparent one)
  logo/                      LOGO_REVEAL.webm
  logo-wordmark/             faceless logo: VYPER-VENOM_Wordmark.png (transparent, 1200x1200),
                             _ProfilePic.png (1000x1000) and .svg (needs Orbitron installed)
  sounds/                    stinger and alert sound effects (WAV)
  after-effects/             VYPER-VENOM_Motion.aep      the After Effects project (relink footage to face_venom.png
                                                         here and the WAVs in assets/sounds)
                             VYPER-VENOM_Build.jsx       builds the loops and all six alerts
                             VYPER-VENOM_Alerts_Fix.jsx  layout fix for alerts built before 13 Oct
                             VYPER-VENOM_Twitch_Alerts.jsx  makes sub/bits/raid from finished alerts
                             VYPER-VENOM_Wordmark.jsx    builds the faceless logo with its reveal animation
                             face_venom.png              the portrait used in the RING comp
```

**Keep the downloaded copy in one place.** OBS's image, loop and stinger sources point at files in your unzipped copy
of this repo. Moving or deleting that folder breaks those sources.

## Scenes

Sources top to bottom (top = in front). Full positions and sizes are in the build guide.

| Twitch (OBS Scenes dock) | Sources |
| --- | --- |
| TW · Starting Soon | VV Twitch Alerts, VV Countdown, Twitch_StartingSoon.png, VV Loop TW |
| TW · Gameplay | VV Twitch Alerts, Twitch_Gameplay.png, VV Cam, VV Game |
| TW · Just Chatting | VV Twitch Alerts, TW Chat, Twitch_JustChatting.png, VV Cam, VV Loop TW |
| TW · BRB | VV Twitch Alerts, Twitch_BRB.png, VV Loop TW |
| TW · Ending | VV Twitch Alerts, TW Raid Target, TW Next Stream, Twitch_Ending.png, VV Loop TW |

| TikTok (Aitum Vertical dock) | Sources |
| --- | --- |
| TT · Starting Soon | VV Alerts, VV Countdown, TikTok_StartingSoon.png, VV Loop TT |
| TT · Gameplay | VV Alerts, TikTok_Gameplay.png, VV Cam, VV Game, VV Loop TT |
| TT · Just Chatting | VV Alerts, TikTok_JustChatting.png, VV Cam, VV Loop TT |
| TT · BRB | VV Alerts, TikTok_BRB.png, VV Loop TT |
| TT · Ending | VV Alerts, TT Handle, TT Next Live, TikTok_Ending.png, VV Loop TT |

## Alert overlay

One page, two modes. Browser sources, **Local file** unticked, at the top of every scene; untick
**Shutdown source when not visible** and **Refresh browser when scene becomes active**.

| Source | URL | Size | Events from |
| --- | --- | --- | --- |
| VV Alerts (TikTok scenes) | `https://vyper-venom-dev.github.io/vyper-venom-overlay/` | 1080 x 1920 | TikFinity, `ws://127.0.0.1:21213/` |
| VV Twitch Alerts (Twitch scenes) | `https://vyper-venom-dev.github.io/vyper-venom-overlay/?twitch` | 1920 x 1080 | Streamer.bot, `ws://127.0.0.1:8080/` |

- **TikFinity**: keep it open and connected while streaming. Don't add TikFinity's own alert overlay, or alerts play twice.
- **Streamer.bot**: connect your Twitch Broadcaster account; Servers/Clients > WebSocket Server: 127.0.0.1, port 8080,
  endpoint `/`, Auto Start on, Authentication off. Keep it open while streaming.
- TikTok: follow, share, and a like alert every 100 likes. Twitch: follow, sub / resub / gift, bits, raid.

### Test

- `?demo` (TikTok) or `?twitch&demo` (Twitch): fake alerts on a loop.
- `?debug` or `?twitch&debug`: a log of what TikFinity / Streamer.bot sends. Use it if a real event doesn't play.

Remove them before going live.

If the online page can't reach TikFinity or Streamer.bot (the debug log never says "connected"), tick **Local file**
and pick `index.html` from the downloaded copy instead (add `?twitch` for the Twitch one).

## Change settings

Open `index.html` and edit the `CONFIG` block near the top:
- `tiktok.top`: how far down the TikTok screen the alerts sit (px). 160 keeps clear of TikTok's top bar.
- `tiktok.likeStep`: likes between like alerts (default 100).
- `twitch.left`, `twitch.top`, `twitch.scale`: where the Twitch alerts sit and how big (default: top centre, 760 px wide).
- `nameY` (per alert): nudge the viewer's name up or down inside the tag.

## Updating

- **Alerts and index.html**: changes pushed here go live in a minute or two. Right-click the Browser source in OBS > **Refresh**.
- **Overlays, loops, stingers, countdown script**: OBS uses your downloaded copy, so download the ZIP again and
  replace the files in the same folder.
