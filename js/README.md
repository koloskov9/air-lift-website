# Air Lift — сайт услуги прикорневого объёма

Одностраничный сайт для мастера по прикорневому объёму волос с формой заявки (отправка в Telegram) и встроенной админ-панелью.

## Структура проекта
- `index.html` — основной сайт с админ-панелью
- `css/style.css` — стили лендинга
- `css/admin.css` — стили админ-панели
- `js/main.js` — отправка заявки в Telegram
- `js/admin.js` — интерфейс администратора
- `config.example.js` — образец конфигурации

## Быстрый старт
1. Создайте бота в Telegram через @BotFather и получите токен.
2. Узнайте ваш chat_id (отправьте боту сообщение и перейдите по `https://api.telegram.org/bot<токен>/getUpdates`).
3. Создайте файл `config.js` на основе `config.example.js` и вставьте свои данные:
   ```js
   const TELEGRAM_BOT_TOKEN = 'ваш_токен';
   const TELEGRAM_CHAT_ID = 'ваш_chat_id';
   const ADMIN_PASSWORD = 'ваш_пароль';
