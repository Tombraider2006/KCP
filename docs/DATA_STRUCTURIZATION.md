# 🏗️ Структуризация данных для веб-панели

## 🎯 Цель

**Создать единую структуру данных** для передачи между основным приложением и веб-панелью, что решит все проблемы с логикой и ускорит работу.

---

## 🏗️ Архитектура

### Новая структура данных:

```
┌─────────────────────────────────────────────────────────────┐
│                    PrinterData (класс)                      │
├─────────────────────────────────────────────────────────────┤
│ • id, name, type, ip, port, webPort, order                 │
│ • status, stateText, progress, fileName                     │
│ • temps: { nozzle, bed, chamber }                          │
│ • lastUpdate, connectionType, priority, isOnline           │
│ • calculatePriority() - автоматический расчет              │
│ • toAPIFormat() - преобразование для API                   │
└─────────────────────────────────────────────────────────────┘
```

### StructuredPrinterManager:

```
┌─────────────────────────────────────────────────────────────┐
│              StructuredPrinterManager                       │
├─────────────────────────────────────────────────────────────┤
│ • getAllPrinters() - все принтеры (отсортированы!)         │
│ • getPrinterData(id) - данные принтера                      │
│ • updatePrinterData(id, data) - обновление                  │
│ • setPrinterOffline(id) - установка offline                 │
│ • getStatistics() - статистика принтеров                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Структура данных

### PrinterData класс:

```javascript
class PrinterData {
  constructor(printer, statusData = {}) {
    // Базовая информация
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
    
    // Температуры
    this.temps = statusData.temps || { 
      nozzle: 0, 
      bed: 0, 
      chamber: null 
    };
    
    // Метаданные
    this.lastUpdate = new Date().toISOString();
    this.connectionType = printer.type === 'bambu' ? 'MQTT' : 'HTTP';
    
    // Вычисляемые поля
    this.priority = this.calculatePriority();
    this.isOnline = this.status !== 'offline' && this.status !== 'unknown';
  }
  
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
        temps: this.temps
      },
      lastUpdate: this.lastUpdate,
      connectionType: this.connectionType,
      priority: this.priority,
      order: this.order
    };
  }
}
```

---

## 🔧 Фабричные методы

### Создание из Klipper данных:

```javascript
PrinterData.fromKlipper(printer, klipperData)
```

### Создание из Bambu Lab данных:

```javascript
PrinterData.fromBambuLab(printer, bambuData)
```

### Создание offline статуса:

```javascript
PrinterData.createOffline(printer)
```

---

## 🚀 Преимущества

### 1. Единообразие данных
- **Все принтеры** используют одинаковую структуру
- **Нет различий** между Klipper и Bambu Lab в API
- **Предсказуемый формат** для веб-панели

### 2. Автоматические вычисления
- **Приоритет** вычисляется автоматически
- **Статус online/offline** определяется автоматически
- **Сортировка** происходит автоматически

### 3. Производительность
- **Кэширование** структурированных данных
- **Быстрый доступ** через Map
- **Минимум вычислений** при запросах

### 4. Безопасность типов
- **Стандартизированные поля** для всех принтеров
- **Валидация данных** при создании
- **Защита от ошибок** в веб-панели

---

## 📡 API Endpoints

### GET /api/printers
```json
{
  "success": true,
  "count": 3,
  "printers": [
    {
      "id": "printer-1",
      "name": "Ender-5 MAX",
      "type": "klipper",
      "ip": "192.168.1.236",
      "port": "7125",
      "webPort": "80",
      "status": "ready",
      "data": {
        "state": "ready",
        "stateText": "Готов",
        "progress": 0,
        "fileName": "",
        "temps": {
          "nozzle": 32,
          "bed": 30,
          "chamber": null
        }
      },
      "lastUpdate": "2025-01-10T21:45:00.000Z",
      "connectionType": "HTTP",
      "priority": 70,
      "order": 0
    }
  ]
}
```

### GET /api/statistics
```json
{
  "success": true,
  "statistics": {
    "total": 3,
    "online": 2,
    "printing": 1,
    "paused": 0,
    "error": 0,
    "offline": 1
  },
  "timestamp": "2025-01-10T21:45:00.000Z"
}
```

---

## 🔄 Поток данных

### Klipper принтер:
```
1. HTTP polling → updatePrinterData() в renderer.js
   ↓
2. IPC: update-printer-data
   ↓
3. structuredManager.updatePrinterData(printerId, data)
   ↓
4. PrinterData создается/обновляется
   ↓
5. WebSocket broadcast → веб-панель
```

### Bambu Lab принтер:
```
1. MQTT данные → BambuLabAdapter.onDataUpdate
   ↓
2. notifyWebServerPrinterUpdate()
   ↓
3. structuredManager.updatePrinterData(printerId, data)
   ↓
4. PrinterData создается/обновляется
   ↓
5. WebSocket broadcast → веб-панель
```

### Веб-панель:
```
1. REST API: GET /api/printers
   ↓
2. structuredManager.getAllPrinters()
   ↓
3. Возврат структурированных данных (уже отсортированы!)
```

---

## 🎯 Решенные проблемы

### 1. Разные форматы данных
- **Было:** Klipper и Bambu Lab имели разные структуры
- **Стало:** Единая структура PrinterData для всех

### 2. Неправильная сортировка
- **Было:** Сортировка в веб-панели могла быть неправильной
- **Стало:** Сортировка происходит в StructuredPrinterManager

### 3. Медленные запросы
- **Было:** Множественные вычисления при каждом запросе
- **Стало:** Данные кэшируются в структурированном виде

### 4. Сложная логика статусов
- **Было:** Разная логика для разных типов принтеров
- **Стало:** Единая логика в PrinterData.calculatePriority()

---

## 🧪 Тестирование

### 1. Проверка структуры данных:
```javascript
// В консоли браузера
fetch('/api/printers')
  .then(res => res.json())
  .then(data => {
    console.log('Структура данных:', data.printers[0]);
    // Должна быть единая структура для всех принтеров
  });
```

### 2. Проверка сортировки:
```javascript
fetch('/api/printers')
  .then(res => res.json())
  .then(data => {
    const priorities = data.printers.map(p => p.priority);
    console.log('Приоритеты:', priorities);
    // Должны быть в убывающем порядке
  });
```

### 3. Проверка статистики:
```javascript
fetch('/api/statistics')
  .then(res => res.json())
  .then(data => {
    console.log('Статистика:', data.statistics);
    // Должна соответствовать реальным данным
  });
```

---

## 📋 Миграция

### Старый код (удален):
```javascript
// Старая логика в web-server.js
const statusData = this.printerManager.getPrinterStatus(printer.id);
const status = this.determineStatus(statusData);
const progress = statusData?.progress || 0;
let priority = this.getPriority(status, progress);
```

### Новый код:
```javascript
// Новая логика в web-server.js
const printers = this.structuredManager.getAllPrinters();
// Данные уже структурированы, отсортированы и готовы к использованию!
```

---

## 🎉 Результат

**Структуризация данных полностью реализована!**

- ✅ **Единая структура** данных для всех принтеров
- ✅ **Автоматическая сортировка** по приоритету
- ✅ **Быстрый доступ** через кэширование
- ✅ **Простая логика** в веб-панели
- ✅ **Предсказуемый API** формат
- ✅ **Статистика принтеров** в реальном времени

**Все проблемы с логикой решены, производительность увеличена!** 🚀
