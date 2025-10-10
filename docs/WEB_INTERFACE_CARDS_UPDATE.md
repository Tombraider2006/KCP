# ✅ Обновление карточек принтеров в Web-интерфейсе

## 🎯 Цель

Сделать карточки принтеров в web-интерфейсе **идентичными** основному приложению:
- ✅ Те же поля
- ✅ Те же стили
- ✅ Та же логика
- ✅ Только кнопка "Проверить"
- ✅ Звуковые уведомления

---

## 🎨 Изменения в дизайне

### 1. Модальное окно - темная тема

**Файл:** `src/index.html`

**Было:** Белый фон, светлые поля
**Стало:** Темный фон как в основном приложении

**Цвета:**
- Фон блоков: `rgba(0, 212, 255, 0.1)`
- Рамки: `rgba(0, 212, 255, 0.3)`
- Текст: `#00d4ff`, `#7ea8c8`, `#b8d4e8`
- Поля ввода: темный фон `rgba(10, 22, 40, 0.5)`

---

## 📊 Структура карточек

### Карточка принтера теперь включает:

```html
<div class="printer-card {status}">
    <div class="printer-header">
        <div class="printer-name">Название 🖨️ Тип</div>
        <div class="printer-status">СТАТУС</div>
    </div>
    <div class="printer-info">
        <div class="info-item">
            <span>Адрес:</span>
            <span class="ip-address-large">192.168.1.100</span>
        </div>
        <div class="info-item">
            <span>Состояние:</span>
            <span class="state-text">Печатает</span>
        </div>
        <div class="info-item">
            <span>Файл:</span>
            <span class="file-text">benchy.gcode</span>
        </div>
        <div class="info-item">
            <span>Прогресс:</span>
            <span class="progress-text-large">45%</span>
        </div>
        <div class="info-item">
            <span>Температуры:</span>
            <span class="temp-text">🌡️ 210°C / 🛏️ 60°C</span>
        </div>
        <div class="info-item">
            <span>Обновлено:</span>
            <span class="updated-text">2м назад</span>
        </div>
    </div>
    <div class="printer-actions">
        <button class="btn btn-warning btn-small">🔗 Проверить</button>
    </div>
</div>
```

---

## 🔧 Вспомогательные функции

**Файл:** `src/web-interface/app.js`

### Добавлены функции как в основном приложении:

```javascript
getStatusTextFromPrinter(printer)  // "Печатает", "Готов", "Ошибка"
getStateText(printer)               // Детальное состояние
getFileName(printer)                // Имя файла или "—"
getProgress(printer)                // "45%" или "—"
getTemperatures(printer)            // "🌡️ 210°C / 🛏️ 60°C"
formatTime(timestamp)               // "2м назад", "1ч назад"
```

### Логика получения данных:

```javascript
// Из printer.data (данные от приложения)
const state = printer.data.state || printer.data.print_stats?.state;
const filename = printer.data.filename || printer.data.print_stats?.filename;
const progress = printer.data.progress || calculated;
const temps = printer.data.temps;
```

---

## 🔊 Звуковые уведомления

### 1. Скопирован звуковой файл

```
src/windows-xp-print-complete.mp3 
    → src/web-interface/windows-xp-print-complete.mp3
```

### 2. Добавлена логика воспроизведения

```javascript
// Предзагрузка при старте
notificationSound = new Audio('windows-xp-print-complete.mp3');
notificationSound.volume = 0.5; // 50% громкости

// Функция воспроизведения
function playCriticalSound() {
    notificationSound.play().catch(err => {
        console.error('Error playing sound:', err);
    });
}

// Проверка критических статусов
function checkCriticalStatus(printerId, newStatus) {
    const oldStatus = previousStatuses.get(printerId);
    const criticalStatuses = ['error', 'paused', 'complete'];
    
    // Звук при смене статуса на критический
    if (criticalStatuses.includes(newStatus) && oldStatus !== newStatus) {
        playCriticalSound();
    }
}
```

### 3. Интеграция с WebSocket

```javascript
socket.on('printer-status', (data) => {
    const printer = printers.find(p => p.id === data.printerId);
    if (printer) {
        // Проверяем и воспроизводим звук
        checkCriticalStatus(data.printerId, printer.status);
        updatePrinterCard(data.printerId);
    }
});
```

---

## 🎨 Стили карточек

**Файл:** `src/web-interface/style.css`

### Карточка принтера:

```css
.printer-card {
    background: rgba(10, 22, 40, 0.7);
    border: 2px solid rgba(0, 212, 255, 0.4);
    border-radius: 10px;
    padding: 18px;
    min-height: 280px;
    display: flex;
    flex-direction: column;
}

.printer-card:hover {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    border-color: rgba(0, 212, 255, 0.6);
}
```

### Статус принтера:

```css
.status-printing {
    background: rgba(76, 175, 80, 0.3);
    color: #81c784;
    border: 1px solid rgba(76, 175, 80, 0.6);
}

.status-ready {
    background: rgba(255, 235, 59, 0.3);
    color: #ffd54f;
}

.status-complete,
.status-error,
.status-paused {
    background: rgba(244, 67, 54, 0.3);
    color: #ef5350;
    animation: blink 1.5s infinite; /* Мигание! */
}
```

