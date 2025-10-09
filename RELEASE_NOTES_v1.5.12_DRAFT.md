# 🧪 3D Printer Control Panel v1.5.12 - DEBUG BUILD (Testing)

## ⚠️ ЭТО ОТЛАДОЧНАЯ ВЕРСИЯ ДЛЯ ТЕСТИРОВАНИЯ

**Не используйте в production!** Эта версия создана для диагностики проблемы с пустыми вкладками Bambu Lab.

---

## 🎯 Цель релиза

Диагностировать и исправить проблему, когда окно вкладок Bambu Lab открывается, но остается пустым (не загружается интерфейс принтера).

---

## 🔧 Что изменено в этой версии

### ✅ Окно вкладок теперь показывается
- **Было**: Окно создавалось с `show: false` и ждало события `ready-to-show`
- **Стало**: Окно показывается сразу с `show: true`
- Добавлены проверки `.isVisible()` и `.isMinimized()`

### 📊 Добавлено расширенное логирование
- Все этапы создания вкладок записываются в консоль
- Детальные логи в `[sendDataToBambuInterface]`
- Логи отправки данных через postMessage
- Логи создания iframe и загрузки интерфейса

### 🛠️ DevTools открываются автоматически
- При открытии окна вкладок автоматически открывается консоль разработчика
- Можно видеть все логи в реальном времени
- Помогает диагностировать, где именно застревает процесс

### ⏱️ Увеличены задержки
- 300мс для новых окон (было 100мс)
- 500мс для отправки данных Bambu Lab (было 200мс)
- 50мс для существующих окон (было 10мс)

---

## 📝 Инструкция для тестирования

### Для пользователей с Bambu Lab принтерами:

1. **Установите эту версию** (скачайте установщик ниже)
2. **Откройте приложение**
3. **Кликните на карточку принтера Bambu Lab**
4. **Откроется окно с вкладками + DevTools (консоль)**

### ⚠️ Что делать, если вкладка пустая:

1. **Посмотрите в консоль DevTools** (правая часть окна)
2. **Найдите все сообщения**, начинающиеся с:
   - `Adding printer tab:`
   - `[sendDataToBambuInterface]`
   - `Received postMessage:`
   - `Loading Bambu Lab interface:`
   
3. **Сделайте скриншот консоли** или скопируйте весь текст
4. **Откройте Issue на GitHub** с логами

---

## 📥 Установка

### macOS (Universal - Intel & Apple Silicon)
Скачайте `3D Printer Control Panel-1.5.12-macOS-Universal.dmg`

### Windows
Скачайте `3D Printer Control Panel-1.5.12-Windows-Setup.exe`

### Linux
Скачайте `3D Printer Control Panel-1.5.12-Linux.AppImage`

---

## 🔍 Что мы ищем в логах

Нужно понять, какой из этих шагов не выполняется:

1. ✅ Окно вкладок создается
2. ✅ Вкладка добавляется
3. ✅ Iframe создается
4. ✅ Iframe загружается
5. ❓ Данные отправляются в iframe
6. ❓ Iframe получает данные
7. ❓ Интерфейс обновляется

Логи должны показать, на каком именно шаге происходит сбой.

---

## 🐛 Известные проблемы в этой версии

- **DevTools открываются автоматически** - это нормально, для отладки
- **Много логов в консоли** - это ожидаемое поведение
- **Немного медленнее загрузка** - из-за увеличенных задержек

---

## 💬 Обратная связь

**Если вкладка работает** - напишите "✅ Работает!" в Issue  
**Если вкладка пустая** - приложите логи из консоли DevTools

---

## 🔧 Технические детали

### Изменённые файлы:
- `src/main.js` - логирование, задержки, DevTools
- `src/printer-tabs-window.html` - расширенное логирование в sendDataToBambuInterface
- `package.json` - версия 1.5.12
- `changelog.md` - документация

### Архитектура:
```
Main Window (renderer.js)
    ↓ openPrinterWindow
Main Process (main.js)
    ↓ createTabsWindow + addPrinterTab
Tabs Window (printer-tabs-window.html)
    ↓ add-printer-tab event
    ↓ create iframe
Iframe (bambu-printer-interface.html)
    ↓ set-printer-id postMessage
    ↓ request-bambu-data postMessage
Tabs Window
    ↓ proxy request → IPC
Main Process
    ↓ sendBambuDataToInterface
    ↓ bambu-data-update event
Tabs Window
    ↓ postMessage to iframe
Iframe
    ↓ updateInterface(data)
```

---

**Версия**: 1.5.12 (DEBUG)  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich  
**Статус**: 🧪 Draft - Testing Only

