// ===== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====
const CONFIG = {
    UPDATE_INTERVAL: 30000,
    CONNECTION_TIMEOUT: 8000,
    RETRY_INTERVAL: 10000
};

let printers = [];
let websocketConnections = {};
let currentPollingInterval = CONFIG.UPDATE_INTERVAL;
let connectionRetries = {};
let previousStatuses = {};
let retryAttempts = {};
let nextRetryAt = {};
let updateInterval = null;
let retryInterval = null;

// Debounce для оптимизации частых вызовов
let sortDebounceTimer = null;
let counterDebounceTimer = null;

// ===== ANALYTICS STATE =====
let analytics = {
    // events: [{printerId, ts, from, to}], status transitions
    events: [],
    // settings
    energyCostPerKwh: 7.0,
    currency: 'RUB',
    // optional wattage per printerId
    wattageByPrinter: {}
};

// Track last inefficiency periods to avoid duplicate notifications
let lastInefficiencyCheck = {};

// Chart.js instances storage for proper cleanup
let chartInstances = {};

// Current analytics tab
let currentAnalyticsTab = 'eff';

// Telegram Bot Configuration
let telegramConfig = {
    enabled: false,
    botToken: '',
    chatId: '',
    notifications: {
        printComplete: true,
        printStart: true,
        printError: true,
        printPaused: true,
        printerOffline: false,
        printerOnline: false,
        inefficiency: true,
        inefficiencyReason: true,
        programStart: true
    }
};

const STATUS_PRIORITY = {
    'error': 100,
    'paused': 90,
    'complete': 80,
    'ready': 70,
    'offline': 10,
    'printing': 50
};

// ===== ОСНОВНЫЕ ФУНКЦИИ =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // ОПТИМИЗАЦИЯ: Сначала настраиваем обработчики (не требует await)
    if (window.electronAPI) {
        // Настраиваем обработчики меню
        window.electronAPI.onMenuAddPrinter(() => {
            openAddPrinterModal();
        });
        
        window.electronAPI.onMenuTestAll(() => {
            testAllConnections();
        });
        
        // Слушаем изменения языка
        if (window.electronAPI.onLanguageChanged) {
            window.electronAPI.onLanguageChanged(async (event, lang) => {
                if (typeof updateLanguage === 'function') {
                    await updateLanguage(lang);
                }
                updateInterfaceLanguage();
                updatePrintersDisplay();
                addConsoleMessage(
                    lang === 'ru' ? '🌐 Язык изменен на русский' : '🌐 Language changed to English', 
                    'info'
                );
            });
        }
        
        // Обработчик запроса данных принтера для Bambu Lab интерфейса
        if (window.electronAPI.onGetPrinterData) {
            window.electronAPI.onGetPrinterData((event, printerId) => {
                sendPrinterDataToBambuInterface(printerId);
            });
        }
    }
    
    // ОПТИМИЗАЦИЯ: Загружаем язык и данные параллельно
    const loadLanguagePromise = (async () => {
        if (window.electronAPI && window.electronAPI.storeGet) {
            const savedLang = await window.electronAPI.storeGet('appLanguage', null);
            if (savedLang && typeof updateLanguage === 'function') {
                await updateLanguage(savedLang);
            }
        }
    })();
    
    const loadDataPromise = Promise.all([
        loadPrintersFromStorage(),
        loadTelegramSettings(),
        loadAnalytics()
    ]);
    
    // Пока данные грузятся, показываем версию
    if (window.electronAPI) {
        window.electronAPI.getAppVersion().then(version => {
            const appVersionElement = document.getElementById('appVersion');
            if (appVersionElement) {
                appVersionElement.textContent = `v${version}`;
            }
        });
    }
    
    // Ждем завершения загрузки языка и данных параллельно
    await Promise.all([loadLanguagePromise, loadDataPromise]);
    
    // Обновляем интерфейс один раз
    updateInterfaceLanguage();
    updatePrintersDisplay();
    
    addConsoleMessage(t('panel_started'), 'info');
    addConsoleMessage(t('add_printers_hint'), 'info');
    
    // Запускаем периодические обновления
    startPeriodicUpdates();
    
    // ОПТИМИЗАЦИЯ: Отправляем уведомление в фоне, не блокируя загрузку
    setTimeout(() => {
        sendProgramStartNotification();
    }, 1000);
}

// ===== ANALYTICS PERSISTENCE =====
async function loadAnalytics() {
    try {
        if (window.electronAPI && window.electronAPI.storeGet) {
            const data = await window.electronAPI.storeGet('analytics', null);
            if (data) {
                analytics = { ...analytics, ...data };
            }
        }
    } catch {}
}

async function saveAnalytics() {
    try {
        if (window.electronAPI && window.electronAPI.storeSet) {
            await window.electronAPI.storeSet('analytics', analytics);
        }
    } catch {}
}

// Функция глубокого объединения объектов
function deepMerge(target, source) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                if (source[key] !== undefined && source[key] !== null) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}

// Отладочная функция для логирования данных принтера
function debugPrinterData(printer, source) {
    console.log(`=== DEBUG ${printer.name} (${source}) ===`);
    console.log('Status:', printer.status);
    console.log('Print Stats:', printer.data.print_stats || 'N/A');
    console.log('Virtual SD:', printer.data.virtual_sdcard || 'N/A');
    console.log('Display Status:', printer.data.display_status || 'N/A');
    console.log('Filename from getFileName:', getFileName(printer));
    
    // Показываем все температурные сенсоры
    console.log('🌡️ Temperature Sensors:');
    let foundSensors = false;
    for (const [key, value] of Object.entries(printer.data)) {
        if (key.startsWith('temperature_sensor ') || 
            key.startsWith('temperature_fan ') || 
            key.startsWith('heater_generic ')) {
            const temp = value && (value.temperature ?? value.temp ?? value.value);
            console.log(`  📊 ${key}: ${temp}°C`, value);
            foundSensors = true;
        }
    }
    if (!foundSensors) {
        console.log('  ❌ No temperature sensors found');
    }
    
    console.log('================================');
}

// Функция для обновления языка интерфейса
function updateInterfaceLanguage() {
    document.title = t('title');
    
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = t('title');
    
    const addPrinterBtn = document.querySelector('[onclick="openAddPrinterModal()"]');
    if (addPrinterBtn) addPrinterBtn.textContent = t('add_printer');
    
    const testAllBtn = document.querySelector('[onclick="testAllConnections()"]');
    if (testAllBtn) testAllBtn.textContent = t('test_all');
    
    const intervalLabel = document.querySelector('.interval-selector label');
    if (intervalLabel) intervalLabel.textContent = t('polling_interval');
    
    const cardTitles = document.querySelectorAll('.card h2');
    if (cardTitles[0]) cardTitles[0].textContent = t('printer_status');
    if (cardTitles[1]) cardTitles[1].textContent = t('event_log');
    
    const clearLogBtn = document.querySelector('[onclick="clearConsole()"]');
    if (clearLogBtn) clearLogBtn.textContent = t('clear_log');
    
    const exportLogBtn = document.querySelector('[onclick="exportLogs()"]');
    if (exportLogBtn) exportLogBtn.textContent = t('export_log');

    const analyticsBtnText = document.getElementById('analyticsBtnText');
    if (analyticsBtnText) analyticsBtnText.textContent = t('analytics').replace('📈 ', '');
    
    // Обновляем счетчик принтеров
    const counter = document.querySelector('.printers-counter');
    if (counter) {
        const printingCounter = counter.querySelector('.counter.printing');
        const offlineCounter = counter.querySelector('.counter.offline');
        const readyCounter = counter.querySelector('.counter.ready');
        const completeCounter = counter.querySelector('.counter.complete');
        const pausedCounter = counter.querySelector('.counter.paused');
        const errorCounter = counter.querySelector('.counter.error');
        
        if (printingCounter) printingCounter.innerHTML = `🖨️ <span id="count-printing">0</span>`;
        if (offlineCounter) offlineCounter.innerHTML = `🔌 <span id="count-offline">0</span>`;
        if (readyCounter) readyCounter.innerHTML = `✅ <span id="count-ready">0</span>`;
        if (completeCounter) completeCounter.innerHTML = `🏁 <span id="count-complete">0</span>`;
        if (pausedCounter) pausedCounter.innerHTML = `⏸️ <span id="count-paused">0</span>`;
        if (errorCounter) errorCounter.innerHTML = `🚫 <span id="count-error">0</span>`;
    }
    
    // Обновляем модальные окна
    updateModalTranslations();
}

