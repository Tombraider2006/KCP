# Changelog: Bambu Lab Integration

## Version 1.3.1 - Bambu Lab Support Added 🎋

### ✨ Новые возможности / New Features

#### 🖨️ Поддержка принтеров Bambu Lab
- Добавлена полная поддержка принтеров Bambu Lab наряду с Klipper
- Выбор типа принтера при добавлении (Klipper / Bambu Lab)
- Специфичные поля для Bambu Lab: Access Code и Serial Number
- Двуязычный интерфейс (Русский/English) для всех новых элементов

#### 🏗️ Архитектурные улучшения
- Создан базовый класс `PrinterAdapter` для абстракции
- Реализован `KlipperAdapter` для принтеров Klipper
- Реализован `BambuLabAdapter` для принтеров Bambu Lab
- Модульная архитектура позволяет легко добавлять новые типы принтеров

#### 🎨 UI/UX улучшения
- Иконки для разных типов принтеров (🖨️ Klipper / 🎋 Bambu Lab)
- Динамическое отображение полей в зависимости от типа принтера
- Информация о серийном номере в карточках Bambu Lab принтеров
- Улучшенная валидация при добавлении принтеров

### 📦 Зависимости / Dependencies

Добавлены:
- `mqtt@^5.3.5` - для MQTT протокола Bambu Lab

### 📝 Новые файлы / New Files

1. **printer-adapter.js** - Базовый абстрактный класс для адаптеров
2. **klipper-printer-adapter.js** - Адаптер для Klipper/Moonraker
3. **bambu-printer-adapter.js** - Адаптер для Bambu Lab MQTT
4. **BAMBU_LAB_SETUP.md** - Английская инструкция по настройке
5. **BAMBU_LAB_SETUP_RU.md** - Русская инструкция по настройке
6. **CHANGELOG_BAMBU.md** - Этот файл

### 🔄 Измененные файлы / Modified Files

1. **package.json**
   - Добавлена зависимость `mqtt@^5.3.5`

2. **index.html**
   - Добавлен выбор типа принтера в модалках
   - Кондициональные поля для Klipper и Bambu Lab
   - Подсказки для Access Code и Serial Number

3. **translations.js**
   - Добавлены переводы для типов принтеров
   - Переводы для новых полей (Access Code, Serial Number)
   - Переводы для MQTT сообщений

4. **renderer.js**
   - Функция `togglePrinterTypeFields()` для переключения полей
   - Обновлена `addPrinter()` для обработки обоих типов
   - Обновлена `editPrinter()` и `savePrinterChanges()`
   - Обновлена `testPrinterConnection()` с маршрутизацией по типу
   - Добавлена `testBambuLabConnection()`
   - Переименована старая логика в `testKlipperConnection()`
   - Обновлена `updatePrintersDisplay()` для показа типа принтера
   - Обновлена `savePrintersToStorage()` для сохранения всех полей
   - Функция `ensurePrinterType()` для обратной совместимости

### 🔧 Технические детали / Technical Details

#### Протоколы связи:
- **Klipper**: HTTP REST API + WebSocket (port 7125)
- **Bambu Lab**: MQTT (port 8883)

#### Хранение данных:
Принтеры Klipper:
```json
{
  "id": "...",
  "name": "...",
  "ip": "...",
  "type": "klipper",
  "port": "7125",
  "webPort": "80"
}
```

Принтеры Bambu Lab:
```json
{
  "id": "...",
  "name": "...",
  "ip": "...",
  "type": "bambu",
  "accessCode": "...",
  "serialNumber": "..."
}
```

### ⚙️ Установка / Installation

```bash
# 1. Установите зависимости
npm install

# 2. Перезапустите приложение
npm start
```

### 📋 Что делать дальше / Next Steps

1. **Установите зависимости**: `npm install`
2. **Перезапустите приложение**
3. **Включите Developer Mode** на принтере Bambu Lab
4. **Добавьте принтер** через UI, выбрав тип "Bambu Lab"
5. **Введите Access Code и Serial Number**

### 🐛 Известные проблемы / Known Issues

1. **MQTT Integration**: 
   - Полная интеграция MQTT требует дополнительной работы
   - Пока что отображается как "MQTT (not configured)"
   - Требуется перезапуск после установки зависимостей

2. **Web Interface**:
   - Bambu Lab принтеры не имеют локального web-интерфейса
   - Используйте Bambu Handy или Bambu Studio

### 🔮 Будущие улучшения / Future Enhancements

- [ ] Полная MQTT интеграция для реального времени
- [ ] Мониторинг статуса печати Bambu Lab
- [ ] Отображение температур Bambu Lab
- [ ] Прогресс печати в реальном времени
- [ ] Поддержка команд управления принтером
- [ ] Интеграция с Bambu Cloud API (опционально)

### 📚 Документация / Documentation

- См. `BAMBU_LAB_SETUP.md` для английской инструкции
- См. `BAMBU_LAB_SETUP_RU.md` для русской инструкции

### 🙏 Благодарности / Credits

- Bambu Lab за открытие Developer Mode
- Сообщество за запросы поддержки Bambu Lab

---

**Версия**: 1.3.1  
**Дата**: 2025-01-08  
**Совместимость**: Windows 10+, macOS 10.15+, Linux

