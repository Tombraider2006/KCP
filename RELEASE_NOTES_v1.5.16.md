# 🐛 3D Printer Control Panel v1.5.16 - Bugfixes

## 🐛 Исправленные ошибки

### 1. Экспорт аналитики

**Проблема**: Ошибка `currentLanguage is not defined` при экспорте статистики

**Причина**: Использовалась несуществующая переменная `currentLanguage`

**Решение**:
- Теперь используется корректная глобальная переменная `BROWSER_LANGUAGE` из `translations.js`
- Добавлен fallback на `'en'` если язык не определен
- Исправлена строка 4114 в `src/renderer.js`

**Было**:
```javascript
language: currentLanguage  // ❌ не определена
```

**Стало**:
```javascript
language: BROWSER_LANGUAGE || 'en'  // ✅ работает
```

---

### 2. Интерфейс Bambu Lab

**Проблема**: Ошибка `Cannot set properties of null (setting 'textContent')`

**Причина**: 
- В v1.5.15 был удален header с элементами `printerName`, `connectionIndicator`, `connectionStatus`
- Но код в функции `updateInterface()` всё ещё пытался обновлять эти элементы

**Решение**:
- Удален код обновления несуществующих элементов (строки 555-571)
- Убраны попытки установить `textContent` для `null` элементов

**Удалено**:
```javascript
document.getElementById('printerName').textContent = data.name;  // ❌
document.getElementById('connectionIndicator').className = ...;   // ❌
document.getElementById('connectionStatus').textContent = ...;    // ❌
```

---

## ✅ Что исправлено

1. ✅ **Экспорт аналитики работает** без ошибок
2. ✅ **Интерфейс Bambu Lab загружается** без JavaScript ошибок
3. ✅ **Камера отображается** корректно (если доступна)
4. ✅ **Все данные обновляются** без ошибок

---

## 📥 Установка

### Windows
`3D Printer Control Panel-1.5.16-Windows-Setup.exe`

### macOS (Universal)
`3D Printer Control Panel-1.5.16-macOS-Universal.dmg`

### Linux
`3D Printer Control Panel-1.5.16-Linux.AppImage`

---

## 🧪 Как проверить

### Экспорт аналитики:
1. Откройте **Аналитика** → **Настройки**
2. Нажмите **Экспорт данных**
3. Файл должен скачаться **без ошибок** в консоли
4. В JSON файле поле `language` должно быть заполнено

### Интерфейс Bambu Lab:
1. Откройте вкладку принтера Bambu Lab
2. В консоли **НЕ ДОЛЖНО** быть ошибок `Cannot set properties of null`
3. Данные должны отображаться корректно
4. Камера показывается (если есть на модели) или скрыта (если нет)

---

## 🔧 Технические детали

### Изменённые файлы:
- `src/renderer.js` - исправлена переменная `currentLanguage` → `BROWSER_LANGUAGE`
- `src/bambu-printer-interface.html` - удален код обновления несуществующих элементов
- `package.json` - версия 1.5.16
- `changelog.md` - документация

### Затронутые версии:
- **Analytics export bug**: присутствовал с v1.5.11 (когда была добавлена функция экспорта)
- **Bambu interface bug**: появился в v1.5.15 (когда был удален header)

---

## 💬 Обратная связь

Если обнаружили другие ошибки - создайте Issue на GitHub!

---

**Версия**: 1.5.16  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich  
**Статус**: ✅ Production - Bugfixes Applied

