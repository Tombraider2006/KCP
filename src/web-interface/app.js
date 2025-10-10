/**
 * Web-интерфейс для 3D Printer Control Panel
 * Подключается к Socket.IO и REST API
 */

// Глобальные переменные
let socket = null;
let printers = [];
let printerStatuses = new Map();

// Звуковое уведомление
let notificationSound = null;
let previousStatuses = new Map(); // Для отслеживания изменений статуса

// Подключение к Socket.IO
function connectWebSocket() {
    const connectionStatus = document.getElementById('connectionStatus');
    const statusIndicator = connectionStatus.querySelector('.status-indicator');

    socket = io();

    socket.on('connect', () => {
        console.log('✅ Подключено к серверу');
        connectionStatus.innerHTML = '<span class="status-indicator"></span><strong>Подключено</strong>';
        loadPrinters();
    });

    socket.on('disconnect', () => {
        console.log('❌ Отключено от сервера');
        connectionStatus.innerHTML = '<span class="status-indicator"></span><strong>Подключение...</strong>';
    });

    socket.on('initial-data', (data) => {
        console.log('📦 Получены начальные данные:', data);
        printers = data.printers || [];
        renderPrinters();
        updateStats();
    });

    socket.on('printer-update', (data) => {
        console.log('🔄 Обновление данных принтера:', data);
        updatePrinterData(data.printerId, data.data);
    });

    socket.on('printer-status', (data) => {
        console.log('📊 Обновление статуса принтера:', data);
        const printer = printers.find(p => p.id === data.printerId);
        if (printer) {
            // Проверяем критический статус и воспроизводим звук
            checkCriticalStatus(data.printerId, printer.status);
            
            // Обновляем данные
            printerStatuses.set(data.printerId, data.status);
            updatePrinterCard(data.printerId);
            updateStats();
        }
    });

    socket.on('error', (error) => {
        console.error('❌ Ошибка WebSocket:', error);
    });
}

// Загрузка списка принтеров через API
async function loadPrinters() {
    try {
        const response = await fetch('/api/printers');
        const data = await response.json();

        if (data.success) {
            // Обрабатываем критические обновления первыми
            if (data.critical && data.critical.length > 0) {
                console.log('🚨 Критические обновления:', data.critical.length);
                data.critical.forEach(update => {
                    // Воспроизводим звук для критических событий
                    if (update.data && isCriticalStatus(update.data.status)) {
                        playCriticalSound();
                    }
                });
            }
            
            // Используем активные принтеры (без offline)
            printers = data.active || [];
            console.log(`✅ Загружено активных принтеров: ${printers.length}`);
            
            // Обновляем статистику из оптимизированного пакета
            if (data.stats) {
                updateStatsFromPackage(data.stats);
            }
            
            // Подписываемся на обновления каждого принтера
            printers.forEach(printer => {
                socket.emit('subscribe-printer', printer.id);
                // Загружаем статус принтера
                loadPrinterStatus(printer.id);
            });
            
            // Логируем размер пакета для мониторинга
            if (data.packageSize) {
                console.log(`📦 Размер пакета данных: ${data.packageSize} байт`);
            }

            renderPrinters();
            updateStats();
        } else {
            console.error('Ошибка загрузки принтеров:', data.error);
            showError('Не удалось загрузить список принтеров');
        }
    } catch (error) {
        console.error('Ошибка при загрузке принтеров:', error);
        showError('Ошибка подключения к серверу');
    }
}

// Загрузка статуса конкретного принтера
async function loadPrinterStatus(printerId) {
    try {
        const response = await fetch(`/api/printers/${printerId}/status`);
        const data = await response.json();

        if (data.success) {
            printerStatuses.set(printerId, data.status);
            updatePrinterCard(printerId);
            updateStats();
        }
    } catch (error) {
        console.error(`Ошибка загрузки статуса принтера ${printerId}:`, error);
    }
}

