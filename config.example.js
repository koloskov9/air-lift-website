// ============================================
// КОНФИГУРАЦИЯ TELEGRAM БОТА
// ============================================
// 1. Переименуйте этот файл в config.js
// 2. Вставьте свои реальные данные
// 3. config.js добавлен в .gitignore — он не попадёт в репозиторий

const TELEGRAM_CONFIG = {
    BOT_TOKEN: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz', // Токен от @BotFather
    CHAT_ID: '123456789' // Ваш числовой chat_id
};

// Не удаляйте эту строку
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TELEGRAM_CONFIG;
}
