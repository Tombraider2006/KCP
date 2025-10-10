/**
 * Единые структуры данных для передачи между приложением и веб-панелью
 */

/**
 * Стандартная структура данных принтера для web-сервера
 */
class PrinterData {
  constructor(printer, statusData = {}) {
    // Базовая информация о принтере
    this.id = printer.id;
    this.name = printer.name;
    this.type = printer.type || 'klipper';
    this.ip = printer.ip;
    this.port = printer.port || '7125';
    this.webPort = printer.webPort || '80';
    this.order = printer.order || 0;
    
    // Статус и данные
    this.status = statusData.state || 'unknown';
    this.stateText = statusData.stateText || 'Неизвестно';
    this.progress = statusData.progress || 0;
    this.fileName = statusData.fileName || '';
    
    // Температуры (с ограничениями обновления)
    this.temps = statusData.temps || { 
      nozzle: 0, 
      nozzle_target: 0,
      bed: 0, 
      bed_target: 0,
      chamber: null 
    };
    
    // Время печати и оставшееся время
    this.printTime = statusData.printTime || 0;
    this.printTimeLeft = statusData.printTimeLeft || 0;
    this.totalTime = statusData.totalTime || 0;
    
    // Метаданные
    this.lastUpdate = new Date().toISOString();
    this.connectionType = printer.type === 'bambu' ? 'MQTT' : 'HTTP';
    
    // Вычисляемые поля
    this.priority = this.calculatePriority();
    this.isOnline = this.status !== 'offline' && this.status !== 'unknown';
    
    // Цвет карточки и визуальные признаки
    this.cardColor = this.getCardColor();
    this.statusColor = this.getStatusColor();
    this.progressColor = this.getProgressColor();
    this.tempColor = this.getTempColor();
    
    // Позиция в списке (вычисляется автоматически)
    this.listPosition = 0;
    
    // Настройки обновления (из панели)
    this.updateInterval = statusData.updateInterval || 30000; // 30 сек по умолчанию
    this.lastTempUpdate = statusData.lastTempUpdate || 0;
    this.lastProgressUpdate = statusData.lastProgressUpdate || 0;
    
    // Дополнительные данные карточки
    this.layerHeight = statusData.layerHeight || 0;
    this.filamentUsed = statusData.filamentUsed || 0;
    this.fanSpeed = statusData.fanSpeed || 0;
    this.printSpeed = statusData.printSpeed || 0;
  }
  
  /**
   * Вычисление приоритета для сортировки (как в renderer.js)
   */
  calculatePriority() {
    const basePriority = {
      'error': 100,
      'paused': 90,
      'complete': 80,
      'ready': 70,
      'printing': 50,
      'offline': 10,
      'unknown': 5
    };
    
    let priority = basePriority[this.status] || 0;
    
    // Печать на 95-100% поднимается выше ready
    if (this.status === 'printing' && this.progress >= 95 && this.progress <= 100) {
      priority = 75;
    }
    
    return priority;
  }
  
  /**
   * Цвет карточки (рамка)
   */
  getCardColor() {
    switch (this.status) {
      case 'error':
      case 'paused':
      case 'complete':
        return '#dc3545'; // Красный - критические статусы
      case 'ready':
        return '#ffc107'; // Желтый - готов
      case 'printing':
        return '#28a745'; // Зеленый - печатает
      case 'offline':
        return '#6c757d'; // Серый - offline
      default:
        return '#17a2b8'; // Синий - неизвестно
    }
  }
  
  /**
   * Цвет статуса
   */
  getStatusColor() {
    switch (this.status) {
      case 'error':
        return '#dc3545'; // Красный
      case 'paused':
        return '#fd7e14'; // Оранжевый
      case 'complete':
        return '#6f42c1'; // Фиолетовый
      case 'ready':
        return '#ffc107'; // Желтый
      case 'printing':
        return '#28a745'; // Зеленый
      case 'offline':
        return '#6c757d'; // Серый
      default:
        return '#17a2b8'; // Синий
    }
  }
  
