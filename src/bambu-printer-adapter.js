/**
 * Адаптер для 3D принтеров Bambu Lab
 * Использует MQTT протокол для связи с принтером
 */

const PrinterAdapter = require('./printer-adapter.js');

class BambuLabAdapter extends PrinterAdapter {
    constructor(printer, mqttClient = null) {
        super(printer);
        this.mqttClient = mqttClient;
        this.printerData = {
            print: {},
            temps: {},
            info: {},
            gcode_state: 'IDLE'
        };
        this.isConnected = false;
        this.messageHandler = null;
    }

    static getType() {
        return 'bambu';
    }

    /**
     * Тестирование подключения к принтеру Bambu Lab через MQTT
     */
    async testConnection() {
        try {
            const mqtt = require('mqtt');
            const { ip, accessCode, serialNumber } = this.printer;

            if (!ip || !accessCode || !serialNumber) {
                throw new Error('IP, Access Code и Serial Number обязательны для Bambu Lab');
            }

            // MQTT подключение к принтеру Bambu Lab
            const mqttUrl = `mqtt://${ip}:8883`;
            
            const client = mqtt.connect(mqttUrl, {
                username: 'bblp',
                password: accessCode,
                clientId: `3DPC_${Date.now()}`,
                reconnectPeriod: 0,
                connectTimeout: 8000,
                rejectUnauthorized: false
            });

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    client.end();
                    reject(new Error('Connection timeout'));
                }, 8000);

                client.on('connect', () => {
                    clearTimeout(timeout);
                    this.mqttClient = client;
                    this.isConnected = true;
                    
                    // Подписываемся на топик статуса принтера
                    const topic = `device/${serialNumber}/report`;
                    client.subscribe(topic, (err) => {
                        if (err) {
                            console.error('Subscribe error:', err);
                        }
                    });

                    // Запрашиваем текущий статус
                    this.requestStatus();
                    
                    resolve(true);
                });

                client.on('error', (error) => {
                    clearTimeout(timeout);
                    client.end();
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Bambu Lab connection error:', error);
            throw error;
        }
    }

    /**
     * Запрос текущего статуса принтера
     */
    requestStatus() {
        if (!this.mqttClient || !this.isConnected) return;

        const { serialNumber } = this.printer;
        const requestTopic = `device/${serialNumber}/request`;
        
        // Запрос информации о принтере
        const pushAllCommand = {
            pushing: {
                sequence_id: Date.now().toString(),
                command: "pushall"
            }
        };

        this.mqttClient.publish(requestTopic, JSON.stringify(pushAllCommand));
    }

    /**
     * Установка MQTT подключения с обработчиками сообщений
     */
    async setupRealtimeConnection() {
        if (!this.mqttClient || !this.isConnected) {
            await this.testConnection();
        }

        const { serialNumber } = this.printer;
        const topic = `device/${serialNumber}/report`;

        // Обработка входящих сообщений
        this.messageHandler = (receivedTopic, message) => {
            if (receivedTopic === topic) {
                try {
                    const data = JSON.parse(message.toString());
                    this.handlePrinterMessage(data);
                } catch (error) {
                    console.error('Error parsing MQTT message:', error);
                }
            }
        };

        this.mqttClient.on('message', this.messageHandler);

        // Периодический запрос статуса
        this.statusInterval = setInterval(() => {
            this.requestStatus();
        }, 30000); // каждые 30 секунд
    }

