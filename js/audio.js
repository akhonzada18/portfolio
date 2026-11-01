/** Optional audio. A local, original loop is included; the requested recording is
 * available only via the official Apple Music player, loaded with consent.
 *
 * TO USE YOUR AUTHORIZED FULL TRACK AS THE BACKGROUND:
 * 1. Put your MP3 at assets/audio/soundtrack.mp3.
 * 2. Change LOCAL_TRACK.sources to [{src:'assets/audio/soundtrack.mp3',type:'audio/mpeg'}].
 * 3. Set LOCAL_TRACK.title and description below to the correct credits.
 * Do not set a streaming webpage URL as an audio source.
 */
(() => {
  'use strict';
  const LOCAL_TRACK = {
    title: 'Studio ambience',
    description: 'Original ambient loop. Included with this portfolio.',
    sources: [
      { src: 'assets/audio/ambient.ogg', type: 'audio/ogg' },
      { src: 'assets/audio/ambient.mp3', type: 'audio/mpeg' }
    ]
  };
  const APPLE_PATH = '/us/album/16%EB%B9%84%ED%8A%B8-%ED%8C%90%ED%83%80%EC%A7%80-%EB%AA%A8%ED%97%98-%EC%9D%8C%EC%95%85-%EC%97%90%EC%9D%B4%EC%95%84%EC%9D%B4%EC%9D%8C%EC%95%85/1812239687';
  const app = window.Portfolio;
  const audio = document.getElementById('ambient-audio');
  const button = document.getElementById('sound-button');
  const label = document.getElementById('sound-label');
  const dialog = document.getElementById('soundtrack-dialog');
  const slot = document.getElementById('apple-player-slot');
  const loadButton = document.getElementById('load-apple-player');
  const volumeSlider = document.getElementById('sound-volume');
  let desired = false, waiting = false, fadeFrame = 0, token = 0;
  let context, effectsGain;
  const voices = new Set();
  const savedVolume = Number(app.storage.get('gm-volume') ?? .22);
  let volume = Number.isFinite(savedVolume) ? Math.max(0, Math.min(.6, savedVolume)) : .22;
  volumeSlider.value = String(Math.round(volume * 100));
  document.getElementById('volume-value').textContent = Math.round(volume * 100) + '%';
  audio.volume = 0;
  LOCAL_TRACK.sources.forEach(item => { const source = document.createElement('source'); source.src = item.src; source.type = item.type; audio.appendChild(source); });
  document.getElementById('local-track-title').textContent = LOCAL_TRACK.title;
  document.getElementById('local-track-description').textContent = LOCAL_TRACK.description;
  document.getElementById('official-track-link').href = 'https://music.apple.com' + APPLE_PATH;

  function sync() {
    const playing = !audio.paused && !audio.ended && !waiting && desired;
    button.classList.toggle('is-playing', playing && volume > 0);
    button.setAttribute('aria-pressed', String(desired));
    button.setAttribute('aria-label', desired ? 'Turn site ambience off' : 'Turn ' + LOCAL_TRACK.title + ' on');
    label.textContent = desired ? waiting ? 'Loading' : document.hidden ? 'Sound paused' : playing ? volume === 0 ? 'Sound muted' : 'Sound on' : 'Sound paused' : 'Sound off';
  }
  function fadeTo(target, duration, done) {
    cancelAnimationFrame(fadeFrame);
    const from = audio.volume, start = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * progress));
      if (progress < 1) fadeFrame = requestAnimationFrame(tick);
      else { fadeFrame = 0; if (done) done(); }
    };
    fadeFrame = requestAnimationFrame(tick);
  }
  function stopEffects() {
    if (effectsGain && context) effectsGain.gain.setValueAtTime(0, context.currentTime);
    voices.forEach(voice => { try { voice.stop(); } catch { /* Already stopped. */ } }); voices.clear();
  }
  function prepareEffects() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!context) { context = new AC(); effectsGain = context.createGain(); effectsGain.connect(context.destination); }
      effectsGain.gain.setValueAtTime(volume * .1, context.currentTime);
      context.resume().catch(() => {});
    } catch { /* Background audio does not depend on Web Audio support. */ }
  }
  function removeEmbed() {
    slot.replaceChildren(); loadButton.hidden = false;
  }
  async function start(gesture = false) {
    removeEmbed();
    const attempt = ++token;
    desired = true; waiting = true;
    cancelAnimationFrame(fadeFrame); audio.volume = 0;
    if (gesture) prepareEffects();
    sync();
    try {
      await audio.play();
      if (attempt !== token || !desired) return;
      waiting = false;
      if (document.hidden) { audio.pause(); sync(); return; }
      app.storage.set('gm-sound', 'on');
      fadeTo(volume, 650); sync();
    } catch (error) {
      if (attempt !== token) return;
      desired = false; waiting = false; stopEffects(); sync();
      if (error.name !== 'AbortError') app.announce('Sound could not start. Check browser audio permissions and keep the audio folder beside index.html.');
    }
  }
  function stop(immediate = false) {
    ++token; desired = false; waiting = false;
    app.storage.set('gm-sound', 'off'); stopEffects();
    if (immediate || document.hidden || audio.paused) { cancelAnimationFrame(fadeFrame); audio.pause(); audio.volume = 0; }
    else fadeTo(0, 180, () => { if (!desired) audio.pause(); });
    sync();
  }
  button.addEventListener('click', () => { if (desired) stop(); else start(true); });
  document.getElementById('track-button').addEventListener('click', event => app.openDialog(dialog, event.currentTarget));
  document.getElementById('play-local').addEventListener('click', () => { dialog.close(); start(true); });
  volumeSlider.addEventListener('input', () => {
    volume = Number(volumeSlider.value) / 100;
    app.storage.set('gm-volume', String(volume));
    document.getElementById('volume-value').textContent = volumeSlider.value + '%';
    if (desired && !audio.paused) { cancelAnimationFrame(fadeFrame); audio.volume = volume; }
    if (effectsGain && context) effectsGain.gain.setValueAtTime(volume * .1, context.currentTime);
    sync();
  });
  loadButton.addEventListener('click', () => {
    stop(true);
    if (slot.firstChild) return;
    const frame = document.createElement('iframe');
    frame.title = 'Official Apple Music player: 16-Bit Fantasy Adventure Music by jinhanborasaeg';
    frame.src = 'https://embed.music.apple.com' + APPLE_PATH + '?theme=dark';
    frame.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
    frame.sandbox = 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    slot.appendChild(frame); loadButton.hidden = true;
  });
  dialog.addEventListener('close', removeEmbed);
  audio.addEventListener('playing', () => { waiting = false; if (!desired) audio.pause(); sync(); });
  audio.addEventListener('pause', sync);
  audio.addEventListener('waiting', () => { if (desired) waiting = true; sync(); });
  audio.addEventListener('error', () => { stop(true); app.announce('The background audio could not load. Check that assets/audio is included.'); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ++token; cancelAnimationFrame(fadeFrame); audio.pause(); audio.volume = 0; stopEffects(); removeEmbed(); sync();
    } else if (desired) start(false);
  });
  window.addEventListener('pagehide', () => { ++token; cancelAnimationFrame(fadeFrame); audio.pause(); stopEffects(); removeEmbed(); });
  document.addEventListener('portfolio:interaction', event => {
    if (!desired || !volume || audio.paused || document.hidden || !context || context.state !== 'running') return;
    const now = context.currentTime;
    const voice = context.createOscillator(), envelope = context.createGain();
    voice.type = 'sine';
    voice.frequency.setValueAtTime(event.detail.kind === 'flow' ? 440 : 660, now);
    voice.frequency.exponentialRampToValueAtTime(880, now + .12);
    envelope.gain.setValueAtTime(0, now); envelope.gain.linearRampToValueAtTime(.35, now + .015); envelope.gain.exponentialRampToValueAtTime(.001, now + .17);
    effectsGain.gain.setValueAtTime(volume * .1, now);
    voice.connect(envelope); envelope.connect(effectsGain); voices.add(voice);
    voice.onended = () => { voices.delete(voice); voice.disconnect(); envelope.disconnect(); };
    voice.start(now); voice.stop(now + .19);
  });
  sync();
})();