function updateModalTranslations() {
    const addModal = document.getElementById('addPrinterModal');
    if (addModal) {
        const title = addModal.querySelector('h3');
        const nameLabel = addModal.querySelector('label[for="printerName"]');
        const ipLabel = addModal.querySelector('label[for="printerIP"]');
        const portLabel = addModal.querySelector('label[for="printerPort"]');
        const webPortLabel = addModal.querySelector('label[for="webInterfacePort"]');
        const addBtn = addModal.querySelector('.modal-footer .btn-primary');
        const cancelBtn = addModal.querySelector('.modal-footer .btn:not(.btn-primary)');
        
        if (title) title.textContent = t('add_printer_modal');
        if (nameLabel) nameLabel.textContent = t('printer_name');
        if (ipLabel) ipLabel.textContent = t('printer_ip');
        if (portLabel) portLabel.textContent = t('moonraker_port');
        if (webPortLabel) webPortLabel.textContent = t('web_port');
        if (addBtn) addBtn.textContent = t('add_button');
        if (cancelBtn) cancelBtn.textContent = t('cancel_button');
    }
    
    const editModal = document.getElementById('editPrinterModal');
    if (editModal) {
        const title = editModal.querySelector('h3');
        const nameLabel = editModal.querySelector('label[for="editPrinterName"]');
        const ipLabel = editModal.querySelector('label[for="editPrinterIP"]');
        const portLabel = editModal.querySelector('label[for="editPrinterPort"]');
        const webPortLabel = editModal.querySelector('label[for="editWebInterfacePort"]');
        const saveBtn = editModal.querySelector('.modal-footer .btn-primary');
        const cancelBtn = editModal.querySelector('.modal-footer .btn:not(.btn-primary)');
        
        if (title) title.textContent = t('edit_printer_modal');
        if (nameLabel) nameLabel.textContent = t('printer_name');
        if (ipLabel) ipLabel.textContent = t('printer_ip');
        if (portLabel) portLabel.textContent = t('moonraker_port');
        if (webPortLabel) webPortLabel.textContent = t('web_port');
        if (saveBtn) saveBtn.textContent = t('save_button');
        if (cancelBtn) cancelBtn.textContent = t('cancel_button');
    }

    // Обновляем модальное окно Telegram
    const telegramModal = document.getElementById('telegramSettingsModal');
    if (telegramModal) {
        const title = telegramModal.querySelector('h3');
        const tokenLabel = telegramModal.querySelector('label[for="telegramBotToken"]');
        const chatLabel = telegramModal.querySelector('label[for="telegramChatId"]');
        const enableSpan = document.getElementById('labelEnableTelegram');
        const notifyTitle = document.getElementById('telegramNotifyTitle');
        const completeSpan = document.getElementById('labelPrintComplete');
        const startSpan = document.getElementById('labelPrintStart');
        const errorSpan = document.getElementById('labelPrintError');
        const pausedSpan = document.getElementById('labelPrintPaused');
        const offlineSpan = document.getElementById('labelPrinterOffline');
        const onlineSpan = document.getElementById('labelPrinterOnline');
        const inefficiencySpan = document.getElementById('labelInefficiency');
        const inefficiencyReasonSpan = document.getElementById('labelInefficiencyReason');
        const programStartSpan = document.getElementById('labelProgramStart');
        const saveBtn = telegramModal.querySelector('.modal-footer .btn-primary');
        const testBtn = telegramModal.querySelector('.modal-footer .btn-secondary');
        const cancelBtn = telegramModal.querySelector('.modal-footer .btn:not(.btn-primary):not(.btn-secondary):not(.btn-help)');
        
        if (title) title.textContent = t('telegram_settings');
        if (tokenLabel) tokenLabel.textContent = t('bot_token');
        if (chatLabel) chatLabel.textContent = t('chat_id');
        if (enableSpan) enableSpan.textContent = t('enable_notifications');
        if (notifyTitle) notifyTitle.textContent = t('notify_on');
        if (completeSpan) completeSpan.textContent = t('print_complete');
        if (startSpan) startSpan.textContent = t('print_start');
        if (errorSpan) errorSpan.textContent = t('print_error');
        if (pausedSpan) pausedSpan.textContent = t('print_paused');
        if (offlineSpan) offlineSpan.textContent = t('printer_offline');
        if (onlineSpan) onlineSpan.textContent = t('printer_online');
        if (inefficiencySpan) inefficiencySpan.textContent = t('inefficiency_event');
        if (inefficiencyReasonSpan) inefficiencyReasonSpan.textContent = t('inefficiency_reason_saved');
        if (programStartSpan) programStartSpan.textContent = t('program_start');
        if (saveBtn) saveBtn.textContent = t('save');
        if (testBtn) testBtn.textContent = t('test_connection');
        if (cancelBtn) cancelBtn.textContent = t('cancel_button');
        
        // Обновляем подсказки
        const botTokenHelp = telegramModal.querySelector('#telegramBotToken')?.nextElementSibling;
        const chatIdHelp = telegramModal.querySelector('#telegramChatId')?.nextElementSibling;
        if (botTokenHelp) botTokenHelp.textContent = t('get_bot_token_from_botfather');
        if (chatIdHelp) chatIdHelp.textContent = t('send_start_to_bot');
    }
    
    // Обновляем модальное окно Bambu Lab Info
    const bambuInfoModal = document.getElementById('bambuInfoModal');
    if (bambuInfoModal) {
        const title = bambuInfoModal.querySelector('#bambuInfoModalTitle');
        const message = bambuInfoModal.querySelector('#bambuInfoMessage');
        const noWeb = bambuInfoModal.querySelector('#bambuInfoNoWeb');
        const helpBtn = bambuInfoModal.querySelector('#bambuInfoHelpBtn');
        
        if (title) title.innerHTML = t('bambu_info_modal_title');
        if (message) message.innerHTML = `ℹ️ ${t('bambu_info_message')}`;
        if (noWeb) noWeb.textContent = t('bambu_info_no_web');
        if (helpBtn) helpBtn.textContent = t('bambu_info_help');
    }
    
    // Обновляем модальное окно Clear Analytics
    updateClearAnalyticsModalTranslations();
    
    // Обновляем модальное окно Inefficiency Comment
    updateInefficiencyCommentModalTranslations();
    
    // Обновляем модальное окно Temperature Sensors
    const tempSensorsModal = document.getElementById('tempSensorsModal');
    if (tempSensorsModal) {
        const modalTitle = document.getElementById('tempSensorsModalTitle');
        const forAdvanced = document.getElementById('tempSensorsForAdvanced');
        const descText = document.getElementById('tempSensorsDescText');
        const autoRecommended = document.getElementById('tempSensorsAutoRecommended');
        const saveBtn = document.getElementById('tempSensorsSaveBtn');
        const skipBtn = document.getElementById('tempSensorsSkipBtn');
        
        if (modalTitle) modalTitle.textContent = t('temp_sensors_modal_title');
        if (forAdvanced) forAdvanced.textContent = t('temp_sensors_for_advanced');
        if (descText) descText.textContent = t('temp_sensors_description');
        if (autoRecommended) autoRecommended.textContent = t('temp_sensors_auto_recommended');
        if (saveBtn) saveBtn.textContent = t('temp_sensors_save_custom');
        if (skipBtn) skipBtn.textContent = t('temp_sensors_use_auto');
    }
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПРИНТЕРАМИ =====

// Функция переключения полей в зависимости от типа принтера
function togglePrinterTypeFields(modalType) {
    const prefix = modalType === 'add' ? '' : 'edit';
    const selectId = modalType === 'add' ? 'printerType' : 'editPrinterType';
    const printerType = document.getElementById(selectId)?.value || 'klipper';
    
    const klipperFields = document.getElementById(`${prefix}${prefix ? 'K' : 'k'}lipperFields`);
    const bambuFields = document.getElementById(`${prefix}${prefix ? 'B' : 'b'}ambuFields`);
    
    if (klipperFields && bambuFields) {
        if (printerType === 'klipper') {
            klipperFields.style.display = 'block';
            bambuFields.style.display = 'none';
        } else if (printerType === 'bambu') {
            klipperFields.style.display = 'none';
            bambuFields.style.display = 'block';
        }
    }
}

function openAddPrinterModal() {
    const modal = document.getElementById('addPrinterModal');
    if (modal) {
        modal.style.display = 'block';
        // Устанавливаем Klipper по умолчанию и показываем соответствующие поля
        const typeSelect = document.getElementById('printerType');
        if (typeSelect) {
            typeSelect.value = 'klipper';
            togglePrinterTypeFields('add');
        }
    }
}

function closeAddPrinterModal() {
    const modal = document.getElementById('addPrinterModal');
    if (modal) modal.style.display = 'none';
    
    const nameInput = document.getElementById('printerName');
    const ipInput = document.getElementById('printerIP');
    const portInput = document.getElementById('printerPort');
    const webPortInput = document.getElementById('webInterfacePort');
    
    if (nameInput) nameInput.value = '';
    if (ipInput) ipInput.value = '';
    if (portInput) portInput.value = '7125';
    if (webPortInput) webPortInput.value = '';
}

function addPrinter() {
    const nameInput = document.getElementById('printerName');
    const ipInput = document.getElementById('printerIP');
    const typeInput = document.getElementById('printerType');
    
    if (!nameInput || !ipInput || !typeInput) return;
    
    const name = nameInput.value.trim();
    const ip = ipInput.value.trim();
    const type = typeInput.value;

    if (!name || !ip) {
        alert(t('fill_fields'));
        return;
    }

    const printer = {
        id: generateId(),
        name: name,
        ip: ip,
        type: type,
        status: 'offline',
        data: {},
        lastUpdate: null,
        connectionType: null,
        order: printers.length
    };

    // Klipper-specific fields
    if (type === 'klipper') {
        const portInput = document.getElementById('printerPort');
        const webPortInput = document.getElementById('webInterfacePort');
        printer.port = portInput ? portInput.value.trim() : '7125';
        printer.webPort = webPortInput ? webPortInput.value.trim() : '80';
    }
    
    // Bambu Lab-specific fields
    if (type === 'bambu') {
        const accessCodeInput = document.getElementById('accessCode');
        const serialNumberInput = document.getElementById('serialNumber');
        
        if (!accessCodeInput || !serialNumberInput) {
            alert('Please fill in Access Code and Serial Number');
            return;
        }
        
        printer.accessCode = accessCodeInput.value.trim();
        printer.serialNumber = serialNumberInput.value.trim();
        
        if (!printer.accessCode || !printer.serialNumber) {
            alert('Access Code and Serial Number are required for Bambu Lab printers');
            return;
        }
    }

    printers.push(printer);
    savePrintersToStorage();
    sortPrinters();
    updatePrintersDisplay();
    testPrinterConnection(printer, true);
    closeAddPrinterModal();
    
    const connInfo = type === 'klipper' ? `${ip}:${printer.port}` : `${ip} (${printer.serialNumber})`;
    addConsoleMessage(`✅ ${t('printer_added')} ${name} (${connInfo})`, 'info');
}

function editPrinter(printerId, event) {
    if (event) event.stopPropagation();
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    
    const idInput = document.getElementById('editPrinterId');
    const typeInput = document.getElementById('editPrinterType');
    const nameInput = document.getElementById('editPrinterName');
    const ipInput = document.getElementById('editPrinterIP');
    const modal = document.getElementById('editPrinterModal');
    
    if (idInput) idInput.value = printer.id;
    if (nameInput) nameInput.value = printer.name;
    if (ipInput) ipInput.value = printer.ip;
    
    // Устанавливаем тип принтера
    const printerType = printer.type || 'klipper';
    if (typeInput) {
        typeInput.value = printerType;
        togglePrinterTypeFields('edit');
    }
    
    // Заполняем поля в зависимости от типа
    if (printerType === 'klipper') {
        const portInput = document.getElementById('editPrinterPort');
        const webPortInput = document.getElementById('editWebInterfacePort');
        if (portInput) portInput.value = printer.port || '7125';
        if (webPortInput) webPortInput.value = printer.webPort || '80';
    } else if (printerType === 'bambu') {
        const accessCodeInput = document.getElementById('editAccessCode');
        const serialNumberInput = document.getElementById('editSerialNumber');
        if (accessCodeInput) accessCodeInput.value = printer.accessCode || '';
        if (serialNumberInput) serialNumberInput.value = printer.serialNumber || '';
    }
    
    if (modal) modal.style.display = 'block';
}

function savePrinterChanges() {
    const idInput = document.getElementById('editPrinterId');
    if (!idInput) return;
    
    const printerId = idInput.value;
    const printer = printers.find(p => p.id === printerId);
    
    if (printer) {
        const typeInput = document.getElementById('editPrinterType');
        const nameInput = document.getElementById('editPrinterName');
        const ipInput = document.getElementById('editPrinterIP');
        
        if (nameInput) printer.name = nameInput.value.trim();
        if (ipInput) printer.ip = ipInput.value.trim();
        
        // Обновляем тип принтера
        if (typeInput) {
            printer.type = typeInput.value;
        }
        
        // Обновляем поля в зависимости от типа
        if (printer.type === 'klipper') {
            const portInput = document.getElementById('editPrinterPort');
            const webPortInput = document.getElementById('editWebInterfacePort');
            if (portInput) printer.port = portInput.value.trim();
            if (webPortInput) printer.webPort = webPortInput.value.trim();
        } else if (printer.type === 'bambu') {
            const accessCodeInput = document.getElementById('editAccessCode');
            const serialNumberInput = document.getElementById('editSerialNumber');
            if (accessCodeInput) printer.accessCode = accessCodeInput.value.trim();
            if (serialNumberInput) printer.serialNumber = serialNumberInput.value.trim();
        }
        
        // Закрываем существующие подключения если тип изменился
        if (websocketConnections[printer.id]) {
            websocketConnections[printer.id].close();
            delete websocketConnections[printer.id];
        }
        
        savePrintersToStorage();
        sortPrinters();
        updatePrintersDisplay();
        testPrinterConnection(printer, true);
        closeEditPrinterModal();
        
        addConsoleMessage(`✏️ ${t('printer_updated')} ${printer.name}`, 'info');
    }
}

function closeEditPrinterModal() {
    const modal = document.getElementById('editPrinterModal');
    if (modal) modal.style.display = 'none';
}

function openBambuInfoModal(printerName) {
    const modal = document.getElementById('bambuInfoModal');
    const nameElement = document.getElementById('bambuPrinterName');
    const title = document.getElementById('bambuInfoModalTitle');
    const message = document.getElementById('bambuInfoMessage');
    const noWeb = document.getElementById('bambuInfoNoWeb');
    const helpBtn = document.getElementById('bambuInfoHelpBtn');
    
    if (modal && nameElement) {
        // Устанавливаем имя принтера
        nameElement.textContent = printerName;
        
        // Применяем переводы
        if (title) title.innerHTML = t('bambu_info_modal_title');
        if (message) message.innerHTML = `ℹ️ ${t('bambu_info_message')}`;
        if (noWeb) noWeb.textContent = t('bambu_info_no_web');
        if (helpBtn) helpBtn.textContent = t('bambu_info_help');
        
        modal.style.display = 'block';
    }
}

function closeBambuInfoModal() {
    const modal = document.getElementById('bambuInfoModal');
    if (modal) modal.style.display = 'none';
}

function openBambuLabHelpFromModal() {
    // Вызываем IPC событие для открытия справки из main.js
    if (window.electronAPI && window.electronAPI.send) {
        window.electronAPI.send('show-bambu-help');
    }
}

function openClearAnalyticsModal() {
    const modal = document.getElementById('clearAnalyticsModal');
    if (modal) {
        // Применяем переводы
        updateClearAnalyticsModalTranslations();
        modal.style.display = 'block';
    }
}

function closeClearAnalyticsModal() {
    const modal = document.getElementById('clearAnalyticsModal');
    if (modal) modal.style.display = 'none';
}

async function confirmClearAnalytics() {
    analytics.events = [];
    await saveAnalytics();
    addConsoleMessage('📈 ' + t('analytics_cleared'), 'warning');
    closeClearAnalyticsModal();
    // Обновляем вкладку аналитики если она открыта
    const currentTab = document.querySelector('.analytics-card');
    if (currentTab) {
        setAnalyticsTab(currentAnalyticsTab);  // Refresh current tab
    }
}

async function clearPrinterAnalytics() {
    const sel = document.getElementById('clearPrinterSelect');
    if (!sel) return;
    
    const printerId = sel.value;
    const printer = printers.find(p => String(p.id) === String(printerId));
    
    if (!printer) return;
    
    const confirmed = confirm(`Удалить все данные аналитики для принтера "${printer.name}"?\n\nЭто действие необратимо!`);
    if (!confirmed) return;
    
    const beforeCount = analytics.events.length;
    analytics.events = analytics.events.filter(e => String(e.printerId) !== String(printerId));
    const afterCount = analytics.events.length;
    const removed = beforeCount - afterCount;
    
    // Also clear wattage settings for this printer
    if (analytics.wattageByPrinter[printerId]) {
        delete analytics.wattageByPrinter[printerId];
    }
    
    await saveAnalytics();
    addConsoleMessage(`🗑️ Удалено ${removed} событий аналитики для "${printer.name}"`, 'warning');
    
    // Refresh analytics tab
    setAnalyticsTab(currentAnalyticsTab);
}

async function clearOrphanedAnalytics() {
    // Find current printer IDs
    const currentPrinterIds = printers.map(p => String(p.id));
    
    // Find orphaned events (events from deleted printers)
    const orphanedEvents = analytics.events.filter(e => !currentPrinterIds.includes(String(e.printerId)));
    
    if (orphanedEvents.length === 0) {
        alert('Нет данных от удаленных принтеров.\n\nВсе события принадлежат текущим принтерам.');
        return;
    }
    
    // Count events by orphaned printer ID
    const orphanedByPrinter = {};
    orphanedEvents.forEach(e => {
        const pid = String(e.printerId);
        if (!orphanedByPrinter[pid]) orphanedByPrinter[pid] = 0;
        orphanedByPrinter[pid]++;
    });
    
    const orphanedPrinters = Object.keys(orphanedByPrinter);
    const message = `Найдено ${orphanedEvents.length} событий от ${orphanedPrinters.length} удаленных принтеров:\n\n` +
        orphanedPrinters.map(pid => `• ${pid.substring(0, 10)}...: ${orphanedByPrinter[pid]} событий`).join('\n') +
        '\n\nУдалить эти данные?';
    
    const confirmed = confirm(message);
    if (!confirmed) return;
    
    const beforeCount = analytics.events.length;
    
    // Keep only events from current printers
    analytics.events = analytics.events.filter(e => currentPrinterIds.includes(String(e.printerId)));
    
    // Clean up wattage settings for orphaned printers
    Object.keys(analytics.wattageByPrinter).forEach(pid => {
        if (!currentPrinterIds.includes(String(pid))) {
            delete analytics.wattageByPrinter[pid];
        }
    });
    
    const afterCount = analytics.events.length;
    const removed = beforeCount - afterCount;
    
    await saveAnalytics();
    addConsoleMessage(`🧹 Удалено ${removed} событий от удаленных принтеров`, 'success');
    
    // Refresh analytics tab
    setAnalyticsTab(currentAnalyticsTab);
}

function updateClearAnalyticsModalTranslations() {
    const title = document.getElementById('clearAnalyticsModalTitle');
    const warning1 = document.getElementById('clearAnalyticsWarning1');
    const warning2 = document.getElementById('clearAnalyticsWarning2');
    const item1 = document.getElementById('clearAnalyticsItem1');
    const item2 = document.getElementById('clearAnalyticsItem2');
    const item3 = document.getElementById('clearAnalyticsItem3');
    const item4 = document.getElementById('clearAnalyticsItem4');
    const warning3 = document.getElementById('clearAnalyticsWarning3');
    const confirm = document.getElementById('clearAnalyticsConfirm');
    const yesBtn = document.getElementById('clearAnalyticsYesBtn');
    const noBtn = document.getElementById('clearAnalyticsNoBtn');
    
    if (title) title.innerHTML = t('clear_analytics_title');
    if (warning1) warning1.textContent = t('clear_analytics_warning1');
    if (warning2) warning2.textContent = t('clear_analytics_warning2');
    if (item1) item1.textContent = t('clear_analytics_item1');
    if (item2) item2.textContent = t('clear_analytics_item2');
    if (item3) item3.textContent = t('clear_analytics_item3');
    if (item4) item4.textContent = t('clear_analytics_item4');
    if (warning3) warning3.textContent = t('clear_analytics_warning3');
    if (confirm) confirm.textContent = t('clear_analytics_confirm');
    if (yesBtn) yesBtn.textContent = t('clear_analytics_yes');
    if (noBtn) noBtn.textContent = t('clear_analytics_no');
}

function removePrinter(printerId, event) {
    if (event) event.stopPropagation();
    
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    
    // Подтверждение удаления
    const confirmMessage = `${t('confirm_delete_printer')} ${printer.name} (${printer.ip})?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    if (websocketConnections[printerId]) {
        websocketConnections[printerId].close();
        delete websocketConnections[printerId];
    }
    
    printers = printers.filter(p => p.id !== printerId);
    savePrintersToStorage();
    sortPrinters();
    updatePrintersDisplay();
    
    addConsoleMessage(`🗑️ ${t('printer_removed')} ${printer.name}`, 'warning');
}

// ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ ВЕБ-ИНТЕРФЕЙСА ПРИНТЕРА В ОКНЕ С ВКЛАДКАМИ
async function openPrinterWebInterface(printerId) {
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    
    ensurePrinterType(printer);
    
    try {
        // Открываем окно вкладок для всех типов принтеров (Klipper и Bambu Lab)
        if (window.electronAPI) {
            const windowExists = await window.electronAPI.focusPrinterWindow(printerId);
            if (!windowExists) {
                await window.electronAPI.openPrinterWindow(printer);
                const printerType = printer.type === 'bambu' ? 'Bambu Lab' : 'Klipper';
                addConsoleMessage(`🌐 ${t('web_interface_opening')} ${printer.name} (${printerType})`, 'info');
            } else {
                addConsoleMessage(`🔍 ${t('web_interface_opening')} ${printer.name}`, 'info');
            }
        } else {
            const webPort = printer.webPort || '80';
            const url = `http://${printer.ip}:${webPort}`;
            window.open(url, '_blank');
            addConsoleMessage(`🌐 ${t('web_interface_opening')} ${printer.name}`, 'info');
        }
    } catch (error) {
        addConsoleMessage(`❌ ${t('web_interface_error')}: ${error.message}`, 'error');
    }
}

// Функция для воспроизведения звука завершения (Windows XP)
function playCompletionSound() {
    const audio = document.getElementById('completionSound');
    if (audio) {
        console.log('🔊 Audio element found, playing sound...');
        
        let playCount = 0;
        
        function play() {
            if (playCount < 3) {
                console.log(`🔊 Playing sound ${playCount + 1}/3`);
                audio.currentTime = 0;
                audio.play().then(() => {
                    console.log('✅ Sound played successfully');
                }).catch(e => {
                    console.log('❌ Audio play failed:', e);
                    console.log('🔊 Audio source:', audio.src);
                });
                playCount++;
                setTimeout(play, 500);
            }
        }
        
        play();
    } else {
        console.log('❌ Audio element not found!');
    }
}

// Функция для обновления счетчика принтеров
function updatePrintersCounter() {
    const counts = {
        printing: 0,
        offline: 0,
        ready: 0,
        complete: 0,
        paused: 0,
        error: 0
    };

    printers.forEach(printer => {
        if (counts.hasOwnProperty(printer.status)) {
            counts[printer.status]++;
        }
    });

    const printingElement = document.getElementById('count-printing');
    const offlineElement = document.getElementById('count-offline');
    const readyElement = document.getElementById('count-ready');
    const completeElement = document.getElementById('count-complete');
    const pausedElement = document.getElementById('count-paused');
    const errorElement = document.getElementById('count-error');
    
    if (printingElement) printingElement.textContent = counts.printing;
    if (offlineElement) offlineElement.textContent = counts.offline;
    if (readyElement) readyElement.textContent = counts.ready;
    if (completeElement) completeElement.textContent = counts.complete;
    if (pausedElement) pausedElement.textContent = counts.paused;
    if (errorElement) errorElement.textContent = counts.error;

    checkStatusChanges();
}

// Функция для проверки изменений статусов и воспроизведения звуков
function checkStatusChanges() {
    printers.forEach(printer => {
        const previousStatus = previousStatuses[printer.id];
        const currentStatus = printer.status;

        if (previousStatus !== currentStatus) {
            // Track analytics event
            if (previousStatus) {
                trackStatusTransition(printer.id, previousStatus, currentStatus);
            }
            let event = '';
            let message = '';
            
            switch(currentStatus) {
                case 'complete':
                    event = t('event_print_complete');
                    message = t('complete_state');
                    playCompletionSound();
                    break;
                case 'error':
                    event = t('event_print_error');
                    message = t('error_state');
                    playCompletionSound();
                    break;
                case 'paused':
                    event = t('event_print_paused');
                    message = t('paused_state');
                    playCompletionSound();
                    break;
                case 'offline':
                    if (previousStatus && previousStatus !== 'offline') {
                        event = t('event_printer_offline');
                        message = t('printer_offline');
                    }
                    break;
                case 'ready':
                case 'printing':
                    if (previousStatus === 'offline') {
                        event = t('event_printer_online');
                        message = `${t('printer')} ${printer.status === 'printing' ? t('printing_state') : t('ready_state')}`;
                    }
                    break;
            }
            
            if (event && message) {
                sendEventNotification(printer, event, message);
                addConsoleMessage(`🔔 ${printer.name}: ${message}`, 'warning');
            }
        }

        previousStatuses[printer.id] = currentStatus;
    });
}

function trackStatusTransition(printerId, fromStatus, toStatus) {
    // Ensure printerId is always a string for consistent comparison
    const printerIdStr = String(printerId);
    const ev = { printerId: printerIdStr, ts: Date.now(), from: fromStatus, to: toStatus };
    analytics.events.push(ev);
    
    // Log event creation
    const printer = printers.find(p => String(p.id) === printerIdStr);
    const printerName = printer ? printer.name : 'Unknown';
    console.log(`📊 Analytics Event: ${printerName} (${printerIdStr}): ${fromStatus} → ${toStatus}`);
    
    // keep only last 90 days to limit growth
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    analytics.events = analytics.events.filter(e => e.ts >= ninetyDaysAgo);
    saveAnalytics();
    
    // Проверяем на новые события неэффективности
    checkForNewInefficiency(printerIdStr);
}

