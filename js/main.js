(function() {
    const form = document.getElementById('orderForm');
    const successDiv = document.getElementById('successMessage');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const length = document.getElementById('length').value;

        if (!name || !phone) {
            alert('Заполни имя и телефон, гений.');
            return;
        }

        // Простая проверка телефона
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            alert('Номер телефона какой-то кривой.');
            return;
        }

        const lengthText = {
            short: 'Короткие',
            medium: 'Средняя длина',
            long: 'Длинные'
        }[length] || length;

        const message = `🔥 Новая заявка Air Root\n\n👤 Имя: ${name}\n📲 Телефон: ${phone}\n📏 Длина волос: ${lengthText}\n\n🕐 ${new Date().toLocaleString('ru-RU')}`;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправляю...';
        }

        try {
            if (typeof TELEGRAM_BOT_TOKEN === 'undefined' || typeof TELEGRAM_CHAT_ID === 'undefined') {
                throw new Error('Нет config.js');
            }

            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();

            if (data.ok) {
                form.reset();
                if (successDiv) successDiv.style.display = 'block';
                setTimeout(() => {
                    if (successDiv) successDiv.style.display = 'none';
                }, 5000);
            } else {
                alert('Telegram не принял заявку. Проверь токен и chat_id.');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка отправки. Либо нет интернета, либо config.js не подключён.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Подтвердить запись';
            }
        }
    });
})();
