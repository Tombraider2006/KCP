# Bambu Lab Integration Setup Guide / Руководство по настройке Bambu Lab

## 🎋 Bambu Lab Support / Поддержка Bambu Lab

**English:** This application now supports **Bambu Lab** 3D printers in addition to Klipper-based printers!

**Русский:** Приложение теперь поддерживает **Bambu Lab** 3D принтеры в дополнение к принтерам на базе Klipper!

---

## 📋 Requirements / Требования

### For Bambu Lab Printers / Для принтеров Bambu Lab:

**English:**
1. **Developer Mode** must be enabled on your printer (or "LAN Mode" in older firmware)
2. **Access Code** from printer settings
3. **Serial Number** of your printer
4. **Local Network** connection (printer and PC on same network)

**Русский:**
1. **Режим разработчика** должен быть включен на принтере (или "LAN Mode" в старых прошивках)
2. **Access Code** из настроек принтера
3. **Серийный номер** вашего принтера
4. Подключение к **локальной сети** (принтер и ПК в одной сети)

---

## 🔧 Installation Steps / Шаги установки

### Step 1: Install the Application / Шаг 1: Установите приложение

Download the ready installer from [**releases**](https://github.com/Tombraider2006/KCP/releases/):

Скачайте готовый установщик из [**релизов**](https://github.com/Tombraider2006/KCP/releases/):

- 🪟 **Windows**: `3D-Printer-Control-Panel-Setup-X.X.X.exe`
- 🍎 **macOS**: `3D-Printer-Control-Panel-X.X.X.dmg`
- 🐧 **Linux**: `3D-Printer-Control-Panel-X.X.X.AppImage`

**English:** All dependencies, including MQTT library (`mqtt@^5.3.5`), are already included in the installer!

**Русский:** Все зависимости, включая MQTT библиотеку (`mqtt@^5.3.5`), уже включены в установщик!

### Step 2: Enable Developer Mode on Printer / Шаг 2: Включите режим разработчика на принтере

**English:**
1. Go to printer settings on the printer's touchscreen
2. Navigate to **Network** → **Advanced**
3. Enable **Developer Mode** (or **LAN Mode** in older firmware)
4. Note down the **Access Code** that appears
5. Also note your printer's **Serial Number** (usually on a sticker)

**Русский:**
1. Зайдите в настройки принтера на сенсорном экране
2. Перейдите в **Network** → **Advanced**
3. Включите **Developer Mode** (или **LAN Mode** в старых прошивках)
4. Запишите **Access Code**, который появится
5. Также запишите **серийный номер** принтера (обычно на наклейке)

### Step 3: Add Printer to Application / Шаг 3: Добавьте принтер в приложение

**English:**
1. Open **3D Printer Control Panel**
2. Click **🔧 Manage Printers**
3. Click **➕ Add Manually**
4. Fill in the form:
   - **Name**: Any name you like (e.g., "Bambu X1")
   - **IP Address**: Your printer's IP (find in printer network settings)
   - **Type**: Select **Bambu Lab**
   - **Access Code**: Enter the code from Step 2
   - **Serial Number**: Enter your printer's serial number
5. Click **Add Printer**

**Русский:**
1. Откройте **3D Printer Control Panel**
2. Нажмите **🔧 Manage Printers**
3. Нажмите **➕ Add Manually**
4. Заполните форму:
   - **Name**: Любое имя (например, "Bambu X1")
   - **IP Address**: IP адрес принтера (найдите в сетевых настройках принтера)
   - **Type**: Выберите **Bambu Lab**
   - **Access Code**: Введите код из Шага 2
   - **Serial Number**: Введите серийный номер принтера
5. Нажмите **Add Printer**

---

## 🔍 Troubleshooting / Устранение проблем

### Connection Issues / Проблемы с подключением

**English:**
- **"Connection failed"**: Check if Developer Mode is enabled and Access Code is correct
- **"Printer not found"**: Verify IP address and network connectivity
- **"Authentication failed"**: Double-check Access Code and Serial Number
- **"MQTT connection timeout"**: Ensure printer and PC are on the same network

**Русский:**
- **"Connection failed"**: Проверьте, включен ли режим разработчика и правильный ли Access Code
- **"Printer not found"**: Проверьте IP адрес и сетевое подключение
- **"Authentication failed"**: Перепроверьте Access Code и серийный номер
- **"MQTT connection timeout"**: Убедитесь, что принтер и ПК в одной сети

### Finding Printer IP / Поиск IP принтера

**English:**
1. On printer screen: **Settings** → **Network** → **Network Info**
2. Or check your router's admin panel for connected devices
3. Or use network scanner tools

**Русский:**
1. На экране принтера: **Settings** → **Network** → **Network Info**
2. Или проверьте админ-панель роутера для подключенных устройств
3. Или используйте инструменты сканирования сети

### Getting Serial Number / Получение серийного номера

**English:**
- Check the sticker on your printer (usually on the back or bottom)
- Or in printer settings: **Settings** → **Device** → **About**

**Русский:**
- Проверьте наклейку на принтере (обычно сзади или снизу)
- Или в настройках принтера: **Settings** → **Device** → **About**

---

## 🎯 Supported Models / Поддерживаемые модели

**English:** Currently tested and supported:
- ✅ **Bambu Lab X1 Carbon**
- ✅ **Bambu Lab X1**
- ✅ **Bambu Lab P1P**
- ✅ **Bambu Lab P1S**
- ✅ **Bambu Lab A1 mini**
- ✅ **Bambu Lab A1**

**Русский:** В настоящее время протестированы и поддерживаются:
- ✅ **Bambu Lab X1 Carbon**
- ✅ **Bambu Lab X1**
- ✅ **Bambu Lab P1P**
- ✅ **Bambu Lab P1S**
- ✅ **Bambu Lab A1 mini**
- ✅ **Bambu Lab A1**

---

## 📊 Available Data / Доступные данные

**English:** The application can monitor:
- 🔄 **Print Status** (printing, paused, complete, error)
- 📈 **Print Progress** (percentage and time remaining)
- 🌡️ **Temperatures** (nozzle, bed, chamber)
- 📄 **Current File** being printed
- 🔗 **Connection Status** (online/offline)

**Русский:** Приложение может отслеживать:
- 🔄 **Статус печати** (печать, пауза, завершено, ошибка)
- 📈 **Прогресс печати** (процент и оставшееся время)
- 🌡️ **Температуры** (сопло, стол, камера)
- 📄 **Текущий файл** для печати
- 🔗 **Статус подключения** (онлайн/офлайн)

---

## 🆘 Need Help? / Нужна помощь?

**English:**
- 📖 Check the [troubleshooting guide](BAMBU_TROUBLESHOOTING.md)
- 🐛 Report issues on [GitHub Issues](https://github.com/Tombraider2006/KCP/issues)
- 💬 Join our community discussions

**Русский:**
- 📖 Проверьте [руководство по устранению проблем](BAMBU_TROUBLESHOOTING.md)
- 🐛 Сообщайте о проблемах в [GitHub Issues](https://github.com/Tombraider2006/KCP/issues)
- 💬 Присоединяйтесь к обсуждениям сообщества

---

**Version:** 1.5.28  
**Last Updated:** October 2025  
**Author:** Tom Tomich