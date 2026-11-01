# QA - Dark Four-Corner Portfolio

## Method

Actual headless Chromium rendered the HTML, CSS and JavaScript. The environment's
browser URL policy blocks navigation even to localhost. For layout/interaction
checks only, the files were injected into an in-memory document and the local
SVG/audio sources were supplied as data URLs. The delivered files are normal,
separate files, not the injected test fixture.

All delivered HTML/CSS/JS/image/audio resources were separately requested through
a local Python HTTP server and returned HTTP 200. This confirms local asset paths,
not an end-to-end deployed browser navigation test. The reference site's live
browser navigation was also blocked here; its published text was available via
web retrieval. No claim of an exact live-animation clone is made.

## Passed

- Layout checks at 320, 360, 390, 430, 540, 768, 1024, 1440 and 1920 pixels.
- No horizontal document overflow at those widths after fixing narrow-screen
  word spacing in Selected Work.
- Top and bottom corner-control groups do not overlap each other at those widths.
- No JavaScript page errors in the tested flows.
- Software Engineer title; uppercase GM. in both locations.
- No header/footer elements and no image/SVG/canvas elements in Selected Work.
- The three social destinations match the requested profiles/number.
- Navigation active-section state and native in-page links.
- Expertise expansion, including AI call agents.
- Hero route selection and updated accessible route text.
- Hero renders with Canvas 2D, including with reduced motion enabled.
- Motion button updates global state; reduced-motion device setting disables
  decorative motion and is reflected in the control.
- Local ambient audio starts after click, currentTime advances and volume ramps.
- Local sound off pauses playback. Both supplied audio files are present.
- Soundtrack options dialog; no Apple iframe before explicit consent.
- Official player URL injected on demand; iframe removed on dialog close.
- Inquiry dialog, Escape close, invalid empty form and valid populated form.
- No-JavaScript content remains visible and has no horizontal overflow at 390px.
- Node.js syntax checks on all four JavaScript files.

## Important limits

- Apple Music playback was not auditioned or verified. The embed mount/lifecycle
  was tested with a mocked frame; actual playback depends on Apple, network,
  browser policy and account/region. The full requested recording is not bundled.
- Audio time advancement was tested; listening quality was not manually auditioned.
- No claim of Safari/Firefox/iPhone/Android physical-device testing.
- Clipboard access depends on browser permission and secure context; a fallback
  message is implemented. This is not a promise of access on every browser.
- Form validation was tested; external email-client sending was not, and the site
  does not send or store messages itself.
- No Lighthouse score, Core Web Vitals field data, formal accessibility certification
  or production availability measurement is claimed.
- The deployment was not changed.

Check Safari on the user's Mac and a physical phone before production publishing.