// Build inefficiency periods based on rules:
// Efficient if gaps between printing < 10m and any pause < 7m
function findInefficiencyPeriods(printerId, since, until) {
    const MAX_GAP = 10 * 60 * 1000;
    const MAX_PAUSE = 7 * 60 * 1000;
    
    // Ensure printerId is string for consistent comparison
    const printerIdStr = String(printerId);
    const events = analytics.events
        .filter(e => {
            const eventPrinterIdStr = String(e.printerId);
            return e.ts >= since && e.ts <= until && (printerIdStr === 'all' || eventPrinterIdStr === printerIdStr);
        })
        .sort((a,b)=>a.ts-b.ts);
    const periods = [];
    let lastPrintEnd = null;
    let lastPauseStart = null;

    // infer from transitions
    for (const e of events) {
        if (e.to === 'printing') {
            if (lastPrintEnd && (e.ts - lastPrintEnd) > MAX_GAP) {
                // Проверяем, не существует ли уже такой период
                const isDuplicate = periods.some(p => p.type === 'gap' && p.from === lastPrintEnd && p.to === e.ts);
                if (!isDuplicate) {
                    periods.push({ type: 'gap', from: lastPrintEnd, to: e.ts, duration: e.ts - lastPrintEnd, reason: getSavedReason(lastPrintEnd, e.ts), printerId: e.printerId });
                }
                // Обновляем lastPrintEnd чтобы следующие события не создавали дубликаты
                lastPrintEnd = e.ts;
            }
            lastPauseStart = null;
        }
        if (e.to === 'paused') {
            lastPauseStart = e.ts;
        }
        if (e.from === 'paused' && lastPauseStart) {
            const dur = e.ts - lastPauseStart;
            if (dur > MAX_PAUSE) {
                // Проверяем, не существует ли уже такой период
                const isDuplicate = periods.some(p => p.type === 'pause' && p.from === lastPauseStart && p.to === e.ts);
                if (!isDuplicate) {
                    periods.push({ type: 'pause', from: lastPauseStart, to: e.ts, duration: dur, reason: getSavedReason(lastPauseStart, e.ts), printerId: e.printerId });
                }
            }
            lastPauseStart = null;
        }
        if (e.from === 'printing') {
            lastPrintEnd = e.ts;
        }
    }
    return periods;
}

function getSavedReason(from, to) {
    const key = `ineff:${from}:${to}`;
    return analytics[key];
}

function saveReason(from, to, text) {
    const key = `ineff:${from}:${to}`;
    const oldReason = analytics[key];
    analytics[key] = text;
    saveAnalytics();
    
    // Отправляем уведомление если причина была добавлена или изменена
    if (text && text.trim() && text !== oldReason) {
        sendInefficiencyReasonNotification(from, to, text);
    }
}

// Проверка на новые события неэффективности
function checkForNewInefficiency(printerId) {
    if (!telegramConfig.enabled || !telegramConfig.notifications.inefficiency) {
        return;
    }
    
    const now = Date.now();
    const since = now - 24 * 60 * 60 * 1000; // последние 24 часа
    const periods = findInefficiencyPeriods(printerId, since, now);
    
    // Проверяем каждый период
    periods.forEach(period => {
        const periodKey = `${period.printerId}:${period.from}:${period.to}`;
        
        // Если этот период еще не был отправлен
        if (!lastInefficiencyCheck[periodKey]) {
            lastInefficiencyCheck[periodKey] = true;
            
            const printer = printers.find(p => p.id === period.printerId);
            if (printer) {
                sendInefficiencyNotification(printer, period);
            }
        }
    });
}

// Отправка уведомления о событии неэффективности
function sendInefficiencyNotification(printer, period) {
    if (!telegramConfig.enabled || !telegramConfig.notifications.inefficiency) {
        return;
    }
    
    const type = period.type === 'gap' ? t('inefficiency_gap') : t('inefficiency_pause');
    const duration = formatDuration(period.duration);
    const from = new Date(period.from).toLocaleString();
    const to = new Date(period.to).toLocaleString();
    
    const notification = {
        printerName: printer.name,
        printerIP: printer.ip,
        event: t('inefficiency_notification_event'),
        message: `${t('inefficiency_type')}: ${type}\n${t('inefficiency_duration')}: ${duration}\n${t('inefficiency_start')}: ${from}\n${t('inefficiency_end')}: ${to}`
    };
    
    sendTelegramNotification(notification);
}

// Отправка уведомления о сохранении причины неэффективности
function sendInefficiencyReasonNotification(from, to, reason) {
    if (!telegramConfig.enabled || !telegramConfig.notifications.inefficiencyReason) {
        return;
    }
    
    // Находим период и принтер
    const periods = findInefficiencyPeriods('all', from - 1000, to + 1000);
    const period = periods.find(p => p.from === from && p.to === to);
    
    if (period) {
        const printer = printers.find(p => p.id === period.printerId);
        if (printer) {
            const type = period.type === 'gap' ? t('inefficiency_gap') : t('inefficiency_pause');
            const duration = formatDuration(period.duration);
            const fromStr = new Date(from).toLocaleString();
            const toStr = new Date(to).toLocaleString();
            
            const notification = {
                printerName: printer.name,
                printerIP: printer.ip,
                event: t('operator_report_event'),
                message: `${t('inefficiency_type')}: ${type}\n${t('inefficiency_duration')}: ${duration}\n${t('inefficiency_period')}: ${fromStr} - ${toStr}\n${t('inefficiency_reason')}: ${reason}`
            };
            
            sendTelegramNotification(notification);
        }
    }
}

function renderInefficiencyTab(printerId, custom) {
    let since = Date.now() - 7*24*60*60*1000;
    if (custom) since = custom.from;
    const until = custom ? custom.to : Date.now();
    const periods = findInefficiencyPeriods(printerId, since, until);
    if (periods.length === 0) {
        return `<div class="analytics-card analytics-empty">🎉 ${t('no_inefficiency')}</div>`;
    }
    const rows = periods.map(p => {
        const from = new Date(p.from).toLocaleString();
        const to = new Date(p.to).toLocaleString();
        const dur = formatDuration(p.duration);
        const reason = (p.reason || '');
        const hasComment = reason.trim().length > 0;
        const printer = printers.find(pr => pr.id === p.printerId);
        const printerName = printer ? printer.name : t('unknown_printer');
        
        // Статус и цвета
        const statusBg = hasComment ? '#2ecc71' : '#f39c12';
        const statusText = hasComment ? t('ineff_status_has_comment') : t('ineff_status_no_comment');
        const statusIcon = hasComment ? '✅' : '📝';
        
        // Превью комментария
        const commentPreview = hasComment ? (reason.length > 80 ? reason.substring(0, 80) + '...' : reason) : '';
        
        // Тип события
        const typeText = p.type === 'gap' ? t('ineff_type_gap') : t('ineff_type_pause');
        const typeIcon = p.type === 'gap' ? '⏸️' : '⏯️';
        
        return `
            <div class="analytics-card" style="position: relative; cursor: pointer; transition: all 0.3s ease; border-left: 4px solid ${statusBg};" 
                 onclick="openInefficiencyCommentModal(${p.from}, ${p.to}, '${p.printerId}', '${p.type}')"
                 onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,212,255,0.3)';"
                 onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='';">
                
                <!-- Статус бейдж -->
                <div style="position: absolute; top: 15px; right: 15px; background: ${statusBg}; color: #fff; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold;">
                    ${statusIcon} ${statusText}
                </div>
                
                <!-- Заголовок -->
                <h4 style="margin-bottom: 15px; color: #00d4ff; font-size: 16px; padding-right: 140px;">
                    🖨️ ${printerName}
                </h4>
                
                <!-- Информация -->
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 20px; margin-bottom: 15px; font-size: 14px;">
                    <div style="color: #888; font-weight: 500;">${t('ineff_comment_type_label')}</div>
                    <div style="color: #fff;">${typeIcon} ${typeText}</div>
                    
                    <div style="color: #888; font-weight: 500;">${t('ineff_comment_duration_label')}</div>
                    <div style="color: #fff; font-weight: bold;">${dur}</div>
                    
                    <div style="color: #888; font-weight: 500;">${t('ineff_comment_period')}</div>
                    <div style="color: #aaa; font-size: 13px;">${from} — ${to}</div>
                </div>
                
                <!-- Превью комментария или кнопка -->
                ${hasComment ? `
                    <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; border-left: 3px solid #2ecc71; margin-top: 15px;">
                        <div style="color: #888; font-size: 12px; margin-bottom: 5px; font-weight: 500;">📝 ${t('reason')}:</div>
                        <div style="color: #ddd; line-height: 1.5; font-size: 14px;">${commentPreview}</div>
                    </div>
                    <div style="margin-top: 10px; text-align: right; font-size: 12px; color: #00d4ff;">
                        👁️ ${t('ineff_btn_view_comment')} / ${t('ineff_btn_edit_comment')} →
                    </div>
                ` : `
                    <div style="text-align: center; margin-top: 15px; padding: 12px; background: rgba(243, 156, 18, 0.1); border-radius: 6px;">
                        <div style="color: #f39c12; font-size: 14px; margin-bottom: 8px;">
                            📝 ${t('ineff_status_no_comment')}
                        </div>
                        <div style="color: #888; font-size: 12px;">
                            ${t('ineff_btn_add_comment')} →
                        </div>
                    </div>
                `}
            </div>`;
    }).join('');
    return `<div>${rows}</div>`;
}

// Переменная для хранения текущего периода неэффективности в модальном окне
let currentIneffPeriod = null;

function openInefficiencyCommentModal(from, to, printerId, type) {
    const modal = document.getElementById('inefficiencyCommentModal');
    if (!modal) return;
    
    // Сохраняем данные текущего периода
    currentIneffPeriod = { from, to, printerId, type };
    
    // Получаем данные
    const printer = printers.find(p => p.id === printerId);
    const printerName = printer ? printer.name : t('unknown_printer');
    const fromDate = new Date(from).toLocaleString();
    const toDate = new Date(to).toLocaleString();
    const duration = formatDuration(to - from);
    const typeText = type === 'gap' ? t('ineff_type_gap') : t('ineff_type_pause');
    const existingReason = getSavedReason(from, to) || '';
    const hasComment = existingReason.trim().length > 0;
    
    // Обновляем заголовок
    const title = document.getElementById('ineffCommentModalTitle');
    if (title) {
        title.textContent = hasComment ? t('ineff_comment_modal_title_edit') : t('ineff_comment_modal_title_add');
    }
    
    // Заполняем данные
    const printerNameEl = document.getElementById('ineffCommentPrinterName');
    const typeEl = document.getElementById('ineffCommentType');
    const durationEl = document.getElementById('ineffCommentDuration');
    const periodEl = document.getElementById('ineffCommentPeriod');
    const textarea = document.getElementById('ineffCommentTextarea');
    const deleteBtn = document.getElementById('ineffCommentDeleteBtn');
    
    if (printerNameEl) printerNameEl.textContent = printerName;
    if (typeEl) typeEl.textContent = typeText;
    if (durationEl) durationEl.textContent = duration;
    if (periodEl) periodEl.textContent = `${fromDate} — ${toDate}`;
    if (textarea) textarea.value = existingReason;
    
    // Показываем/скрываем кнопку удаления
    if (deleteBtn) {
        deleteBtn.style.display = hasComment ? 'inline-block' : 'none';
    }
    
    // Применяем переводы
    updateInefficiencyCommentModalTranslations();
    
    // Показываем модальное окно
    modal.style.display = 'block';
    
    // Фокусируемся на textarea
    if (textarea) {
        setTimeout(() => textarea.focus(), 100);
    }
}

function closeInefficiencyCommentModal() {
    const modal = document.getElementById('inefficiencyCommentModal');
    if (modal) {
        modal.style.display = 'none';
        currentIneffPeriod = null;
    }
}

async function saveInefficiencyComment() {
    if (!currentIneffPeriod) return;
    
    const textarea = document.getElementById('ineffCommentTextarea');
    const text = textarea ? textarea.value.trim() : '';
    
    const { from, to } = currentIneffPeriod;
    
    // Сохраняем причину
    saveReason(from, to, text);
    
    // Показываем сообщение
    addConsoleMessage(`📈 ${t('ineff_comment_saved')}`, 'info');
    
    // Закрываем модальное окно
    closeInefficiencyCommentModal();
    
    // Обновляем вкладку неэффективности
    const printerId = document.getElementById('analyticsPrinter')?.value || 'all';
    const period = document.getElementById('analyticsPeriod')?.value;
    const custom = getCustomRangeIfAny();
    renderInefficiency(printerId, custom);
    bindInefficiencyHandlers();
}

async function deleteInefficiencyComment() {
    if (!currentIneffPeriod) return;
    
    const { from, to } = currentIneffPeriod;
    
    // Удаляем причину (сохраняем пустую строку)
    saveReason(from, to, '');
    
    // Показываем сообщение
    addConsoleMessage(`📈 ${t('ineff_comment_deleted')}`, 'warning');
    
    // Закрываем модальное окно
    closeInefficiencyCommentModal();
    
    // Обновляем вкладку неэффективности
    const printerId = document.getElementById('analyticsPrinter')?.value || 'all';
    const period = document.getElementById('analyticsPeriod')?.value;
    const custom = getCustomRangeIfAny();
    renderInefficiency(printerId, custom);
    bindInefficiencyHandlers();
}

function updateInefficiencyCommentModalTranslations() {
    const typeLabel = document.getElementById('ineffCommentTypeLabel');
    const durationLabel = document.getElementById('ineffCommentDurationLabel');
    const label = document.getElementById('ineffCommentLabel');
    const textarea = document.getElementById('ineffCommentTextarea');
    const hint = document.getElementById('ineffCommentHint');
    const saveBtn = document.getElementById('ineffCommentSaveBtn');
    const deleteText = document.getElementById('ineffCommentDeleteText');
    const cancelBtn = document.getElementById('ineffCommentCancelBtn');
    
    if (typeLabel) typeLabel.textContent = t('ineff_comment_type_label');
    if (durationLabel) durationLabel.textContent = t('ineff_comment_duration_label');
    if (label) label.textContent = t('ineff_comment_label');
    if (textarea) textarea.placeholder = t('ineff_comment_placeholder');
    if (hint) hint.innerHTML = t('ineff_comment_hint');
    if (saveBtn) saveBtn.textContent = t('ineff_comment_save');
    if (deleteText) deleteText.textContent = t('ineff_comment_delete');
    if (cancelBtn) cancelBtn.textContent = t('ineff_comment_cancel');
}

function bindInefficiencyHandlers() {
    // Эта функция теперь пустая, т.к. обработчики теперь в onclick карточек
    // Оставляем её для совместимости
}

function renderInefficiency(printerId, custom) {
    let since = Date.now() - 7*24*60*60*1000;
    if (custom) since = custom.from;
    const until = custom ? custom.to : Date.now();
    const periods = findInefficiencyPeriods(printerId, since, until);
    
    // Aggregate by day with separate Gap and Pause durations
    const byDay = {};
    periods.forEach(p => {
        const day = new Date(p.from).toISOString().slice(0,10);
        if (!byDay[day]) {
            byDay[day] = { gapMinutes: 0, pauseMinutes: 0 };
        }
        const durationMinutes = p.duration / (60 * 1000);
        if (p.type === 'gap') {
            byDay[day].gapMinutes += durationMinutes;
        } else if (p.type === 'pause') {
            byDay[day].pauseMinutes += durationMinutes;
        }
    });
    
    const series = Object.keys(byDay).sort().map(day => ({ 
        day, 
        gapMinutes: byDay[day].gapMinutes,
        pauseMinutes: byDay[day].pauseMinutes
    }));
    
    drawIneffMarkers('ineffChart', series);
    const list = document.getElementById('ineffList');
    if (list) list.innerHTML = renderInefficiencyTab(printerId, custom);
}

function drawIneffMarkers(canvasId, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    destroyChart(canvasId);
    
    if (!series || series.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.fillText(t('no_inefficiency') || 'No inefficiency events', 10, 20);
        return;
    }
    
    const labels = series.map(s => {
        const date = new Date(s.day);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });
    
    const gapData = series.map(s => (s.gapMinutes || 0).toFixed(1));
    const pauseData = series.map(s => (s.pauseMinutes || 0).toFixed(1));
    
    chartInstances[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: t('ineff_type_gap') || 'Gap',
                    data: gapData,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    maxBarThickness: 50  // Limit bar width
                },
                {
                    label: t('ineff_type_pause') || 'Pause',
                    data: pauseData,
                    backgroundColor: 'rgba(230, 126, 34, 0.7)',
                    borderColor: 'rgba(230, 126, 34, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    maxBarThickness: 50  // Limit bar width
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#ccc', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e74c3c',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const hours = Math.floor(context.parsed.y / 60);
                            const mins = Math.round(context.parsed.y % 60);
                            return `${context.dataset.label}: ${hours}h ${mins}m`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: { 
                        color: '#888', 
                        font: { size: 11 },
                        callback: function(value) {
                            return Math.round(value) + ' min';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    stacked: true,
                    ticks: { color: '#888', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                }
            },
            // Control bar sizing
            categoryPercentage: 0.8,
            barPercentage: 0.7
        }
    });
}

// ===== ФУНКЦИИ ПОДКЛЮЧЕНИЯ И WEBSOCKET =====

