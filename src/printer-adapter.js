/**
 * Базовый абстрактный класс для адаптеров принтеров
 * Определяет единый интерфейс для работы с разными типами 3D принтеров
 */
class PrinterAdapter {
    constructor(printer) {
        if (this.constructor === PrinterAdapter) {
            throw new Error("PrinterAdapter is an abstract class and cannot be instantiated directly");
        }
        this.printer = printer;
    }

    /**
     * Тестирование подключения к принтеру
     * @returns {Promise<boolean>} true если подключение успешно
     */
    async testConnection() {
        throw new Error("Method 'testConnection()' must be implemented");
    }

    /**
     * Получение данных о принтере
     * @returns {Promise<Object>} данные принтера
     */
    async getPrinterData() {
        throw new Error("Method 'getPrinterData()' must be implemented");
    }

    /**
     * Установка WebSocket или MQTT подключения
     * @returns {Promise<void>}
     */
    async setupRealtimeConnection() {
        throw new Error("Method 'setupRealtimeConnection()' must be implemented");
    }

    /**
     * Закрытие подключения
     * @returns {Promise<void>}
     */
    async closeConnection() {
        throw new Error("Method 'closeConnection()' must be implemented");
    }

    /**
     * Обновление статуса принтера
     * @returns {Promise<void>}
     */
    async updateStatus() {
        throw new Error("Method 'updateStatus()' must be implemented");
    }

    /**
     * Получение прогресса печати (0-100)
     * @returns {number}
     */
    getProgress() {
        throw new Error("Method 'getProgress()' must be implemented");
    }

    /**
     * Получение имени файла
     * @returns {string}
     */
    getFileName() {
        throw new Error("Method 'getFileName()' must be implemented");
    }

    /**
     * Получение температур
     * @returns {Object} {extruder, bed, chamber}
     */
    getTemperatures() {
        throw new Error("Method 'getTemperatures()' must be implemented");
    }

    /**
     * Получение статуса принтера (offline, ready, printing, paused, complete, error)
     * @returns {string}
     */
    getStatus() {
        throw new Error("Method 'getStatus()' must be implemented");
    }

    /**
     * Получение текстового описания состояния
     * @returns {string}
     */
    getStateText() {
        throw new Error("Method 'getStateText()' must be implemented");
    }

    /**
     * Проверка типа принтера
     * @returns {string} Тип принтера (klipper, bambu, etc)
     */
    static getType() {
        throw new Error("Static method 'getType()' must be implemented");
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrinterAdapter;
}

