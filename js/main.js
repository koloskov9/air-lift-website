(function() {
    const form = document.getElementById('telegramForm');
    const successDiv = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        // formData собирает все поля: name, phone, time, type

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
            // Apps Script вернёт текстовый ответ "OK" или ошибку
            if (response.ok) {
                successDiv.style.display = 'flex';
                form.reset();
                setTimeout(() => successDiv.style.display = 'none', 5000);
            } else {
                alert('Ошибка отправки. Попробуйте ещё раз.');
            }
        } catch (error) {
            alert('Ошибка сети. Проверьте подключение.');
        }
    });
})();