// Проверка совместимости старых принтеров (добавлен type если его нет)
function ensurePrinterType(printer) {
    if (!printer.type) {
        // Если есть port - значит это Klipper
        printer.type = printer.port ? 'klipper' : 'klipper';
    }
    return printer.type;
}

async function testPrinterConnection(printer, isManualCheck = false) {
    ensurePrinterType(printer);
    
    if (printer.type === 'bambu') {
        return await testBambuLabConnection(printer, isManualCheck);
    } else {
        return await testKlipperConnection(printer, isManualCheck);
    }
}

// Тестирование подключения к Bambu Lab принтеру
async function testBambuLabConnection(printer, isManualCheck = false) {
    if (!isManualCheck) {
        const dueAt = nextRetryAt[printer.id] || 0;
        if (Date.now() < dueAt) {
            return;
        }
    }
    
    addConsoleMessage(`🔍 ${t('testing_connection')} ${printer.name}... (Bambu Lab)`, 'info');
    
    try {
        // Note: MQTT connection handled by main process
        addConsoleMessage(`ℹ️ ${printer.name} - Bambu Lab printer detected, connecting via MQTT...`, 'info');
        
        printer.status = 'offline';
        printer.connectionType = 'MQTT (not configured)';
        printer.lastUpdate = new Date();
        updatePrinterDisplay(printer);
        debouncedSortPrinters();
        updatePrintersDisplay();
        
        return false;
    } catch (error) {
        printer.status = 'offline';
        printer.connectionType = null;
        addConsoleMessage(`❌ ${printer.name} - ${t('mqtt_failed')}`, 'error');
        printer.lastUpdate = new Date();
        updatePrinterDisplay(printer);
        debouncedSortPrinters();
        updatePrintersDisplay();
        return false;
    }
}

// Тестирование подключения к Klipper принтеру
async function testKlipperConnection(printer, isManualCheck = false) {
    if (!isManualCheck) {
        const dueAt = nextRetryAt[printer.id] || 0;
        if (Date.now() < dueAt) {
            return;
        }
    }
    
    addConsoleMessage(`🔍 ${t('testing_connection')} ${printer.name}...`, 'info');
    
    let httpSuccess = false;
    let websocketSuccess = false;

    try {
        const response = await fetch(`http://${printer.ip}:${printer.port}/printer/info`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(CONFIG.CONNECTION_TIMEOUT)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.result) {
                deepMerge(printer.data, { info: data.result });
            }
            
            printer.connectionType = 'HTTP';
            printer.lastUpdate = new Date();
            httpSuccess = true;
            
            addConsoleMessage(`✅ ${printer.name} - ${t('http_success')}`, 'info');
            await getPrinterObjects(printer);
            
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        httpSuccess = false;
        if (!isManualCheck) {
            connectionRetries[printer.id] = (connectionRetries[printer.id] || 0) + 1;
            retryAttempts[printer.id] = (retryAttempts[printer.id] || 0) + 1;
            const delay = getBackoffDelayMs(retryAttempts[printer.id]);
            nextRetryAt[printer.id] = Date.now() + delay;
        }
    }

    if (httpSuccess) {
        try {
            await setupWebSocketConnection(printer);
            websocketSuccess = true;
            addConsoleMessage(`✅ ${printer.name} - ${t('websocket_success')}`, 'info');
        } catch (error) {
            websocketSuccess = false;
            addConsoleMessage(`⚠️ ${printer.name} - ${t('websocket_failed')}, ${t('using_http_polling')}`, 'warning');
        }
    }

    if (httpSuccess) {
        printer.status = 'ready';
        connectionRetries[printer.id] = 0;
        retryAttempts[printer.id] = 0;
        nextRetryAt[printer.id] = 0;
    } else {
        printer.status = 'offline';
        printer.connectionType = null;
        addConsoleMessage(`❌ ${printer.name} - ${t('http_failed')}`, 'error');
        if (websocketConnections[printer.id]) {
            websocketConnections[printer.id].close();
            delete websocketConnections[printer.id];
        }
    }

    printer.lastUpdate = new Date();
    updatePrinterDisplay(printer);
    debouncedSortPrinters();
    updatePrintersDisplay();
    
    debugPrinterData(printer, 'test connection');
    
    // НЕ показываем модальное окно автоматически - пусть работает автоопределение
    // Пользователь может открыть настройки вручную через кнопку 🌡️
}

async function discoverPrinterObjects(printer) {
    try {
        const response = await fetch(`http://${printer.ip}:${printer.port}/printer/objects/list`, {
            signal: AbortSignal.timeout(CONFIG.CONNECTION_TIMEOUT)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.result && data.result.objects) {
                printer.availableObjects = data.result.objects;
                console.log(`📋 ${printer.name} - Available objects:`, printer.availableObjects);
            }
        }
    } catch (error) {
        console.log(`Failed to discover objects for ${printer.name}:`, error);
        printer.availableObjects = null;
    }
}

async function getPrinterObjects(printer) {
    try {
        // Сначала получаем список всех доступных объектов
        if (!printer.availableObjects) {
            await discoverPrinterObjects(printer);
        }
        
        // Формируем список объектов для запроса
        let queryObjects = ['webhooks', 'print_stats', 'display_status', 'virtual_sdcard', 'extruder', 'heater_bed'];
        
        // Добавляем все найденные temperature_sensor объекты
        if (printer.availableObjects) {
            const tempSensors = printer.availableObjects.filter(obj => obj.startsWith('temperature_sensor '));
            const tempFans = printer.availableObjects.filter(obj => obj.startsWith('temperature_fan '));
            const heaterGeneric = printer.availableObjects.filter(obj => obj.startsWith('heater_generic '));
            queryObjects = [...queryObjects, ...tempSensors, ...tempFans, ...heaterGeneric];
            
            console.log(`🌡️ ${printer.name} - Temperature sensors found:`, [...tempSensors, ...tempFans, ...heaterGeneric]);
        }
        
        const queryString = queryObjects.join('&');
        const response = await fetch(`http://${printer.ip}:${printer.port}/printer/objects/query?${queryString}`, {
            signal: AbortSignal.timeout(CONFIG.CONNECTION_TIMEOUT)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.result && data.result.status) {
                deepMerge(printer.data, data.result.status);
            }
            
            updatePrinterStatus(printer);
            
            debugPrinterData(printer, 'get objects');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.log(`${t('printer_objects_failed')} ${printer.name}:`, error);
    }
}

function setupWebSocketConnection(printer) {
    return new Promise((resolve, reject) => {
        const wsUrl = `ws://${printer.ip}:${printer.port}/websocket`;
        
        try {
            if (websocketConnections[printer.id]) {
                websocketConnections[printer.id].close();
            }
            
            const websocket = new WebSocket(wsUrl);
            websocketConnections[printer.id] = websocket;
            
            const timeout = setTimeout(() => {
                websocket.close();
                reject(new Error('WebSocket connection timeout'));
            }, CONFIG.CONNECTION_TIMEOUT);
            
            websocket.onopen = async function(event) {
                clearTimeout(timeout);
                addConsoleMessage(`🔗 ${printer.name} - ${t('websocket_connected')}`, 'info');
                printer.connectionType = 'WebSocket';
                
                // Получаем список доступных объектов, если еще не получили
                if (!printer.availableObjects) {
                    await discoverPrinterObjects(printer);
                }
                
                // Формируем объекты для подписки
                const subscribeObjects = {
                    "webhooks": null,
                    "print_stats": ["state", "filename", "print_duration", "message", "total_duration"],
                    "display_status": ["progress", "message"],
                    "virtual_sdcard": ["progress", "is_active", "file_position", "file_path"],
                    "extruder": ["temperature", "target"],
                    "heater_bed": ["temperature", "target"]
                };
                
                // Добавляем все temperature_sensor объекты
                if (printer.availableObjects) {
                    printer.availableObjects.forEach(obj => {
                        if (obj.startsWith('temperature_sensor ') || 
                            obj.startsWith('temperature_fan ') || 
                            obj.startsWith('heater_generic ')) {
                            subscribeObjects[obj] = null;
                        }
                    });
                }
                
                const subscribeMessage = {
                    jsonrpc: "2.0",
                    method: "printer.objects.subscribe",
                    params: {
                        objects: subscribeObjects
                    },
                    id: Date.now()
                };
                
                console.log(`🔌 ${printer.name} - WebSocket subscription:`, Object.keys(subscribeObjects));
                websocket.send(JSON.stringify(subscribeMessage));
                resolve(websocket);
            };
            
            websocket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(printer, data);
            };
            
            websocket.onclose = function(event) {
                clearTimeout(timeout);
                if (printer.connectionType === 'WebSocket') {
                    addConsoleMessage(`⚠️ ${printer.name} - ${t('websocket_disconnected')}`, 'warning');
                    printer.connectionType = 'HTTP';
                }
            };
            
            websocket.onerror = function(error) {
                clearTimeout(timeout);
                reject(error);
            };
            
        } catch (error) {
            reject(error);
        }
    });
}

function handleWebSocketMessage(printer, data) {
    if (data.method === "notify_status_update") {
        const oldStatus = printer.status;
        
        if (data.params && data.params[0]) {
            deepMerge(printer.data, data.params[0]);
        }
        
        printer.lastUpdate = new Date();
        const prevStatus = printer.status;
        const prevFile = getFileName(printer);
        updatePrinterStatus(printer);
        
        if (oldStatus !== printer.status) {
            debouncedSortPrinters();
        }
        
        // Telegram: notify on print start
        if (prevStatus !== 'printing' && printer.status === 'printing') {
            const fn = getFileName(printer);
            sendEventNotification(printer, t('event_print_start'), `${t('printer')}: ${printer.name}, ${t('file')}: ${fn}`);
        }
        updatePrinterDisplay(printer);
        debouncedUpdatePrintersCounter();
        
        debugPrinterData(printer, 'websocket');
    }
}

async function updatePrinterData(printer) {
    ensurePrinterType(printer);
    
    if (printer.type === 'bambu') {
        // Bambu Lab uses MQTT, no HTTP polling needed
        return;
    }
    
    if (printer.connectionType === 'WebSocket') return;

    try {
        const response = await fetch(`http://${printer.ip}:${printer.port}/printer/objects/query?print_stats&display_status&virtual_sdcard&extruder&heater_bed`, {
            signal: AbortSignal.timeout(CONFIG.CONNECTION_TIMEOUT)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.result && data.result.status) {
                deepMerge(printer.data, data.result.status);
            }
            
            printer.lastUpdate = new Date();
            printer.connectionType = 'HTTP';
            updatePrinterStatus(printer);
            
            updatePrinterDisplay(printer);
            debouncedSortPrinters();
            debouncedUpdatePrintersCounter();
            
            debugPrinterData(printer, 'HTTP update');
        }
    } catch (error) {
        if (printer.status !== 'offline') {
            printer.status = 'offline';
            printer.connectionType = null;
            printer.lastUpdate = new Date();
            updatePrinterDisplay(printer);
            debouncedSortPrinters();
            debouncedUpdatePrintersCounter();
        }
        retryAttempts[printer.id] = (retryAttempts[printer.id] || 0) + 1;
        const delay = getBackoffDelayMs(retryAttempts[printer.id]);
        nextRetryAt[printer.id] = Date.now() + delay;
    }
}

// Экспоненциальный бэкофф с джиттером
function getBackoffDelayMs(attempt) {
    const base = 5000; // 5s
    const max = 60000; // 60s
    const exp = Math.min(max, base * Math.pow(2, Math.max(0, attempt - 1)));
    const jitter = Math.floor(Math.random() * 1000);
    return Math.min(max, exp + jitter);
}

// Вспомогательная функция для получения числового значения прогресса
function getProgressNumber(printer) {
    if (printer.status === 'offline') {
        return 0;
    }
    
    const displayProgress = printer.data.display_status?.progress;
    const virtualSdcardProgress = printer.data.virtual_sdcard?.progress;
    
    const progress = displayProgress !== undefined ? displayProgress : virtualSdcardProgress;
    
    if (progress === undefined || progress === null) return 0;
    
    return Math.round(progress * 100);
}

// Новая функция для определения приоритета принтера
function getPrinterPriority(printer) {
    const basePriority = {
        'error': 100,
        'paused': 90,
        'complete': 80,
        'ready': 70,
        'offline': 10,
        'printing': 50
    };
    
    let priority = basePriority[printer.status] || 0;
    
    if (printer.status === 'printing') {
        const progress = getProgressNumber(printer);
        if (progress >= 95 && progress <= 100) {
            priority = 75;
        }
    }
    
    return priority;
}

function sortPrinters() {
    const oldOrder = printers.map(p => p.id);
    
    printers.sort((a, b) => {
        const priorityA = getPrinterPriority(a);
        const priorityB = getPrinterPriority(b);
        
        if (priorityB !== priorityA) {
            return priorityB - priorityA;
        }
        
        return a.order - b.order;
    });
    
    const newOrder = printers.map(p => p.id);
    if (JSON.stringify(oldOrder) !== JSON.stringify(newOrder)) {
        updatePrintersDisplay();
    }
}

function updatePrinterStatus(printer) {
    const printStats = printer.data.print_stats || {};
    const virtualSdcard = printer.data.virtual_sdcard || {};
    const displayStatus = printer.data.display_status || {};
    
    const state = printStats.state || 'unknown';
    const isActive = virtualSdcard.is_active;
    const progress = displayStatus.progress;
    const filename = printStats.filename;
    const filePath = virtualSdcard.file_path;
    
    const hasActiveFile = !!(filename && filename !== 'null' && filename !== '' && filename !== null) || 
                         !!(filePath && filePath !== 'null' && filePath !== '' && filePath !== null);
    
    if (state === 'printing') {
        printer.status = 'printing';
    } 
    else if (state === 'paused') {
        printer.status = 'paused';
    }
    else if (state === 'error') {
        printer.status = 'error';
    }
    else if (state === 'complete') {
        printer.status = 'complete';
    }
    else if (state === 'ready' || state === 'standby' || state === 'cancelled') {
        if (isActive === true || (progress !== undefined && progress > 0 && progress < 1) || hasActiveFile) {
            printer.status = 'printing';
        } else {
            printer.status = 'ready';
        }
    }
    else {
        if (isActive === true || (progress !== undefined && progress > 0 && progress < 1) || hasActiveFile) {
            printer.status = 'printing';
        } else {
            printer.status = printer.connectionType ? 'ready' : 'offline';
        }
    }
    
    const progressPercent = getProgressNumber(printer);
    console.log(`Printer ${printer.name}: state=${state}, status=${printer.status}, progress=${progressPercent}%, filename=${filename}, hasActiveFile=${hasActiveFile}`);
}

// ===== ФУНКЦИИ ОТОБРАЖЕНИЯ И УТИЛИТЫ =====

function updatePrintersDisplay() {
    const container = document.getElementById('printersContainer');
    if (!container) return;
    
    if (printers.length === 0) {
        container.innerHTML = `
            <div class="no-printers">
                <p>${t('no_printers')}</p>
                <button class="btn btn-primary" onclick="openAddPrinterModal()">${t('add_first_printer')}</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = printers.map(printer => {
        ensurePrinterType(printer);
        const printerTypeLabel = printer.type === 'bambu' ? '🎋 Bambu Lab' : '🖨️ Klipper';
        const addressInfo = printer.ip;
        
        return `
        <div class="printer-card ${printer.status}" data-printer-id="${printer.id}" onclick="openPrinterWebInterface('${printer.id}')">
            <div class="printer-header">
                <div class="printer-name">${printer.name} <small style="opacity: 0.7;">${printerTypeLabel}</small></div>
                <div class="printer-status status-${printer.status}">
                    ${getStatusText(printer.status)} ${printer.connectionType ? `(${printer.connectionType})` : ''}
                </div>
            </div>
            <div class="printer-info">
                <div class="info-item">
                    <span>${t('address')}</span>
                    <span class="ip-address-large">${addressInfo}</span>
                </div>
                <div class="info-item">
                    <span>${t('state')}</span>
                    <span class="state-text">${getStateText(printer)}</span>
                </div>
                <div class="info-item">
                    <span>${t('file')}</span>
                    <span class="file-text">${getFileName(printer)}</span>
                </div>
                <div class="info-item">
                    <span>${t('progress')}</span>
                    <span class="progress-text-large ${getProgress(printer) === '100%' ? 'progress-100-animation' : ''}">
                        ${getProgress(printer)}
                    </span>
                </div>
                <div class="info-item">
                    <span>${t('temperatures')}</span>
                    <span class="temp-text">${getTemperatures(printer)}</span>
                </div>
                ${printer.lastUpdate ? `
                <div class="info-item">
                    <span>${t('updated')}</span>
                    <span class="updated-text">${formatTime(printer.lastUpdate)}</span>
                </div>
                ` : ''}
            </div>
            <div class="printer-actions" onclick="event.stopPropagation()">
                <button class="btn btn-secondary btn-small" onclick="editPrinter('${printer.id}', event)">
                    ${t('edit')}
                </button>
                <button class="btn btn-warning btn-small" onclick="testPrinterConnection(printers.find(p => p.id === '${printer.id}'), true)">
                    ${t('test')}
                </button>
                ${printer.type === 'klipper' ? `
                <button class="btn btn-info btn-small" onclick="openTempSensorsEditor('${printer.id}', event)" title="Advanced: Configure temperature sensors">
                    🌡️
                </button>
                ` : ''}
                <button class="btn btn-danger btn-small" onclick="removePrinter('${printer.id}', event)">
                    ${t('remove')}
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    updatePrintersCounter();
}

// ===== ANALYTICS UI =====
function openAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    if (!modal) return;
    populateAnalyticsPrinterSelect();
    document.getElementById('analyticsPeriod').value = '7d';
    localizeAnalyticsUi();
    bindAnalyticsFilters();
    setAnalyticsTab('eff');  // Open Efficiency tab by default to showcase new charts
    modal.style.display = 'block';
}

