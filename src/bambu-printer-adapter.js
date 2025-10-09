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
            temps: {
                nozzle: 0,
                nozzle_target: 0,
                bed: 0,
                bed_target: 0,
                chamber: null  // null пока не получим данные с принтера
            },
            info: {},
            gcode_state: 'IDLE'
        };
        this.isConnected = false;
        this.messageHandler = null;
        // Кэшируем успешный протокол подключения (mqtts или mqtt)
        this.preferredProtocol = printer.preferredProtocol || null;
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

            // Если у нас есть сохраненный успешный протокол, пробуем его первым
            if (this.preferredProtocol) {
                const useSecure = this.preferredProtocol === 'mqtts';
                try {
                    console.log(`Trying cached protocol: ${this.preferredProtocol.toUpperCase()}`);
                    return await this.tryConnect(mqtt, ip, accessCode, serialNumber, useSecure);
                } catch (error) {
                    console.log(`Cached protocol ${this.preferredProtocol.toUpperCase()} failed, trying alternatives...`);
                    // Сбрасываем кэш если не сработало
                    this.preferredProtocol = null;
                    this.printer.preferredProtocol = null;
                }
            }

            // Пробуем сначала MQTTS (новые прошивки 1.09+), потом MQTT (старые прошивки)
            return await this.tryConnect(mqtt, ip, accessCode, serialNumber, true)
                .catch(() => {
                    console.log('MQTTS failed, trying plain MQTT for older firmware...');
                    return this.tryConnect(mqtt, ip, accessCode, serialNumber, false);
                });
        } catch (error) {
            console.error('Bambu Lab connection error:', error);
            throw error;
        }
    }

    /**
     * Попытка подключения через MQTT/MQTTS
     */
    async tryConnect(mqtt, ip, accessCode, serialNumber, useSecure) {
        const protocol = useSecure ? 'mqtts' : 'mqtt';
        const mqttUrl = `${protocol}://${ip}:8883`;
        
        console.log(`Trying ${protocol.toUpperCase()} connection to ${ip}...`);
        
        const options = {
            username: 'bblp',
            password: accessCode,
            clientId: `3DPC_${Date.now()}`,
            reconnectPeriod: 0,
            connectTimeout: 10000,
        };
        
        // Для MQTTS добавляем параметры TLS
        if (useSecure) {
            options.rejectUnauthorized = false;
            options.protocol = 'mqtts';
        }
        
        const client = mqtt.connect(mqttUrl, options);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                client.end();
                reject(new Error(`${protocol.toUpperCase()} connection timeout - превышено время ожидания подключения (10 сек)`));
            }, 10000);

            client.on('connect', () => {
                clearTimeout(timeout);
                this.mqttClient = client;
                this.isConnected = true;
                this.usedProtocol = protocol;
                
                // Сохраняем успешный протокол для будущих подключений
                this.preferredProtocol = protocol;
                this.printer.preferredProtocol = protocol;
                
                console.log(`✅ Connected via ${protocol.toUpperCase()} to Bambu Lab printer (saved for future connections)`);
                
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
                
                // Улучшенная диагностика ошибок
                let errorMessage = `Ошибка подключения к Bambu Lab (${protocol.toUpperCase()}): `;
                
                if (error.code === 'ECONNREFUSED') {
                    errorMessage += 'Принтер недоступен. Проверьте IP адрес и убедитесь, что принтер включен.';
                } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
                    errorMessage += 'Превышено время ожидания. Проверьте сетевое подключение и firewall.';
                } else if (error.code === 'ENOTFOUND') {
                    errorMessage += 'Неверный IP адрес.';
                } else if (error.toString().includes('Not authorized') || error.toString().includes('auth')) {
                    errorMessage += 'Неверный Access Code. Проверьте код в настройках принтера.';
                } else {
                    errorMessage += error.message || error.toString();
                }
                
                console.error('Bambu Lab connection error:', {
                    protocol,
                    ip,
                    error: error.message,
                    code: error.code,
                    fullError: error
                });
                
                reject(new Error(errorMessage));
            });
        });
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
        console.log('Bambu Lab MQTT message received:', JSON.stringify(data, null, 2));
        
        // Логируем ВСЕ ключи верхнего уровня для поиска данных камеры
        console.log('[MQTT] Top level keys:', Object.keys(data));
        if (data.print) {
            console.log('[MQTT] Print keys:', Object.keys(data.print));
        }
        
        // Обновляем данные принтера
        if (data.print) {
            this.printerData.print = { ...this.printerData.print, ...data.print };
            console.log('Updated print data:', this.printerData.print);
            
            // Проверяем поля камеры
            if (data.print.ipcam_dev !== undefined) {
                console.log('[CAMERA] ipcam_dev found:', data.print.ipcam_dev);
            }
            if (data.print.ipcam_record !== undefined) {
                console.log('[CAMERA] ipcam_record found:', data.print.ipcam_record);
            }
        }

        // Температуры - проверяем различные возможные поля
        if (data.print) {
            // Проверяем все возможные поля для температур
            const tempFields = [
                'nozzle_temper', 'nozzle_temperature', 'hotend_temp', 'extruder_temp',
                'bed_temper', 'bed_temperature', 'bed_temp',
                'chamber_temper', 'chamber_temperature', 'chamber_temp'
            ];
            
            console.log('Available temperature fields in data.print:', Object.keys(data.print));
            
            // Сопло
            if (data.print.nozzle_temper !== undefined) {
                this.printerData.temps.nozzle = data.print.nozzle_temper;
                this.printerData.temps.nozzle_target = data.print.nozzle_target_temper || 0;
                console.log('Updated nozzle temp:', data.print.nozzle_temper, 'target:', data.print.nozzle_target_temper);
            }
            if (data.print.nozzle_temperature !== undefined) {
                this.printerData.temps.nozzle = data.print.nozzle_temperature;
                this.printerData.temps.nozzle_target = data.print.nozzle_target_temperature || 0;
                console.log('Updated nozzle temp (alt):', data.print.nozzle_temperature);
            }
            
            // Стол
            if (data.print.bed_temper !== undefined) {
                this.printerData.temps.bed = data.print.bed_temper;
                this.printerData.temps.bed_target = data.print.bed_target_temper || 0;
                console.log('Updated bed temp:', data.print.bed_temper, 'target:', data.print.bed_target_temper);
            }
            if (data.print.bed_temperature !== undefined) {
                this.printerData.temps.bed = data.print.bed_temperature;
                this.printerData.temps.bed_target = data.print.bed_target_temperature || 0;
                console.log('Updated bed temp (alt):', data.print.bed_temperature);
            }
            
            // Камера (фильтруем нереалистично низкие значения < 10°C, которые могут приходить с принтеров без датчика)
            if (data.print.chamber_temper !== undefined) {
                if (data.print.chamber_temper >= 10) {
                    this.printerData.temps.chamber = data.print.chamber_temper;
                    console.log('Updated chamber temp:', data.print.chamber_temper);
                } else {
                    this.printerData.temps.chamber = null;
                    console.log('Ignoring invalid chamber temp:', data.print.chamber_temper, '(too low, sensor likely not present)');
                }
            }
            if (data.print.chamber_temperature !== undefined) {
                if (data.print.chamber_temperature >= 10) {
                    this.printerData.temps.chamber = data.print.chamber_temperature;
                    console.log('Updated chamber temp (alt):', data.print.chamber_temperature);
                } else {
                    this.printerData.temps.chamber = null;
                    console.log('Ignoring invalid chamber temp (alt):', data.print.chamber_temperature, '(too low, sensor likely not present)');
                }
            }
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
        console.log('Getting temperatures - current temps data:', temps);
        console.log('Full printer data:', this.printerData);
        
        const result = {
            extruder: temps.nozzle || 0,
            extruderTarget: temps.nozzle_target || 0,
            bed: temps.bed || 0,
            bedTarget: temps.bed_target || 0,
            chamber: temps.chamber || null
        };
        
        console.log('Returning temperatures:', result);
        return result;
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
     * Проверка наличия камеры у принтера
     */
    hasCamera() {
        // Проверяем модель принтера для определения наличия камеры
        const model = this.printerData.info?.model || this.printerData.info?.machine_type || this.printer.name || '';
        const modelLower = model.toLowerCase();
        
        // bambu-js поддерживает камеру только для P1S и H2D
        const bambuJsSupportedModels = ['p1s', 'h2d'];
        
        // Модели без камеры (обычно нет камеры)
        const modelsWithoutCamera = ['a1', 'a1-mini'];
        
        let hasCamera = false;
        
        if (modelsWithoutCamera.some(m => modelLower.includes(m))) {
            console.log(`[CAMERA CHECK] Model ${model} - camera not typically available (A1 series)`);
            hasCamera = false;
        } else if (bambuJsSupportedModels.some(m => modelLower.includes(m))) {
            console.log(`[CAMERA CHECK] Model ${model} - camera supported by bambu-js`);
            hasCamera = true;
        } else if (modelLower.includes('x1') || modelLower.includes('carbon')) {
            console.log(`[CAMERA CHECK] Model ${model} - camera not supported by bambu-js (X1 series)`);
            hasCamera = false;
        } else {
            // Неизвестная модель - не показываем камеру
            console.log(`[CAMERA CHECK] Unknown model ${model} - camera not supported`);
            hasCamera = false;
        }
        
        return hasCamera;
    }

    /**
     * Получение URL видеопотока камеры
     */
    getCameraStreamUrl() {
        if (!this.hasCamera()) {
            return null;
        }
        
        // Очищаем IP от порта (если есть)
        const cleanIp = this.printer.ip.split(':')[0];
        
        // Bambu Lab использует FTP для доступа к снимкам камеры
        // Требуется аутентификация с access code
        // OrcaSlicer использует: ftp://bblp:ACCESS_CODE@IP/ipcam.jpg
        const accessCode = this.printer.accessCode || '';
        
        if (!accessCode) {
            console.log('[CAMERA URL] No access code - camera requires authentication');
            return null;
        }
        
        // FTP URL с аутентификацией (как в OrcaSlicer)
        const url = `ftp://bblp:${accessCode}@${cleanIp}/ipcam.jpg`;
        
        console.log('[CAMERA URL] Generated camera URL (FTP with auth)');
        console.log('[CAMERA URL] Clean IP:', cleanIp);
        console.log('[CAMERA URL] Has access code:', !!accessCode);
        
        return url;
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

    /**
     * Пауза печати
     */
    async pausePrint() {
        if (!this.mqttClient || !this.isConnected) {
            throw new Error('Printer not connected');
        }
        
        console.log('[BAMBU CONTROL] Sending pause command...');
        
        // Отправляем команду паузы через MQTT
        const command = {
            "print": {
                "sequence_id": Date.now(),
                "command": "pause"
            }
        };
        
        const topic = `device/${this.printer.serialNumber}/request`;
        this.mqttClient.publish(topic, JSON.stringify(command));
        
        console.log('[BAMBU CONTROL] Pause command sent');
    }

    /**
     * Возобновление печати
     */
    async resumePrint() {
        if (!this.mqttClient || !this.isConnected) {
            throw new Error('Printer not connected');
        }
        
        console.log('[BAMBU CONTROL] Sending resume command...');
        
        // Отправляем команду возобновления через MQTT
        const command = {
            "print": {
                "sequence_id": Date.now(),
                "command": "resume"
            }
        };
        
        const topic = `device/${this.printer.serialNumber}/request`;
        this.mqttClient.publish(topic, JSON.stringify(command));
        
        console.log('[BAMBU CONTROL] Resume command sent');
    }

    /**
     * Остановка печати
     */
    async stopPrint() {
        if (!this.mqttClient || !this.isConnected) {
            throw new Error('Printer not connected');
        }
        
        console.log('[BAMBU CONTROL] Sending stop command...');
        
        // Отправляем команду остановки через MQTT
        const command = {
            "print": {
                "sequence_id": Date.now(),
                "command": "stop"
            }
        };
        
        const topic = `device/${this.printer.serialNumber}/request`;
        this.mqttClient.publish(topic, JSON.stringify(command));
        
        console.log('[BAMBU CONTROL] Stop command sent');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BambuLabAdapter;
}

