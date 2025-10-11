# Исправление проблемы с застреванием статуса "печатает" для Klipper принтеров

## Проблема

Пользователи жаловались, что после завершения печати на принтерах с Klipper принтер иногда остается в состоянии "печатает", хотя печать давно закончена.

## Причина

После завершения печати Klipper переводит `print_stats.state` в состояние `'ready'` или `'standby'`, но **не очищает сразу** поля `filename` и `file_path`. Эти поля остаются заполненными до начала следующей печати.

В методе `updatePrinterStatus()` была следующая логика:

```javascript
else if (state === 'ready' || state === 'standby' || state === 'cancelled') {
    if (isActive === true || (progress > 0 && progress < 1) || hasActiveFile) {
        printer.status = 'printing';  // ← ПРОБЛЕМА!
    } else {
        printer.status = 'ready';
    }
}
```

Когда печать завершалась:
- ✅ `state = 'ready'` 
- ✅ `isActive = false`
- ✅ `progress = 1.0` (100%) - условие `progress > 0 && progress < 1` = false
- ❌ `hasActiveFile = true` - файл еще указан в системе, хотя печать завершена

Из-за этого принтер ошибочно считался печатающим.

## Решение

Введена новая переменная `isActivelyPrinting`, которая проверяет:

1. `isActive === true` - явно указано, что печать активна
2. `progress > 0 && progress < 1` - прогресс между 0% и 100%
3. `hasActiveFile && isActive !== false && progress < 1` - файл указан, НО только если:
   - `isActive` явно не равен `false` (т.е. undefined или true)
   - `progress` меньше 100% или не указан

Теперь после завершения печати (progress = 1.0 или progress >= 1), наличие filename не приводит к ошибочному определению статуса "печатает".

## Исправленные файлы

1. **src/klipper-printer-adapter.js** - метод `updatePrinterStatus()` (строки 240-280)
2. **src/renderer.js** - функция `updatePrinterStatus()` (строки 2565-2613)

## Изменения в коде

### До:
```javascript
if (isActive === true || (progress !== undefined && progress > 0 && progress < 1) || hasActiveFile) {
    this.printer.status = 'printing';
}
```

### После:
```javascript
const isActivelyPrinting = isActive === true || 
                           (progress !== undefined && progress > 0 && progress < 1) ||
                           (hasActiveFile && isActive !== false && (progress === undefined || progress < 1));

if (isActivelyPrinting) {
    this.printer.status = 'printing';
}
```

## Примечания

- Bambu Lab адаптер не затронут - он использует прямое определение статуса через `gcode_state` (IDLE, RUNNING, PAUSE, FINISH, FAILED) и не имеет этой проблемы
- Для Klipper принтеров теперь более корректно определяется состояние после завершения печати
- Добавлено логирование переменной `isActivelyPrinting` для отладки

## Дата исправления

10 октября 2025





