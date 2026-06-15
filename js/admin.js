(function() {
    const BOT_TOKEN = typeof TELEGRAM_BOT_TOKEN !== 'undefined' ? TELEGRAM_BOT_TOKEN : '';
    const CHAT_ID = typeof TELEGRAM_CHAT_ID !== 'undefined' ? TELEGRAM_CHAT_ID : '';
    const PASSWORD = typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'airlift2026';

    const overlay = document.getElementById('adminOverlay');
    const panel = document.getElementById('adminPanel');
    let requests = [];

    // Открыть админку по клику на логотип
    document.getElementById('openAdminBtn').addEventListener('click', () => {
        if (sessionStorage.getItem('airlift_admin') === 'true') {
            renderMain();
            loadRequests();
        } else {
            renderLogin();
        }
        overlay.style.display = 'flex';
    });

    // Закрыть по клику вне панели
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });

    function renderLogin() {
        panel.innerHTML = `
            <div class="admin-login">
                <div class="login-icon"><i class="fa-solid fa-lock"></i></div>
                <h2>Админ-панель</h2>
                <div class="input-group"><i class="fa-solid fa-key"></i><input type="password" id="adminPassInput" placeholder="Пароль"></div>
                <button id="adminLoginBtn"><i class="fa-solid fa-right-to-bracket"></i> Войти</button>
                <p class="admin-error" id="adminError"></p>
            </div>`;
        document.getElementById('adminLoginBtn').addEventListener('click', login);
        document.getElementById('adminPassInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }

    function login() {
        const pass = document.getElementById('adminPassInput').value;
        if (pass === PASSWORD) {
            sessionStorage.setItem('airlift_admin', 'true');
            renderMain();
            loadRequests();
        } else {
            document.getElementById('adminError').textContent = 'Неверный пароль';
        }
    }

    function renderMain() {
        panel.innerHTML = `
            <div class="admin-header">
                <h2><i class="fa-solid fa-feather"></i> Заявки Air Lift</h2>
                <div>
                    <button class="btn-icon" id="adminLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i></button>
                    <button class="btn-icon" id="closeAdminBtn">&times;</button>
                </div>
            </div>
            <div class="admin-stats">
                <div class="admin-stat"><span class="stat-number" id="adminTotal">0</span><span class="stat-label">всего</span></div>
                <div class="admin-stat"><span class="stat-number" id="adminToday">0</span><span class="stat-label">сегодня</span></div>
            </div>
            <div class="admin-requests" id="adminRequestsList"><div class="empty-state">Загрузка...</div></div>
            <div class="admin-loader" id="adminLoader"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</div>
        `;
        document.getElementById('closeAdminBtn').addEventListener('click', () => overlay.style.display = 'none');
        document.getElementById('adminLogoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('airlift_admin');
            requests = [];
            renderLogin();
        });
    }

    async function loadRequests() {
        const loader = document.getElementById('adminLoader');
        if (loader) loader.style.display = 'block';
        try {
            if (BOT_TOKEN && CHAT_ID) {
                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100&timeout=5`);
                const data = await res.json();
                if (data.ok) {
                    requests = data.result
                        .filter(u => u.message && u.message.text && u.message.text.includes('Новая заявка'))
                        .map(u => {
                            const t = u.message.text;
                            const d = new Date(u.message.date * 1000);
                            return {
                                id: u.update_id,
                                date: d,
                                name: (t.match(/👤 Имя: (.+)/) || ['','—'])[1].replace(/\\/g, ''),
                                contact: (t.match(/📲 Контакт: (.+)/) || ['','—'])[1].replace(/\\/g, ''),
                                wish: (t.match(/📝 Пожелания: (.+)/) || ['','—'])[1].replace(/\\/g, '')
                            };
                        })
                        .sort((a,b) => b.date - a.date);
                }
            } else {
                // Демо
                requests = [
                    { id: 1, date: new Date(), name: 'Анна', contact: '@anna_test', wish: 'Завтра в 12:00' },
                    { id: 2, date: new Date(Date.now()-86400000), name: 'Мария', contact: '+79001234567', wish: '' }
                ];
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (loader) loader.style.display = 'none';
        }
        renderRequests();
        updateStats();
    }

    function renderRequests() {
        const list = document.getElementById('adminRequestsList');
        if (!list) return;
        if (requests.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Заявок пока нет</p></div>';
            return;
        }
        list.innerHTML = requests.map(r => `
            <div class="request-card">
                <button class="delete-btn" onclick="window.hideAdminRequest(${r.id})"><i class="fa-solid fa-xmark"></i></button>
                <div class="request-time"><i class="fa-regular fa-clock"></i> ${r.date.toLocaleDateString('ru-RU', {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</div>
                <div class="request-field"><span class="field-label">👤 Имя:</span><span class="field-value">${escHtml(r.name)}</span></div>
                <div class="request-field"><span class="field-label">📲 Контакт:</span><span class="field-value">${escHtml(r.contact)}</span></div>
                <div class="request-field"><span class="field-label">📝 Пожелания:</span><span class="field-value">${escHtml(r.wish) || '—'}</span></div>
            </div>
        `).join('');
    }

    function updateStats() {
        const total = document.getElementById('adminTotal');
        const today = document.getElementById('adminToday');
        if (total) total.textContent = requests.length;
        if (today) {
            const start = new Date(); start.setHours(0,0,0,0);
            today.textContent = requests.filter(r => r.date >= start).length;
        }
    }

    window.hideAdminRequest = function(id) {
        requests = requests.filter(r => r.id !== id);
        renderRequests();
        updateStats();
    };

    function escHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
