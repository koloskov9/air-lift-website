/**
 * Air Lift — Прикорневой объём
 * Отправка заявок в Telegram
 * Версия: 1.0.0
 */

(function() {
    'use strict';

    // ============================================
    // DOM ЭЛЕМЕНТЫ
    // ============================================
    const form = document.getElementById('telegramForm');
    const successDiv = document.getElementById('successMessage');
    const nameInput = document.getElementById('name');
    const contactInput = document.getElementById('contact');
    const messageInput = document.getElementById('message');

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================

    /**
     * Экранирование специальных символов для MarkdownV2
     * @param {string} text - Исходный текст
     * @returns {string} Экранированный текст
     */
    function escapeMarkdown(text) {
        if (!text) return '';
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }

    /**
     * Проверка, настроен ли конфиг
     * @returns {boolean}
     */
    function isConfigured() {
        return (
            typeof TELEGRAM_CONFIG !== 'undefined' &&
            TELEGRAM_CONFIG.BOT_TOKEN &&
            TELEGRAM_CONFIG.CHAT_ID &&
            TELEGRAM_CONFIG.BOT_TOKEN !== '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' &&
            TELEGRAM_CONFIG.CHAT_ID !== '123456789'
        );
    }

    /**
     * Показать сообщение об успехе
     */
    function showSuccess() {
        successDiv.style.display = 'flex';
        form.reset();
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 6000);
    }

    /**
     * Валидация формы
     * @returns {boolean}
     */
    function validateForm(name, contact) {
        if (!name || name.length < 2) {
            alert('Пожалуйста, укажите имя (минимум 2 символа)');
            return false;
        }
        if (!contact || contact.length < 3) {
            alert('Пожалуйста, укажите контакт');
            return false;
        }
        return true;
    }

    // ============================================
    // ОТПРАВКА ФОРМЫ
    // ============================================
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const contact = contactInput.value.trim();
        const message = messageInput.value.trim();

        // Валидация
        if (!validateForm(name, contact)) {
            return;
        }

        // Формируем сообщение
        const text = [
            '🕊️ *Новая заявка Air Lift*',
            '',
            `👤 Имя: ${escapeMarkdown(name)}`,
            `📲 Контакт: ${escapeMarkdown(contact)}`,
            `📝 Пожелания: ${escapeMarkdown(message || 'нет')}`,
            '',
            `⏱ ${new Date().toLocaleString('ru-RU')}`
        ].join('\n');

        // Демо-режим (если конфиг не настроен)
        if (!isConfigured()) {
            console.warn('⚠️ Telegram не настроен. Работает демо-режим.');
            console.log('📋 Содержимое заявки:', { name, contact, message });
            alert('Демо-режим: заявка не отправлена.\n\n' +
                  'Для настройки:\n' +
                  '1. Создайте config.js из config.example.js\n' +
                  '2. Вставьте ток