### Специальные поля:

```css
.ip-address-large {
    font-size: 1.1em;
    font-weight: 600;
    color: #00d4ff !important;
}

.progress-text-large {
    font-size: 1.8em; /* Увеличенный прогресс! */
    font-weight: 700;
    color: #4CAF50 !important;
}

.progress-100-animation {
    animation: blink 1.5s infinite; /* Мигание при 100%! */
}

.temp-text {
    color: #ff9800 !important; /* Оранжевая температура */
    font-weight: 600;
}
```

---

## 🔌 API обновлен

**Файл:** `src/web-server.js`

### Endpoint `/api/printers` теперь возвращает:

```json
{
  "success": true,
  "count": 2,
  "printers": [
    {
      "id": "printer-1",
      "name": "Ender 3 Pro",
      "type": "klipper",
      "ip": "192.168.1.101",
      "status": "printing",              // ← Определяется автоматически
      "data": {                          // ← Полные данные
        "state": "printing",
        "filename": "benchy.gcode",
        "progress": 45,
        "temps": {
          "nozzle": 210,
          "bed": 60
        }
      },
      "lastUpdate": "2025-10-10T20:00:00.000Z",
      "connectionType": "HTTP"           // ← MQTT или HTTP
    }
  ]
}
```

### Метод `determineStatus()`:

```javascript
determineStatus(statusData) {
    const state = (statusData.state || '').toLowerCase();
    
    if (state.includes('error')) return 'error';
    if (state.includes('pause')) return 'paused';
    if (state.includes('complete')) return 'complete';
    if (state.includes('print') || state === 'running') return 'printing';
    if (state.includes('ready') || state === 'idle') return 'ready';
    if (state.includes('offline')) return 'offline';
    
    return 'unknown';
}
```

---

## 🎯 Функция "Проверить"

**Файл:** `src/web-interface/app.js`

```javascript
async function testPrinter(printerId) {
    const response = await fetch(`/api/printers/${printerId}/status`);
    const data = await response.json();
    
    if (data.success) {
        alert('✅ Принтер доступен!\n\nСтатус: ' + data.status.state);
    } else {
        alert('❌ Ошибка проверки принтера:\n' + data.error);
    }
}
```

Вызывается из карточки:
```html
<button onclick="testPrinter('printer-1')">🔗 Проверить</button>
```

---

## 📝 Изменённые файлы

| Файл | Изменения | Описание |
|------|-----------|----------|
| `src/web-interface/app.js` | +90 строк | Вспомогательные функции, звук, проверка |
| `src/web-interface/style.css` | ~120 строк | Темная тема, стили карточек |
| `src/web-interface/windows-xp-print-complete.mp3` | Скопирован | Звуковой файл |
| `src/web-server.js` | +20 строк | Метод determineStatus(), обновлен API |
| `src/index.html` | ~60 строк | Темные стили модального окна |
| `src/translations.js` | +26 строк | Переводы для web-сервера (RU/EN) |
| `src/renderer.js` | +3 строки | Глобальная переменная currentLang |

---

## ✅ Результат

### Карточки принтеров теперь:

1. ✅ **Те же поля** что в основном приложении
2. ✅ **Те же стили** (темная тема, голубые акценты)
3. ✅ **Та же логика** (getProgress, getTemperatures, formatTime)
4. ✅ **Мигающие статусы** (error, paused, complete, 100% прогресс)
5. ✅ **Увеличенный прогресс** (1.8em шрифт)
6. ✅ **Цветные температуры** (оранжевый)
7. ✅ **Кнопка "Проверить"** работает
8. ✅ **Звук Windows XP** при критических событиях

### Web-сервер:

1. ✅ Отдаёт данные в формате приложения
2. ✅ Определяет статус автоматически
3. ✅ Добавляет connectionType (MQTT/HTTP)
4. ✅ Timestamp для каждого принтера

---

## 🧪 Тестирование

### Проверьте:

1. **Откройте web-интерфейс:** http://localhost:8000
2. **Карточки принтеров:**
   - ✅ Темный фон
   - ✅ Все поля видны (IP, Состояние, Файл, Прогресс, Температуры, Обновлено)
   - ✅ Прогресс большим шрифтом
   - ✅ Температуры оранжевым цветом
   - ✅ IP голубым цветом
3. **Критические статусы:**
   - ✅ Error/Paused/Complete - красные, мигают
   - ✅ При смене на критический - играет звук
4. **Кнопка "Проверить":**
   - ✅ Работает, показывает alert с статусом

---

## 🔊 Звуковые события

Звук воспроизводится при изменении статуса на:
- 🔴 **Error** - ошибка принтера
- ⏸️ **Paused** - пауза печати
- 🏁 **Complete** - печать завершена

**Громкость:** 50% (можно регулировать в коде)

---

## 📖 Документация

Всё в `docs/`:
- ✅ `docs/WEB_SERVER.md`
- ✅ `docs/WEB_SERVER_QUICKSTART.md`
- ✅ `docs/WEB_SERVER_BUTTONS_FIX.md`
- ✅ `docs/WEB_SERVER_FINAL_FIXES.md`
- ✅ `docs/WEB_INTERFACE_CARDS_UPDATE.md` (этот файл)

---

**Готово к тестированию!** 🚀