// Отрисовка списка принтеров (уже отсортированы сервером!)
function renderPrinters() {
    const grid = document.getElementById('printersGrid');

    if (printers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🖨️</div>
                <h3>Принтеры не найдены</h3>
                <p>Добавьте принтеры в настольном приложении</p>
            </div>
        `;
        return;
    }

    // Принтеры уже отсортированы сервером по приоритету!
    grid.innerHTML = printers.map(printer => createPrinterCard(printer)).join('');
    
    // Исправляем температуры с HTML
    document.querySelectorAll('.temp-text').forEach(el => {
        const printerId = el.closest('.printer-card').dataset.printerId;
        const printer = printers.find(p => p.id === printerId);
        if (printer) {
            el.innerHTML = getTemperatures(printer);
        }
    });
}

// Создание карточки принтера (как в основном приложении)
function createPrinterCard(printer) {
    const status = printer.status || 'unknown';
    const printerType = printer.type || 'klipper';
    const printerTypeLabel = printerType === 'bambu' ? '🎋 Bambu Lab' : '🖨️ Klipper';
    const addressInfo = printer.ip;
    const webUrl = printer.type === 'bambu' 
        ? null 
        : `http://${printer.ip}:${printer.webPort || '80'}`;

    return `
        <div class="printer-card ${status}" data-printer-id="${printer.id}" ${webUrl ? `onclick="openPrinterWeb('${webUrl}'); return false;"` : ''} style="${webUrl ? 'cursor: pointer;' : ''}">
            <div class="printer-header">
                <div class="printer-name-row">
                    <span class="printer-name">${escapeHtml(printer.name)} <small style="opacity: 0.7;">${printerTypeLabel}</small></span>
                    <span class="printer-status status-${status}">
                        ${getStatusTextFromPrinter(printer)} ${printer.connectionType ? `(${printer.connectionType})` : ''}
                    </span>
                </div>
            </div>
            <div class="printer-info">
                <div class="info-item">
                    <span>Адрес:</span>
                    <span class="ip-address-large">${addressInfo}</span>
                </div>
                <div class="info-item">
                    <span>Состояние:</span>
                    <span class="state-text">${getStateText(printer)}</span>
                </div>
                <div class="info-item">
                    <span>Файл:</span>
                    <span class="file-text">${getFileName(printer)}</span>
                </div>
                <div class="info-item">
                    <span>Прогресс:</span>
                    <span class="progress-text-large ${getProgressClass(printer)}">
                        ${getProgress(printer)}
                    </span>
                </div>
                <div class="info-item">
                    <span>Температуры:</span>
                    <span class="temp-text">${getTemperatures(printer)}</span>
                </div>
                ${printer.lastUpdate ? `
                <div class="info-item">
                    <span>Обновлено:</span>
                    <span class="updated-text">${formatTime(printer.lastUpdate)}</span>
                </div>
                ` : ''}
            </div>
            <div class="printer-actions" onclick="event.stopPropagation(); return false;">
                <button class="btn btn-warning btn-small" onclick="testPrinter('${printer.id}'); return false;">
                    🔗 Проверить
                </button>
            </div>
        </div>
    `;
}

// Вспомогательные функции (как в основном приложении)

function getStatusTextFromPrinter(printer) {
    const statusMap = {
        'printing': 'Печатает',
        'ready': 'Готов',
        'complete': 'Завершено',
        'paused': 'На паузе',
        'offline': 'Offline',
        'error': 'Ошибка',
        'standby': 'Готов',
        'idle': 'Готов',
        'unknown': 'Неизвестно'
    };
    return statusMap[printer.status] || printer.status || 'Готов';
}

function getStateText(printer) {
    if (!printer.data) return '—';
    
    const state = printer.data.state || printer.data.print_stats?.state || printer.data.stateText || '—';
    
    if (state === '—') return '—';
    
    const stateMap = {
        'standby': 'Готов',
        'printing': 'Печатает',
        'paused': 'На паузе',
        'complete': 'Завершено',
        'cancelled': 'Отменено',
        'error': 'Ошибка',
        'ready': 'Готов',
        'idle': 'Готов'
    };
    
    const stateLower = state.toLowerCase();
    return stateMap[stateLower] || state;
}

function getFileName(printer) {
    if (!printer.data) return '—';
    return printer.data.filename || printer.data.print_stats?.filename || '—';
}

function getProgress(printer) {
    if (!printer.data) return '—';
    
    const progress = printer.data.progress || 
                    (printer.data.print_stats?.info?.total_duration && printer.data.print_stats?.info?.print_duration
                        ? Math.round((printer.data.print_stats.info.print_duration / printer.data.print_stats.info.total_duration) * 100)
                        : 0);
    
    return progress ? `${progress}%` : '—';
}

function getProgressClass(printer) {
    const progressText = getProgress(printer);
    
    // Мигание при 100%
    if (progressText === '100%') {
        return 'progress-100-animation';
    }
    
    // Проверяем 95-100%
    const progressNum = parseInt(progressText);
    if (progressNum >= 95 && progressNum <= 100) {
        return 'progress-95-plus';
    }
    
    return '';
}

function getTemperatures(printer) {
    if (!printer.data || !printer.data.temps) return '—';
    
    const temps = printer.data.temps;
    const nozzle = temps.nozzle_temp || temps.nozzle || temps.extruder?.temperature || 0;
    const bed = temps.bed_temp || temps.bed || temps.heater_bed?.temperature || 0;
    const chamber = temps.chamber_temp || temps.chamber || null;
    
    // Цветовая индикация: сопло >170°C = красный
    const nozzleRounded = Math.round(nozzle);
    const nozzleHtml = nozzleRounded > 170 
        ? `<span style="color: #ff4444; font-weight: bold;">🌡️ ${nozzleRounded}°C</span>` 
        : `🌡️ ${nozzleRounded}°C`;
    
    let tempText = `${nozzleHtml} / 🛏️ ${Math.round(bed)}°C`;
    
    if (chamber !== null && chamber !== undefined) {
        tempText += ` / 📦 ${Math.round(chamber)}°C`;
    }
    
    return tempText;
}

function formatTime(timestamp) {
    if (!timestamp) return '—';
    
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffMs = now - updateTime;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}с назад`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}м назад`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}ч назад`;
    
    return updateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Обновление карточки принтера
function updatePrinterCard(printerId) {
    const card = document.querySelector(`[data-printer-id="${printerId}"]`);
    if (!card) return;

    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;

    card.outerHTML = createPrinterCard(printer);

    // Добавляем обработчик клика заново
    const newCard = document.querySelector(`[data-printer-id="${printerId}"]`);
    if (newCard) {
        // Клик убираем - теперь обрабатывается в HTML через onclick
    }
}

// Обновление данных принтера
function updatePrinterData(printerId, data) {
    const printer = printers.find(p => p.id === printerId);
    if (printer) {
        printer.data = data;
        updatePrinterCard(printerId);
    }
}

// Обновление статистики
function updateStats() {
    const total = printers.length;
    let online = 0;
    let printing = 0;
    let paused = 0;

    printers.forEach(printer => {
        const status = printerStatuses.get(printer.id);
        if (!status) return;

        const state = (status.state || '').toLowerCase();
        
        if (state.includes('ready') || state.includes('idle') || state.includes('print')) {
            online++;
        }
        if (state.includes('print') || state === 'running') {
            printing++;
        }
        if (state.includes('pause')) {
            paused++;
        }
    });

    document.getElementById('totalPrinters').textContent = total;
    document.getElementById('onlinePrinters').textContent = online;
    document.getElementById('printingPrinters').textContent = printing;
    document.getElementById('pausedPrinters').textContent = paused;
}

// Показать детали принтера в модальном окне
async function showPrinterDetails(printerId) {
    const modal = document.getElementById('printerModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;

    modalTitle.textContent = printer.name;
    modalBody.innerHTML = '<div class="loading"><div class="spinner"></div><p>Загрузка...</p></div>';
    modal.classList.add('active');

    try {
        const response = await fetch(`/api/printers/${printerId}`);
        const data = await response.json();

        if (data.success) {
            const printerData = data.printer;
            const status = printerStatuses.get(printerId) || {};

            modalBody.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                        <strong>Тип:</strong> ${printerData.type || 'klipper'}<br>
                        <strong>IP:</strong> ${printerData.ip}<br>
                        <strong>Статус:</strong> ${getStatusText(status)}
                    </div>
                    
                    ${status.temps ? `
                    <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                        <h3 style="margin-bottom: 0.5rem;">🌡️ Температуры</h3>
                        <strong>Сопло:</strong> ${status.temps.nozzle || 0}°C / ${status.temps.nozzle_target || 0}°C<br>
                        <strong>Стол:</strong> ${status.temps.bed || 0}°C / ${status.temps.bed_target || 0}°C<br>
                        ${status.temps.chamber !== null && status.temps.chamber !== undefined ? 
                            `<strong>Камера:</strong> ${status.temps.chamber}°C<br>` : ''}
                    </div>
                    ` : ''}
                    
                    ${status.progress ? `
                    <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                        <h3 style="margin-bottom: 0.5rem;">📊 Печать</h3>
                        <strong>Прогресс:</strong> ${status.progress}%<br>
                        ${status.fileName ? `<strong>Файл:</strong> ${escapeHtml(status.fileName)}<br>` : ''}
                    </div>
                    ` : ''}
                    
                    <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            💡 <strong>Подсказка:</strong> Для полного управления используйте настольное приложение
                        </p>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML = '<p style="color: var(--error-color);">Ошибка загрузки данных принтера</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки деталей принтера:', error);
        modalBody.innerHTML = '<p style="color: var(--error-color);">Ошибка подключения к серверу</p>';
    }
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('printerModal');
    modal.classList.remove('active');
}

// Показать ошибку
function showError(message) {
    const grid = document.getElementById('printersGrid');
    grid.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Открытие веб-интерфейса принтера
function openPrinterWeb(url) {
    console.log('🌐 Открытие веб-интерфейса:', url);
    window.open(url, '_blank');
    return false; // Предотвращаем всплытие события
}

// Функция проверки принтера
async function testPrinter(printerId) {
    console.log('🔍 Testing printer:', printerId);
    
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    
    // Показываем индикатор проверки
    const card = document.querySelector(`[data-printer-id="${printerId}"]`);
    const btn = card?.querySelector('.btn-warning');
    
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '⏳ Проверка...';
        btn.disabled = true;
        
        try {
            const response = await fetch(`/api/printers/${printerId}/status`);
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Принтер доступен:', printer.name, '-', data.status?.state || 'unknown');
                btn.textContent = '✅ Доступен';
                btn.style.background = 'rgba(76, 175, 80, 0.3)';
                btn.style.borderColor = 'rgba(76, 175, 80, 0.6)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }, 2000);
            } else {
                console.error('❌ Ошибка проверки:', printer.name, '-', data.error);
                btn.textContent = '❌ Ошибка';
                btn.style.background = 'rgba(244, 67, 54, 0.3)';
                btn.style.borderColor = 'rgba(244, 67, 54, 0.6)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Ошибка подключения:', error);
            btn.textContent = '❌ Нет связи';
            btn.style.background = 'rgba(244, 67, 54, 0.3)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        } finally {
            btn.disabled = false;
        }
    }
    
    return false; // Предотвращаем всплытие события
}

// Воспроизведение звука при критических событиях
function playCriticalSound() {
    if (!notificationSound) {
        notificationSound = new Audio('windows-xp-print-complete.mp3');
    }
    
    notificationSound.play().catch(err => {
        console.error('Error playing sound:', err);
    });
}

// Проверка критических статусов и воспроизведение звука
function checkCriticalStatus(printerId, newStatus) {
    const oldStatus = previousStatuses.get(printerId);
    const criticalStatuses = ['error', 'paused', 'complete'];
    
    // Если статус изменился на критический - играем звук
    if (criticalStatuses.includes(newStatus) && oldStatus !== newStatus) {
        console.log(`🔊 Critical status for ${printerId}: ${newStatus}`);
        playCriticalSound();
    }
    
    previousStatuses.set(printerId, newStatus);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация Web-интерфейса');

    // Предзагружаем звук
    notificationSound = new Audio('windows-xp-print-complete.mp3');
    notificationSound.volume = 0.5; // 50% громкости

    // Подключаемся к WebSocket
    connectWebSocket();

    // Закрытие модального окна
    const modalClose = document.getElementById('modalClose');
    modalClose.addEventListener('click', closeModal);

    // Закрытие модального окна по клику вне его
    const modal = document.getElementById('printerModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Проверка критического статуса
function isCriticalStatus(status) {
    const criticalStatuses = ['error', 'paused', 'complete'];
    return criticalStatuses.includes(status);
}

// Обновление статистики из пакета данных
function updateStatsFromPackage(stats) {
    const totalPrintersEl = document.getElementById('totalPrinters');
    const onlinePrintersEl = document.getElementById('onlinePrinters');
    const printingPrintersEl = document.getElementById('printingPrinters');
    const pausedPrintersEl = document.getElementById('pausedPrinters');
    
    if (totalPrintersEl) totalPrintersEl.textContent = stats.total || 0;
    if (onlinePrintersEl) onlinePrintersEl.textContent = stats.online || 0;
    if (printingPrintersEl) printingPrintersEl.textContent = stats.printing || 0;
    if (pausedPrintersEl) pausedPrintersEl.textContent = stats.paused || 0;
}
