// translations.js
const TRANSLATIONS = {
    ru: {
        // Статусы
        'ready': 'Готов',
        'printing': 'Печатает', 
        'error': 'Ошибка',
        'offline': 'Оффлайн',
        'paused': 'На паузе',
        'complete': 'Завершено',
        
        // Состояния
        'ready_state': 'Готов к печати',
        'printing_state': 'Печатает',
        'paused_state': 'На паузе',
        'error_state': 'Ошибка',
        'complete_state': 'Печать завершена',
        'cancelled_state': 'Отменено',
        'standby_state': 'Ожидание',
        
        // Интерфейс
        'title': '🖨️ 3D Printer Control Panel',
        'add_printer': '➕ Добавить принтер',
        'test_all': '🔍 Проверить все подключения',
        'polling_interval': 'Интервал опроса:',
        'printer_status': '📊 Статус принтеров',
        'event_log': '📋 Лог событий',
        'clear_log': '🗑️ Очистить',
        'export_log': '📥 Экспорт',
        'no_printers': 'Нет добавленных принтеров',
        'add_first_printer': 'Добавить первый принтер',
        
        // Модальные окна
        'add_printer_modal': '➕ Добавить принтер',
        'edit_printer_modal': '✏️ Изменить принтер',
        'printer_name': 'Название принтера:',
        'printer_type': 'Тип принтера:',
        'printer_ip': 'IP адрес:',
        'moonraker_port': 'Порт Moonraker:',
        'web_port': 'Порт веб-интерфейса (опционально):',
        'access_code': 'Access Code:',
        'serial_number': 'Серийный номер:',
        'dev_mode_enabled': 'Режим разработчика включен на принтере',
        'dev_mode_warning': '⚠️ Режим разработчика должен быть включен в настройках принтера',
        'access_code_hint': 'Получите в настройках принтера → Сеть → Access Code',
        'serial_number_hint': 'Найдите на наклейке принтера или в настройках',
        'add_button': 'Добавить',
        'save_button': 'Сохранить',
        'cancel_button': 'Отмена',
        
        // Информация принтера
        'address': 'Адрес:',
        'state': 'Состояние:',
        'file': 'Файл:',
        'progress': 'Прогресс:',
        'temperatures': 'Температуры:',
        'updated': 'Обновлено:',
        'no_file': 'Нет файла',
        'nozzle': 'Сопло:',
        'bed': 'Стол:',
        'chamber': 'Камера:',
        
        // Действия
        'edit': '✏️ Изменить',
        'test': '🔄 Проверить',
        'remove': '🗑️ Удалить',
        
        // Сообщения
        'panel_started': '🚀 3D Printer Control Panel запущен',
        'add_printers_hint': '📁 Добавьте принтеры через кнопку "➕ Добавить принтер"',
        'testing_connection': '🔍 Проверяем подключение к',
        'http_success': 'Успешное HTTP подключение',
        'http_failed': 'Не удалось подключиться по HTTP',
        'websocket_connected': 'WebSocket подключен',
        'websocket_disconnected': 'WebSocket отключен',
        'websocket_error': 'WebSocket ошибка',
        'websocket_failed': 'Не удалось установить WebSocket',
        'websocket_success': 'WebSocket успешно подключен',
        'mqtt_connected': 'MQTT подключен',
        'mqtt_disconnected': 'MQTT отключен',
        'mqtt_failed': 'Не удалось подключиться по MQTT',
        'mqtt_success': 'MQTT успешно подключен',
        'using_http_polling': 'использую HTTP опрос',
        'connection_error': 'Ошибка подключения',
        'printer_added': 'Добавлен принтер:',
        'printer_updated': 'Принтер обновлен',
        'printer_removed': 'Удален принтер:',
        'web_interface_opening': 'Открываю веб-интерфейс',
        'web_interface_error': 'Ошибка открытия веб-интерфейса',
        'testing_all': '🚀 Запуск проверки всех подключений...',
        'testing_complete': '✅ Проверка всех подключений завершена',
        'interval_changed': '🔄 Интервал опроса изменен на',
        'seconds': 'секунд',
        'fill_fields': 'Пожалуйста, заполните название принтера и IP адрес',
        'printer_objects_failed': 'Не удалось получить объекты принтера',
        'printer_offline': 'Принтер отключен',
        'no_data': 'Нет данных',
        'no_connection': 'Нет подключения',
        'never': 'Никогда',

        // Счетчик принтеров
        'printing_count': 'Печатает',
        'offline_count': 'Оффлайн', 
        'ready_count': 'Готовы',
        'complete_count': 'Завершено',
        'paused_count': 'Пауза',
        'error_count': 'Ошибка',

        // Telegram Bot
        'telegram_settings': '🤖 Настройки Telegram',
        'bot_token': 'Токен бота:',
        'chat_id': 'ID чата:',
        'enable_notifications': 'Включить уведомления',
        'notify_on': 'Уведомлять о:',
        'print_complete': 'Завершение печати',
        'print_error': 'Ошибка печати', 
        'print_paused': 'Пауза печати',
        'printer_offline': 'Принтер offline',
        'printer_online': 'Принтер online',
        'inefficiency_event': 'Событие неэффективности',
        'inefficiency_reason_saved': 'Сохранение причины неэффективности',
        'program_start': 'Запуск программы',
        'save': 'Сохранить',
        'test_connection': 'Проверить соединение',
        'telegram_saved': 'Настройки Telegram сохранены',
        'enter_bot_token_chat_id': 'Введите токен бота и ID чата',
        'testing_telegram': 'Проверка соединения Telegram...',
        'telegram_test_success': 'Тестовое сообщение Telegram отправлено успешно!',
        'telegram_test_failed': 'Не удалось отправить тестовое сообщение Telegram',
        'get_bot_token_from_botfather': 'Получите у @BotFather в Telegram',
        'send_start_to_bot': 'Отправьте /start вашему боту и проверьте логи',
        'telegram_help': 'Помощь по настройке Telegram бота',

        // Дополнительные ключи
        'printer': 'Принтер',

        // Analytics
        'analytics': '📈 Аналитика',
        'period': 'Период:',
        'printer_filter': 'Принтер:',
        'period_day': 'За день',
        'period_week': 'За неделю',
        'period_month': 'За месяц',
        'period_custom': 'Произвольный',
        'custom_from': 'С',
        'custom_to': 'По',
        'kpi_print_time': 'Общее время печати',
        'kpi_idle_time': 'Общее время простоя',
        'kpi_efficiency': 'Эффективность',
        'kpi_energy_cost': 'Стоимость энергии',
        'tab_efficiency': 'Эффективность',
        'tab_inefficiency': 'Неэффективность',
        'tab_energy': 'Энергопотребление',
        'tab_details': 'Детальная статистика',
        'tab_settings': 'Настройки',
        'energy_details_title': 'Детали энергопотребления',
        'total_consumption': 'Всего потребление',
        'energy_cost': 'Стоимость энергии',
        'avg_daily': 'Среднее дневное потребление',
        'cost_per_kwh': 'Стоимость за 1 кВт⋅ч',
        'save_cost': 'Сохранить стоимость',
        'clear_analytics': 'Очистить все данные аналитики',
        'analytics_saved': 'Стоимость энергии сохранена',
        'analytics_cleared': 'Данные аналитики очищены',
        'export_csv': 'Экспорт CSV',
        'wattage_title': 'Мощность принтера (Вт)',
        'wattage_print': 'Номинальная мощность (печать, Вт)',
        'wattage_idle': 'Мощность простоя (Вт)',
        'wattage_print_hint': 'Оценочная средняя мощность во время печати',
        'wattage_idle_hint': 'Средняя мощность при простое (электроника/вентиляторы)',
        'save_wattage': 'Сохранить мощность',
        'inefficiency_periods': 'Периоды неэффективности',
        'no_inefficiency': 'Нет периодов неэффективности',
        'reason': 'Причина',
        'enter_reason': 'Введите причину...',
        'save_reason': 'Сохранить причину',
        'efficiency_rules_hint': 'Эффективность: перерыв между печатями < 10 мин, паузы < 7 мин',
        'confirm_delete_printer': 'Вы уверены что хотите удалить принтер',
        'unknown_printer': 'Неизвестный принтер',
        
        // Analytics Help
        'analytics_help': '❓ Помощь',
        'analytics_help_title': 'Справка по разделу Аналитика',
        'analytics_help_content': `
            <div class="help-section">
                <h4>📊 Общее описание</h4>
                <p>Раздел "Аналитика" позволяет отслеживать эффективность работы ваших 3D-принтеров, анализировать время печати, простоя и энергопотребление.</p>
            </div>
            
            <div class="help-section">
                <h4>📈 Показатели эффективности (KPI)</h4>
                <ul>
                    <li><strong>Общее время печати</strong> — суммарное время активной печати за выбранный период</li>
                    <li><strong>Общее время простоя</strong> — время, когда принтер был готов, но не печатал</li>
                    <li><strong>Эффективность</strong> — процент времени печати от общего доступного времени принтера</li>
                    <li><strong>Стоимость энергии</strong> — рассчитанная стоимость потребленной электроэнергии</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>⚡ Вкладка "Энергопотребление"</h4>
                <p>Отображает детальную информацию об энергопотреблении:</p>
                <ul>
                    <li>Общее потребление электроэнергии в кВт⋅ч</li>
                    <li>Стоимость потребленной энергии</li>
                    <li>Среднее дневное потребление</li>
                </ul>
                <p><em>Примечание: для точных расчетов необходимо указать мощность принтера в настройках.</em></p>
            </div>
            
            <div class="help-section">
                <h4>📉 Вкладка "Неэффективность"</h4>
                <p>Показывает периоды, когда принтер работал неэффективно:</p>
                <ul>
                    <li>Длительные паузы во время печати (> 7 минут)</li>
                    <li>Длительные перерывы между печатями (> 10 минут)</li>
                </ul>
                <p>Вы можете указать причину неэффективности для каждого периода, чтобы вести учет.</p>
            </div>
            
            <div class="help-section">
                <h4>⚙️ Вкладка "Настройки"</h4>
                <p>Настройки для расчета аналитики:</p>
                <ul>
                    <li><strong>Стоимость за 1 кВт⋅ч</strong> — установите ваш тариф на электроэнергию</li>
                    <li><strong>Мощность принтера</strong> — номинальная мощность при печати и в режиме простоя</li>
                    <li><strong>Очистка данных</strong> — удаление всех накопленных данных аналитики</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>🔍 Фильтры</h4>
                <ul>
                    <li><strong>Период</strong> — выберите временной интервал для анализа (день, неделя, месяц или произвольный)</li>
                    <li><strong>Принтер</strong> — фильтруйте данные по конкретному принтеру или просматривайте статистику по всем</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>💾 Экспорт данных</h4>
                <p>Используйте кнопку "Экспорт CSV" для сохранения детальной статистики в формате CSV для дальнейшего анализа в Excel или других программах.</p>
            </div>
        `
    },
    en: {
        // Statuses
        'ready': 'Ready',
        'printing': 'Printing',
        'error': 'Error', 
        'offline': 'Offline',
        'paused': 'Paused',
        'complete': 'Complete',
        
        // States
        'ready_state': 'Ready to print',
        'printing_state': 'Printing',
        'paused_state': 'Paused',
        'error_state': 'Error',
        'complete_state': 'Print completed',
        'cancelled_state': 'Cancelled',
        'standby_state': 'Standby',
        
        // Interface
        'title': '🖨️ 3D Printer Control Panel',
        'add_printer': '➕ Add Printer',
        'test_all': '🔍 Test All Connections',
        'polling_interval': 'Polling interval:',
        'printer_status': '📊 Printer Status',
        'event_log': '📋 Event Log',
        'clear_log': '🗑️ Clear',
        'export_log': '📥 Export',
        'no_printers': 'No printers added',
        'add_first_printer': 'Add first printer',
        
        // Modal windows
        'add_printer_modal': '➕ Add Printer',
        'edit_printer_modal': '✏️ Edit Printer',
        'printer_name': 'Printer name:',
        'printer_type': 'Printer type:',
        'printer_ip': 'IP address:',
        'moonraker_port': 'Moonraker port:',
        'web_port': 'Web interface port (optional):',
        'access_code': 'Access Code:',
        'serial_number': 'Serial Number:',
        'dev_mode_enabled': 'Developer Mode enabled on printer',
        'dev_mode_warning': '⚠️ Developer mode must be enabled in printer settings',
        'access_code_hint': 'Get from printer settings → Network → Access Code',
        'serial_number_hint': 'Find on printer label or in settings',
        'add_button': 'Add',
        'save_button': 'Save',
        'cancel_button': 'Cancel',
        
        // Printer info
        'address': 'Address:',
        'state': 'State:',
        'file': 'File:',
        'progress': 'Progress:',
        'temperatures': 'Temperatures:',
        'updated': 'Updated:',
        'no_file': 'No file',
        'nozzle': 'Nozzle:',
        'bed': 'Bed:',
        'chamber': 'Chamber:',
        
        // Actions
        'edit': '✏️ Edit',
        'test': '🔄 Test',
        'remove': '🗑️ Remove',
        
        // Messages
        'panel_started': '🚀 3D Printer Control Panel started',
        'add_printers_hint': '📁 Add printers via "➕ Add Printer" button',
        'testing_connection': '🔍 Testing connection to',
        'http_success': 'Successful HTTP connection',
        'http_failed': 'HTTP connection failed',
        'websocket_connected': 'WebSocket connected',
        'websocket_disconnected': 'WebSocket disconnected',
        'websocket_error': 'WebSocket error',
        'websocket_failed': 'Failed to setup WebSocket',
        'websocket_success': 'WebSocket successfully connected',
        'mqtt_connected': 'MQTT connected',
        'mqtt_disconnected': 'MQTT disconnected',
        'mqtt_failed': 'Failed to connect via MQTT',
        'mqtt_success': 'MQTT successfully connected',
        'using_http_polling': 'using HTTP polling',
        'connection_error': 'Connection error',
        'printer_added': 'Printer added:',
        'printer_updated': 'Printer updated',
        'printer_removed': 'Printer removed:',
        'web_interface_opening': 'Opening web interface',
        'web_interface_error': 'Web interface opening error',
        'testing_all': '🚀 Starting all connections test...',
        'testing_complete': '✅ All connections test completed',
        'interval_changed': '🔄 Polling interval changed to',
        'seconds': 'seconds',
        'fill_fields': 'Please fill in printer name and IP address',
        'printer_objects_failed': 'Failed to get printer objects',
        'printer_offline': 'Printer offline',
        'no_data': 'No data',
        'no_connection': 'No connection',
        'never': 'Never',

        // Printers counter
        'printing_count': 'Printing',
        'offline_count': 'Offline',
        'ready_count': 'Ready', 
        'complete_count': 'Complete',
        'paused_count': 'Paused',
        'error_count': 'Error',

        // Telegram Bot
        'telegram_settings': '🤖 Telegram Settings',
        'bot_token': 'Bot Token:',
        'chat_id': 'Chat ID:',
        'enable_notifications': 'Enable notifications',
        'notify_on': 'Notify on:',
        'print_complete': 'Print complete',
        'print_error': 'Print error',
        'print_paused': 'Print paused', 
        'printer_offline': 'Printer offline',
        'printer_online': 'Printer online',
        'inefficiency_event': 'Inefficiency event',
        'inefficiency_reason_saved': 'Inefficiency reason saved',
        'program_start': 'Program start',
        'save': 'Save',
        'test_connection': 'Test Connection',
        'telegram_saved': 'Telegram settings saved',
        'enter_bot_token_chat_id': 'Please enter Bot Token and Chat ID',
        'testing_telegram': 'Testing Telegram connection...',
        'telegram_test_success': 'Telegram test message sent successfully!',
        'telegram_test_failed': 'Failed to send Telegram test message',
        'get_bot_token_from_botfather': 'Get this from @BotFather in Telegram',
        'send_start_to_bot': 'Send /start to your bot and check logs',
        'telegram_help': 'Telegram Bot Setup Help',

        // Additional keys
        'printer': 'Printer',

        // Analytics
        'analytics': '📈 Analytics',
        'period': 'Period:',
        'printer_filter': 'Printer:',
        'period_day': 'Day',
        'period_week': 'Week',
        'period_month': 'Month',
        'period_custom': 'Custom',
        'custom_from': 'From',
        'custom_to': 'To',
        'kpi_print_time': 'Total print time',
        'kpi_idle_time': 'Total idle time',
        'kpi_efficiency': 'Efficiency',
        'kpi_energy_cost': 'Energy cost',
        'tab_efficiency': 'Efficiency',
        'tab_inefficiency': 'Inefficiency',
        'tab_energy': 'Energy',
        'tab_details': 'Details',
        'tab_settings': 'Settings',
        'energy_details_title': 'Energy details',
        'total_consumption': 'Total consumption',
        'energy_cost': 'Energy cost',
        'avg_daily': 'Average daily consumption',
        'cost_per_kwh': 'Cost per 1 kWh',
        'save_cost': 'Save cost',
        'clear_analytics': 'Clear all analytics data',
        'analytics_saved': 'Energy cost saved',
        'analytics_cleared': 'Analytics data cleared',
        'export_csv': 'Export CSV',
        'wattage_title': 'Printer wattage (W)',
        'wattage_print': 'Nominal printing power (W)',
        'wattage_idle': 'Idle power (W)',
        'wattage_print_hint': 'Estimated average power while printing',
        'wattage_idle_hint': 'Average power while idle (electronics/fans)',
        'save_wattage': 'Save wattage',
        'inefficiency_periods': 'Inefficiency periods',
        'no_inefficiency': 'No inefficiency periods',
        'reason': 'Reason',
        'enter_reason': 'Enter reason...',
        'save_reason': 'Save reason',
        'efficiency_rules_hint': 'Efficiency: print gaps < 10 min, pauses < 7 min',
        'confirm_delete_printer': 'Are you sure you want to delete printer',
        'unknown_printer': 'Unknown printer',
        
        // Analytics Help
        'analytics_help': '❓ Help',
        'analytics_help_title': 'Analytics Section Help',
        'analytics_help_content': `
            <div class="help-section">
                <h4>📊 Overview</h4>
                <p>The "Analytics" section allows you to track the efficiency of your 3D printers, analyze printing time, idle time, and energy consumption.</p>
            </div>
            
            <div class="help-section">
                <h4>📈 Key Performance Indicators (KPI)</h4>
                <ul>
                    <li><strong>Total print time</strong> — total active printing time for the selected period</li>
                    <li><strong>Total idle time</strong> — time when the printer was ready but not printing</li>
                    <li><strong>Efficiency</strong> — percentage of printing time from total available printer time</li>
                    <li><strong>Energy cost</strong> — calculated cost of consumed electricity</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>⚡ Energy Tab</h4>
                <p>Displays detailed energy consumption information:</p>
                <ul>
                    <li>Total power consumption in kWh</li>
                    <li>Cost of consumed energy</li>
                    <li>Average daily consumption</li>
                </ul>
                <p><em>Note: for accurate calculations, you need to specify printer wattage in settings.</em></p>
            </div>
            
            <div class="help-section">
                <h4>📉 Inefficiency Tab</h4>
                <p>Shows periods when the printer was operating inefficiently:</p>
                <ul>
                    <li>Long pauses during printing (> 7 minutes)</li>
                    <li>Long gaps between prints (> 10 minutes)</li>
                </ul>
                <p>You can specify a reason for each inefficiency period to keep track.</p>
            </div>
            
            <div class="help-section">
                <h4>⚙️ Settings Tab</h4>
                <p>Settings for analytics calculations:</p>
                <ul>
                    <li><strong>Cost per 1 kWh</strong> — set your electricity tariff</li>
                    <li><strong>Printer wattage</strong> — nominal power when printing and in idle mode</li>
                    <li><strong>Clear data</strong> — delete all accumulated analytics data</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>🔍 Filters</h4>
                <ul>
                    <li><strong>Period</strong> — select time interval for analysis (day, week, month, or custom)</li>
                    <li><strong>Printer</strong> — filter data by specific printer or view statistics for all</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>💾 Data Export</h4>
                <p>Use the "Export CSV" button to save detailed statistics in CSV format for further analysis in Excel or other programs.</p>
            </div>
        `
    }
};

