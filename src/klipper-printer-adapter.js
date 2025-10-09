/**
 * Адаптер для 3D принтеров с Klipper + Moonraker
 * Использует HTTP REST API и WebSocket для связи с принтером
 */

const PrinterAdapter = require('./printer-adapter.js');

class KlipperAdapter extends PrinterAdapter {
    constructor(printer) {
        super(printer);
        this.websocket = null;
        this.isConnected = false;
        this.CONNECTION_TIMEOUT = 8000;
    }

    static getType() {
        return 'klipper';
    }

    /**
     * Тестирование HTTP подключения к Moonraker
     */
    async testConnection() {
        try {
            const { ip, port } = this.printer;
            const response = await fetch(`http://${ip}:${port}/printer/info`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(this.CONNECTION_TIMEOUT)
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.result) {
                    this.deepMerge(this.printer.data, { info: data.result });
                }

                this.printer.connectionType = 'HTTP';
                this.printer.lastUpdate = new Date();
                this.isConnected = true;

                // Получаем объекты принтера
                await this.getPrinterData();
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Получение данных принтера через REST API
     */
    async getPrinterData() {
        try {
            const { ip, port } = this.printer;
            
            // Сначала получаем список всех доступных объектов
            if (!this.availableObjects) {
                await this.discoverObjects();
            }
            
            // Формируем список объектов для запроса
            let queryObjects = ['webhooks', 'print_stats', 'display_status', 'virtual_sdcard', 'extruder', 'heater_bed'];
            
            // Добавляем все найденные temperature_sensor объекты
            if (this.availableObjects) {
                const tempSensors = this.availableObjects.filter(obj => obj.startsWith('temperature_sensor '));
                const tempFans = this.availableObjects.filter(obj => obj.startsWith('temperature_fan '));
                const heaterGeneric = this.availableObjects.filter(obj => obj.startsWith('heater_generic '));
                queryObjects = [...queryObjects, ...tempSensors, ...tempFans, ...heaterGeneric];
            }
            
            const queryString = queryObjects.join('&');
            const response = await fetch(
                `http://${ip}:${port}/printer/objects/query?${queryString}`,
                { signal: AbortSignal.timeout(this.CONNECTION_TIMEOUT) }
            );

            if (response.ok) {
                const data = await response.json();
                
                if (data.result && data.result.status) {
                    this.deepMerge(this.printer.data, data.result.status);
                }

                this.updatePrinterStatus();
                
                return this.printer.data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to get printer objects:', error);
            throw error;
        }
    }
    
    /**
     * Получение списка доступных объектов принтера
     */
    async discoverObjects() {
        try {
            const { ip, port } = this.printer;
            const response = await fetch(
                `http://${ip}:${port}/printer/objects/list`,
                { signal: AbortSignal.timeout(this.CONNECTION_TIMEOUT) }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.objects) {
                    this.availableObjects = data.result.objects;
                    console.log('📋 Available printer objects:', this.availableObjects);
                }
            }
        } catch (error) {
            console.error('Failed to discover printer objects:', error);
            this.availableObjects = null;
        }
    }

    /**
     * Установка WebSocket подключения
     */
    async setupRealtimeConnection() {
        return new Promise((resolve, reject) => {
            const { ip, port } = this.printer;
            const wsUrl = `ws://${ip}:${port}/websocket`;

            try {
                if (this.websocket) {
                    this.websocket.close();
                }

                this.websocket = new WebSocket(wsUrl);

                const timeout = setTimeout(() => {
                    this.websocket.close();
                    reject(new Error('WebSocket connection timeout'));
                }, this.CONNECTION_TIMEOUT);

                this.websocket.onopen = async () => {
                    clearTimeout(timeout);
                    this.printer.connectionType = 'WebSocket';
                    this.isConnected = true;

                    // Получаем список доступных объектов, если еще не получили
                    if (!this.availableObjects) {
                        await this.discoverObjects();
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
                    if (this.availableObjects) {
                        this.availableObjects.forEach(obj => {
                            if (obj.startsWith('temperature_sensor ') || 
                                obj.startsWith('temperature_fan ') || 
                                obj.startsWith('heater_generic ')) {
                                subscribeObjects[obj] = null;
                            }
                        });
                    }

                    // Подписка на обновления
                    const subscribeMessage = {
                        jsonrpc: "2.0",
                        method: "printer.objects.subscribe",
                        params: {
                            objects: subscribeObjects
                        },
                        id: Date.now()
                    };

                    console.log('🔌 WebSocket subscription:', subscribeObjects);
                    this.websocket.send(JSON.stringify(subscribeMessage));
                    resolve(this.websocket);
                };

                this.websocket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                };

                this.websocket.onclose = () => {
                    clearTimeout(timeout);
                    if (this.printer.connectionType === 'WebSocket') {
                        this.printer.connectionType = 'HTTP';
                    }
                    this.isConnected = false;
                };

                this.websocket.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Обработка WebSocket сообщений
     */
    handleWebSocketMessage(data) {
        if (data.method === "notify_status_update") {
            if (data.params && data.params[0]) {
                this.deepMerge(this.printer.data, data.params[0]);
            }

            this.printer.lastUpdate = new Date();
            this.updatePrinterStatus();

            // Вызываем callback если установлен
            if (this.printer.onDataUpdate) {
                this.printer.onDataUpdate(this.printer);
            }
        }
    }

    /**
     * Обновление статуса принтера на основе данных
     */
    updatePrinterStatus() {
        const printStats = this.printer.data.print_stats || {};
        const virtualSdcard = this.printer.data.virtual_sdcard || {};
        const displayStatus = this.printer.data.display_status || {};

        const state = printStats.state || 'unknown';
        const isActive = virtualSdcard.is_active;
        const progress = displayStatus.progress;
        const filename = printStats.filename;
        const filePath = virtualSdcard.file_path;

        const hasActiveFile = !!(filename && filename !== 'null' && filename !== '' && filename !== null) ||
                              !!(filePath && filePath !== 'null' && filePath !== '' && filePath !== null);

        if (state === 'printing') {
            this.printer.status = 'printing';
        } else if (state === 'paused') {
            this.printer.status = 'paused';
        } else if (state === 'error') {
            this.printer.status = 'error';
        } else if (state === 'complete') {
            this.printer.status = 'complete';
        } else if (state === 'ready' || state === 'standby' || state === 'cancelled') {
            if (isActive === true || (progress !== undefined && progress > 0 && progress < 1) || hasActiveFile) {
                this.printer.status = 'printing';
            } else {
                this.printer.status = 'ready';
            }
        } else {
            if (isActive === true || (progress !== undefined && progress > 0 && progress < 1) || hasActiveFile) {
                this.printer.status = 'printing';
            } else {
                this.printer.status = this.printer.connectionType ? 'ready' : 'offline';
            }
        }
    }

    /**
     * Обновление статуса через HTTP polling
     */
    async updateStatus() {
        if (this.printer.connectionType === 'WebSocket') return;

        try {
            const { ip, port } = this.printer;
            const response = await fetch(
                `http://${ip}:${port}/printer/objects/query?print_stats&display_status&virtual_sdcard&extruder&heater_bed`,
                { signal: AbortSignal.timeout(this.CONNECTION_TIMEOUT) }
            );

            if (response.ok) {
                const data = await response.json();

                if (data.result && data.result.status) {
                    this.deepMerge(this.printer.data, data.result.status);
                }

                this.printer.lastUpdate = new Date();
                this.printer.connectionType = 'HTTP';
                this.updatePrinterStatus();
            }
        } catch (error) {
            if (this.printer.status !== 'offline') {
                this.printer.status = 'offline';
                this.printer.connectionType = null;
                this.printer.lastUpdate = new Date();
            }
            throw error;
        }
    }

    /**
     * Получение прогресса печати (0-100)
     */
    getProgress() {
        if (this.printer.status === 'offline') {
            return 0;
        }

        const displayProgress = this.printer.data.display_status?.progress;
        const virtualSdcardProgress = this.printer.data.virtual_sdcard?.progress;

        const progress = displayProgress !== undefined ? displayProgress : virtualSdcardProgress;

        if (progress === undefined || progress === null) return 0;

        return Math.round(progress * 100);
    }

    /**
     * Получение имени файла
     */
    getFileName() {
        if (this.printer.status === 'offline') {
            return 'No connection';
        }

        const printStats = this.printer.data.print_stats || {};
        const virtualSdcard = this.printer.data.virtual_sdcard || {};

        let filename = printStats.filename;

        if ((!filename || filename === 'null' || filename === '' || filename === null) && virtualSdcard.file_path) {
            filename = virtualSdcard.file_path;
        }

        const emptyFilenameValues = [null, undefined, '', 'null', 'None', 'none'];
        if (emptyFilenameValues.includes(filename)) {
            return 'No file';
        }

        try {
            const shortName = filename.split('/').pop().split('\\').pop();
            return shortName.length > 25 ? shortName.substring(0, 25) + '...' : shortName;
        } catch (error) {
            return filename && filename.length > 25 ? filename.substring(0, 25) + '...' : filename || 'No file';
        }
    }

    /**
     * Получение температур
     */
    getTemperatures() {
        const extruder = this.printer.data.extruder || {};
        const bed = this.printer.data.heater_bed || {};

        const temps = {
            extruder: extruder.temperature || 0,
            extruderTarget: extruder.target || 0,
            bed: bed.temperature || 0,
            bedTarget: bed.target || 0,
            chamber: this.getChamberTemperature()
        };

        return temps;
    }

    /**
     * Получение температуры камеры
     */
    getChamberTemperature() {
        const matchName = (name) => {
            const n = (name || '').toLowerCase();
            return n.includes('chamber') || n.includes('enclosure') || n.includes('case');
        };

        // Проходим по всем ключам в printer.data
        for (const [key, value] of Object.entries(this.printer.data)) {
            // Ищем объекты temperature_sensor, temperature_fan, heater_generic
            if (key.startsWith('temperature_sensor ') || 
                key.startsWith('temperature_fan ') || 
                key.startsWith('heater_generic ')) {
                
                const temp = value && (value.temperature ?? value.temp ?? value.value);
                
                // Если имя подходит и температура валидна
                if (matchName(key) && temp !== undefined && temp !== null && temp > 0) {
                    console.log(`🌡️ Chamber temperature found in ${key}: ${temp}°C`);
                    return temp;
                }
            }
        }

        // Fallback: если есть только один temperature_sensor, используем его
        const allTempSensors = Object.entries(this.printer.data)
            .filter(([key]) => key.startsWith('temperature_sensor '));
        
        if (allTempSensors.length === 1) {
            const [sensorKey, sensorData] = allTempSensors[0];
            const temp = sensorData && (sensorData.temperature ?? sensorData.temp ?? sensorData.value);
            if (temp !== undefined && temp !== null && temp > 0) {
                console.log(`🌡️ Using single temperature sensor ${sensorKey}: ${temp}°C`);
                return temp;
            }
        }

        return null;
    }

    /**
     * Получение статуса принтера
     */
    getStatus() {
        return this.printer.status;
    }

    /**
     * Получение текстового описания состояния
     */
    getStateText() {
        if (this.printer.status === 'offline') {
            return 'Принтер offline';
        }

        const printStats = this.printer.data.print_stats || {};
        const state = printStats.state || 'unknown';

        if (this.printer.status === 'printing' && state !== 'printing') {
            return 'Печатает';
        }

        const stateMap = {
            'ready': 'Готов',
            'printing': 'Печатает',
            'paused': 'Пауза',
            'error': 'Ошибка',
            'complete': 'Завершено',
            'cancelled': 'Отменено',
            'standby': 'Режим ожидания'
        };

        return stateMap[state] || 'Готов';
    }

    /**
     * Закрытие подключения
     */
    async closeConnection() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.isConnected = false;
    }

    /**
     * Глубокое объединение объектов (оптимизированная версия)
     */
    deepMerge(target, source) {
        // Используем Object.keys() вместо for...in для лучшей производительности
        const keys = Object.keys(source);
        const len = keys.length;
        
        for (let i = 0; i < len; i++) {
            const key = keys[i];
            const value = source[key];
            
            // Пропускаем undefined и null значения
            if (value === undefined || value === null) {
                continue;
            }
            
            // Проверяем, является ли значение объектом (но не массивом)
            if (typeof value === 'object' && !Array.isArray(value)) {
                // Инициализируем целевой ключ если необходимо
                if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                    target[key] = {};
                }
                this.deepMerge(target[key], value);
            } else {
                target[key] = value;
            }
        }
        return target;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KlipperAdapter;
}

