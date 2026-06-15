/*
(function() {
    const form = document.getElementById('telegramForm');
    const successDiv = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
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
*/
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();