function closeAnalyticsModal() {
    // Destroy all chart instances before closing
    Object.keys(chartInstances).forEach(chartId => {
        destroyChart(chartId);
    });
    
    const modal = document.getElementById('analyticsModal');
    if (modal) modal.style.display = 'none';
}

function setAnalyticsTab(tab) {
    currentAnalyticsTab = tab;  // Save current tab
    
    // Destroy all existing chart instances before switching tabs
    Object.keys(chartInstances).forEach(chartId => {
        destroyChart(chartId);
    });
    
    const content = document.getElementById('analyticsTabContent');
    if (!content) return;
    const period = document.getElementById('analyticsPeriod').value;
    const printerId = document.getElementById('analyticsPrinter').value || 'all';
    const custom = getCustomRangeIfAny();
    
    console.log('========== setAnalyticsTab DEBUG ==========');
    console.log('Selected printerId from dropdown:', printerId);
    console.log('Type of printerId:', typeof printerId);
    console.log('Period:', period);
    console.log('Total events in analytics:', analytics.events.length);
    console.log('Printers:', printers.map(p => ({ id: p.id, name: p.name })));
    
    const stats = computeAnalytics(period, printerId, custom);
    // Update header metrics
    document.getElementById('stat-print-time').textContent = formatDuration(stats.totalPrintMs);
    document.getElementById('stat-idle-time').textContent = formatDuration(stats.totalIdleMs);
    document.getElementById('stat-efficiency').textContent = `${stats.efficiency.toFixed(1)}%`;
    document.getElementById('stat-energy-cost').textContent = `${stats.energyCost.toFixed(2)}${getCurrencySymbol(analytics.currency)}`;

    if (tab === 'help') {
        content.innerHTML = `
            <div class="analytics-card" style="max-width: 900px; margin: 0 auto;">
                <h3 style="margin-bottom: 20px; color: #00d4ff; text-align: center;">${t('analytics_help_title')}</h3>
                <div class="analytics-help-content">
                    ${t('analytics_help_content')}
                </div>
            </div>
        `;
        return;
    }

    if (tab === 'settings') {
        content.innerHTML = renderAnalyticsSettings();
        bindAnalyticsSettingsHandlers();
        return;
    }

    if (tab === 'eff') {
        const dailyData = aggregateDailyEnergy(period, printerId, custom, true);
        
        if (dailyData.length === 0) {
            content.innerHTML = `
                <div class="analytics-card">
                    <div class="analytics-empty">${t('no_data_available') || 'No data available'}</div>
                </div>
            `;
            return;
        }
        
        // Calculate summary statistics
        const totalPrint = dailyData.reduce((sum, d) => sum + d.printMs, 0);
        const totalIdle = dailyData.reduce((sum, d) => sum + d.idleMs, 0);
        const avgEff = totalPrint + totalIdle > 0 ? (totalPrint / (totalPrint + totalIdle) * 100) : 0;
        
        // Find best and worst days
        let bestDay = null, worstDay = null;
        let maxEff = -1, minEff = 101;
        
        dailyData.forEach(d => {
            const total = d.printMs + d.idleMs;
            if (total > 0) {
                const eff = (d.printMs / total) * 100;
                if (eff > maxEff) {
                    maxEff = eff;
                    bestDay = d.day;
                }
                if (eff < minEff) {
                    minEff = eff;
                    worstDay = d.day;
                }
            }
        });
        
        const formatDate = (dayStr) => {
            const date = new Date(dayStr);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        };
        
        content.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card" style="grid-column: 1 / -1;">
                    <h4 style="margin-bottom: 10px; color: #00d4ff;">${t('efficiency_overview') || 'Efficiency Overview'}</h4>
                    <div style="height: 260px; position: relative;">
                        <canvas id="efficiencyComboChart"></canvas>
                    </div>
                </div>
                <div class="analytics-card">
                    <h4 style="color: #2ecc71; margin-bottom: 15px;">📊 ${t('efficiency_stats') || 'Statistics'}</h4>
                    <div class="info-item">
                        <span>${t('avg_efficiency') || 'Average Efficiency'}:</span>
                        <span style="color: ${avgEff >= 70 ? '#2ecc71' : avgEff >= 50 ? '#f39c12' : '#e74c3c'}; font-weight: bold; font-size: 18px;">
                            ${avgEff.toFixed(1)}%
                        </span>
                    </div>
                    ${bestDay ? `
                    <div class="info-item">
                        <span>🏆 ${t('best_day') || 'Best Day'}:</span>
                        <span style="color: #2ecc71;">${formatDate(bestDay)} (${maxEff.toFixed(1)}%)</span>
                    </div>
                    ` : ''}
                    ${worstDay ? `
                    <div class="info-item">
                        <span>⚠️ ${t('worst_day') || 'Worst Day'}:</span>
                        <span style="color: #e74c3c;">${formatDate(worstDay)} (${minEff.toFixed(1)}%)</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span>${t('total_days') || 'Total Days'}:</span>
                        <span>${dailyData.length}</span>
                    </div>
                </div>
                <div class="analytics-card">
                    <h4 style="color: #3498db; margin-bottom: 15px;">💡 ${t('efficiency_tips') || 'Tips'}</h4>
                    <div style="font-size: 13px; line-height: 1.8; color: #aaa;">
                        ${avgEff >= 70 ? `
                            <p style="color: #2ecc71;">✅ ${t('eff_tip_good') || 'Excellent efficiency! Your printers are well utilized.'}</p>
                        ` : avgEff >= 50 ? `
                            <p style="color: #f39c12;">⚠️ ${t('eff_tip_medium') || 'Good efficiency, but there\'s room for improvement.'}</p>
                            <p>• ${t('eff_tip_reduce_gaps') || 'Reduce gaps between prints'}</p>
                            <p>• ${t('eff_tip_batch') || 'Consider batch printing'}</p>
                        ` : `
                            <p style="color: #e74c3c;">❌ ${t('eff_tip_low') || 'Low efficiency detected.'}</p>
                            <p>• ${t('eff_tip_check_ineff') || 'Check Inefficiency tab for details'}</p>
                            <p>• ${t('eff_tip_schedule') || 'Optimize print scheduling'}</p>
                            <p>• ${t('eff_tip_minimize') || 'Minimize idle time'}</p>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        drawEfficiencyComboChart('efficiencyComboChart', dailyData);
        return;
    }

    if (tab === 'ineff') {
        content.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div style="height: 220px; position: relative;">
                        <canvas id="ineffChart"></canvas>
                    </div>
                </div>
                <div class="analytics-card" id="ineffList"></div>
            </div>
        `;
        renderInefficiency(printerId, custom);
        bindInefficiencyHandlers();
        return;
    }

    // Energy details with charts
    content.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <div style="height: 200px; position: relative; margin-bottom: 15px;">
                    <canvas id="analyticsChart"></canvas>
                </div>
                <div style="height: 150px; position: relative;">
                    <canvas id="efficiencyChart"></canvas>
                </div>
            </div>
            <div class="analytics-card">
                <h4>${t('energy_details_title')}</h4>
                <div class="info-item"><span>${t('total_consumption')}:</span><span>${stats.kwhTotal.toFixed(2)} kWh</span></div>
                <div class="info-item"><span>${t('energy_cost')}:</span><span>${stats.energyCost.toFixed(2)}${getCurrencySymbol(analytics.currency)}</span></div>
                <div class="info-item"><span>${t('avg_daily')}:</span><span>${stats.kwhDailyAvg.toFixed(2)} kWh</span></div>
                <div class="info-item"><span>${t('cost_per_kwh')}:</span><span>${analytics.energyCostPerKwh.toFixed(2)}${getCurrencySymbol(analytics.currency)}</span></div>
            </div>
        </div>
    `;
    const energySeries = aggregateDailyEnergy(period, printerId, custom);
    drawEnergyChart('analyticsChart', energySeries);
    const effSeries = aggregateDailyEfficiency(period, printerId, custom);
    drawEfficiencyLine('efficiencyChart', effSeries);
}

function localizeAnalyticsUi() {
    const lblPeriod = document.getElementById('analyticsPeriodLabel');
    const lblPrinter = document.getElementById('analyticsPrinterLabel');
    const lblFrom = document.getElementById('analyticsFromLabel');
    const lblTo = document.getElementById('analyticsToLabel');
    const kpiP = document.getElementById('kpiPrintLabel');
    const kpiI = document.getElementById('kpiIdleLabel');
    const kpiE = document.getElementById('kpiEffLabel');
    const kpiC = document.getElementById('kpiCostLabel');
    const bEff = document.getElementById('tabEffBtn');
    const bIneff = document.getElementById('tabIneffBtn');
    const bEnergy = document.getElementById('tabEnergyBtn');
    const bDetails = document.getElementById('tabDetailsBtn');
    const bSettings = document.getElementById('tabSettingsBtn');
    const bHelp = document.getElementById('tabHelpBtn');
    if (lblPeriod) lblPeriod.textContent = t('period');
    if (lblPrinter) lblPrinter.textContent = t('printer_filter');
    if (lblFrom) lblFrom.textContent = t('custom_from');
    if (lblTo) lblTo.textContent = t('custom_to');
    if (kpiP) kpiP.textContent = t('kpi_print_time');
    if (kpiI) kpiI.textContent = t('kpi_idle_time');
    if (kpiE) kpiE.textContent = t('kpi_efficiency');
    if (kpiC) kpiC.textContent = t('kpi_energy_cost');
    if (bEff) bEff.textContent = t('tab_efficiency');
    if (bIneff) bIneff.textContent = t('tab_inefficiency');
    if (bEnergy) bEnergy.textContent = t('tab_energy');
    if (bDetails) bDetails.textContent = t('tab_details');
    if (bSettings) bSettings.textContent = t('tab_settings');
    if (bHelp) bHelp.textContent = t('analytics_help');
}

function bindAnalyticsFilters() {
    const periodSel = document.getElementById('analyticsPeriod');
    const customBox = document.getElementById('analyticsCustomRange');
    const onChange = () => {
        customBox.style.display = periodSel.value === 'custom' ? 'flex' : 'none';
        setAnalyticsTab(currentAnalyticsTab);  // Keep current tab
    };
    periodSel.onchange = onChange;
    const from = document.getElementById('analyticsFrom');
    const to = document.getElementById('analyticsTo');
    if (from) from.onchange = () => setAnalyticsTab(currentAnalyticsTab);  // Keep current tab
    if (to) to.onchange = () => setAnalyticsTab(currentAnalyticsTab);  // Keep current tab
    const printerSel = document.getElementById('analyticsPrinter');
    if (printerSel) printerSel.onchange = () => setAnalyticsTab(currentAnalyticsTab);  // Keep current tab
}

function getCustomRangeIfAny() {
    const period = document.getElementById('analyticsPeriod').value;
    if (period !== 'custom') return null;
    const fromStr = document.getElementById('analyticsFrom').value;
    const toStr = document.getElementById('analyticsTo').value;
    const from = fromStr ? new Date(fromStr + 'T00:00:00').getTime() : null;
    const to = toStr ? new Date(toStr + 'T23:59:59').getTime() : null;
    if (!from || !to || from > to) return null;
    return { from, to };
}

function populateAnalyticsPrinterSelect() {
    const sel = document.getElementById('analyticsPrinter');
    if (!sel) return;
    sel.innerHTML = '';
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = t('all_printers') || 'Все принтеры';
    sel.appendChild(all);
    for (const p of printers) {
        const o = document.createElement('option');
        o.value = String(p.id);  // Ensure ID is string
        o.textContent = p.name;
        sel.appendChild(o);
    }
    
    // Debug: Log detailed analytics status
    console.log('========== ANALYTICS STATUS ==========');
    console.log('Total printers configured:', printers.length);
    console.log('Printers:', printers.map(p => ({ id: p.id, name: p.name, status: p.status })));
    console.log('Total analytics events:', analytics.events.length);
    
    if (analytics.events.length > 0) {
        const eventsByPrinter = {};
        analytics.events.forEach(e => {
            const pid = String(e.printerId);
            if (!eventsByPrinter[pid]) eventsByPrinter[pid] = 0;
            eventsByPrinter[pid]++;
        });
        console.log('Events by printer:', eventsByPrinter);
        console.log('Unique printer IDs in events:', Object.keys(eventsByPrinter));
        
        // Show date range
        const timestamps = analytics.events.map(e => e.ts);
        const oldest = new Date(Math.min(...timestamps));
        const newest = new Date(Math.max(...timestamps));
        console.log('Data range:', oldest.toLocaleString(), 'to', newest.toLocaleString());
    } else {
        console.log('⚠️ NO ANALYTICS EVENTS YET! Events will be created when printer status changes.');
    }
    console.log('======================================');
}

function renderAnalyticsSettings() {
    const curr = analytics.currency || 'RUB';
    return `
        <div class="analytics-card">
            <h4>Настройки стоимости энергии</h4>
            <div style="margin-bottom: 20px; padding: 10px; background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 5px;">
                <h5 style="color: #e74c3c; margin-bottom: 10px;">🗑️ Очистка данных</h5>
                
                <div style="margin-bottom: 15px;">
                    <p style="font-size: 13px; color: #aaa; margin-bottom: 10px;">Удалить данные от удаленных принтеров (рекомендуется):</p>
                    <button class="btn btn-danger btn-small" onclick="clearOrphanedAnalytics()" style="width: 100%;">🧹 Очистить данные от удаленных принтеров</button>
                </div>
                
                <div>
                    <p style="font-size: 13px; color: #aaa; margin-bottom: 10px;">Или удалить данные конкретного принтера:</p>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <select id="clearPrinterSelect" style="flex: 1; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: #fff; border-radius: 5px;">
                            ${printers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                        <button class="btn btn-danger btn-small" onclick="clearPrinterAnalytics()">Очистить</button>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Стоимость за 1 кВтч:</label>
                <input type="number" step="0.01" id="energyCostInput" value="${analytics.energyCostPerKwh.toFixed(2)}">
            </div>
            <div class="form-group">
                <label>Currency:</label>
                <select id="currencyInput">
                    <option value="RUB" ${curr==='RUB'?'selected':''}>₽ RUB</option>
                    <option value="USD" ${curr==='USD'?'selected':''}>$ USD</option>
                    <option value="EUR" ${curr==='EUR'?'selected':''}>€ EUR</option>
                    <option value="KZT" ${curr==='KZT'?'selected':''}>₸ KZT</option>
                </select>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" id="saveEnergyCostBtn">💾 Сохранить стоимость</button>
            </div>
            <div class="form-group">
                <h4>${t('wattage_title')}</h4>
                ${printers.map(p => {
                    const w = analytics.wattageByPrinter[p.id] || { print: 120, idle: 8 };
                    return `
                    <div class="info-item" style="gap:8px; align-items:center;">
                        <span>${p.name}</span>
                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:12px; color:#666;">${t('wattage_print')}</label>
                            <input type="number" step="1" min="0" style="width:120px" data-wtype="print" data-pid="${p.id}" value="${w.print || 120}" title="${t('wattage_print_hint')}">
                        </div>
                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:12px; color:#666;">${t('wattage_idle')}</label>
                            <input type="number" step="1" min="0" style="width:120px" data-wtype="idle" data-pid="${p.id}" value="${w.idle || 8}" title="${t('wattage_idle_hint')}">
                        </div>
                    </div>`;
                }).join('')}
                <button class="btn btn-primary" id="saveWattageBtn">💾 ${t('save_wattage')}</button>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" id="clearAnalyticsBtn">🧹 Очистить все данные аналитики</button>
            </div>
            <div class="form-group" style="margin-top: 25px; padding: 15px; background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 5px;">
                <h5 style="color: #2ecc71; margin-bottom: 10px;">📥 Экспорт данных</h5>
                <p style="font-size: 13px; color: #aaa; margin-bottom: 10px;">${t('export_analytics_hint')}</p>
                <button class="btn btn-primary" id="exportAnalyticsBtn">${t('export_analytics')}</button>
            </div>
        </div>
    `;
}

function bindAnalyticsSettingsHandlers() {
    const saveBtn = document.getElementById('saveEnergyCostBtn');
    const clearBtn = document.getElementById('clearAnalyticsBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const cost = parseFloat(document.getElementById('energyCostInput').value || '0');
            const currency = document.getElementById('currencyInput').value || 'RUB';
            analytics.energyCostPerKwh = isNaN(cost) ? analytics.energyCostPerKwh : cost;
            analytics.currency = currency;
            await saveAnalytics();
            addConsoleMessage('📈 ' + t('analytics_saved'), 'info');
        };
    }
    const saveW = document.getElementById('saveWattageBtn');
    if (saveW) {
        saveW.onclick = async () => {
            const inputs = Array.from(document.querySelectorAll('input[data-pid]'));
            inputs.forEach(inp => {
                const pid = inp.getAttribute('data-pid');
                const wtype = inp.getAttribute('data-wtype');
                const val = parseFloat(inp.value || '0');
                if (!analytics.wattageByPrinter[pid]) analytics.wattageByPrinter[pid] = { print: 120, idle: 8 };
                analytics.wattageByPrinter[pid][wtype] = isNaN(val) ? analytics.wattageByPrinter[pid][wtype] : val;
            });
            await saveAnalytics();
            addConsoleMessage('📈 ' + t('save_wattage'), 'info');
        };
    }
    if (clearBtn) {
        clearBtn.onclick = () => {
            openClearAnalyticsModal();
        };
    }
    const exportBtn = document.getElementById('exportAnalyticsBtn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            exportAnalytics();
        };
    }
}

