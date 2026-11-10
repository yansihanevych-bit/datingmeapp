# Анкета Яна

Стьобна інтерактивна анкета знайомств: три стилі (80-ті мультик → хмара відгуків → VHS 90-х), ачівки, синтвейв-музика, фінальна форма з фото і ніком, яка приходить тобі в Telegram.

## Що змінити під себе

- `assets/yan.jpg` — поклади своє фото і в `config.js` зміни `photo: 'assets/yan.jpg'`
- `config.js` → `socials` — свої нік і посилання
- `assets/music.mp3` — музика, грає за замовчуванням (кнопка ♪ вимикає). `config.js` → `autoplay: false`, щоб не грала одразу
- `config.js` → `youtubeId` — id відео з YouTube (після `v=`), грає в міні-плеєрі в куточку. Якщо відео не дозволяє вбудовування, автоматично грає вбудований синтвейв. `musicUrl` — свій mp3, `null` — без нього
- Тексти питань і відповідей — у `index.html`, відгуки й ачівки — у `app.js`

## Налаштування анімацій наживо

Відкрий сайт з `?tune` в кінці адреси (напр. `https://твій-сайт.vercel.app/?tune`).
З'явиться панель з повзунками і переходом на будь-який екран. Підібрав — натисни «Скопіювати для config.js» і встав у `config.js`.

## Telegram-бот для анкет

1. У Telegram напиши @BotFather → `/newbot` → отримаєш токен.
2. Напиши своєму боту будь-що, потім відкрий `https://api.telegram.org/bot<ТОКЕН>/getUpdates` і знайди `"chat":{"id": ...}` — це твій chat id.
3. У Vercel: Project → Settings → Environment Variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Redeploy.

## Деплой

```bash
git remote add origin https://github.com/<ти>/yan-match.git
git push -u origin main
```
Далі на vercel.com → Add New → Project → імпортуй репозиторій. Збірка не потрібна: Framework Preset — Other.

## Локально

```bash
npx vercel dev
```
(або просто відкрий `index.html`, але форма без `/api` не надішлеться)