// Функция для получения языка (сохраненный или системный)
async function getAppLanguage() {
    try {
        // Пытаемся получить сохраненный язык
        if (window.electronAPI && window.electronAPI.storeGet) {
            const savedLang = await window.electronAPI.storeGet('appLanguage', null);
            if (savedLang) {
                return savedLang;
            }
        }
    } catch (error) {
        console.error('Error getting saved language:', error);
    }
    
    // Fallback на системный язык
    try {
        return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
    } catch (error) {
        console.error('Error detecting browser language:', error);
        return 'en';
    }
}

// Язык по умолчанию (синхронный доступ для обратной совместимости)
let BROWSER_LANGUAGE = 'en';

// Инициализация языка
(async () => {
    BROWSER_LANGUAGE = await getAppLanguage();
})();

// Функция для получения перевода
function t(key) {
    if (TRANSLATIONS[BROWSER_LANGUAGE] && TRANSLATIONS[BROWSER_LANGUAGE][key]) {
        return TRANSLATIONS[BROWSER_LANGUAGE][key];
    }
    
    // Fallback to English if key not found in current language
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
        console.warn(`Translation key "${key}" not found for language "${BROWSER_LANGUAGE}", using English fallback`);
        return TRANSLATIONS.en[key];
    }
    
    // If key not found in any language, return the key itself
    console.error(`Translation key "${key}" not found in any language`);
    return key;
}

// Функция для обновления языка
async function updateLanguage(lang) {
    BROWSER_LANGUAGE = lang;
    // Перерисовываем интерфейс
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
}