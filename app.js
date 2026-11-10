(function () {
  const cfg = window.YAN_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ORDER = ['intro', 'name', 'about', 'hobby', 'seek', 'reviews', 'date', 'power', 'flags', 'final', 'done'];
  const state = { hobbies: [] };
  let current = 'intro';

  /* ---------- Ачівки ---------- */
  const ACH = {
    brave:     { ic: '🫡', t: 'Хоробрість 1 рівня', d: 'Почала анкету, знаючи, що це стьоб' },
    adult:     { ic: '🔞', t: 'Вже можна', d: 'Підтвердила, що тобі 18+' },
    chess:     { ic: '♟️', t: 'Гамбіт королеви', d: 'Шахи на роздягання. Ян нервово ковтає каву' },
    gamer:     { ic: '🎮', t: 'Player 2 connected', d: 'Любиш відеоігри' },
    coffee:    { ic: '☕', t: 'Кавова сестра', d: 'Кава о третій ночі. Ми однакові' },
    herring:   { ic: '🐟', t: 'Архітекторка оселедців', d: 'Будуєш замки з риби. Поважаю' },
    lol:       { ic: '🤣', t: 'Чесність', d: 'Прийшла просто поржати' },
    emo:       { ic: '🖤', t: 'Чорний чубчик', d: 'Емо не вмирає' },
    dumplings: { ic: '🥟', t: 'Інвесторка шукає інвестора', d: 'Пельмені — це серйозно' },
    reviews:   { ic: '⭐', t: 'Due diligence', d: 'Почитала відгуки перед побаченням' },
    poop:      { ic: '🚽', t: 'Синхронізація', d: 'Обрала найкориснішу суперсилу' },
    flags:     { ic: '🚩', t: 'Чесні прапорці', d: 'Показала і зелений, і червоний' },
    unlock:    { ic: '🔓', t: 'Фото розблоковано', d: 'Тепер ти знаєш, як виглядає 163 см щастя' },
    final:     { ic: '💌', t: 'Ачівка для психотерапевта', d: 'Дійшла до кінця і залишила контакти' },
  };
  const got = new Set();
  function unlock(id) {
    if (!ACH[id] || got.has(id)) return;
    got.add(id);
    $('#achCount').textContent = got.size;
    const a = ACH[id];
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="ic" aria-hidden="true">${a.ic}</span><div><small>Ачівку отримано</small><b>${a.t}</b></div>`;
    $('#toasts').appendChild(el);
    window.YanMusic.ding();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2600);
  }
  function renderAch(list, all) {
    if (!all && !got.size) { list.innerHTML = '<li><span class="ic" aria-hidden="true">🥚</span><div><b>Поки жодної</b><span class="d">Це теж своєрідна ачівка</span></div></li>'; return; }
    list.innerHTML = Object.entries(ACH).filter(([k]) => all || got.has(k)).map(([k, a]) =>
      `<li class="${got.has(k) ? '' : 'off'}"><span class="ic" aria-hidden="true">${a.ic}</span><div><b>${a.t}</b><span class="d">${got.has(k) ? a.d : '???'}</span></div></li>`
    ).join('');
  }
  $('#achBtn').addEventListener('click', () => { renderAch($('#achDialogList'), true); $('#achDialog').showModal(); });
  $('#achClose').addEventListener('click', () => $('#achDialog').close());

  /* ---------- Конфеті ---------- */
  function confetti(n = 40) {
    if (reduced) return;
    const colors = ['#ff3d7f', '#17b8a6', '#ffc93c', '#7a5cff', '#2de2e6', '#ff2a4d'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--fx', (Math.random() * 30 - 15) + 'vw');
      c.style.setProperty('--fr', (Math.random() * 1080 - 540) + 'deg');
      c.style.setProperty('--fd', (1.6 + Math.random() * 1.6) / cfg.anim.globalSpeed + 's');
      c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  /* ---------- Навігація ---------- */
  function go(name) {
    if (name === current) return;
    const from = $(`[data-screen="${current}"]`);
    const to = $(`[data-screen="${name}"]`);
    const dur = reduced ? 0 : 270 / cfg.anim.globalSpeed;
    from.classList.add('leave');
    setTimeout(() => {
      from.hidden = true; from.classList.remove('leave');
      to.hidden = false; to.classList.remove('enter'); void to.offsetWidth; to.classList.add('enter');
      document.body.dataset.style = to.dataset.style;
      current = name;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      onEnter(name);
      updateXP();
    }, dur);
  }
  const next = () => go(ORDER[ORDER.indexOf(current) + 1]);
  $$('[data-next]').forEach((b) => b.addEventListener('click', next));

  function updateXP() {
    const i = ORDER.indexOf(current);
    $('#xpFill').style.width = Math.round((i / (ORDER.length - 1)) * 100) + '%';
    $('#lvl').textContent = 'LVL ' + (i + 1);
  }

  function onEnter(name) {
    if (name === 'name') setTimeout(() => $('#inName').focus({ preventScroll: true }), 300);
    if (name === 'about') typeAll();
    if (name === 'reviews') { buildReviews(); unlock('reviews'); }
    if (name === 'final') { unlock('unlock'); confetti(30); }
  }

  /* ---------- Чіпси ---------- */
  $$('.chips').forEach((group) => {
    const multi = group.hasAttribute('data-multi');
    $$('.chip', group).forEach((chip) => {
      chip.setAttribute(multi ? 'aria-pressed' : 'aria-checked', 'false');
      if (!multi) chip.setAttribute('role', 'radio');
      chip.addEventListener('click', () => {
        if (multi) {
          const on = chip.getAttribute('aria-pressed') !== 'true';
          chip.setAttribute('aria-pressed', String(on));
          if (on && chip.dataset.ach) unlock(chip.dataset.ach);
        } else {
          $$('.chip', group).forEach((c) => c.setAttribute('aria-checked', 'false'));
          chip.setAttribute('aria-checked', 'true');
          if (chip.dataset.ach) unlock(chip.dataset.ach);
        }
        group.dispatchEvent(new CustomEvent('pick', { detail: chip.dataset.value }));
      });
    });
  });
  const picked = (g) => $$(`[data-group="${g}"] .chip[aria-checked="true"], [data-group="${g}"] .chip[aria-pressed="true"]`).map((c) => c.dataset.value);

  /* ---------- Екрани ---------- */
  $('[data-screen="intro"] [data-next]').addEventListener('click', () => unlock('brave'));

  $('#nameNext').addEventListener('click', () => {
    const name = $('#inName').value.trim();
    const age = picked('age')[0];
    if (!name || !age) { $('#nameHint').hidden = false; return; }
    state.name = name; state.age = age;
    $$('.her-name').forEach((e) => (e.textContent = name));
    unlock('adult');
    next();
  });
  $('#inName').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#nameNext').click(); });

  // друкарська машинка
  function typeAll() {
    const els = $$('[data-screen="about"] [data-type]');
    els.forEach((el) => { el.dataset.full = el.dataset.full || el.textContent; el.textContent = ''; });
    let i = 0;
    const run = () => {
      if (i >= els.length) return;
      const el = els[i], full = el.dataset.full;
      if (reduced) { el.textContent = full; i++; return run(); }
      el.classList.add('typing');
      let k = 0;
      const speed = 14 / cfg.anim.globalSpeed;
      const t = setInterval(() => {
        k += 2; el.textContent = full.slice(0, k);
        if (k >= full.length) { clearInterval(t); el.classList.remove('typing'); i++; setTimeout(run, 200); }
      }, speed);
    };
    run();
  }

  const hobbyReplies = {
    'Шахи на роздягання': 'Небезпечно. Я ж жодного разу не програвав.',
    'Відеоігри': 'Кооп чи PvP? Відповідай обережно.',
    'Кава о 3 ночі й сенс життя': 'Сенс життя знайшовся? Скинь і мені.',
    'Будування замків з оселедця': 'Нарешті хтось про справжнє мистецтво.',
    'Жирогенерація': 'Обожнюю. Особливо після шаурми.',
    'Маркетинг': 'О ні, ми будемо продавати одне одному ідеї побачень.',
    'Татуювання': 'Покажеш свої, покажу свої.',
  };
  $('[data-group="hobby"]').addEventListener('pick', (e) => {
    const on = picked('hobby').includes(e.detail);
    $('#hobbyReaction').textContent = on && hobbyReplies[e.detail] ? hobbyReplies[e.detail] : '';
  });
  $('#hobbyNext').addEventListener('click', () => {
    state.hobbies = picked('hobby');
    state.hobbyOther = $('#inHobbyOther').value.trim();
    if (!state.hobbies.length && !state.hobbyOther) { $('#hobbyReaction').textContent = 'Хоча б одне. «Лежати» теж рахується, напиши в «Інше».'; return; }
    next();
  });

  $('[data-group="seek"]').addEventListener('pick', (e) => {
    state.seek = e.detail;
    if ($('#seekAnswer').hidden) { $('#seekAnswer').hidden = false; $('#seekNext').hidden = false; }
  });
  $('#seekNext').addEventListener('click', next);

  $('#dateNext').addEventListener('click', function () {
    if (!$('#dateAnswer').hidden) return next();
    state.date = $('#inDate').value.trim();
    $('#dateAnswer').hidden = false;
    this.textContent = 'Далі';
  });

  $('[data-group="power"]').addEventListener('pick', (e) => {
    state.power = e.detail;
    $('#powerAnswer').hidden = false; $('#powerNext').hidden = false;
  });
  $('#powerNext').addEventListener('click', next);

  $('#flagsNext').addEventListener('click', () => {
    state.green = $('#inGreen').value.trim();
    state.red = $('#inRed').value.trim();
    if (!state.green && !state.red) { $('#flagsHint').hidden = false; return; }
    if (state.green && state.red) unlock('flags');
    $('#photoWrap').classList.remove('locked');
    next();
  });

  /* ---------- Фото і соцмережі Яна ---------- */
  ['#yanPhoto', '#yanPhotoFinal'].forEach((s) => ($(s).src = cfg.photo));
  $('#socials').innerHTML = cfg.socials.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label} ${s.handle}</a></li>`).join('');

  /* ---------- Хмара відгуків ---------- */
  const REVIEWS = [
    ['Відмовився піти пописяти разом після першого побачення. Яка тоді близькість?', 'Колишня №3', 3],
    ['Мамі не сподобались його жарти про євреїв і циган. Мені теж, але я посміялась.', 'Колишня №2', 4],
    ['Дав сир. Потім ще сир. Потім пішов на роботу на 12 годин. Зрадник.', 'Його пес', 4],
    ['Замовляє подвійне еспресо о 23:40 і питає, чому не спиться.', 'Бариста біля дому', 3],
    ['Пішли від нього. Повернулись. Він підняв ціну. Тепер плачемо, але платимо.', 'Колишній клієнт', 5],
    ['Програв йому шахи на роздягання. Тепер ходжу в його светрі. Він теж замалий.', 'Шахова суперниця', 5],
    ['Б\'є чітко, але тільки в печінку. Вище не дістає.', 'Тренер з боксу', 4],
    ['Хороший хлопчик. Але хто так ріже олів\'є?', 'Мама', 4],
    ['Впізнаю себе. Такий же гучний і так само паркується.', 'Ударний вертоліт «Апач»', 5],
    ['Бере шаурму без цибулі «на всяк випадок». Дуже оптимістично.', 'Продавець шаурми', 3],
    ['Не найкращий колишній. Але й не найгірший. Найгірший — той, що з гітарою.', 'Колишня №1', 2],
    ['Простояв 20 хвилин у найповільнішій черзі. Здається, йому це подобається.', 'Касирка АТБ', 3],
    ['Набив моє ім\'я. Ми бачились один раз.', 'Тату-майстриня', 1],
  ];
  // На екрані одночасно до 8 карток (по 4 з боків), тексти по черзі змінюються
  let reviewTimer, reviewPtr = 0;
  const reviewHTML = ([text, who, stars]) =>
    `<span class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span><br>${text}<small>— ${who}</small>`;
  function buildReviews() {
    const box = $('#reviewCloud');
    clearInterval(reviewTimer);
    const slots = Math.min(cfg.anim.clouds, 8, REVIEWS.length);
    const perSide = Math.ceil(slots / 2);
    box.innerHTML = Array.from({ length: slots }, (_, i) => {
      const left = i % 2 === 0, row = Math.floor(i / 2);
      const stagger = row % 2 ? 5 : 0;
      const x = left ? 1 + stagger : 79 - stagger;
      const y = 2 + row * (74 / Math.max(perSide - 1, 1));
      return `<div class="review" style="--x:${x}%;--y:${y}%;--r:${(Math.random() * 6 - 3).toFixed(1)}deg;--d:${(3 + Math.random() * 3).toFixed(1)}s;--delay:${(-Math.random() * 5).toFixed(1)}s;--delay2:${(i * 0.12 / cfg.anim.globalSpeed).toFixed(2)}s">${reviewHTML(REVIEWS[i])}</div>`;
    }).join('');
    reviewPtr = slots;
    if (REVIEWS.length <= slots || reduced) return;
    let slot = 0;
    reviewTimer = setInterval(() => {
      if (current !== 'reviews') return clearInterval(reviewTimer);
      const el = box.children[slot % slots];
      el.classList.add('swap');
      setTimeout(() => {
        el.innerHTML = reviewHTML(REVIEWS[reviewPtr++ % REVIEWS.length]);
        el.classList.remove('swap');
      }, 350);
      slot += 3; // не підряд, щоб мінялось у різних місцях
    }, 2600 / cfg.anim.globalSpeed);
  }

  /* ---------- Чашки ---------- */
  const CUP_COLORS = [['#ff3d7f', '#fff'], ['#17b8a6', '#fff'], ['#fff6e4', '#ff3d7f'], ['#ffc93c', '#1d1320'], ['#7a5cff', '#fff']];
  function cupSVG(body, stripe, face) {
    const faces = [
      '<circle cx="34" cy="52" r="4"/><circle cx="54" cy="52" r="4"/><path d="M36 62 q8 8 16 0" fill="none" stroke="#1d1320" stroke-width="3.5" stroke-linecap="round"/>',
      '<path d="M29 52 q5 -6 10 0 M49 52 q5 -6 10 0" fill="none" stroke="#1d1320" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="44" cy="63" rx="5" ry="6"/>',
      '<circle cx="34" cy="52" r="5" fill="#fff" stroke="#1d1320" stroke-width="3"/><circle cx="35" cy="53" r="2"/><circle cx="54" cy="52" r="5" fill="#fff" stroke="#1d1320" stroke-width="3"/><circle cx="55" cy="53" r="2"/><path d="M37 64 h14" stroke="#1d1320" stroke-width="3.5" stroke-linecap="round"/>',
    ];
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M32 22 q-6 -8 0 -16"/><path d="M46 20 q-6 -8 0 -16" style="animation-delay:-.4s"/><path d="M60 22 q-6 -8 0 -16" style="animation-delay:-.8s"/></g>
      <path d="M72 42 q20 0 18 16 q-2 16 -22 14" fill="none" stroke="#1d1320" stroke-width="9"/>
      <path d="M72 42 q20 0 18 16 q-2 16 -22 14" fill="none" stroke="${body}" stroke-width="4"/>
      <path d="M16 32 h60 l-6 52 q-2 8 -10 8 h-28 q-8 0 -10 -8 z" fill="${body}" stroke="#1d1320" stroke-width="4" stroke-linejoin="round"/>
      <path d="M17.5 44 h57" stroke="${stripe}" stroke-width="5"/>
      <ellipse cx="46" cy="32" rx="30" ry="6" fill="#6b3e26" stroke="#1d1320" stroke-width="4"/>
      <g fill="#1d1320">${faces[face]}</g>
      <ellipse cx="27" cy="60" rx="4" ry="2.5" fill="#ff8fb3" opacity=".8"/><ellipse cx="61" cy="60" rx="4" ry="2.5" fill="#ff8fb3" opacity=".8"/>
    </svg>`;
  }
  function buildCups() {
    const box = $('#cups');
    box.innerHTML = '';
    for (let i = 0; i < cfg.anim.cups; i++) {
      const [b, s] = CUP_COLORS[i % CUP_COLORS.length];
      const el = document.createElement('div');
      el.className = 'cup';
      const size = 60 + Math.random() * 70;
      const dur = 9 + Math.random() * 10;
      el.style.cssText = `--y:${(Math.random() * 85).toFixed(1)}vh;--size:${size.toFixed(0)}px;--dur:${dur.toFixed(1)}s;--delay:${(-Math.random() * dur).toFixed(1)}s;--bob:${(Math.random() * 120 - 60).toFixed(0)}px`;
      el.innerHTML = cupSVG(b, s, i % 3);
      box.appendChild(el);
    }
  }

  function applyAnim() {
    root.style.setProperty('--gs', cfg.anim.globalSpeed);
    root.style.setProperty('--cup-speed', cfg.anim.cupSpeed);
    root.style.setProperty('--wobble', cfg.anim.wobble);
  }

  /* ---------- Музика ----------
     Грає за замовчуванням. Браузери не дають вмикати звук до першої дії людини,
     тому пробуємо одразу, а якщо заблоковано — стартуємо з першого кліку чи тапу.
     Вибір «вимкнено» запам'ятовується. */
  const mbtn = $('#musicBtn');
  let muted = false;
  try { muted = localStorage.getItem('yan-muted') === '1'; } catch {}
  const setBtn = (on) => {
    mbtn.setAttribute('aria-pressed', String(on));
    mbtn.setAttribute('aria-label', on ? 'Вимкнути звук' : 'Увімкнути звук');
    $('#musicIcon').textContent = on ? '♪' : '🔇';
  };
  const remember = (m) => { muted = m; try { localStorage.setItem('yan-muted', m ? '1' : '0'); } catch {} };
  async function play() {
    try { await window.YanMusic.start(); setBtn(true); return true; } catch { setBtn(false); return false; }
  }
  mbtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (window.YanMusic.playing) { window.YanMusic.stop(); setBtn(false); remember(true); }
    else { remember(false); await play(); }
  });
  setBtn(false);
  if (cfg.autoplay !== false && !muted) {
    play().then((ok) => {
      if (ok) return;
      const kick = () => {
        if (!muted && !window.YanMusic.playing) play();
        ['pointerdown', 'keydown', 'touchstart'].forEach((t) => document.removeEventListener(t, kick, true));
      };
      ['pointerdown', 'keydown', 'touchstart'].forEach((t) => document.addEventListener(t, kick, true));
    });
  }

  /* ---------- Фінальна форма ---------- */
  const drop = $('#photoDrop');
  $('#inPhoto').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state.photo = await compress(file);
      const img = $('#photoPreview');
      img.src = state.photo; img.hidden = false;
      drop.classList.add('has');
    } catch {
      showFinalHint('Не вийшло прочитати фото. Спробуй інший файл (JPG або PNG).');
    }
  });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, () => drop.classList.add('drag')));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('drag')));

  // стискаємо до 1280px JPEG, щоб влізти в ліміт Vercel
  function compress(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const max = 1280, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  function showFinalHint(msg) { const h = $('#finalHint'); h.textContent = msg; h.hidden = false; }

  $('#finalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    state.contact = $('#inContact').value.trim();
    if (!state.contact) return showFinalHint('Залиш нік, інакше як я напишу? Голубом?');
    if (!$('#inConsent').checked) return showFinalHint('Постав галочку згоди, будь ласка.');
    $('#finalHint').hidden = true;
    const btn = $('#sendBtn');
    btn.disabled = true; btn.textContent = 'Надсилаю…';
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, achievements: [...got].map((k) => ACH[k].t) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
      unlock('final');
      showDone();
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Спробувати ще раз';
      const tg = cfg.socials[0];
      showFinalHint(`Не вдалося надіслати. Напиши мені напряму: ${tg ? tg.handle : ''}`);
    }
  });

  function showDone() {
    // сумісність: завжди висока, бо ти дійшла до кінця
    let pct = 69;
    if (state.hobbies.some((h) => /Шахи|Відеоігри|Кава|Татуювання/.test(h))) pct += 8;
    if (state.seek === 'Хочу стосунків' || state.seek === 'Люблю пельмені та шукаю інвестора') pct += 7;
    if (state.green) pct += 5;
    if (state.red) pct += 5;
    if (got.has('poop')) pct += 3;
    pct = Math.min(pct, 99);
    const texts = [
      [90, 'Небезпечно високо. Я вже ставлю чайник.'],
      [80, 'Це вже не метч, це діагноз. Для нас обох.'],
      [0, 'Достатньо для кави. І для другої кави.'],
    ];
    $('#matchText').textContent = texts.find(([min]) => pct >= min)[1];
    go('done');
    setTimeout(() => {
      renderAch($('#achList'), false);
      confetti(70);
      const el = $('#matchPct');
      if (reduced) { el.textContent = pct + '%'; return; }
      let v = 0;
      const t = setInterval(() => { v += 1; el.textContent = v + '%'; if (v >= pct) clearInterval(t); }, 18 / cfg.anim.globalSpeed);
    }, 400);
  }

  /* ---------- Панель ?tune ---------- */
  function setupTune() {
    if (!new URLSearchParams(location.search).has('tune')) return;
    const fields = [
      ['cups', 'Кількість чашок', 0, 30, 1],
      ['cupSpeed', 'Швидкість чашок', 0.3, 3, 0.1],
      ['wobble', 'Хитання', 0, 2, 0.1],
      ['globalSpeed', 'Швидкість анімацій', 0.5, 2, 0.1],
      ['clouds', 'Відгуків у хмарі', 2, 8, 1],
      ['tempo', 'Темп музики, BPM', 70, 160, 1],
    ];
    $('#tuneFields').innerHTML = fields.map(([k, l, min, max, st]) =>
      `<label for="t_${k}">${l}<output id="o_${k}">${cfg.anim[k]}</output><input id="t_${k}" type="range" min="${min}" max="${max}" step="${st}" value="${cfg.anim[k]}"></label>`
    ).join('');
    fields.forEach(([k]) => {
      $('#t_' + k).addEventListener('input', (e) => {
        cfg.anim[k] = +e.target.value;
        $('#o_' + k).textContent = e.target.value;
        applyAnim();
        if (k === 'cups') buildCups();
        if (k === 'clouds' && current === 'reviews') buildReviews();
      });
    });
    $('#tuneJump').innerHTML = ORDER.map((s) => `<button type="button" data-jump="${s}">${s}</button>`).join('');
    $('#tuneJump').addEventListener('click', (e) => {
      const s = e.target.dataset.jump; if (!s) return;
      if (s === 'final' || s === 'done') $('#photoWrap').classList.remove('locked');
      if (s === 'done') return showDone();
      go(s);
    });
    $('#tuneCopy').addEventListener('click', async () => {
      const txt = 'anim: ' + JSON.stringify(cfg.anim, null, 2) + ',';
      try { await navigator.clipboard.writeText(txt); $('#tuneOut').textContent = 'Скопійовано. Встав у config.js замість блоку anim.'; }
      catch { $('#tuneOut').textContent = txt; }
    });
    $('#tune').hidden = false;
  }

  /* ---------- Старт ---------- */
  applyAnim();
  buildCups();
  updateXP();
  setupTune();
  $('[data-screen="intro"]').classList.add('enter');

  // для скриншотів і тестів: ?screen=reviews
  const jump = new URLSearchParams(location.search).get('screen');
  if (jump && ORDER.includes(jump)) {
    if (['final', 'done'].includes(jump)) $('#photoWrap').classList.remove('locked');
    $('[data-screen="intro"]').hidden = true;
    const to = $(`[data-screen="${jump}"]`);
    to.hidden = false; document.body.dataset.style = to.dataset.style; current = jump;
    onEnter(jump); updateXP();
  }
})();
