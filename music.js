// Вбудований синтвейв-луп на Web Audio: бас, арпеджіо, бочка, хет. Без файлів.
// Якщо в config.js вказано musicUrl, грає mp3 замість цього.
(function () {
  const cfg = window.YAN_CONFIG;
  let ctx, master, timer, step = 0, nextTime = 0, playing = false, audioEl = null;

  // Am – F – C – G, класика 80-х
  const chords = [
    [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62],
  ];
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function voice(type, freq, t, dur, gain, cutoff) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = cutoff;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.32);
  }

  let noiseBuf;
  function hat(t, open) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(open ? 0.12 : 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.2 : 0.05));
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 0.25);
  }

  function schedule() {
    const sixteenth = 60 / (cfg.anim.tempo || 104) / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      const bar = Math.floor(step / 16) % chords.length;
      const s = step % 16;
      const ch = chords[bar];
      // бас на восьмих
      if (s % 2 === 0) voice('sawtooth', hz(ch[0] - 24), nextTime, sixteenth * 1.8, 0.22, 600);
      // арпеджіо на шістнадцятих
      const arp = [0, 1, 2, 1, 2, 0, 1, 2];
      voice('square', hz(ch[arp[s % 8]] + 12), nextTime, sixteenth * 0.9, 0.05, 2400);
      // пед на першу долю такту
      if (s === 0) ch.forEach((n) => voice('sawtooth', hz(n), nextTime, sixteenth * 15, 0.035, 1400));
      if (s % 4 === 0) kick(nextTime);
      if (s % 4 === 2) hat(nextTime, s === 14);
      else if (s % 2 === 1) hat(nextTime, false);
      nextTime += sixteenth; step++;
    }
  }

  /* ---------- YouTube (офіційний плеєр, видимий у куточку) ---------- */
  let yt = null, ytReady = null, ytFailed = false;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise((resolve, reject) => {
      const dock = document.getElementById('ytDock');
      window.onYouTubeIframeAPIReady = () => {
        yt = new YT.Player('ytPlayer', {
          width: 220, height: 124, videoId: cfg.youtubeId,
          playerVars: { autoplay: 1, loop: 1, playlist: cfg.youtubeId, controls: 1, modestbranding: 1, playsinline: 1, start: cfg.youtubeStart || 0 },
          events: {
            onReady: (e) => { e.target.setVolume(60); resolve(); },
            onError: () => { ytFailed = true; dock.hidden = true; reject(new Error('yt')); },
          },
        });
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => { ytFailed = true; reject(new Error('yt')); };
      document.head.appendChild(tag);
      setTimeout(() => reject(new Error('yt timeout')), 8000);
    });
    return ytReady;
  }

  async function startYT() {
    document.getElementById('ytDock').hidden = false;
    await loadYT();
    yt.playVideo();
    playing = true;
  }

  async function start() {
    if (cfg.youtubeId && !ytFailed) {
      try { return await startYT(); }
      catch { document.getElementById('ytDock').hidden = true; /* відео не вбудовується — граємо синтвейв */ }
    }
    if (cfg.musicUrl) {
      if (!audioEl) { audioEl = new Audio(cfg.musicUrl); audioEl.loop = true; audioEl.volume = 0.45; audioEl.preload = 'auto'; }
      return audioEl.play().then(() => { playing = true; });
    }
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.35;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
    }
    return ctx.resume().then(() => {
      nextTime = ctx.currentTime + 0.05;
      timer = setInterval(schedule, 25);
      playing = true;
    });
  }

  function stop() {
    playing = false;
    if (yt && yt.pauseVideo) { yt.pauseVideo(); document.getElementById('ytDock').hidden = true; }
    if (audioEl) audioEl.pause();
    clearInterval(timer);
    if (ctx) ctx.suspend();
  }

  // короткий «дзинь» для ачівки
  function ding() {
    if (!playing) return;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    [76, 79, 84].forEach((n, i) => voice('square', hz(n), t + i * 0.07, 0.25, 0.08, 4000));
  }

  window.YanMusic = { start, stop, ding, get playing() { return playing; } };
})();
