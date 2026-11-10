// Vercel serverless function: отримує анкету і пересилає її тобі в Telegram.
// Потрібні змінні середовища у Vercel: TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID.

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).slice(0, 600);

export default async function handler(req, res) {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

  // Діагностика: відкрий /api/submit у браузері
  if (req.method === 'GET') {
    let bot = null;
    if (token) {
      try { const r = await fetch(`https://api.telegram.org/bot${token}/getMe`); const j = await r.json(); bot = j.ok ? '@' + j.result.username : 'токен не приймається: ' + j.description; }
      catch (e) { bot = 'не вдалося звернутися до Telegram'; }
    }
    return res.status(200).json({ tokenSet: !!token, chatIdSet: !!chatId, chatId: chatId ? chatId.replace(/\d(?=\d{3})/g, '•') : null, bot });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!token || !chatId) return res.status(500).json({ error: 'Telegram не налаштований: додай TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у Vercel' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (!b.contact) return res.status(400).json({ error: 'Немає контакту' });

  const hobbies = [...(b.hobbies || []), b.hobbyOther].filter(Boolean).join(', ');
  const text = [
    '💌 <b>Нова анкета!</b>',
    '',
    `<b>Ім'я:</b> ${esc(b.name)}`,
    `<b>18+ вже:</b> ${esc(b.age)}`,
    `<b>Контакт:</b> ${esc(b.contact)}`,
    '',
    `<b>Хобі:</b> ${esc(hobbies)}`,
    `<b>Шукає:</b> ${esc(b.seek)}`,
    `<b>Ідеальне побачення:</b> ${esc(b.date)}`,
    `<b>Суперсила:</b> ${esc(b.power)}`,
    `🟢 ${esc(b.green)}`,
    `🔴 ${esc(b.red)}`,
    '',
    `🏆 ${esc((b.achievements || []).join(' · '))}`,
  ].join('\n');

  const api = `https://api.telegram.org/bot${token}`;
  try {
    const r = await fetch(`${api}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error('Telegram: ' + (j.description || r.status));
    }

    if (typeof b.photo === 'string' && b.photo.startsWith('data:image/')) {
      const base64 = b.photo.split(',')[1];
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('caption', `Фото: ${String(b.name || '').slice(0, 60)} · ${String(b.contact).slice(0, 60)}`);
      form.append('photo', new Blob([Buffer.from(base64, 'base64')], { type: 'image/jpeg' }), 'photo.jpg');
      const p = await fetch(`${api}/sendPhoto`, { method: 'POST', body: form });
      if (!p.ok) console.error('sendPhoto failed', await p.text());
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: String(e.message || e) });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