function getCurrencySymbol(code) {
    switch(code) {
        case 'RUB': return '₽';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'KZT': return '₸';
        default: return '';
    }
}

function computeAnalytics(periodKey, printerId, customRange) {
    let since = Date.now() - 7*24*60*60*1000;
    if (periodKey === '1d') since = Date.now() - 24*60*60*1000;
    if (periodKey === '30d') since = Date.now() - 30*24*60*60*1000;
    if (periodKey === 'custom' && customRange) since = customRange.from;
    const until = (periodKey === 'custom' && customRange) ? customRange.to : Date.now();
    
    // Ensure printerId is string for consistent comparison
    const printerIdStr = String(printerId);
    
    // Debug: show first few events
    if (analytics.events.length > 0) {
        console.log('Sample of first 3 events:', analytics.events.slice(0, 3).map(e => ({
            printerId: e.printerId,
            printerIdType: typeof e.printerId,
            from: e.from,
            to: e.to,
            ts: new Date(e.ts).toISOString()
        })));
    }
    
    const filtered = analytics.events.filter(e => {
        const eventPrinterIdStr = String(e.printerId);
        const timeMatch = e.ts >= since && e.ts <= until;
        const printerMatch = printerIdStr === 'all' || eventPrinterIdStr === printerIdStr;
        
        // Debug: log comparison for first 5 events
        if (analytics.events.indexOf(e) < 5) {
            console.log(`Event ${analytics.events.indexOf(e)}: printerId="${e.printerId}" (type: ${typeof e.printerId}), comparing with "${printerIdStr}" -> match: ${printerMatch}`);
        }
        
        return timeMatch && printerMatch;
    });
    
    console.log(`computeAnalytics: filtering by printerId="${printerIdStr}", found ${filtered.length} events out of ${analytics.events.length}`);
    
    // Если нет событий - возвращаем нулевые метрики (не считаем период как простой)
    if (filtered.length === 0) {
        console.log('No analytics events found - returning zero metrics');
        return { totalPrintMs: 0, totalIdleMs: 0, kwhTotal: 0, energyCost: 0, efficiency: 0, kwhDailyAvg: 0 };
    }
    
    // Approximate by summing durations between transitions: printing vs not printing
    let totalPrintMs = 0;
    let totalIdleMs = 0;
    let lastTs = since;
    let lastState = 'idle';
    for (const e of filtered) {
        const dur = Math.max(0, e.ts - lastTs);
        // Не считаем offline как idle для энергопотребления
        if (lastState === 'printing') {
            totalPrintMs += dur;
        } else if (lastState !== 'offline') {
            totalIdleMs += dur;
        }
        lastTs = e.ts;
        lastState = e.to;
    }
    // tail until now - НЕ считаем если принтер offline
    const tail = Math.max(0, until - lastTs);
    if (lastState === 'printing') {
        totalPrintMs += tail;
        console.log(`Added tail time as printing: ${(tail / (1000 * 60 * 60)).toFixed(2)}h`);
    } else if (lastState !== 'offline') {
        totalIdleMs += tail;
        console.log(`Added tail time as idle (state: ${lastState}): ${(tail / (1000 * 60 * 60)).toFixed(2)}h`);
    } else {
        console.log(`Skipped tail time for offline state: ${(tail / (1000 * 60 * 60)).toFixed(2)}h`);
    }

    // kWh estimation
    let kwhTotal = 0;
    
    if (printerIdStr === 'all') {
        // For "all" - calculate energy for each printer separately and sum
        const printerTimes = {}; // Track time per printer
        
        console.log('=== "ALL PRINTERS" ENERGY CALCULATION ===');
        console.log('Filtered events:', filtered.length);
        console.log('Unique printer IDs in filtered events:', [...new Set(filtered.map(e => String(e.printerId)))]);
        
        filtered.forEach(e => {
            const pid = String(e.printerId);
            if (!printerTimes[pid]) {
                printerTimes[pid] = { printMs: 0, idleMs: 0 };
            }
        });
        
        // Recalculate time per printer
        let lastTsByPrinter = {};
        let lastStatByPrinter = {};
        
        filtered.forEach(e => {
            const pid = String(e.printerId);
            
            if (lastTsByPrinter[pid]) {
                const dur = Math.max(0, e.ts - lastTsByPrinter[pid]);
                const prevState = lastStatByPrinter[pid];
                // Не считаем offline как idle для энергопотребления
                if (prevState === 'printing') {
                    printerTimes[pid].printMs += dur;
                } else if (prevState !== 'offline') {
                    printerTimes[pid].idleMs += dur;
                }
            }
            
            lastTsByPrinter[pid] = e.ts;
            lastStatByPrinter[pid] = e.to;
        });
        
        // Add tail time for each printer - НЕ считаем offline
        Object.keys(lastTsByPrinter).forEach(pid => {
            const tailTime = Math.max(0, until - lastTsByPrinter[pid]);
            const finalState = lastStatByPrinter[pid];
            if (finalState === 'printing') {
                printerTimes[pid].printMs += tailTime;
            } else if (finalState !== 'offline') {
                printerTimes[pid].idleMs += tailTime;
            }
        });
        
        // Calculate energy for each printer and sum
        console.log('Energy calculation for "All Printers":');
        console.log('Printers with time data:', Object.keys(printerTimes));
        
        Object.keys(printerTimes).forEach(pid => {
            const wattPrint = getPrinterWattage(pid, true);
            const wattIdle = getPrinterWattage(pid, false);
            const printHours = printerTimes[pid].printMs / (1000 * 60 * 60);
            const idleHours = printerTimes[pid].idleMs / (1000 * 60 * 60);
            const kwh = (wattPrint * printerTimes[pid].printMs + wattIdle * printerTimes[pid].idleMs) / (1000 * 60 * 60 * 1000);
            const printer = printers.find(p => String(p.id) === pid);
            const name = printer ? printer.name : pid.substring(0, 10);
            console.log(`  ${name} (${pid.substring(0,10)}...):`);
            console.log(`    Print: ${printHours.toFixed(2)}h × ${wattPrint}W = ${(wattPrint * printHours / 1000).toFixed(3)} kWh`);
            console.log(`    Idle: ${idleHours.toFixed(2)}h × ${wattIdle}W = ${(wattIdle * idleHours / 1000).toFixed(3)} kWh`);
            console.log(`    Total: ${kwh.toFixed(3)} kWh`);
            kwhTotal += kwh;
        });
        console.log(`  === GRAND TOTAL: ${kwhTotal.toFixed(3)} kWh ===`);
    } else {
        // For single printer - use existing calculation
        const wattPrint = getPrinterWattage(printerIdStr, true);
        const wattIdle = getPrinterWattage(printerIdStr, false);
        kwhTotal = (wattPrint * totalPrintMs + wattIdle * totalIdleMs) / (1000 * 60 * 60 * 1000);
        
        const printHours = totalPrintMs / (1000 * 60 * 60);
        const idleHours = totalIdleMs / (1000 * 60 * 60);
        console.log(`=== SINGLE PRINTER ENERGY (${printerIdStr.substring(0,10)}...) ===`);
        console.log(`  Print: ${printHours.toFixed(2)}h × ${wattPrint}W = ${(wattPrint * printHours / 1000).toFixed(3)} kWh`);
        console.log(`  Idle: ${idleHours.toFixed(2)}h × ${wattIdle}W = ${(wattIdle * idleHours / 1000).toFixed(3)} kWh`);
        console.log(`  Total: ${kwhTotal.toFixed(3)} kWh`);
    }
    
    const energyCost = kwhTotal * (analytics.energyCostPerKwh || 0);
    const efficiency = (totalPrintMs + totalIdleMs) > 0 ? (totalPrintMs / (totalPrintMs + totalIdleMs)) * 100 : 0;
    const days = Math.max(1, Math.round((until - since) / (24*60*60*1000)));
    const kwhDailyAvg = kwhTotal / days;
    return { totalPrintMs, totalIdleMs, kwhTotal, energyCost, efficiency, kwhDailyAvg };
}

function aggregateDailyEnergy(periodKey, printerId, customRange, withRaw) {
    // Build daily buckets
    let since = Date.now() - 7*24*60*60*1000;
    if (periodKey === '1d') since = Date.now() - 24*60*60*1000;
    if (periodKey === '30d') since = Date.now() - 30*24*60*60*1000;
    if (periodKey === 'custom' && customRange) since = customRange.from;
    const until = (periodKey === 'custom' && customRange) ? customRange.to : Date.now();
    const dayMs = 24*60*60*1000;
    const buckets = {};
    const push = (ts, printing) => {
        const day = new Date(ts).toISOString().slice(0,10);
        if (!buckets[day]) buckets[day] = { printMs:0, idleMs:0 };
        if (printing) buckets[day].printMs += 60000; else buckets[day].idleMs += 60000;
    };
    // sample each minute based on last state approximation
    let state = 'idle';
    
    // Ensure printerId is string for consistent comparison
    const printerIdStr = String(printerId);
    const events = analytics.events.filter(e => {
        const eventPrinterIdStr = String(e.printerId);
        return e.ts >= since && e.ts <= until && (printerIdStr === 'all' || eventPrinterIdStr === printerIdStr);
    }).sort((a,b)=>a.ts-b.ts);
    
    if (printerIdStr === 'all') {
        // For "all" - track each printer separately
        const bucketsByPrinter = {}; // { printerId: { day: { printMs, idleMs } } }
        
        // Group events by printer
        const eventsByPrinter = {};
        events.forEach(e => {
            const pid = String(e.printerId);
            if (!eventsByPrinter[pid]) eventsByPrinter[pid] = [];
            eventsByPrinter[pid].push(e);
        });
        
        // Process each printer separately
        Object.keys(eventsByPrinter).forEach(pid => {
            const printerEvents = eventsByPrinter[pid];
            let state = 'idle';
            let cursor = since;
            let idx = 0;
            
            while (cursor <= until) {
                while (idx < printerEvents.length && printerEvents[idx].ts <= cursor) {
                    state = (printerEvents[idx].to === 'printing') ? 'printing' : (printerEvents[idx].to === 'paused' ? 'paused' : 'idle');
                    idx++;
                }
                
                const day = new Date(cursor).toISOString().slice(0,10);
                if (!bucketsByPrinter[pid]) bucketsByPrinter[pid] = {};
                if (!bucketsByPrinter[pid][day]) bucketsByPrinter[pid][day] = { printMs: 0, idleMs: 0 };
                
                if (state === 'printing') {
                    bucketsByPrinter[pid][day].printMs += 60000;
                } else {
                    bucketsByPrinter[pid][day].idleMs += 60000;
                }
                
                cursor += 60000;
            }
        });
        
        // Sum energy across all printers by day
        const combinedBuckets = {};
        Object.keys(bucketsByPrinter).forEach(pid => {
            const wPrint = getPrinterWattage(pid, true);
            const wIdle = getPrinterWattage(pid, false);
            
            Object.keys(bucketsByPrinter[pid]).forEach(day => {
                if (!combinedBuckets[day]) {
                    combinedBuckets[day] = { kwh: 0, printMs: 0, idleMs: 0 };
                }
                
                const dayData = bucketsByPrinter[pid][day];
                const kwh = (wPrint * dayData.printMs + wIdle * dayData.idleMs) / (1000*60*60*1000);
                
                combinedBuckets[day].kwh += kwh;
                combinedBuckets[day].printMs += dayData.printMs;
                combinedBuckets[day].idleMs += dayData.idleMs;
            });
        });
        
        const data = Object.keys(combinedBuckets).sort().map(day => {
            return withRaw 
                ? { day, kwh: combinedBuckets[day].kwh, printMs: combinedBuckets[day].printMs, idleMs: combinedBuckets[day].idleMs }
                : { day, kwh: combinedBuckets[day].kwh };
        });
        return data;
        
    } else {
        // Single printer - original logic
        let cursor = since;
        let idx = 0;
        let state = 'idle';
        
        while (cursor <= until) {
            while (idx < events.length && events[idx].ts <= cursor) {
                state = (events[idx].to === 'printing') ? 'printing' : (events[idx].to === 'paused' ? 'paused' : 'idle');
                idx++;
            }
            push(cursor, state === 'printing');
            cursor += 60000;
        }
        
        const data = Object.keys(buckets).sort().map(day => {
            const wPrint = getPrinterWattage(printerIdStr, true);
            const wIdle = getPrinterWattage(printerIdStr, false);
            const kwh = (wPrint * buckets[day].printMs + wIdle * buckets[day].idleMs) / (1000*60*60*1000);
            return withRaw ? { day, kwh, printMs: buckets[day].printMs, idleMs: buckets[day].idleMs } : { day, kwh };
        });
        return data;
    }
}

// Helper function to destroy chart instance if exists
function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
        delete chartInstances[chartId];
    }
    
    // Reset canvas size to prevent accumulation
    const canvas = document.getElementById(chartId);
    if (canvas) {
        // Clear the canvas context
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Remove inline width/height that Chart.js may have set
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Reset style to allow proper resizing
        canvas.style.width = '';
        canvas.style.height = '';
    }
}

function drawEnergyChart(canvasId, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    destroyChart(canvasId);
    
    if (!series || series.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.fillText('No data', 10, 20);
        return;
    }
    
    const labels = series.map(s => {
        const date = new Date(s.day);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });
    
    const data = series.map(s => s.kwh.toFixed(2));
    
    chartInstances[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('energy_consumption_kwh') || 'Energy (kWh)',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                borderRadius: 4,
                maxBarThickness: 60  // Limit bar width
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#ccc', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} kWh`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#888', font: { size: 11 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#888', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                }
            },
            // Control bar sizing
            categoryPercentage: 0.8,
            barPercentage: 0.7
        }
    });
}

function drawEfficiencyLine(canvasId, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    destroyChart(canvasId);
    
    if (!series || series.length === 0) return;
    
    const labels = series.map(s => {
        const date = new Date(s.day);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });
    
    const data = series.map(s => s.eff.toFixed(1));
    
    chartInstances[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('kpi_efficiency') || 'Efficiency (%)',
                data: data,
                borderColor: 'rgba(142, 68, 173, 1)',
                backgroundColor: 'rgba(142, 68, 173, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(142, 68, 173, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#ccc', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#8e44ad',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color: '#888', 
                        font: { size: 11 },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#888', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                }
            }
        }
    });
}

function aggregateDailyEfficiency(periodKey, printerId, customRange) {
    const daily = aggregateDailyEnergy(periodKey, printerId, customRange, true);
    return daily.map(d => {
        const total = (d.printMs||0) + (d.idleMs||0);
        const eff = total>0 ? (d.printMs/total)*100 : 0;
        return { day: d.day, eff };
    });
}

// Draw combined efficiency chart: print/idle time + efficiency line
function drawEfficiencyComboChart(canvasId, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    destroyChart(canvasId);
    
    if (!series || series.length === 0) return;
    
    const labels = series.map(s => {
        const date = new Date(s.day);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });
    
    const printHours = series.map(s => (s.printMs / (1000 * 60 * 60)).toFixed(2));
    const idleHours = series.map(s => (s.idleMs / (1000 * 60 * 60)).toFixed(2));
    const effData = series.map(s => {
        const total = s.printMs + s.idleMs;
        return total > 0 ? ((s.printMs / total) * 100).toFixed(1) : 0;
    });
    
    chartInstances[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: t('kpi_print_time') || 'Print Time',
                    data: printHours,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    maxBarThickness: 50,  // Limit bar width
                    yAxisID: 'y'
                },
                {
                    label: t('kpi_idle_time') || 'Idle Time',
                    data: idleHours,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    maxBarThickness: 50,  // Limit bar width
                    yAxisID: 'y'
                },
                {
                    label: t('kpi_efficiency') || 'Efficiency',
                    data: effData,
                    type: 'line',
                    borderColor: 'rgba(241, 196, 15, 1)',
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(241, 196, 15, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#ccc', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.yAxisID === 'y1') {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                            return `${context.dataset.label}: ${context.parsed.y}h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: { 
                        color: '#888', 
                        font: { size: 11 },
                        callback: function(value) {
                            return value + 'h';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: {
                        display: true,
                        text: t('hours') || 'Hours',
                        color: '#888'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color: '#888', 
                        font: { size: 11 },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: t('kpi_efficiency') || 'Efficiency %',
                        color: '#888'
                    }
                },
                x: {
                    ticks: { color: '#888', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                }
            },
            // Control bar sizing
            categoryPercentage: 0.8,
            barPercentage: 0.7
        }
    });
}

// Get wattage for a specific printer (not "all")
function getPrinterWattage(printerId, printing) {
    const w = analytics.wattageByPrinter[printerId];
    if (w && typeof w === 'object') {
        return printing ? (w.print || 120) : (w.idle || 8);
    }
    return printing ? 120 : 8;
}

// DEPRECATED: For backward compatibility in aggregateDailyEnergy
function averageWattage(printerId, printing) {
    return getPrinterWattage(printerId, printing);
}

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
}

