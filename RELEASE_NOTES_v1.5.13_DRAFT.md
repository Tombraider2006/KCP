# 🔬 3D Printer Control Panel v1.5.13 - IFRAME DEBUG (Critical Finding)

## ⚠️ ЭТО ОТЛАДОЧНАЯ ВЕРСИЯ

**Версия для диагностики критической проблемы с iframe в Bambu Lab интерфейсе**

---

## 🎯 КРИТИЧЕСКОЕ ОБНАРУЖЕНИЕ

### Проблема найдена в v1.5.12!

**Скрипт в `bambu-printer-interface.html` (iframe) НЕ ВЫПОЛНЯЕТСЯ!**

### Доказательства из логов v1.5.12:

✅ **Parent window работает:**
- `postMessage sent successfully` (10+ раз)
- `Iframe exists?: true`
- `ContentWindow exists?: true`
- Данные отправляются корректно

❌ **Iframe НЕ работает:**
- **НЕТ логов** `[BAMBU IFRAME]`
- **НЕТ логов** `Received postMessage`
- **НЕТ логов** `Updating interface`
- **Скрипт вообще не запускается!**

---

## 🔬 Что добавлено в v1.5.13

### Диагностика выполнения скрипта:

```javascript
[BAMBU IFRAME] Script tag executed!       // Самый первый лог
[BAMBU IFRAME] Window location: ...       // URL iframe
[BAMBU IFRAME] Parent exists?: true       // Проверка parent
[BAMBU IFRAME] Global error: ...          // Любые ошибки JS
[BAMBU IFRAME] DOMContentLoaded event     // Загрузка DOM
[BAMBU IFRAME] setupPostMessage called    // Настройка listeners
```

### Глобальные обработчики ошибок:
- `window.addEventListener('error')` - ловит все JavaScript ошибки
- `window.addEventListener('unhandledrejection')` - ловит ошибки промисов

### Проверки environment:
- Проверка `window.location.href` - правильный ли путь?
- Проверка `window.parent !== window` - в iframe ли мы?

---

## 📝 Инструкция для тестирования

### 1. Установите v1.5.13
### 2. Откройте принтер Bambu Lab
### 3. Откроются DevTools

### 4. Смотрите в консоль:

#### Если видите `[BAMBU IFRAME] Script tag executed!`:
✅ **Скрипт загружается** - проблема в логике

#### Если НЕ видите `[BAMBU IFRAME]`:
❌ **Скрипт вообще не выполняется** - проблема в загрузке iframe

### 5. Также проверьте:

**Вкладка Elements (DOM):**
- Найдите iframe с `src="src/bambu-printer-interface.html"`
- Кликните правой кнопкой → Inspect
- Посмотрите, загружен ли HTML внутри iframe

**Вкладка Network:**
- Ищите запрос к `bambu-printer-interface.html`
- Статус должен быть `200 OK`
- Если `404` или ошибка - файл не найден

**Вкладка Console:**
- Переключите контекст в `src/bambu-printer-interface.html` (dropdown вверху)
- Посмотрите логи в контексте iframe

---

## 🔍 Что мы ищем

### Вариант 1: Скрипт выполняется
Если видим логи `[BAMBU IFRAME]` - проблема в логике postMessage

### Вариант 2: Скрипт НЕ выполняется
Возможные причины:
- Файл не загружается (404)
- CSP блокирует выполнение
- Ошибка парсинга HTML/JS
- Путь к файлу неправильный

---

## 💬 Что отправить в ответ

**Скопируйте ВСЕ из консоли:**
1. Все логи (особенно с `[BAMBU IFRAME]`)
2. Все ошибки (красные сообщения)
3. Скриншот вкладки Network (если есть 404)
4. Контекст консоли (iframe или top)

**Также проверьте:**
- Загружен ли HTML в iframe? (Elements → iframe → внутренний HTML)
- Есть ли файл `src/bambu-printer-interface.html` в приложении?

---

## 📥 Установка

### macOS (для вашего товарища)
Скачайте `3D Printer Control Panel-1.5.13-macOS-Universal.dmg`

### Windows
Скачайте `3D Printer Control Panel-1.5.13-Windows-Setup.exe`

---

## 🔧 Технические детали

### Последовательность загрузки:

1. Parent создает iframe: `<iframe src="src/bambu-printer-interface.html">`
2. Браузер загружает HTML файл
3. Парсит HTML
4. **Выполняет `<script>` тег** ← ЗДЕСЬ ЗАСТРЕВАЕТ
5. `console.log('[BAMBU IFRAME] Script tag executed!')` ← ЭТОГО НЕТ В ЛОГАХ!

### Проверка CSP:

CSP в iframe:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' 'unsafe-inline' data:; 
               script-src 'self' 'unsafe-inline';">
```

`'unsafe-inline'` разрешен → скрипты ДОЛЖНЫ работать

---

**Версия**: 1.5.13 (IFRAME DEBUG)  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich  
**Статус**: 🔬 Draft - Critical Debug

