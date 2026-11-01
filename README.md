# GM. - Software Engineer / Dark Four-Corner Edition

A static, personal portfolio. HTML, CSS and JavaScript; no npm installation,
framework, build step, font files or required CDN connection.

## Run on your Mac

Extract the ZIP and open Terminal in the extracted `portfolio` directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Use `python3`, not `python`: your earlier terminal
message means the `python` command was not available. Stop the server with Ctrl+C.
You can also open index.html directly for a basic preview; a local server is
recommended for realistic browser behavior and clipboard permissions.

## Files

portfolio/
  index.html
  css/styles.css
  js/main.js
  js/animations.js
  js/audio.js
  js/hero-3d.js
  assets/images/favicon.svg
  assets/images/social-preview.png
  assets/images/system-fallback.svg
  assets/audio/ambient.ogg
  assets/audio/ambient.mp3
  README.md
  QA.md

## This revision

- Software Engineer, not Sr. Software Engineer; Backend / Full-Stack / AI Systems.
- Dark charcoal, warm typography and a restrained orange accent.
- GM. top left; Work / Expertise / About top right.
- GitHub, LinkedIn and WhatsApp icons bottom left.
- Independent motion and sound controls bottom right, with soundtrack options.
- No separate header or footer bars.
- Uppercase GM. in the About section.
- Text-only Selected Work: short descriptions of the kind of work you do.
- AI call agents included in the work, expertise and inquiry sections.
- Original, isometric architecture study instead of the rotating abstract rings.
- Switch between API request, AI workflow and call-agent paths.
- A desktop pointer lens reveals an alternate hero statement.
- Entrance motion, scroll reveals, subtle link motion and interactive social icons.
- Reduced-motion support, motion pause, keyboard controls and touch layouts.
- Company/executive branding and academic projects stay removed.

## How the hero works

hero-3d.js projects a small 3D-coordinate scene onto Canvas 2D. It does not require
WebGL or a 3D library. This is intentionally an illustrative architecture, not a
live production dashboard. There are no invented throughput or uptime figures.

The animation is capped near 30 fps, uses at most 2x device pixel ratio, and sleeps
when offscreen, hidden or paused. The local SVG is a fallback. Content remains
readable without JavaScript. The hero's pointer effect is supplemental; it never
hides important information from keyboard or touch users.

## Sound - important distinction

The SOUND button plays the original Studio ambience loop from the earlier
portfolio. The two bundled formats are that same original recording, not the
36-minute recording requested in chat.

The small arrow beside SOUND opens the soundtrack options. They include the
requested release, "16-Bit Fantasy Adventure Music (AI Music)" by jinhanborasaeg,
through the official Apple Music embed. The player is loaded only after a click.
Apple controls availability, sign-in and preview/full playback. A preview may be
all a signed-out visitor can play. No third-party recording was downloaded or
redistributed in this package.

Opening the official player stops the local ambience. Closing its dialog or
hiding the tab removes the player, stopping it. The site cannot read or control
its cross-origin playback state, so it never claims the SOUND indicator represents
Apple Music playback. The indicator reflects only the local ambience.

To use your authorized full recording as the background instead:

1. Place your permitted MP3 in `assets/audio/soundtrack.mp3`.
2. Open `js/audio.js` and change LOCAL_TRACK.sources to:

```js
sources: [
  { src: 'assets/audio/soundtrack.mp3', type: 'audio/mpeg' }
]
```

3. Update LOCAL_TRACK.title and LOCAL_TRACK.description with correct credits.
4. Optionally rename the "Play ambience" button copy in index.html.

A streaming-page link is not a playable MP3 URL. No copy of the requested full
recording is included. The official listing and embed documentation are here:

- https://music.apple.com/us/album/16-bit-fantasy-adventure-music/1812239687
- https://artists.apple.com/support/1117-apple-music-marketing-tools

All local playback starts only after a user gesture. The site starts silent on
every load, fades ambience in/out, and pauses when hidden. The motion setting is
separate from sound. The volume preference is remembered when storage is allowed.

## Content and contacts

Edit content in index.html. Core design tokens are at the start of css/styles.css.

GitHub: https://github.com/akhonzada18
LinkedIn: https://linkedin.com/in/gm-akhonzada
WhatsApp: https://wa.me/923129908431
Email: ghulamakhonzada@gmail.com

"Cal agent" was interpreted as AI call agents, not a Cal.com booking integration.
The site describes that capability; it does not contain a deployed voice-calling
backend or claim a specific call-agent client/project.

The inquiry form validates fields and opens an email draft. It does NOT send
emails automatically, store submissions or contain a backend. The visitor must
send the message in their own email application. Direct email and WhatsApp links
remain available. No analytics or advertising scripts have been added.

## Deployment

Serve the contents of `portfolio` as the static site root. Keep css, js and assets
beside index.html. There is no build command. This package has NOT changed your
live deployment.

Canonical/OG URLs use the supplied gms-portfolio-alpha.vercel.app domain. Update
those URLs if you change domains. Social previews may remain cached after a
redeploy, depending on the platform displaying them.

The reference site was used as a visual direction, not copied source, text,
portraits, proprietary models or audio. These are original implementations.

## Before publishing

Check the deployed site in Safari on your Mac and on a real phone. Chromium QA
was performed here; this environment cannot validate every browser or third-party
player state. Review your professional claims, links and the intended music
permissions. See QA.md for exactly what was and was not tested.