function updatePrinterDisplay(printer) {
    const printerElement = document.querySelector(`.printer-card[data-printer-id="${printer.id}"]`);
    if (!printerElement) return;

    const statusElement = printerElement.querySelector('.printer-status');
    const stateElement = printerElement.querySelector('.state-text');
    const progressElement = printerElement.querySelector('.progress-text-large');
    const fileElement = printerElement.querySelector('.file-text');
    const tempElement = printerElement.querySelector('.temp-text');
    const updatedElement = printerElement.querySelector('.updated-text');
    const ipElement = printerElement.querySelector('.ip-address-large');
    
    if (statusElement) {
        statusElement.className = `printer-status status-${printer.status}`;
        statusElement.textContent = `${getStatusText(printer.status)} ${printer.connectionType ? `(${printer.connectionType})` : ''}`;
    }
    if (stateElement) stateElement.textContent = getStateText(printer);
    if (progressElement) {
        progressElement.textContent = getProgress(printer);
        progressElement.classList.toggle('progress-100-animation', getProgress(printer) === '100%');
    }
    if (fileElement) fileElement.textContent = getFileName(printer);
    if (tempElement) tempElement.innerHTML = getTemperatures(printer); // Используем innerHTML для поддержки HTML-форматирования
    if (updatedElement && printer.lastUpdate) {
        updatedElement.textContent = formatTime(printer.lastUpdate);
    }
    if (ipElement) {
        ipElement.textContent = printer.ip;
    }
    
    printerElement.classList.remove('blinking-red', 'blinking-green', 'blinking-yellow');
    
    if (printer.status === 'paused' || printer.status === 'error' || printer.status === 'complete') {
        printerElement.classList.add('blinking-red');
    } 
    else if (printer.status === 'printing') {
        printerElement.classList.add('blinking-green');
    }
    else if (printer.status === 'ready') {
        printerElement.classList.add('blinking-yellow');
    }
}

function getStatusText(status) {
    return t(status);
}

function getStateText(printer) {
    if (printer.status === 'offline') {
        return t('printer_offline');
    }
    
    const printStats = printer.data.print_stats || {};
    const state = printStats.state || 'unknown';
    
    if (printer.status === 'printing' && state !== 'printing') {
        return t('printing_state');
    }
    
    const stateMap = {
        'ready': t('ready_state'),
        'printing': t('printing_state'),
        'paused': t('paused_state'),
        'error': t('error_state'),
        'complete': t('complete_state'),
        'cancelled': t('cancelled_state'),
        'standby': t('standby_state')
    };
    
    return stateMap[state] || t('ready_state');
}

function getFileName(printer) {
    if (printer.status === 'offline') {
        return t('no_connection');
    }
    
    const printStats = printer.data.print_stats || {};
    const virtualSdcard = printer.data.virtual_sdcard || {};
    
    let filename = printStats.filename;
    
    if ((!filename || filename === 'null' || filename === '' || filename === null) && virtualSdcard.file_path) {
        filename = virtualSdcard.file_path;
    }
    
    const emptyFilenameValues = [null, undefined, '', 'null', 'None', 'none'];
    if (emptyFilenameValues.includes(filename)) {
        return t('no_file');
    }
    
    try {
        const shortName = filename.split('/').pop().split('\\').pop();
        return shortName.length > 25 ? shortName.substring(0, 25) + '...' : shortName;
    } catch (error) {
        console.log('Error parsing filename:', error);
        return filename && filename.length > 25 ? filename.substring(0, 25) + '...' : filename || t('no_file');
    }
}

function getProgress(printer) {
    if (printer.status === 'offline') {
        return 'N/A';
    }
    
    const displayProgress = printer.data.display_status?.progress;
    const virtualSdcardProgress = printer.data.virtual_sdcard?.progress;
    
    const progress = displayProgress !== undefined ? displayProgress : virtualSdcardProgress;
    
    if (progress === undefined || progress === null) return '0%';
    
    const percentage = Math.round(progress * 100);
    return `${percentage}%`;
}

function getTemperatures(printer) {
    if (printer.status === 'offline') {
        return t('no_data');
    }
    
    const extruder = printer.data.extruder || {};
    const bed = printer.data.heater_bed || {};
    
    const extruderTemp = parseFloat(extruder.temperature) || 0;
    const extruderTarget = extruder.target > 0 ? extruder.target : '';
    const bedTemp = parseFloat(bed.temperature) || 0;
    const bedTarget = bed.target > 0 ? bed.target : '';
    
    // Форматируем температуру сопла (красный если > 170°C)
    let extruderHtml = `${t('nozzle')} `;
    if (extruderTemp > 170) {
        extruderHtml += `<span style="color: #ff4444; font-weight: bold;">${extruderTemp.toFixed(1)}°C</span>`;
    } else {
        extruderHtml += `${extruderTemp.toFixed(1)}°C`;
    }
    if (extruderTarget) {
        extruderHtml += ` / ${extruderTarget}°C`;
    }
    
    let result = extruderHtml;
    
    result += ` | ${t('bed')} ${bedTemp.toFixed(1)}°C`;
    if (bedTarget) {
        result += ` / ${bedTarget}°C`;
    }
    
    const chamberTemp = getChamberTemperature(printer);
    if (chamberTemp) {
        result += ` | ${chamberTemp}`;
    }
    
    return result;
}

function getChamberTemperature(printer) {
    // Функция для проверки, является ли датчик MCU
    function isMCUSensor(sensorKey, label) {
        const key = (sensorKey || '').toLowerCase();
        const lbl = (label || '').toLowerCase();
        return key.includes('mcu') || key.includes('mainboard') || key.includes('board') ||
               lbl.includes('mcu') || lbl.includes('mainboard') || lbl.includes('board');
    }
    
    // Функция для форматирования температуры с предупреждениями
    function formatTemperature(temp, label, sensorKey, target) {
        const tempValue = Number(temp).toFixed(1);
        const isMCU = isMCUSensor(sensorKey, label);
        
        // MCU > 60°C: красный + шрифт x2
        if (isMCU && temp > 60) {
            const tempHtml = `<span style="color: #ff4444; font-size: 2em; font-weight: bold;">${tempValue}°C</span>`;
            if (target && target > 0) {
                return `${label}: ${tempHtml} / ${Number(target).toFixed(1)}°C`;
            }
            return `${label}: ${tempHtml}`;
        }
        
        // Обычное отображение
        if (target && target > 0) {
            return `${label}: ${tempValue}°C / ${Number(target).toFixed(1)}°C`;
        }
        return `${label}: ${tempValue}°C`;
    }
    
    // Если пользователь выбрал custom сенсоры, используем их
    if (printer.customTempSensors && printer.customTempSensors.length > 0) {
        const results = [];
        
        for (const sensor of printer.customTempSensors) {
            const sensorData = printer.data[sensor.key];
            if (sensorData) {
                const temp = sensorData.temperature ?? sensorData.temp ?? sensorData.value;
                if (temp !== undefined && temp !== null) {
                    const target = sensorData.target;
                    results.push(formatTemperature(temp, sensor.label, sensor.key, target));
                }
            }
        }
        
        return results.length > 0 ? results.join(' | ') : null;
    }
    
    // Fallback: старый метод автоматического поиска (для совместимости со старыми принтерами)
    function matchName(name) {
        const n = (name || '').toLowerCase();
        return n.includes('chamber') || n.includes('enclosure') || n.includes('case') || n.includes('chamber_temp') || name === 'Chamber Temp';
    }

    // Проходим по всем ключам в printer.data
    for (const [key, value] of Object.entries(printer.data)) {
        // Ищем объекты temperature_sensor, temperature_fan, heater_generic
        if (key.startsWith('temperature_sensor ') || 
            key.startsWith('temperature_fan ') || 
            key.startsWith('heater_generic ')) {
            
            const temp = value && (value.temperature ?? value.temp ?? value.value);
            
            // Если имя подходит и температура валидна
            if (matchName(key) && temp !== undefined && temp !== null && temp > 0) {
                console.log(`🌡️ ${printer.name} - Chamber temperature found in "${key}": ${temp}°C`);
                
                // Если есть target (для heater_generic)
                const target = value.target;
                if (target && target > 0) {
                    return `${t('chamber')}: ${Number(temp).toFixed(1)}°C / ${Number(target).toFixed(1)}°C`;
                }
                
                return `${t('chamber')}: ${Number(temp).toFixed(1)}°C`;
            }
        }
    }

    return null;
}

function formatTime(date) {
    return date ? date.toLocaleTimeString() : t('never');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addConsoleMessage(message, type = 'info') {
    const consoleElement = document.getElementById('messageConsole');
    if (!consoleElement) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `console-message console-${type}`;
    messageElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    consoleElement.appendChild(messageElement);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

function clearConsole() {
    const consoleElement = document.getElementById('messageConsole');
    if (consoleElement) consoleElement.innerHTML = '';
}

function exportLogs() {
    const consoleElement = document.getElementById('messageConsole');
    if (!consoleElement) return;
    
    const logs = consoleElement.innerText;
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3d-printer-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportAnalytics() {
    try {
        // Получаем текущие фильтры из UI
        const period = document.getElementById('analyticsPeriod')?.value || '7d';
        const printerId = document.getElementById('analyticsPrinter')?.value || 'all';
        
        // Получаем custom range если установлен
        let customRange = null;
        if (period === 'custom') {
            const fromStr = document.getElementById('analyticsFrom')?.value;
            const toStr = document.getElementById('analyticsTo')?.value;
            if (fromStr && toStr) {
                customRange = {
                    from: new Date(fromStr).getTime(),
                    to: new Date(toStr + 'T23:59:59').getTime()
                };
            }
        }
        
        // Вычисляем статистику для текущих фильтров
        const stats = computeAnalytics(period, printerId, customRange);
        
        // Получаем информацию о принтерах
        const printersInfo = printers.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            ip: p.ip,
            wattage: analytics.wattageByPrinter[p.id] || { print: 120, idle: 8 }
        }));
        
        // Получаем комментарии к неэффективности
        const inefficiencyComments = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ineff-comment-')) {
                inefficiencyComments[key] = getInefficiencyReason(key);
            }
        });
        
        // Формируем полный экспорт
        const exportData = {
            exportInfo: {
                version: '1.0',
                appVersion: APP_VERSION,
                exportDate: new Date().toISOString(),
                exportTimestamp: Date.now(),
                language: currentLanguage
            },
            filters: {
                period: period,
                printerId: printerId,
                printerName: printerId === 'all' ? 'All Printers' : (printers.find(p => String(p.id) === String(printerId))?.name || 'Unknown'),
                customRange: customRange ? {
                    from: new Date(customRange.from).toISOString(),
                    to: new Date(customRange.to).toISOString()
                } : null
            },
            statistics: {
                totalPrintTime: stats.printTime,
                totalIdleTime: stats.idleTime,
                efficiency: stats.efficiency,
                energyConsumption: stats.energyKwh,
                energyCost: stats.energyCost,
                totalEvents: stats.totalEvents,
                printingEvents: stats.printingEvents,
                completeEvents: stats.completeEvents,
                errorEvents: stats.errorEvents,
                pauseEvents: stats.pauseEvents
            },
            printers: printersInfo,
            analyticsSettings: {
                energyCostPerKwh: analytics.energyCostPerKwh,
                currency: analytics.currency,
                wattageByPrinter: analytics.wattageByPrinter
            },
            rawEvents: analytics.events.map(e => ({
                printerId: e.printerId,
                printerName: printers.find(p => String(p.id) === String(e.printerId))?.name || `Printer ${e.printerId}`,
                timestamp: new Date(e.ts).toISOString(),
                timestampMs: e.ts,
                fromStatus: e.from,
                toStatus: e.to
            })),
            inefficiencyComments: inefficiencyComments,
            systemInfo: {
                totalPrinters: printers.length,
                totalAnalyticsEvents: analytics.events.length,
                dataRetentionDays: 90
            }
        };
        
        // Создаем JSON строку с форматированием для читаемости
        const jsonStr = JSON.stringify(exportData, null, 2);
        
        // Создаем blob и скачиваем файл
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Формируем имя файла с датой и временем
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `3DC-analytics-export-${dateStr}.json`;
        
        a.click();
        URL.revokeObjectURL(url);
        
        addConsoleMessage('📥 ' + t('analytics_exported'), 'success');
        
    } catch (error) {
        console.error('Error exporting analytics:', error);
        addConsoleMessage('❌ Error exporting analytics: ' + error.message, 'error');
    }
}

async function testAllConnections() {
    addConsoleMessage(t('testing_all'), 'info');
    
    for (const printer of printers) {
        await testPrinterConnection(printer, true);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addConsoleMessage(t('testing_complete'), 'info');
}

function updatePollingInterval(seconds) {
    currentPollingInterval = parseInt(seconds);
    addConsoleMessage(`${t('interval_changed')} ${seconds/1000} ${t('seconds')}`, 'info');
    // Перезапускаем интервалы с новым значением
    startPeriodicUpdates();
}

async function savePrintersToStorage() {
    const printersData = printers.map(p => {
        const data = {
            id: p.id,
            name: p.name,
            ip: p.ip,
            type: p.type || 'klipper',
            order: p.order
        };
        
        // Klipper-specific fields
        if (p.type === 'klipper' || !p.type) {
            data.port = p.port;
            data.webPort = p.webPort;
            // Сохраняем настройки температурных датчиков
            if (p.customTempSensors) {
                data.customTempSensors = p.customTempSensors;
            }
        }
        
        // Bambu Lab-specific fields
        if (p.type === 'bambu') {
            data.accessCode = p.accessCode;
            data.serialNumber = p.serialNumber;
        }
        
        return data;
    });
    
    if (window.electronAPI && window.electronAPI.storeSet) {
        await window.electronAPI.storeSet('printers', printersData);
    } else {
        localStorage.setItem('3d-printer-printers', JSON.stringify(printersData));
    }
}

async function loadPrintersFromStorage() {
    let printersData = [];
    if (window.electronAPI && window.electronAPI.storeGet) {
        printersData = await window.electronAPI.storeGet('printers', []);
        if ((!printersData || printersData.length === 0)) {
            const legacy = localStorage.getItem('3d-printer-printers');
            if (legacy) {
                try {
                    printersData = JSON.parse(legacy);
                    await window.electronAPI.storeSet('printers', printersData);
                } catch {}
            }
        }
    } else {
        const stored = localStorage.getItem('3d-printer-printers');
        printersData = stored ? JSON.parse(stored) : [];
    }

    printers = (printersData || []).map((p, index) => ({
        ...p,
        status: 'offline',
        data: {},
        lastUpdate: null,
        connectionType: null,
        order: p.order !== undefined ? p.order : index
    }));
    
    sortPrinters();
    
    // ОПТИМИЗАЦИЯ: Тестируем подключения асинхронно, не блокируя запуск
    setTimeout(() => {
        printers.forEach(printer => {
            testPrinterConnection(printer);
        });
    }, 500);
}

function startPeriodicUpdates() {
    // Очищаем старые интервалы, если они существуют
    if (updateInterval) clearInterval(updateInterval);
    if (retryInterval) clearInterval(retryInterval);
    
    // Создаем новые интервалы и сохраняем ссылки
    updateInterval = setInterval(() => {
        printers.forEach(printer => {
            if (printer.status === 'offline' || printer.connectionType === 'HTTP') {
                updatePrinterData(printer);
            }
        });
    }, currentPollingInterval);
    
    retryInterval = setInterval(() => {
        printers.forEach(printer => {
            if (printer.status === 'offline') {
                const dueAt = nextRetryAt[printer.id] || 0;
                if (Date.now() >= dueAt) {
                    testPrinterConnection(printer);
                }
            }
        });
    }, CONFIG.RETRY_INTERVAL);
}

// Debounced версия sortPrinters для избежания множественных вызовов
function debouncedSortPrinters() {
    if (sortDebounceTimer) clearTimeout(sortDebounceTimer);
    sortDebounceTimer = setTimeout(() => {
        sortPrinters();
    }, 100);
}

// Debounced версия updatePrintersCounter для избежания множественных вызовов
function debouncedUpdatePrintersCounter() {
    if (counterDebounceTimer) clearTimeout(counterDebounceTimer);
    counterDebounceTimer = setTimeout(() => {
        updatePrintersCounter();
    }, 100);
}

// ===== TELEGRAM BOT FUNCTIONS =====

function openTelegramSettingsModal() {
    const modal = document.getElementById('telegramSettingsModal');
    if (modal) {
        modal.style.display = 'block';
        loadTelegramSettings();
    }
}

function closeTelegramSettingsModal() {
    const modal = document.getElementById('telegramSettingsModal');
    if (modal) modal.style.display = 'none';
}

function openTelegramHelp() {
    // Вызываем IPC событие для открытия справки из main.js
    if (window.electronAPI && window.electronAPI.send) {
        window.electronAPI.send('show-telegram-help');
    }
}

async function loadTelegramSettings() {
    let savedConfig = null;
    if (window.electronAPI && window.electronAPI.storeGet) {
        savedConfig = await window.electronAPI.storeGet('telegramConfig', null);
        if (!savedConfig) {
            const legacy = localStorage.getItem('telegramConfig');
            if (legacy) {
                try {
                    savedConfig = JSON.parse(legacy);
                    await window.electronAPI.storeSet('telegramConfig', savedConfig);
                } catch {}
            }
        }
    } else {
        const saved = localStorage.getItem('telegramConfig');
        savedConfig = saved ? JSON.parse(saved) : null;
    }
    if (savedConfig) {
        telegramConfig = {
            ...telegramConfig,
            ...savedConfig,
            notifications: {
                ...telegramConfig.notifications,
                ...savedConfig.notifications
            }
        };
    }
    
    const tokenInput = document.getElementById('telegramBotToken');
    const chatIdInput = document.getElementById('telegramChatId');
    const enabledInput = document.getElementById('telegramEnabled');
    const completeInput = document.getElementById('notifyPrintComplete');
    const startInput = document.getElementById('notifyPrintStart');
    const errorInput = document.getElementById('notifyPrintError');
    const pausedInput = document.getElementById('notifyPrintPaused');
    const offlineInput = document.getElementById('notifyPrinterOffline');
    const onlineInput = document.getElementById('notifyPrinterOnline');
    const inefficiencyInput = document.getElementById('notifyInefficiency');
    const inefficiencyReasonInput = document.getElementById('notifyInefficiencyReason');
    const programStartInput = document.getElementById('notifyProgramStart');
    
    if (tokenInput) tokenInput.value = telegramConfig.botToken || '';
    if (chatIdInput) chatIdInput.value = telegramConfig.chatId || '';
    if (enabledInput) enabledInput.checked = telegramConfig.enabled;
    if (completeInput) completeInput.checked = telegramConfig.notifications.printComplete;
    if (startInput) startInput.checked = telegramConfig.notifications.printStart !== false;
    if (errorInput) errorInput.checked = telegramConfig.notifications.printError;
    if (pausedInput) pausedInput.checked = telegramConfig.notifications.printPaused;
    if (offlineInput) offlineInput.checked = telegramConfig.notifications.printerOffline;
    if (onlineInput) onlineInput.checked = telegramConfig.notifications.printerOnline;
    if (inefficiencyInput) inefficiencyInput.checked = telegramConfig.notifications.inefficiency !== false;
    if (inefficiencyReasonInput) inefficiencyReasonInput.checked = telegramConfig.notifications.inefficiencyReason !== false;
    if (programStartInput) programStartInput.checked = telegramConfig.notifications.programStart !== false;
    
    updateTelegramStatusDisplay();
}

async function saveTelegramSettings() {
    const tokenInput = document.getElementById('telegramBotToken');
    const chatIdInput = document.getElementById('telegramChatId');
    const enabledInput = document.getElementById('telegramEnabled');
    const completeInput = document.getElementById('notifyPrintComplete');
    const startInput = document.getElementById('notifyPrintStart');
    const errorInput = document.getElementById('notifyPrintError');
    const pausedInput = document.getElementById('notifyPrintPaused');
    const offlineInput = document.getElementById('notifyPrinterOffline');
    const onlineInput = document.getElementById('notifyPrinterOnline');
    const inefficiencyInput = document.getElementById('notifyInefficiency');
    const inefficiencyReasonInput = document.getElementById('notifyInefficiencyReason');
    const programStartInput = document.getElementById('notifyProgramStart');
    
    if (tokenInput) telegramConfig.botToken = tokenInput.value.trim();
    if (chatIdInput) telegramConfig.chatId = chatIdInput.value.trim();
    if (enabledInput) telegramConfig.enabled = enabledInput.checked;
    if (completeInput) telegramConfig.notifications.printComplete = completeInput.checked;
    if (startInput) telegramConfig.notifications.printStart = startInput.checked;
    if (errorInput) telegramConfig.notifications.printError = errorInput.checked;
    if (pausedInput) telegramConfig.notifications.printPaused = pausedInput.checked;
    if (offlineInput) telegramConfig.notifications.printerOffline = offlineInput.checked;
    if (onlineInput) telegramConfig.notifications.printerOnline = onlineInput.checked;
    if (inefficiencyInput) telegramConfig.notifications.inefficiency = inefficiencyInput.checked;
    if (inefficiencyReasonInput) telegramConfig.notifications.inefficiencyReason = inefficiencyReasonInput.checked;
    if (programStartInput) telegramConfig.notifications.programStart = programStartInput.checked;
    
    if (window.electronAPI && window.electronAPI.storeSet) {
        await window.electronAPI.storeSet('telegramConfig', telegramConfig);
    } else {
        localStorage.setItem('telegramConfig', JSON.stringify(telegramConfig));
    }
    updateTelegramStatusDisplay();
    addConsoleMessage('🤖 ' + t('telegram_saved'), 'info');
    closeTelegramSettingsModal();
}

async function testTelegramConnection() {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
        addConsoleMessage('❌ ' + t('enter_bot_token_chat_id'), 'error');
        return;
    }
    
    const testMessage = {
        printerName: 'Test Printer',
        printerIP: '192.168.1.100',
        event: 'Test notification',
        message: 'This is a test message from 3D Printer Control Panel'
    };
    
    addConsoleMessage('🤖 ' + t('testing_telegram'), 'info');
    
    const success = await sendTelegramNotification(testMessage);
    if (success) {
        addConsoleMessage('✅ ' + t('telegram_test_success'), 'info');
    } else {
        addConsoleMessage('❌ ' + t('telegram_test_failed'), 'error');
    }
}