  /**
   * Цвет прогресса
   */
  getProgressColor() {
    if (this.progress >= 95 && this.progress <= 100) {
      return '#ffc107'; // Желтый - почти готово
    } else if (this.progress >= 75) {
      return '#28a745'; // Зеленый - хорошо идет
    } else if (this.progress >= 25) {
      return '#17a2b8'; // Синий - идет
    } else {
      return '#6c757d'; // Серый - начало
    }
  }
  
  /**
   * Цвет температуры (сопло >170°C = красный)
   */
  getTempColor() {
    const nozzleTemp = this.temps.nozzle || 0;
    if (nozzleTemp > 170) {
      return '#dc3545'; // Красный - горячо
    }
    return '#17a2b8'; // Синий - нормально
  }
  
  /**
   * Проверка, нужно ли обновлять температуры
   */
  shouldUpdateTemps() {
    const now = Date.now();
    return (now - this.lastTempUpdate) >= this.updateInterval;
  }
  
  /**
   * Проверка, нужно ли обновлять прогресс
   */
  shouldUpdateProgress() {
    const now = Date.now();
    return (now - this.lastProgressUpdate) >= this.updateInterval;
  }
  
  /**
   * Обновление времени последнего обновления температур
   */
  updateTempTimestamp() {
    this.lastTempUpdate = Date.now();
  }
  
  /**
   * Обновление времени последнего обновления прогресса
   */
  updateProgressTimestamp() {
    this.lastProgressUpdate = Date.now();
  }
  
  /**
   * Создание offline статуса
   */
  static createOffline(printer) {
    const statusData = {
      state: 'offline',
      stateText: 'Offline',
      progress: 0,
      fileName: '',
      temps: { nozzle: 0, bed: 0, chamber: null }
    };
    
    return new PrinterData(printer, statusData);
  }
  
  /**
   * Преобразование в формат для API
   */
  toAPIFormat() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      ip: this.ip,
      port: this.port,
      webPort: this.webPort,
      status: this.status,
      data: {
        state: this.status,
        stateText: this.stateText,
        progress: this.progress,
        fileName: this.fileName,
        temps: this.temps,
        printTime: this.printTime,
        printTimeLeft: this.printTimeLeft,
        totalTime: this.totalTime,
        layerHeight: this.layerHeight,
        filamentUsed: this.filamentUsed,
        fanSpeed: this.fanSpeed,
        printSpeed: this.printSpeed
      },
      lastUpdate: this.lastUpdate,
      connectionType: this.connectionType,
      priority: this.priority,
      order: this.order,
      listPosition: this.listPosition,
      
      // Визуальные признаки
      colors: {
        card: this.cardColor,
        status: this.statusColor,
        progress: this.progressColor,
        temp: this.tempColor
      },
      
      // Настройки обновления
      updateSettings: {
        interval: this.updateInterval,
        lastTempUpdate: this.lastTempUpdate,
        lastProgressUpdate: this.lastProgressUpdate,
        shouldUpdateTemps: this.shouldUpdateTemps(),
        shouldUpdateProgress: this.shouldUpdateProgress()
      }
    };
  }
  
  /**
   * Обновление данных с учетом ограничений по времени
   */
  update(statusData) {
    if (statusData.state) this.status = statusData.state;
    if (statusData.stateText) this.stateText = statusData.stateText;
    if (statusData.fileName) this.fileName = statusData.fileName;
    
    // Обновление прогресса только если прошло достаточно времени
    if (statusData.progress !== undefined && this.shouldUpdateProgress()) {
      this.progress = statusData.progress;
      this.updateProgressTimestamp();
    }
    
    // Обновление температур только если прошло достаточно времени
    if (statusData.temps && this.shouldUpdateTemps()) {
      this.temps = { ...this.temps, ...statusData.temps };
      this.updateTempTimestamp();
    }
    
    // Обновление дополнительных данных
    if (statusData.printTime !== undefined) this.printTime = statusData.printTime;
    if (statusData.printTimeLeft !== undefined) this.printTimeLeft = statusData.printTimeLeft;
    if (statusData.totalTime !== undefined) this.totalTime = statusData.totalTime;
    if (statusData.layerHeight !== undefined) this.layerHeight = statusData.layerHeight;
    if (statusData.filamentUsed !== undefined) this.filamentUsed = statusData.filamentUsed;
    if (statusData.fanSpeed !== undefined) this.fanSpeed = statusData.fanSpeed;
    if (statusData.printSpeed !== undefined) this.printSpeed = statusData.printSpeed;
    
    // Обновление настроек обновления
    if (statusData.updateInterval) this.updateInterval = statusData.updateInterval;
    
    this.lastUpdate = new Date().toISOString();
    this.priority = this.calculatePriority();
    this.isOnline = this.status !== 'offline' && this.status !== 'unknown';
    
    // Пересчет цветов
    this.cardColor = this.getCardColor();
    this.statusColor = this.getStatusColor();
    this.progressColor = this.getProgressColor();
    this.tempColor = this.getTempColor();
  }
}

