/**
 * Air Lift — Админ-панель
 * Просмотр заявок из Telegram
 * Версия: 1.0.0
 */

(function() {
    'use strict';

    // ============================================
    // НАСТРОЙКИ
    // ============================================
    const ADMIN_PASSWORD = 'airlift2026'; // ЗАМЕНИТЕ НА СВОЙ ПАРОЛЬ

    // Ключ для localStorage (сохранение сессии)
    const SESSION_KEY = 'airlift_admin_session';

    // ============================================
    // DOM ЭЛЕМЕНТЫ
    // ============================================
    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const requestsList = document.getElementById('requestsList');
    const loader = document.getElementById('loader');
    const totalCountEl = document.getElementById('totalCount');
    const todayCountEl = document.getElementById('todayCount');

    // ============================================
    // СОСТОЯНИЕ
    // ============================================
    let allRequests = [];
    let isLoggedIn = false;

    // ============================================
    // ПРОВЕРКА КОНФИГА
    // ============================================
    function getConfig() {
        if (typeof TELEGRAM_CONFIG !== 'undefined' && TELEGRAM_CONFIG.BOT_TOKEN) {
            return TELEGRAM_CONFIG;
        }
        return null;
    }

    // ============================================
    // АВТОРИЗАЦИЯ
    // ============================================
    function checkSession() {
        const session = sessionStorage.getItem(SESSION_KEY);
        if (session === 'true') {
            showMainScreen();
        }
    }

    function login(password) {
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            showMainScreen();
            return true;
        }
        return false;
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        isLoggedIn = false;
        allRequests = [];
        loginScreen.style.display = 'flex';
        mainScreen.style.display = 'none';
        passwordInput.value = '';
        loginError.textContent = '';
    }

    function showMainScreen() {
        isLoggedIn = true;
        loginScreen.style.display = 'none';
        mainScreen.style.display = 'flex';
        loadRequests();
    }

    // ============================================
    // ЗАГРУЗКА ЗАЯВОК ИЗ TELEGRAM
    // ============================================
    async function loadRequests() {
        const config = getConfig();
        if (!config) {
            showError('Конфиг не найден. Создайте config.js');
            return;
        }

        showLoader(true);
        try {
            // Используем getUpdates с параметром offset=-1 для получения последних неподтвержденных
            const url = `https://api.telegram.org/bot${config.BOT_TOKEN}/getUpdates?limit=100&timeout=5`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.description || 'Ошибка API Telegram');
            }

            // Фильтруем только сообщения с маркером "Новая заявка"
            const requests = data.result
                .filter(update => {
                    return update.message && 
                           update.message.text && 
                           update.message.text.includes('Новая заявка');
                })
                .map(update => {
                    const msg = update.message;
                    const text = msg.text;
                    const date = new Date(msg.date * 1000);
                    
                    // Парсим поля из текста
                    const nameMatch = text.match(/👤 Имя: (.+)/);
                    const contactMatch = text.match(/📲 Контакт: (.+)/);
                    const wishMatch = text.match(/📝 Пожелания: (.+)/);

                    return {
                        id: update.update_id,
                        date: date,
                        name: nameMatch ? nameMatch[1].replace(/\\/g, '') : '—',
                        contact: contactMatch ? contactMatch[1].replace(/\\/g, '') : '—',
                        wish: wishMatch ? wishMatch[1].replace(/\\/g, '') : '—',
                        raw: text
                    };
                })
                .sort((a, b) => b.date - a.date); // новые сверху

            allRequests = requests;
            renderRequests();
            updateStats();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showError('Не удалось загрузить заявки. Проверьте токен и соединение.');
        } finally {
            showLoader(false);
        }
    }

    // ============================================
    // ОТОБРАЖЕНИЕ
    // ============================================
    function renderRequests() {
        if (allRequests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <p>Заявок пока нет</p>
                </div>`;
            return;
        }

        requestsList.innerHTML = allRequests.map(req => `
            <div class="request-card" data-id="${req.id}">
                <button class="delete-btn" title="Скрыть" onclick="window.adminHideRequest(${req.id})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="request-time">
                    <i class="fa-regular fa-clock"></i>
                    ${formatDate(req.date)}
                </div>
                <div class="request-field">
                    <span class="field-label">👤 Имя:</span>
                    <span class="field-value">${escapeHtml(req.name)}</span>
                </div>
                <div class="request-field">
                    <span class="field-label">📲 Контакт:</span>
                    <span class="field-value">${escapeHtml(req.contact)}</span>
                </div>
                <div class="request-field">
                    <span class="field-label">📝 Пожелания:</span>
                    <span class="field-value">${escapeHtml(req.wish) || '—'}</span>
                </div>
            </div>
        `).join('');
    }

    function updateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRequests = allRequests.filter(r => r.date >= today);
        
        totalCountEl.textContent = allRequests.length;
        todayCountEl.textContent = todayRequests.length;
    }

    function showError(message) {
        requestsList.innerHTML = `
            <div class="empty-state" style="color: #c96b6b;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>${message}</p>
            </div>`;
    }

    function showLoader(show) {
        loader.style.display = show ? 'block' : 'none';
    }

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    function formatDate(date) {
        const options = {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ru-RU', options);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Функция скрытия заявки (только визуально)
    window.adminHideRequest = function(id) {
        allRequests = allRequests.filter(r => r.id !== id);
        renderRequests();
        updateStats();
    };

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = passwordInput.value;
        if (!login(password)) {
            loginError.textContent = 'Неверный пароль';
            passwordInput.value = '';
        }
    });

    refreshBtn.addEventListener('click', loadRequests);
    logoutBtn.addEventListener('click', logout);

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    checkSession();
})();
