# 🔧 3D Printer Control Panel v1.5.11 - Bug Fixes & UI Improvements

## 🐛 Критические исправления

### ⚡ Исправлена работа вкладок Bambu Lab (КОРНЕВАЯ ПРОБЛЕМА РЕШЕНА!)

**Проблема**: Вкладки Bambu Lab не работали после множества попыток исправления

**Корневая причина**: `bambu-printer-interface.html` загружался в iframe и пытался использовать `ipcRenderer`, но iframe не имеет доступа к Node.js API, даже если parent окно имеет `nodeIntegration: true`

**Решение**: 
- Полностью удален `require('electron')` и все использования `ipcRenderer` из `bambu-printer-interface.html`
- Вся коммуникация переведена на `postMessage` между iframe и parent window
- Добавлен proxy в `printer-tabs-window.html` для проксирования запросов из iframe в main процесс через IPC

**Результат**: ✅ Вкладки Bambu Lab теперь корректно получают и отображают данные с принтера!

---

### 📊 Исправлен экспорт аналитики

**Проблема**: Ошибка "APP_VERSION is not defined" при нажатии на кнопку экспорта статистики

**Решение**: 
- Переменная APP_VERSION теперь правильно получается через IPC API из main процесса
- Функция `exportAnalytics()` преобразована в асинхронную

**Результат**: ✅ Экспорт статистики работает корректно

---

### 🌡️ Скрыт несуществующий датчик температуры камеры

**Проблема**: На принтерах Bambu Lab без датчика камеры (P1P, A1) показывался "Chamber 5°C"

**Решение**: 
- Добавлен фильтр нереалистично низких значений (<10°C) в `bambu-printer-adapter.js`
- Автоматическое скрытие элемента температуры камеры в UI, если датчик недоступен
- Инициализация температуры камеры как `null` вместо `0`

**Результат**: 
- ✅ На принтерах БЕЗ датчика (P1P, A1) - элемент не отображается
- ✅ На принтерах С датчиком (X1 Carbon) - показывается реальная температура

---

## 📝 Технические детали

### Изменённые файлы:
- `src/bambu-printer-interface.html` - удален ipcRenderer, добавлен postMessage
- `src/printer-tabs-window.html` - добавлен proxy для postMessage → IPC
- `src/bambu-printer-adapter.js` - фильтр температур камеры, инициализация
- `src/renderer.js` - асинхронный экспорт аналитики с получением APP_VERSION
- `changelog.md` - документация всех изменений

### Архитектура коммуникации Bambu Lab:
```
iframe (bambu-printer-interface.html)
    ↓ postMessage (request-bambu-data)
parent window (printer-tabs-window.html) 
    ↓ ipcRenderer.send
main process (main.js)
    ↓ tabsWindow.webContents.send (bambu-data-update)
parent window 
    ↓ iframe.contentWindow.postMessage
iframe (отображает данные)
```

---

## 🎯 Что работает теперь

✅ **Вкладки Bambu Lab** - корректное отображение данных с принтера  
✅ **Экспорт аналитики** - без ошибок, с правильной версией приложения  
✅ **Датчики температуры** - отображаются только реально существующие  
✅ **MQTT подключение** - стабильная работа с принтерами Bambu Lab  
✅ **Real-time обновления** - автоматическое обновление данных каждые 5 секунд  

---

## 📥 Установка

### Windows
Скачайте `3D Printer Control Panel-1.5.11-Windows-Setup.exe` и запустите установщик

### macOS
Скачайте `3D Printer Control Panel-1.5.11-macOS-Universal.dmg` и установите приложение

### Linux
Скачайте `3D Printer Control Panel-1.5.11-Linux.AppImage`, сделайте исполняемым и запустите

---

## 🔗 Поддерживаемые принтеры

**Klipper (Moonraker)**:
- Voron, Prusa, Ender, CR-10 и другие принтеры с Klipper
- Moonraker API на порту 7125
- Mainsail / Fluidd веб-интерфейсы

**Bambu Lab**:
- X1 Carbon, X1, P1P, P1S, A1
- MQTT подключение (порт 8883)
- Поддержка старых и новых прошивок

---

## 💬 Обратная связь

Если вы нашли баг или у вас есть предложения - создайте Issue на GitHub!

**Версия**: 1.5.11  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich

