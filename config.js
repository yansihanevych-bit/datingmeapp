// Усе, що можна міняти без коду. Значення з панелі ?tune вставляй сюди.
window.YAN_CONFIG = {
  // Твоє фото (поклади файл у assets/ і зміни шлях, напр. 'assets/yan.jpg')
  photo: 'assets/yan.jpg',

  // Твої соцмережі (показуються на картці у відгуках)
  socials: [
    { label: 'Telegram', handle: '@yansi_carnifex', url: 'https://t.me/yansi_carnifex' },
    { label: 'Instagram', handle: '@yansi_carnifex', url: 'https://www.instagram.com/yansi_carnifex' },
  ],

  // Музика. Пріоритет: YouTube → mp3 → вбудований синтвейв.
  // YouTube: id відео з посилання (те, що після v=). Відео має дозволяти вбудовування,
  // інакше автоматично заграє синтвейв.
  youtubeId: null,    // напр. 'Iuid4TlIw34'
  youtubeStart: 0,     // з якої секунди починати
  // Свій mp3 (якщо маєш права на трек): 'assets/music.mp3'
  musicUrl: 'assets/music.mp3',
  autoplay: true,      // грати одразу (з першого кліку, якщо браузер блокує)

  // Анімації (міняються наживо через ?tune)
  anim: {
    cups: 9,          // кількість чашок, що літають
    cupSpeed: 1,      // швидкість польоту (0.3 – 3)
    wobble: 1,        // наскільки чашки хитаються (0 – 2)
    globalSpeed: 1,   // швидкість усіх переходів (0.5 – 2)
    clouds: 8,        // скільки карток з відгуками одночасно (до 8, тексти змінюються)
    tempo: 104,       // темп вбудованої музики (BPM)
  },
};