async function sendTelegramNotification(notification) {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) {
        return false;
    }
    
    try {
        // Формируем заголовок с IP только если он указан и не пустой
        const header = notification.printerIP && notification.printerIP.trim() 
            ? `🖨️ *${notification.printerName}* (${notification.printerIP})`
            : `🖨️ *${notification.printerName}*`;
        
        const message = `${header}\n` +
                       `📋 *Event:* ${notification.event}\n` +
                       `💬 *Message:* ${notification.message}\n` +
                       `⏰ *Time:* ${new Date().toLocaleString()}`;
        
        const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log('Telegram message sent successfully');
            return true;
        } else {
            console.error('Telegram API error:', data);
            addConsoleMessage(`❌ Telegram error: ${data.description}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        addConsoleMessage('❌ Failed to send Telegram message', 'error');
        return false;
    }
}

function updateTelegramStatusDisplay() {
    const telegramButton = document.querySelector('.btn-telegram');
    if (telegramButton) {
        if (telegramConfig.enabled && telegramConfig.botToken && telegramConfig.chatId) {
            telegramButton.innerHTML = '🤖 Telegram <span class="telegram-status connected">✓</span>';
        } else {
            telegramButton.innerHTML = '🤖 Telegram <span class="telegram-status disconnected">✗</span>';
        }
    }
}

function sendEventNotification(printer, event, message) {
    if (!telegramConfig.enabled) return;
    
    const notification = {
        printerName: printer.name,
        printerIP: printer.ip,
        event: event,
        message: message
    };
    
    let shouldSend = false;
    
    // Проверяем тип события по переведенным строкам
    if (event === t('event_print_complete')) {
        shouldSend = telegramConfig.notifications.printComplete;
    } else if (event === t('event_print_start')) {
        shouldSend = telegramConfig.notifications.printStart;
    } else if (event === t('event_print_error')) {
        shouldSend = telegramConfig.notifications.printError;
    } else if (event === t('event_print_paused')) {
        shouldSend = telegramConfig.notifications.printPaused;
    } else if (event === t('event_printer_offline')) {
        shouldSend = telegramConfig.notifications.printerOffline;
    } else if (event === t('event_printer_online')) {
        shouldSend = telegramConfig.notifications.printerOnline;
    }
    
    if (shouldSend) {
        sendTelegramNotification(notification);
    }
}

// Отправка уведомления о старте программы
function sendProgramStartNotification() {
    if (!telegramConfig.enabled || !telegramConfig.notifications.programStart) {
        return;
    }
    
    const appVersion = document.getElementById('appVersion')?.textContent || 'unknown';
    const printersCount = printers.length;
    
    const notification = {
        printerName: '3D Printer Control Panel',
        printerIP: '', // Пустой IP для системных уведомлений
        event: t('startup_event'),
        message: `${t('startup_version')}: ${appVersion}\n${t('startup_printers_count')}: ${printersCount}\n${t('startup_status')}`
    };
    
    sendTelegramNotification(notification);
}

// ===== BAMBU LAB DATA TRANSMISSION =====

function sendPrinterDataToBambuInterface(printerId) {
    const printer = printers.find(p => p.id === printerId);
    if (!printer || printer.type !== 'bambu') {
        return;
    }

    // Подготавливаем данные для интерфейса
    const interfaceData = {
        id: printer.id,
        name: printer.name,
        ip: printer.ip,
        serialNumber: printer.serialNumber,
        status: printer.status || 'offline',
        progress: 0,
        fileName: 'No file',
        temps: {
            nozzle: 0,
            nozzle_target: 0,
            bed: 0,
            bed_target: 0,
            chamber: null
        }
    };

    // Если есть данные от адаптера, используем их
    if (printer.data) {
        const data = printer.data;
        
        // Прогресс
        if (data.print && data.print.progress !== undefined) {
            interfaceData.progress = Math.round(data.print.progress);
        }
        
        // Имя файла
        if (data.print && data.print.filename) {
            interfaceData.fileName = data.print.filename;
        } else if (data.print && data.print.subtask_name) {
            interfaceData.fileName = data.print.subtask_name;
        }
        
        // Температуры
        if (data.temps) {
            interfaceData.temps = {
                nozzle: Math.round(data.temps.nozzle || 0),
                nozzle_target: Math.round(data.temps.nozzle_target || 0),
                bed: Math.round(data.temps.bed || 0),
                bed_target: Math.round(data.temps.bed_target || 0),
                chamber: data.temps.chamber !== null && data.temps.chamber !== undefined 
                    ? Math.round(data.temps.chamber) 
                    : null
            };
        }
    }

    // Отправляем данные через IPC в окно вкладок
    if (window.electronAPI && window.electronAPI.sendBambuData) {
        window.electronAPI.sendBambuData(printerId, interfaceData);
    }
}

// ===== TEMPERATURE SENSORS SELECTION =====

let currentPrinterForTempSelection = null;

function openTempSensorsEditor(printerId, event) {
    if (event) event.stopPropagation();
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    
    // Убедимся что у принтера есть availableObjects
    if (!printer.availableObjects) {
        addConsoleMessage(`⚠️ ${printer.name} - Discovering sensors...`, 'warning');
        discoverPrinterObjects(printer).then(() => {
            if (printer.availableObjects) {
                showTempSensorsModal(printer, true);
            } else {
                addConsoleMessage(`❌ ${printer.name} - Failed to discover sensors`, 'error');
            }
        });
    } else {
        showTempSensorsModal(printer, true);
    }
}

function showTempSensorsModal(printer, isEdit = false) {
    currentPrinterForTempSelection = printer;
    
    const modal = document.getElementById('tempSensorsModal');
    const content = document.getElementById('tempSensorsContent');
    
    if (!modal || !content) return;
    
    // Получаем все температурные сенсоры
    const tempSensors = [];
    if (printer.availableObjects) {
        printer.availableObjects.forEach(obj => {
            if (obj.startsWith('temperature_sensor ') || 
                obj.startsWith('temperature_fan ') || 
                obj.startsWith('heater_generic ')) {
                tempSensors.push(obj);
            }
        });
    }
    
    if (tempSensors.length === 0) {
        content.innerHTML = '<p style="color: #888;">⚠️ No additional temperature sensors found on this printer.</p>';
        return;
    }
    
    // Функция для автоматического определения названия и описания
    function getSensorSuggestion(sensorKey) {
        const name = sensorKey.toLowerCase();
        
        if (name.includes('chamber') || name.includes('enclosure') || name.includes('case')) {
            return { label: 'Chamber', hint: t('temp_sensors_chamber_hint'), shouldCheck: true };
        }
        if (name.includes('mcu') || name.includes('mainboard') || name.includes('board')) {
            return { label: 'MCU', hint: t('temp_sensors_mcu_hint'), shouldCheck: false };
        }
        if (name.includes('raspberry') || name.includes('pi') || name.includes('host')) {
            return { label: 'RPi', hint: t('temp_sensors_rpi_hint'), shouldCheck: false };
        }
        if (name.includes('ambient') || name.includes('room')) {
            return { label: 'Room', hint: t('temp_sensors_room_hint'), shouldCheck: false };
        }
        
        // По умолчанию - берём короткое имя
        const shortName = sensorKey.replace('temperature_sensor ', '')
                                   .replace('temperature_fan ', '')
                                   .replace('heater_generic ', '');
        return { label: shortName, hint: t('temp_sensors_generic_hint'), shouldCheck: false };
    }
    
    // Генерируем HTML для списка сенсоров
    let html = `
        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #4CAF50;">
            <div style="font-size: 14px; color: #4CAF50; margin-bottom: 5px;">💡 <strong>${t('temp_sensors_tip')}</strong></div>
            <div style="font-size: 13px; color: #ccc; line-height: 1.5;">
                ${t('temp_sensors_tip_text')}
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    tempSensors.forEach((sensor, index) => {
        // Получаем текущие данные сенсора если они есть
        const sensorData = printer.data[sensor];
        const currentTemp = sensorData ? (sensorData.temperature ?? sensorData.temp ?? sensorData.value ?? '—') : '—';
        const tempDisplay = currentTemp !== '—' ? `${Number(currentTemp).toFixed(1)}°C` : '—';
        
        // Получаем умное предложение для этого сенсора
        const suggestion = getSensorSuggestion(sensor);
        
        // Красивое имя (убираем префикс)
        const displayName = sensor.replace('temperature_sensor ', '')
                                  .replace('temperature_fan ', '')
                                  .replace('heater_generic ', '');
        
        // Проверяем, выбран ли этот сенсор уже (проверяем customTempSensors независимо от isEdit)
        const existingSensor = printer.customTempSensors && Array.isArray(printer.customTempSensors)
            ? printer.customTempSensors.find(s => s.key === sensor)
            : null;
        
        // Если уже выбран - используем существующие настройки, иначе - умное предложение
        const isChecked = existingSensor ? 'checked' : (isEdit ? '' : (suggestion.shouldCheck ? 'checked' : ''));
        const labelValue = existingSensor ? existingSensor.label : suggestion.label;
        
        html += `
            <div style="border: 1px solid #444; padding: 12px; border-radius: 8px; background: #2a2a2a;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" 
                                   id="tempSensor_${index}" 
                                   value="${sensor}" 
                                   ${isChecked}
                                   style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                            <div>
                                <div style="font-weight: bold; font-size: 14px;">${displayName}</div>
                                <div style="font-size: 11px; color: #888; margin-top: 2px;">${suggestion.hint}</div>
                            </div>
                        </label>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 20px; font-weight: bold; color: #4CAF50;">${tempDisplay}</div>
                        <input type="text" 
                               id="tempSensorLabel_${index}" 
                               placeholder="${suggestion.label}" 
                               value="${labelValue}"
                               style="width: 150px; padding: 6px 10px; background: #1a1a1a; border: 1px solid #555; border-radius: 4px; color: #fff;">
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
    
    modal.style.display = 'block';
    
    addConsoleMessage(`🌡️ ${printer.name} - Found ${tempSensors.length} temperature sensor(s). Advanced settings opened.`, 'info');
}

function closeTempSensorsModal() {
    const modal = document.getElementById('tempSensorsModal');
    if (modal) modal.style.display = 'none';
    currentPrinterForTempSelection = null;
}

function saveTempSensorsSelection() {
    if (!currentPrinterForTempSelection) return;
    
    const printer = currentPrinterForTempSelection;
    const content = document.getElementById('tempSensorsContent');
    if (!content) return;
    
    // Собираем выбранные сенсоры
    const selectedSensors = [];
    const checkboxes = content.querySelectorAll('input[type="checkbox"]:checked');
    
    checkboxes.forEach((checkbox, idx) => {
        const sensorKey = checkbox.value;
        const labelInput = document.getElementById(`tempSensorLabel_${checkbox.id.split('_')[1]}`);
        const label = labelInput ? labelInput.value.trim() : '';
        
        selectedSensors.push({
            key: sensorKey,
            label: label || sensorKey.replace('temperature_sensor ', '')
                                      .replace('temperature_fan ', '')
                                      .replace('heater_generic ', '')
        });
    });
    
    // Сохраняем выбор
    printer.customTempSensors = selectedSensors;
    savePrintersToStorage();
    
    if (selectedSensors.length > 0) {
        const labels = selectedSensors.map(s => s.label).join(', ');
        addConsoleMessage(`✅ ${printer.name} - Custom temperature sensors: ${labels}`, 'info');
    } else {
        // Очищаем customTempSensors чтобы использовалось автоопределение
        printer.customTempSensors = undefined;
        savePrintersToStorage();
        addConsoleMessage(`✅ ${printer.name} - Using automatic temperature detection`, 'info');
    }
    
    closeTempSensorsModal();
    updatePrinterDisplay(printer);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

window.onclick = function(event) {
    const addModal = document.getElementById('addPrinterModal');
    const editModal = document.getElementById('editPrinterModal');
    const telegramModal = document.getElementById('telegramSettingsModal');
    const bambuInfoModal = document.getElementById('bambuInfoModal');
    const clearAnalyticsModal = document.getElementById('clearAnalyticsModal');
    const ineffCommentModal = document.getElementById('inefficiencyCommentModal');
    const tempSensorsModal = document.getElementById('tempSensorsModal');
    
    if (event.target === addModal) closeAddPrinterModal();
    if (event.target === editModal) closeEditPrinterModal();
    if (event.target === telegramModal) closeTelegramSettingsModal();
    if (event.target === bambuInfoModal) closeBambuInfoModal();
    if (event.target === clearAnalyticsModal) closeClearAnalyticsModal();
    if (event.target === ineffCommentModal) closeInefficiencyCommentModal();
    if (event.target === tempSensorsModal) closeTempSensorsModal();
}

document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        if (document.getElementById('addPrinterModal')?.style.display === 'block') {
            addPrinter();
        }
        if (document.getElementById('editPrinterModal')?.style.display === 'block') {
            savePrinterChanges();
        }
    }
});