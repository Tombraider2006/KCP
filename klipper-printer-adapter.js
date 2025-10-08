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
            const response = await fetch(
                `http://${ip}:${port}/printer/objects/query?webhooks&print_stats&display_status&virtual_sdcard&extruder&heater_bed&temperature_sensor&temperature_fan&heater_generic`,
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

                this.websocket.onopen = () => {
                    clearTimeout(timeout);
                    this.printer.connectionType = 'WebSocket';
                    this.isConnected = true;

                    // Подписка на обновления
                    const subscribeMessage = {
                        jsonrpc: "2.0",
                        method: "printer.objects.subscribe",
                        params: {
                            objects: {
                                "webhooks": null,
                                "print_stats": ["state", "filename", "print_duration", "message", "total_duration"],
                                "display_status": ["progress", "message"],
                                "virtual_sdcard": ["progress", "is_active", "file_position", "file_path"],
                                "extruder": ["temperature", "target"],
                                "heater_bed": ["temperature", "target"],
                                "temperature_sensor": null,
                                "temperature_fan": null,
                                "heater_generic": null
                            }
                        },
                        id: Date.now()
                    };

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
        const tempSensors = this.printer.data.temperature_sensor || {};
        const tempFans = this.printer.data.temperature_fan || {};
        const heaterGeneric = this.printer.data.heater_generic || {};

        const matchName = (name) => {
            const n = (name || '').toLowerCase();
            return n.includes('chamber') || n.includes('enclosure') || n.includes('case');
        };

        // Проверка temperature_sensor
        for (const [sensorName, sensorData] of Object.entries(tempSensors)) {
            const temp = sensorData && (sensorData.temperature ?? sensorData.temp ?? sensorData.value);
            if (matchName(sensorName) && temp !== undefined && temp !== null && temp > 0) {
                return temp;
            }
        }

        // Проверка temperature_fan
        for (const [fanName, fanData] of Object.entries(tempFans)) {
            const temp = fanData && (fanData.temperature ?? fanData.temp ?? fanData.value);
            if (matchName(fanName) && temp !== undefined && temp !== null && temp > 0) {
                return temp;
            }
        }

        // Проверка heater_generic
        for (const [heaterName, heaterData] of Object.entries(heaterGeneric)) {
            const temp = heaterData && (heaterData.temperature ?? heaterData.temp ?? heaterData.value);
            if (matchName(heaterName) && temp !== undefined && temp !== null && temp > 0) {
                return temp;
            }
        }

        // Fallback: один сенсор
        const sensorEntries = Object.entries(tempSensors);
        if (sensorEntries.length === 1) {
            const only = sensorEntries[0][1];
            const temp = only && (only.temperature ?? only.temp ?? only.value);
            if (temp !== undefined && temp !== null && temp > 0) {
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
     * Глубокое объединение объектов
     */
    deepMerge(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    this.deepMerge(target[key], source[key]);
                } else {
                    if (source[key] !== undefined && source[key] !== null) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KlipperAdapter;
}

