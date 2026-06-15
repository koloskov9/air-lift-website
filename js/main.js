(function() {
    // Используем глобальные переменные из config.js
    const BOT_TOKEN = typeof TELEGRAM_BOT_TOKEN !== 'undefined' ? TELEGRAM_BOT_TOKEN : '';
    const CHAT_ID = typeof TELEGRAM_CHAT_ID !== 'undefined' ? TELEGRAM_CHAT_ID : '';

    const form = document.getElementById('telegramForm');
    const successDiv = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !contact) {
            alert('Заполните имя и контакт');
            return;
        }

        const text = `🕊️ *Новая заявка Air Lift*\n\n👤 Имя: ${escapeMd(name)}\n📲 Контакт: ${escapeMd(contact)}\n📝 Пожелания: ${escapeMd(message || 'нет')}\n\n⏱ ${new Date().toLocaleString('ru-RU')}`;

        if (BOT_TOKEN && CHAT_ID) {
            try {
                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'MarkdownV2' })
                });
                const data = await res.json();
                if (data.ok) {
                    successDiv.style.display = 'flex';
                    form.reset();
                    setTimeout(() => successDiv.style.display = 'none', 5000);
                } else {
                    alert('Ошибка отправки: ' + (data.description || ''));
                }
            } catch (err) {
                alert('Ошибка сети');
            }
        } else {
            // Демо-режим
            console.log('Демо:', { name, contact, message });
            alert('Демо-режим (не задан токен)');
            successDiv.style.display = 'flex';
            form.reset();
            setTimeout(() => successDiv.style.display = 'none', 5000);
        }
    });

    function escapeMd(text) {
        if (!text) return '';
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }
})();
