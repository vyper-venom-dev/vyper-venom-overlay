# VYPER-VENOM TikTok Alerts

A browser-source overlay for OBS / Aitum Vertical that plays the VYPER-VENOM follow, share and like alerts
and writes the viewer's name inside the tag. Events come from **TikFinity** running on the same PC.

## Files

```
index.html              the overlay
alerts/ALERT_FOLLOW.webm   \
alerts/ALERT_SHARE.webm     > exported from After Effects, converted to WebM with alpha in Shutter Encoder
alerts/ALERT_LIKE.webm     /
```

## Set up

1. Export the three alerts from After Effects and convert them to WebM (VP9, *Enable alpha channel*).
2. Put them in the `alerts` folder with exactly the names above.
3. Download this repository to your PC (Code > Download ZIP, then unzip), or `git clone` it.
4. In OBS, in the **vertical** scenes: add a **Browser** source.
   - Tick **Local file** and pick `index.html` from the downloaded folder.
   - Width **1080**, Height **1920**.
   - Tick **Control audio via OBS** if you want the alert sounds on their own mixer slider.
5. Keep TikFinity open while you stream. Don't also add TikFinity's own alert overlay, or alerts will play twice.

## Test it

- Add `?demo` to the end of the file path (or open `index.html?demo` in Chrome): alerts play on a loop with fake names.
- Add `?debug` to show a log of what TikFinity sends. Useful if a real follow doesn't trigger an alert.

## Change settings

Open `index.html` in a text editor and edit the `CONFIG` block near the top:
- `alertTop`: how far down the screen the alert sits (px)
- `likeStep`: how many likes between like alerts (default 100)
- `nameY`: nudge the username up or down inside the tag
