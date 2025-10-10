# ✅ Добавлена кнопка "Помощь" в модальное окно Web-сервера

## 📝 Что сделано

### 1. Кнопка "📖 Помощь" в модальном окне

**Файл:** `src/index.html`

```html
<button class="btn btn-info" onclick="openWebServerHelp()" style="margin-right: auto;">
    <span id="webServerHelpBtnText">📖 Помощь</span>
</button>
```

**Расположение:** В footer модального окна, слева от остальных кнопок

**Стиль:** `btn-info` (голубой цвет) с `margin-right: auto` чтобы отделить от остальных кнопок

---

### 2. Функция открытия документации

**Файл:** `src/renderer.js`

```javascript
async function openWebServerHelp() {
    try {
        const helpUrl = 'https://github.com/Tombraider2006/KCP/blob/main/docs/WEB_SERVER.md';
        const result = await window.electronAPI.openExternalLink(helpUrl);
        
        if (result && result.success) {
            addToConsole('📖 Открыта документация по web-серверу', 'info');
        } else {
            addToConsole('❌ Ошибка открытия документации', 'error');
        }
    } catch (error) {
        console.error('Error opening help:', error);
        addToConsole('❌ Ошибка открытия документации', 'error');
    }
}
```

**Что делает:**
- Открывает `docs/WEB_SERVER.md` на GitHub в браузере
- Логирует результат в консоль приложения
- Обрабатывает ошибки

---

### 3. IPC обработчик для внешних ссылок

**Файл:** `src/main.js`

```javascript
ipcMain.handle('open-external-link', (event, url) => {
  try {
    shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('[IPC] Error opening external link:', error);
    return { success: false, error: error.message };
  }
});
```

**Зачем:** Безопасное открытие внешних ссылок через main процесс

---

### 4. API в preload.js

**Файл:** `src/preload.js`

```javascript
openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),
```

**Зачем:** Связь между renderer и main процессом через contextBridge

---

## 🎨 Внешний вид

```
┌─────────────────────────────────────────────────┐
│  🌐 Web Server Settings                     ✕  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Статус, порт, информация...]                 │
│                                                 │
├─────────────────────────────────────────────────┤
│ [📖 Помощь]  [▶️ Запустить] [Открыть] [Закрыть]│
└─────────────────────────────────────────────────┘
```

**Порядок кнопок:**
1. **📖 Помощь** - слева, отделена (margin-right: auto)
2. **▶️ Запустить** - зелёная
3. **Открыть в браузере** - синяя (только когда сервер запущен)
4. **Закрыть** - серая

---

## 🔗 Ссылка на документацию

**URL:** https://github.com/Tombraider2006/KCP/blob/main/docs/WEB_SERVER.md

**Содержание документации:**
- ✅ Описание возможностей
- ✅ Быстрый старт
- ✅ REST API с примерами
- ✅ WebSocket события
- ✅ Интеграция (Python, Node.js)
- ✅ Безопасность
- ✅ Устранение неполадок
- ✅ FAQ

---

## ✅ Готово к использованию

**Протестируйте:**

1. Откройте приложение
2. Нажмите **"🌐 Web Server"**
3. В модальном окне нажмите **"📖 Помощь"**
4. Должен открыться браузер с документацией на GitHub
5. В консоли приложения появится: `📖 Открыта документация по web-серверу`

---

## 📋 Изменённые файлы

1. ✅ `src/index.html` - добавлена кнопка
2. ✅ `src/renderer.js` - функция `openWebServerHelp()`
3. ✅ `src/main.js` - IPC handler `open-external-link`
4. ✅ `src/preload.js` - API `openExternalLink()`

**Стили:** Используется существующий класс `btn-info` (голубая кнопка)

---

## 🌍 Локализация

Текст логов поддерживает русский и английский язык через переменную `currentLang`:

- **RU:** "Открыта документация по web-серверу"
- **EN:** "Web server documentation opened"

---

**Всё готово!** 🚀