    /**
     * Обработка сообщений от принтера
     */
    handlePrinterMessage(data) {
        // Обновляем данные принтера
        if (data.print) {
            this.printerData.print = { ...this.printerData.print, ...data.print };
        }

        // Температуры
        if (data.print && data.print.nozzle_temper !== undefined) {
            this.printerData.temps.nozzle = data.print.nozzle_temper;
            this.printerData.temps.nozzle_target = data.print.nozzle_target_temper || 0;
        }
        if (data.print && data.print.bed_temper !== undefined) {
            this.printerData.temps.bed = data.print.bed_temper;
            this.printerData.temps.bed_target = data.print.bed_target_temper || 0;
        }
        if (data.print && data.print.chamber_temper !== undefined) {
            this.printerData.temps.chamber = data.print.chamber_temper;
        }

        // Состояние печати
        if (data.print && data.print.gcode_state !== undefined) {
            this.printerData.gcode_state = data.print.gcode_state;
        }

        // Прогресс
        if (data.print && data.print.mc_percent !== undefined) {
            this.printerData.print.progress = data.print.mc_percent;
        }

        // Имя файла
        if (data.print && data.print.subtask_name !== undefined) {
            this.printerData.print.filename = data.print.subtask_name;
        }

        // Обновляем объект принтера
        this.updatePrinterObject();

        // Вызываем callback если установлен
        if (this.printer.onDataUpdate) {
            this.printer.onDataUpdate(this.printer);
        }
    }

    /**
     * Обновление объекта принтера с новыми данными
     */
    updatePrinterObject() {
        this.printer.lastUpdate = new Date();
        this.printer.data = this.printerData;
        this.printer.connectionType = 'MQTT';
    }

    /**
     * Получение данных о принтере
     */
    async getPrinterData() {
        this.requestStatus();
        return this.printerData;
    }

    /**
     * Обновление статуса
     */
    async updateStatus() {
        if (this.isConnected) {
            this.requestStatus();
        } else {
            await this.testConnection();
        }
    }

    /**
     * Получение прогресса печати (0-100)
     */
    getProgress() {
        if (this.printer.status === 'offline') {
            return 0;
        }
        return this.printerData.print?.progress || 0;
    }

    /**
     * Получение имени файла
     */
    getFileName() {
        if (this.printer.status === 'offline') {
            return 'No connection';
        }

        const filename = this.printerData.print?.filename || this.printerData.print?.subtask_name;
        
        if (!filename || filename === '' || filename === 'null') {
            return 'No file';
        }

        try {
            const shortName = filename.split('/').pop().split('\\').pop();
            return shortName.length > 25 ? shortName.substring(0, 25) + '...' : shortName;
        } catch (error) {
            return filename.length > 25 ? filename.substring(0, 25) + '...' : filename;
        }
    }

    /**
     * Получение температур
     */
    getTemperatures() {
        const temps = this.printerData.temps || {};
        return {
            extruder: temps.nozzle || 0,
            extruderTarget: temps.nozzle_target || 0,
            bed: temps.bed || 0,
            bedTarget: temps.bed_target || 0,
            chamber: temps.chamber || null
        };
    }

    /**
     * Получение статуса принтера
     * Bambu Lab states: IDLE, RUNNING, PAUSE, FINISH, FAILED
     */
    getStatus() {
        if (!this.isConnected) {
            return 'offline';
        }

        const state = this.printerData.gcode_state;

        switch (state) {
            case 'RUNNING':
                return 'printing';
            case 'PAUSE':
                return 'paused';
            case 'FINISH':
                return 'complete';
            case 'FAILED':
                return 'error';
            case 'IDLE':
            default:
                return 'ready';
        }
    }

    /**
     * Получение текстового описания состояния
     */
    getStateText() {
        const status = this.getStatus();
        
        const stateMap = {
            'offline': 'Принтер offline',
            'ready': 'Готов',
            'printing': 'Печатает',
            'paused': 'Пауза',
            'complete': 'Завершено',
            'error': 'Ошибка'
        };

        return stateMap[status] || 'Неизвестно';
    }

    /**
     * Закрытие подключения
     */
    async closeConnection() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        if (this.mqttClient) {
            if (this.messageHandler) {
                this.mqttClient.removeListener('message', this.messageHandler);
                this.messageHandler = null;
            }
            this.mqttClient.end();
            this.mqttClient = null;
        }

        this.isConnected = false;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BambuLabAdapter;
}