/**
 * Менеджер структурированных данных принтеров
 */
class StructuredPrinterManager {
  constructor(store, bambuConnections) {
    this.store = store;
    this.bambuConnections = bambuConnections;
    this.printerCache = new Map(); // id -> PrinterData
    this.lastStatusCache = new Map(); // id -> последний известный статус для offline принтеров
    this.criticalUpdateQueue = []; // очередь критических обновлений
  }
  
  /**
   * Получить все принтеры в структурированном формате (оптимизированный)
   */
  getAllPrinters() {
    const printers = this.store.get('printers', []);
    
    const printerDataList = [];
    const offlinePrinters = [];
    
    // Разделяем принтеры на активные и offline
    printers.forEach(printer => {
      let printerData;
      
      if (this.printerCache.has(printer.id)) {
        printerData = this.printerCache.get(printer.id);
      } else {
        printerData = new PrinterData(printer);
      }
      
      // Offline принтеры добавляем только при изменении статуса
      if (printerData.status === 'offline') {
        const lastStatus = this.lastStatusCache.get(printer.id);
        if (lastStatus !== printerData.status) {
          offlinePrinters.push(printerData);
          this.lastStatusCache.set(printer.id, printerData.status);
        }
      } else {
        printerDataList.push(printerData);
      }
    });
    
    // Сортируем активные принтеры по приоритету (критические первыми)
    printerDataList.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.order - b.order;
    });
    
    // Добавляем offline принтеры в конец (только при изменении статуса)
    printerDataList.push(...offlinePrinters);
    
    // Устанавливаем позиции в списке
    printerDataList.forEach((printerData, index) => {
      printerData.listPosition = index + 1;
    });
    
    return printerDataList.map(printerData => printerData.toAPIFormat());
  }
  
  /**
   * Получить данные конкретного принтера
   */
  getPrinterData(printerId) {
    if (this.printerCache.has(printerId)) {
      return this.printerCache.get(printerId).toAPIFormat();
    }
    
    const printers = this.store.get('printers', []);
    const printer = printers.find(p => p.id === printerId);
    
    if (!printer) {
      return null;
    }
    
    // Создаем базовую структуру
    const printerData = new PrinterData(printer);
    return printerData.toAPIFormat();
  }
  
  /**
   * Обновить данные принтера (с проверкой критичности)
   */
  updatePrinterData(printerId, statusData) {
    const printers = this.store.get('printers', []);
    const printer = printers.find(p => p.id === printerId);
    
    if (!printer) {
      return false;
    }
    
    const isCriticalUpdate = this.isCriticalStatus(statusData.state);
    let printerData;
    
    if (this.printerCache.has(printerId)) {
      // Обновляем существующие данные
      printerData = this.printerCache.get(printerId);
      const oldStatus = printerData.status;
      printerData.update(statusData);
      
      // Проверяем, изменился ли статус на критический
      if (isCriticalUpdate && oldStatus !== statusData.state) {
        this.addToCriticalQueue(printerId, printerData);
      }
    } else {
      // Создаем новые данные
      printerData = new PrinterData(printer, statusData);
      this.printerCache.set(printerId, printerData);
      
      // Если статус критический - добавляем в очередь
      if (isCriticalUpdate) {
        this.addToCriticalQueue(printerId, printerData);
      }
    }
    
    // Обновляем кэш статусов для offline принтеров
    this.lastStatusCache.set(printerId, printerData.status);
    
    return true;
  }
  
  /**
   * Проверка, является ли статус критическим
   */
  isCriticalStatus(status) {
    const criticalStatuses = ['error', 'paused', 'complete'];
    return criticalStatuses.includes(status);
  }
  
  /**
   * Добавление в очередь критических обновлений
   */
  addToCriticalQueue(printerId, printerData) {
    const criticalUpdate = {
      printerId,
      timestamp: Date.now(),
      data: printerData.toAPIFormat()
    };
    
    // Удаляем старые обновления для этого принтера
    this.criticalUpdateQueue = this.criticalUpdateQueue.filter(
      update => update.printerId !== printerId
    );
    
    // Добавляем новое критическое обновление в начало очереди
    this.criticalUpdateQueue.unshift(criticalUpdate);
    
    // Ограничиваем размер очереди (максимум 10 критических обновлений)
    if (this.criticalUpdateQueue.length > 10) {
      this.criticalUpdateQueue = this.criticalUpdateQueue.slice(0, 10);
    }
  }
  
  /**
   * Получить критические обновления из очереди
   */
  getCriticalUpdates() {
    const updates = this.criticalUpdateQueue.slice();
    this.criticalUpdateQueue = []; // Очищаем очередь после получения
    return updates;
  }
  
  /**
   * Создать offline статус для принтера
   */
  setPrinterOffline(printerId) {
    const printers = this.store.get('printers', []);
    const printer = printers.find(p => p.id === printerId);
    
    if (!printer) {
      return false;
    }
    
    const lastStatus = this.lastStatusCache.get(printerId);
    
    // Создаем offline данные
    const offlineData = PrinterData.createOffline(printer);
    this.printerCache.set(printerId, offlineData);
    
    // Обновляем кэш статусов только при изменении
    if (lastStatus !== 'offline') {
      this.lastStatusCache.set(printerId, 'offline');
      return true; // Статус изменился - нужно передать в веб-панель
    }
    
    return false; // Статус не изменился - не передаем
  }
  
  /**
   * Очистить данные принтера
   */
  clearPrinterData(printerId) {
    this.printerCache.delete(printerId);
  }
  
  /**
   * Очистить все данные
   */
  clearAllData() {
    this.printerCache.clear();
  }
  
  /**
   * Получить статистику принтеров
   */
  getStatistics() {
    const printers = this.getAllPrinters();
    
    const stats = {
      total: printers.length,
      online: 0,
      printing: 0,
      paused: 0,
      error: 0,
      offline: 0
    };
    
    printers.forEach(printer => {
      switch (printer.status) {
        case 'printing':
          stats.printing++;
          stats.online++;
          break;
        case 'paused':
          stats.paused++;
          stats.online++;
          break;
        case 'error':
          stats.error++;
          stats.online++;
          break;
        case 'ready':
        case 'complete':
          stats.online++;
          break;
        case 'offline':
          stats.offline++;
          break;
      }
    });
    
    return stats;
  }
  
  /**
   * Получить оптимизированный пакет данных для веб-панели
   */
  getOptimizedPackage() {
    const criticalUpdates = this.getCriticalUpdates();
    const activePrinters = this.getActivePrinters();
    const statistics = this.getStatistics();
    
    return {
      critical: criticalUpdates, // Критические обновления первыми
      active: activePrinters,   // Активные принтеры
      stats: statistics,        // Статистика
      timestamp: Date.now(),
      packageSize: JSON.stringify({
        critical: criticalUpdates,
        active: activePrinters,
        stats: statistics
      }).length
    };
  }
  
  /**
   * Получить все принтеры (включая offline)
   */
  getActivePrinters() {
    const printers = this.store.get('printers', []);
    
    return printers
      .map(printer => {
        let printerData;
        
        if (this.printerCache.has(printer.id)) {
          printerData = this.printerCache.get(printer.id);
        } else {
          // Создаём данные принтера если их нет в кэше
          printerData = new PrinterData(printer);
          // НЕ добавляем в кэш, т.к. это временные данные до первого обновления
        }
        
        return printerData.toAPIFormat();
      })
      .sort((a, b) => {
        // Сортировка по приоритету (критические первыми)
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.order - b.order;
      });
  }
}

module.exports = {
  PrinterData,
  StructuredPrinterManager
};
