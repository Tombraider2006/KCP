# 📊 Улучшение функции отображения данных Bambu принтера

## 🔍 Что было проверено

При нажатии на карточку Bambu Lab принтера открывается окно с детальной информацией. Проверена функция `sendPrinterDataToBambuInterface()` на соответствие с новой MQTT интеграцией.

## ⚠️ Найденная проблема

**Старая версия функции:**
- Полагалась ТОЛЬКО на `printer.data` (кэшированные данные)
- Не запрашивала свежие данные из MQTT адаптера
- Могла показывать устаревшие данные

## ✅ Выполненные улучшения

### 1. **Приоритет свежих данных из адаптера**

```javascript
// Теперь СНАЧАЛА пытается получить данные из MQTT адаптера
let adapterData = null;
if (window.electronAPI && window.electronAPI.getBambuPrinterData && printer.status !== 'offline') {
    adapterData = await window.electronAPI.getBambuPrinterData(printerId);
}
```

### 2. **Fallback на кэшированные данные**

```javascript
// Если адаптер недоступен - использует кэш
const dataSource = adapterData || printer.data;
```

### 3. **Поддержка двух форматов данных**

**Формат от адаптера (приоритет):**
```javascript
if (adapterData) {
    interfaceData.status = adapterData.status;
    interfaceData.stateText = adapterData.stateText;
    interfaceData.progress = adapterData.progress;
    interfaceData.fileName = adapterData.fileName;
    interfaceData.temps = {
        nozzle: adapterData.temperatures.extruder,
        bed: adapterData.temperatures.bed,
        chamber: adapterData.temperatures.chamber
    };
}
```

**Формат из кэша (fallback):**
```javascript
else if (printer.data) {
    // Работает с существующей структурой
    interfaceData.progress = data.print.progress;
    interfaceData.fileName = data.print.filename;
    interfaceData.temps = data.temps;
}
```

### 4. **Добавлены новые поля**

- ✅ `stateText` - текстовое описание состояния ("Ready", "Printing", "Paused" и т.д.)
- ✅ `connectionType` - тип подключения ("MQTT (MQTTS)" или "MQTT (MQTT)")

### 5. **Асинхронная работа**

```javascript
// Функция теперь async
async function sendPrinterDataToBambuInterface(printerId)

// Вызовы с await
await sendPrinterDataToBambuInterface(printerId);
```

## 📊 Передаваемые данные в окно принтера

### Базовая информация:
- `id` - ID принтера
- `name` - имя принтера
- `ip` - IP адрес
- `serialNumber` - серийный номер
- `status` - статус (offline/ready/printing/paused/complete/error)
- `stateText` - текстовое описание состояния
- `connectionType` - тип подключения

### Прогресс печати:
- `progress` - прогресс 0-100%
- `fileName` - имя печатаемого файла

### Температуры:
- `temps.nozzle` - температура сопла
- `temps.nozzle_target` - целевая температура сопла
- `temps.bed` - температура стола
- `temps.bed_target` - целевая температура стола
- `temps.chamber` - температура камеры (если есть)

## 🎯 Результат

### До изменений:
- ❌ Использовались только кэшированные данные
- ❌ Могли показываться устаревшие данные
- ❌ Нет запроса свежих данных при открытии окна

### После изменений:
- ✅ Приоритет СВЕЖИХ данных из MQTT адаптера
- ✅ Надежный fallback на кэш при недоступности адаптера
- ✅ Добавлены полезные поля (stateText, connectionType)
- ✅ Поддержка обоих форматов данных
- ✅ Правильная асинхронная работа

## 🔄 Когда обновляются данные

1. **При запросе от main процесса** (через IPC)
2. **При получении real-time обновлений** от MQTT (каждые 30 сек)
3. **При открытии окна принтера** - запрашиваются свежие данные

## 📝 Измененные функции

- `sendPrinterDataToBambuInterface()` - улучшена для получения свежих данных
- `handleBambuPrinterUpdate()` - теперь async с await
- Обработчики IPC - добавлены async/await для корректной работы

## ✅ Проверка

- ✅ Линтер не выявил ошибок
- ✅ Совместимость с существующим кодом
- ✅ Поддержка обратной совместимости (кэш данных)

---

**Дата:** 09.10.2025  
**Версия:** 1.5.10  
**Статус:** ✅ Готово

