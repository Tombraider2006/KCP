# 📹 3D Printer Control Panel v1.5.15 - Camera Stream & UI Improvements

## 📹 Исправление видеопотока камеры

### Проблема
Камера показывала "Not available" даже на принтерах с камерой

### Причина
URL камеры формировался неправильно, если IP принтера содержал порт MQTT:

**Было**:
```javascript
return `http://${this.printer.ip}:8080/?action=stream`;
// Если ip = "192.168.1.100:8883"
// Результат: http://192.168.1.100:8883:8080/?action=stream ❌
```

**Стало**:
```javascript
const cleanIp = this.printer.ip.split(':')[0];
return `http://${cleanIp}:8080/?action=stream`;
// Если ip = "192.168.1.100:8883"
// Результат: http://192.168.1.100:8080/?action=stream ✅
```

### Исправление
- Метод `getCameraStreamUrl()` теперь очищает IP от порта перед формированием URL
- IP разбивается по `:` и берется только первая часть
- Работает и с чистым IP ("192.168.1.100") и с портом ("192.168.1.100:8883")

---

## 🎨 Улучшения интерфейса

### Убрана дублирующаяся шапка
- **Было**: Название принтера показывалось и во вкладке, и в шапке iframe
- **Стало**: Название только во вкладке
- **Результат**: Интерфейс компактнее, больше места для данных

### Визуальные улучшения
- Уменьшены отступы сверху
- Больше контента видно сразу
- Чище и современнее

---

## 🔍 Добавлена диагностика камеры

### Новые логи для отладки:
```
[CAMERA] updateCamera called
[CAMERA] data.hasCamera: true
[CAMERA] data.cameraStreamUrl: http://192.168.1.100:8080/?action=stream
[CAMERA] Printer has camera, showing container
[CAMERA] Loading stream from: http://...
```

### Что помогает найти:
- Определяется ли камера на принтере (`hasCamera`)
- Формируется ли правильный URL (`cameraStreamUrl`)
- Загружается ли видеопоток
- Ошибки при загрузке

---

## 📥 Установка

### Windows
`3D Printer Control Panel-1.5.15-Windows-Setup.exe`

### macOS (Universal)
`3D Printer Control Panel-1.5.15-macOS-Universal.dmg`

### Linux
`3D Printer Control Panel-1.5.15-Linux.AppImage`

---

## ✅ Что работает теперь

1. ✅ **Вкладки Bambu Lab открываются** (исправлено в v1.5.14)
2. ✅ **Данные обновляются** (температуры, прогресс, статус)
3. ✅ **Видеопоток камеры** работает на принтерах с камерой
4. ✅ **Интерфейс компактный** без дублирующихся элементов

---

## 🧪 Как проверить камеру

### В DevTools (Console):

**Если камера работает**:
```
[CAMERA] data.hasCamera: true
[CAMERA] data.cameraStreamUrl: http://192.168.1.100:8080/?action=stream
[CAMERA] Loading stream from: http://192.168.1.100:8080/?action=stream
Camera stream loaded successfully
```

**Если камера недоступна на модели**:
```
[CAMERA] data.hasCamera: false
[CAMERA] Camera not available on this printer model
```

**Если нет URL**:
```
[CAMERA] data.hasCamera: true
[CAMERA] data.cameraStreamUrl: null
[CAMERA] ERROR: No camera stream URL provided
```

### Проверка вручную:

Откройте в браузере: `http://<IP_принтера>:8080/?action=stream`

Если видите видео - камера работает!

---

## 🔧 Технические детали

### Изменённые файлы:
- `src/bambu-printer-adapter.js` - исправлен `getCameraStreamUrl()`
- `src/bambu-printer-interface.html` - убрана шапка, добавлены логи камеры
- `package.json` - версия 1.5.15
- `changelog.md` - документация

### Модели с камерой:
- X1 Carbon
- X1
- P1P
- P1S

---

## 💬 Обратная связь

**Если камера работает** - отлично! 🎉  
**Если не работает** - пришлите логи `[CAMERA]` из консоли DevTools

---

**Версия**: 1.5.15  
**Дата**: 09.10.2025  
**Автор**: Tom Tomich  
**Статус**: ✅ Production - Camera & UI Fixed

