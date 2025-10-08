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
        'print_start': 'Начало печати',
        'print_error': 'Ошибка печати', 
        'print_paused': 'Пауза печати',
        'printer_offline': 'Принтер offline',
        'printer_online': 'Принтер online',
        'inefficiency_event': 'Событие неэффективности',
        'inefficiency_reason_saved': 'Сохранение причины неэффективности',
        'program_start': 'Запуск программы',
        'startup_event': '🚀 Запуск программы',
        'startup_version': 'Версия',
        'startup_printers_count': 'Принтеров в системе',
        'startup_status': 'Статус: готово к работе',
        'inefficiency_notification_event': '⚠️ Неэффективность',
        'operator_report_event': '📝 Отчет оператора',
        'inefficiency_gap': 'Gap (перерыв между печатями)',
        'inefficiency_pause': 'Pause (пауза во время печати)',
        'inefficiency_type': 'Тип',
        'inefficiency_duration': 'Длительность',
        'inefficiency_start': 'Начало',
        'inefficiency_end': 'Конец',
        'inefficiency_period': 'Период',
        'inefficiency_reason': 'Причина',
        'event_print_complete': '✅ Печать завершена',
        'event_print_error': '❌ Ошибка печати',
        'event_print_paused': '⏸️ Печать на паузе',
        'event_printer_offline': '🔌 Принтер отключен',
        'event_printer_online': '🟢 Принтер подключен',
        'event_print_start': '▶️ Печать начата',
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
        
        // New Efficiency Tab Translations
        'energy_consumption_kwh': 'Потребление энергии (кВт⋅ч)',
        'hours': 'Часы',
        'efficiency_overview': 'Обзор эффективности',
        'efficiency_stats': 'Статистика',
        'avg_efficiency': 'Средняя эффективность',
        'best_day': 'Лучший день',
        'worst_day': 'Худший день',
        'total_days': 'Всего дней',
        'efficiency_tips': 'Рекомендации',
        'eff_tip_good': 'Отличная эффективность! Ваши принтеры хорошо используются.',
        'eff_tip_medium': 'Хорошая эффективность, но есть возможности для улучшения.',
        'eff_tip_low': 'Обнаружена низкая эффективность.',
        'eff_tip_reduce_gaps': 'Уменьшите перерывы между печатями',
        'eff_tip_batch': 'Рассмотрите возможность пакетной печати',
        'eff_tip_check_ineff': 'Проверьте вкладку Неэффективность для деталей',
        'eff_tip_schedule': 'Оптимизируйте планирование печати',
        'eff_tip_minimize': 'Минимизируйте время простоя',
        'no_data_available': 'Нет доступных данных',
        'all_printers': 'Все принтеры',
        
        // Bambu Lab Info Modal
        'bambu_info_modal_title': '🎋 Bambu Lab',
        'bambu_info_message': 'Принтеры Bambu Lab используют мобильное приложение <strong>Bambu Handy</strong> или <strong>Bambu Studio</strong> для управления.',
        'bambu_info_no_web': 'Локальный веб-интерфейс недоступен для данного типа принтера.',
        'bambu_info_help': 'Помощь',
        'bambu_lab_setup_help': 'Настройка принтеров Bambu Lab',
        
        // Inefficiency Comment Modal
        'ineff_comment_modal_title_add': '📝 Добавить комментарий',
        'ineff_comment_modal_title_edit': '✏️ Редактировать комментарий',
        'ineff_comment_type_label': 'Тип:',
        'ineff_comment_duration_label': 'Длительность:',
        'ineff_comment_period': 'Период:',
        'ineff_comment_label': 'Комментарий / Причина:',
        'ineff_comment_placeholder': 'Введите причину этого периода неэффективности...',
        'ineff_comment_hint': '💡 Пример: Замена материала, обслуживание, ожидание деталей, перерыв оператора и т.д.',
        'ineff_comment_save': '💾 Сохранить комментарий',
        'ineff_comment_delete': '🗑️ Удалить',
        'ineff_comment_cancel': 'Отмена',
        'ineff_status_no_comment': '📝 Без комментария',
        'ineff_status_has_comment': '✅ Заполнено',
        'ineff_btn_add_comment': '➕ Добавить комментарий',
        'ineff_btn_edit_comment': '✏️ Редактировать',
        'ineff_btn_view_comment': '👁️ Просмотр',
        'ineff_type_gap': 'Перерыв между печатями',
        'ineff_type_pause': 'Пауза во время печати',
        'ineff_comment_saved': 'Комментарий сохранен',
        'ineff_comment_deleted': 'Комментарий удален',
        
        // Clear Analytics Modal
        'clear_analytics_title': '⚠️ Очистить данные аналитики',
        'clear_analytics_warning1': '⚠️ Внимание! Это действие необратимо!',
        'clear_analytics_warning2': 'Все данные аналитики будут безвозвратно удалены, включая:',
        'clear_analytics_item1': 'История времени печати и простоя',
        'clear_analytics_item2': 'Все события изменения статуса',
        'clear_analytics_item3': 'Периоды неэффективности и отчёты операторов',
        'clear_analytics_item4': 'Статистика энергопотребления',
        'clear_analytics_warning3': 'Настройки мощности (ватты, стоимость кВт⋅ч) будут сохранены.',
        'clear_analytics_confirm': 'Вы уверены, что хотите продолжить?',
        'clear_analytics_yes': 'Да, очистить все данные',
        'clear_analytics_no': 'Отмена',
        
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
            
            <div class="help-section" style="background: #2a2a2a; padding: 15px; border-radius: 8px; border-left: 4px solid #00d4ff;">
                <h4>⚡ Как рассчитать мощность 3D принтера</h4>
                <p>Для точного расчёта энергопотребления необходимо знать мощность вашего принтера:</p>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">📋 Способ 1: Спецификация производителя</h5>
                <ul>
                    <li>Проверьте техническую документацию принтера</li>
                    <li>Посмотрите на наклейку на блоке питания (Voltage × Amperage = Watts)</li>
                    <li>Пример: 24V × 15A = 360W (номинальная мощность)</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">📊 Способ 2: Измерение ваттметром</h5>
                <ul>
                    <li><strong>Рекомендуется!</strong> Используйте бытовой ваттметр (умную розетку с измерением мощности)</li>
                    <li>Подключите принтер через ваттметр</li>
                    <li>Измерьте реальное потребление во время печати (обычно 50-70% от номинала)</li>
                    <li>Измерьте потребление в режиме ожидания (обычно 5-15W)</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">🔢 Способ 3: Расчёт по компонентам</h5>
                <p>Суммируйте мощность основных компонентов:</p>
                <ul>
                    <li><strong>Нагревательный стол:</strong> обычно 150-300W (зависит от размера)</li>
                    <li><strong>Хотенд:</strong> обычно 40-60W</li>
                    <li><strong>Шаговые моторы:</strong> 4-6 моторов × 10-20W = 40-120W</li>
                    <li><strong>Электроника:</strong> платы, дисплей ≈ 10-20W</li>
                    <li><strong>Вентиляторы:</strong> 2-5W каждый</li>
                    <li><strong>Освещение/камера:</strong> 5-10W (если есть)</li>
                </ul>
                <p><em>Пример расчёта: 200W (стол) + 50W (хотенд) + 80W (моторы) + 15W (электроника) + 10W (вентиляторы) = 355W</em></p>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">💡 Типичные значения для разных принтеров</h5>
                <ul>
                    <li><strong>Малые принтеры</strong> (Ender 3, Prusa Mini): 120-200W печать, 5-10W простой</li>
                    <li><strong>Средние принтеры</strong> (Prusa i3, Ender 5): 200-350W печать, 8-15W простой</li>
                    <li><strong>Большие принтеры</strong> (CR-10, Voron): 350-600W печать, 10-20W простой</li>
                    <li><strong>Bambu Lab</strong> (X1, P1): 250-400W печать, 10-15W простой</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">⚙️ Где вносить данные</h5>
                <p>Перейдите в <strong>Аналитика → Настройки</strong> и укажите:</p>
                <ul>
                    <li><strong>Номинальная мощность (печать, Вт)</strong> — средняя мощность во время активной печати</li>
                    <li><strong>Мощность простоя (Вт)</strong> — мощность когда принтер включен, но не печатает</li>
                </ul>
                <p style="margin-top: 10px; color: #888;"><em>💡 Совет: Лучше указать реальные измеренные значения для более точного расчёта стоимости энергии!</em></p>
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
        'print_start': 'Print start',
        'print_error': 'Print error',
        'print_paused': 'Print paused', 
        'printer_offline': 'Printer offline',
        'printer_online': 'Printer online',
        'inefficiency_event': 'Inefficiency event',
        'inefficiency_reason_saved': 'Inefficiency reason saved',
        'program_start': 'Program start',
        'startup_event': '🚀 Program Start',
        'startup_version': 'Version',
        'startup_printers_count': 'Printers in system',
        'startup_status': 'Status: ready to work',
        'inefficiency_notification_event': '⚠️ Inefficiency',
        'operator_report_event': '📝 Operator Report',
        'inefficiency_gap': 'Gap (break between prints)',
        'inefficiency_pause': 'Pause (during printing)',
        'inefficiency_type': 'Type',
        'inefficiency_duration': 'Duration',
        'inefficiency_start': 'Start',
        'inefficiency_end': 'End',
        'inefficiency_period': 'Period',
        'inefficiency_reason': 'Reason',
        'event_print_complete': '✅ Print Complete',
        'event_print_error': '❌ Print Error',
        'event_print_paused': '⏸️ Print Paused',
        'event_printer_offline': '🔌 Printer Offline',
        'event_printer_online': '🟢 Printer Online',
        'event_print_start': '▶️ Print Started',
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
        
        // New Efficiency Tab Translations
        'energy_consumption_kwh': 'Energy Consumption (kWh)',
        'hours': 'Hours',
        'efficiency_overview': 'Efficiency Overview',
        'efficiency_stats': 'Statistics',
        'avg_efficiency': 'Average Efficiency',
        'best_day': 'Best Day',
        'worst_day': 'Worst Day',
        'total_days': 'Total Days',
        'efficiency_tips': 'Tips',
        'eff_tip_good': 'Excellent efficiency! Your printers are well utilized.',
        'eff_tip_medium': 'Good efficiency, but there\'s room for improvement.',
        'eff_tip_low': 'Low efficiency detected.',
        'eff_tip_reduce_gaps': 'Reduce gaps between prints',
        'eff_tip_batch': 'Consider batch printing',
        'eff_tip_check_ineff': 'Check Inefficiency tab for details',
        'eff_tip_schedule': 'Optimize print scheduling',
        'eff_tip_minimize': 'Minimize idle time',
        'no_data_available': 'No data available',
        'all_printers': 'All Printers',
        
        // Bambu Lab Info Modal
        'bambu_info_modal_title': '🎋 Bambu Lab',
        'bambu_info_message': 'Bambu Lab printers use mobile app <strong>Bambu Handy</strong> or <strong>Bambu Studio</strong> for control.',
        'bambu_info_no_web': 'There is no local web interface available for this printer type.',
        'bambu_info_help': 'Help',
        'bambu_lab_setup_help': 'Bambu Lab Printer Setup',
        
        // Inefficiency Comment Modal
        'ineff_comment_modal_title_add': '📝 Add Comment',
        'ineff_comment_modal_title_edit': '✏️ Edit Comment',
        'ineff_comment_type_label': 'Type:',
        'ineff_comment_duration_label': 'Duration:',
        'ineff_comment_period': 'Period:',
        'ineff_comment_label': 'Comment / Reason:',
        'ineff_comment_placeholder': 'Enter the reason for this inefficiency period...',
        'ineff_comment_hint': '💡 Example: Material change, maintenance, waiting for parts, operator break, etc.',
        'ineff_comment_save': '💾 Save Comment',
        'ineff_comment_delete': '🗑️ Delete',
        'ineff_comment_cancel': 'Cancel',
        'ineff_status_no_comment': '📝 No Comment',
        'ineff_status_has_comment': '✅ Commented',
        'ineff_btn_add_comment': '➕ Add Comment',
        'ineff_btn_edit_comment': '✏️ Edit',
        'ineff_btn_view_comment': '👁️ View',
        'ineff_type_gap': 'Gap between prints',
        'ineff_type_pause': 'Pause during printing',
        'ineff_comment_saved': 'Comment saved',
        'ineff_comment_deleted': 'Comment deleted',
        
        // Clear Analytics Modal
        'clear_analytics_title': '⚠️ Clear Analytics Data',
        'clear_analytics_warning1': '⚠️ Warning! This action is irreversible!',
        'clear_analytics_warning2': 'All analytics data will be permanently deleted, including:',
        'clear_analytics_item1': 'Print and idle time history',
        'clear_analytics_item2': 'All status transition events',
        'clear_analytics_item3': 'Inefficiency periods and operator reports',
        'clear_analytics_item4': 'Energy consumption statistics',
        'clear_analytics_warning3': 'Power settings (wattage, cost per kWh) will be preserved.',
        'clear_analytics_confirm': 'Are you sure you want to continue?',
        'clear_analytics_yes': 'Yes, Clear All Data',
        'clear_analytics_no': 'Cancel',
        
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
            
            <div class="help-section" style="background: #2a2a2a; padding: 15px; border-radius: 8px; border-left: 4px solid #00d4ff;">
                <h4>⚡ How to Calculate 3D Printer Power Consumption</h4>
                <p>For accurate energy consumption calculations, you need to know your printer's power consumption:</p>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">📋 Method 1: Manufacturer Specifications</h5>
                <ul>
                    <li>Check the printer's technical documentation</li>
                    <li>Look at the power supply label (Voltage × Amperage = Watts)</li>
                    <li>Example: 24V × 15A = 360W (nominal power)</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">📊 Method 2: Measurement with Power Meter</h5>
                <ul>
                    <li><strong>Recommended!</strong> Use a household wattmeter (smart plug with power measurement)</li>
                    <li>Connect the printer through the power meter</li>
                    <li>Measure actual consumption during printing (usually 50-70% of nominal)</li>
                    <li>Measure consumption in standby mode (usually 5-15W)</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">🔢 Method 3: Component Calculation</h5>
                <p>Sum the power of main components:</p>
                <ul>
                    <li><strong>Heated bed:</strong> usually 150-300W (depends on size)</li>
                    <li><strong>Hotend:</strong> usually 40-60W</li>
                    <li><strong>Stepper motors:</strong> 4-6 motors × 10-20W = 40-120W</li>
                    <li><strong>Electronics:</strong> boards, display ≈ 10-20W</li>
                    <li><strong>Fans:</strong> 2-5W each</li>
                    <li><strong>Lighting/camera:</strong> 5-10W (if present)</li>
                </ul>
                <p><em>Example calculation: 200W (bed) + 50W (hotend) + 80W (motors) + 15W (electronics) + 10W (fans) = 355W</em></p>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">💡 Typical Values for Different Printers</h5>
                <ul>
                    <li><strong>Small printers</strong> (Ender 3, Prusa Mini): 120-200W printing, 5-10W idle</li>
                    <li><strong>Medium printers</strong> (Prusa i3, Ender 5): 200-350W printing, 8-15W idle</li>
                    <li><strong>Large printers</strong> (CR-10, Voron): 350-600W printing, 10-20W idle</li>
                    <li><strong>Bambu Lab</strong> (X1, P1): 250-400W printing, 10-15W idle</li>
                </ul>
                
                <h5 style="color: #00d4ff; margin-top: 15px;">⚙️ Where to Enter Data</h5>
                <p>Go to <strong>Analytics → Settings</strong> and specify:</p>
                <ul>
                    <li><strong>Nominal printing power (W)</strong> — average power during active printing</li>
                    <li><strong>Idle power (W)</strong> — power when printer is on but not printing</li>
                </ul>
                <p style="margin-top: 10px; color: #888;"><em>💡 Tip: It's better to specify real measured values for more accurate energy cost calculations!</em></p>
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