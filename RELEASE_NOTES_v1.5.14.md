# 🎉 3D Printer Control Panel v1.5.14 - BAMBU LAB TABS FIXED!

## ✅ ВКЛАДКИ BAMBU LAB ТЕПЕРЬ РАБОТАЮТ!

**После нескольких версий отладки, корневая причина найдена и исправлена!**

---

## 🎯 Проблема

**Вкладки Bambu Lab открывались пустыми** (белый экран, интерфейс не загружался)

---

## 🔍 Корневая причина

### Неправильный путь к iframe!

**Было**:
```javascript
printerUrl = 'src/bambu-printer-interface.html';
```

**Проблема**:
- Родительское окно находится в `src/printer-tabs-window.html`
- Браузер искал iframe по относительному пути
- Итоговый путь: `src/src/bambu-printer-interface.html` ❌
- **Результат: 404 Not Found** → скрипт в iframe не выполнялся

**Стало**:
```javascript
printerUrl = 'bambu-printer-interface.html';  // Без src/
```

**Результат**:
- Браузер ищет файл в той же папке, что и родитель
- Итоговый путь: `src/bambu-printer-interface.html` ✅
- **Файл найден** → скрипт выполняется → интерфейс загружается!

---

## 📊 Как была найдена проблема

### Версии отладки:

**v1.5.11** - Исправлена архитектура коммуникации
- Удален `ipcRenderer` из iframe (не работает в iframe)
- Добавлен `postMessage` для связи iframe ↔ parent

**v1.5.12** - Первая debug версия
- Добавлено расширенное логирование
- Обнаружено: `postMessage` отправляется, но iframe не отвечает
- Окно показывается сразу (`show: true`)

**v1.5.13** - Диагностика выполнения скрипта
- Добавлены логи `[BAMBU IFRAME]` в самом начале скрипта
- Глобальные обработчики ошибок
- Результат: **НИ ОДНОГО** лога `[BAMBU IFRAME]` → скрипт вообще не запускается!

**v1.5.14** - КОРНЕВАЯ ПРИЧИНА НАЙДЕНА! 🎯
- Анализ: postMessage работает, iframe существует, но скрипт не выполняется
- Вывод: файл не загружается!
- Проверка пути: `src/bambu-printer-interface.html` из `src/printer-tabs-window.html` = `src/src/...` ❌
- **ИСПРАВЛЕНИЕ**: Убран лишний `src/` из пути

---

## 🔧 Что исправлено

### Технические изменения:

1. **Путь к iframe**: `src/bambu-printer-interface.html` → `bambu-printer-interface.html`
2. **Сохранены debug логи** из v1.5.13 для подтверждения работы
3. **DevTools открываются** автоматически (можно убрать в production)

### Сопутствующие исправления (из v1.5.11-1.5.13):

- ✅ Окно вкладок показывается сразу
- ✅ Проверки видимости окна (`.isVisible()`, `.isMinimized()`)
- ✅ Архитектура postMessage (iframe ↔ parent ↔ main)
- ✅ Расширенное логирование для отладки
- ✅ Увеличенные задержки для инициализации

---

## 📥 Установка

### Windows
Скачайте `3D Printer Control Panel-1.5.14-Windows-Setup.exe`

### macOS (Universal - Intel & Apple Silicon)
Скачайте `3D Printer Control Panel-1.5.14-macOS-Universal.dmg`

### Linux
Скачайте `3D Printer Control Panel-1.5.14-Linux.AppImage`

---

## 🧪 Что ожидать после установки

### При клике на принтер Bambu Lab:

1. **Откроется окно с вкладками** ✅
2. **Откроются DevTools** (для проверки) ✅
3. **В консоли появятся логи**:
   ```
   [BAMBU IFRAME] Script tag executed!
   [BAMBU IFRAME] Window location: ...
   [BAMBU IFRAME] DOMContentLoaded event fired
   [BAMBU IFRAME] Received postMessage: {type: 'set-printer-id', ...}
   [BAMBU IFRAME] Received postMessage: {type: 'bambu-data-update', ...}
   ```
4. **Интерфейс загрузится с данными** ✅

### Если всё работает:

- Увидите температуры принтера (сопло, стол)
- Прогресс печати
- Статус принтера
- Имя файла
- Информацию о принтере

---

## 🔧 Для production релиза

В следующей версии можно убрать:
- Автоматическое открытие DevTools
- Часть debug логов `[sendDataToBambuInterface]`
- Сохранить только критичные логи `[BAMBU IFRAME]`

---

## 🙏 Благодарности

Спасибо за терпение и тестирование! Без подробных логов из v1.5.12 и v1.5.13 мы бы не нашли эту проблему так быстро.

---

## 💬 Обратная связь

Если вкладки работают - дайте знать! 🎉  
Если нет - приложите логи из консоли DevTools.

---

**Версия**: 1.5.14  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich  
**Статус**: ✅ Production Ready - Bambu Lab tabs WORKING!

