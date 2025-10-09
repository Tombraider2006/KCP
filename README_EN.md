<div align="center">

<img src="logo.png" alt="3D Printer Control Panel Logo" width="250">

# 🖨️ 3D Printer Control Panel

**[🇷🇺 Русский](README.md)** | **[🇬🇧 English](README_EN.md)**

![3D Printer Control Panel](https://img.shields.io/badge/Version-1.5.6-blue.svg)
![Electron](https://img.shields.io/badge/Electron-22.0+-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-14.0+-green.svg)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Mac-lightgrey.svg)
![Languages](https://img.shields.io/badge/Languages-Russian%20%7C%20English-green.svg)

**Control panel for 3D printers with Klipper firmware and Bambu Lab**  
*Convenient interface for monitoring and controlling multiple 3D printers*

**[⬇️ Quick navigation](#-table-of-contents)**

</div>

---

## 📑 Table of Contents

<table>
<tr>
<td width="50%">

### 🚀 Quick Start
- **[👥 Who Is This For?](#-who-is-this-for)**
- **[🚀 Installation](#-installation)**
- **[📋 Adding Printers](#-adding-printers)**
- **[🎋 Bambu Lab Support](#-bambu-lab-support)**

### 📚 Features
- **[🌟 Key Features](#-key-features)**
- **[🎯 System Features](#-system-features)**
- **[🎉 Benefits](#-benefits)**

</td>
<td width="50%">

### ⚙️ Help & Configuration
- **[🆘 Troubleshooting](#-troubleshooting)**
- **[🔧 Technical Details](#-technical-details)**
- **[📚 Additional Documentation](#-additional-documentation)**

### 📝 Information
- **[📋 Changelog](#-changelog)**
- **[💝 Support the Project](#-support-the-project)**
- **[📄 License](#-license)**
- **[🤝 Contributing](#-contributing)**

</td>
</tr>
</table>

---

## 👥 Who Is This For?

### 🎯 Target Audience

**Primarily for 3D farm operators, secondarily for their managers.**

### 🚨 Main Purpose

**To alert operators in time when a specific printer requires attention.**

Critical events requiring immediate response:
- 🔴 **Error** - printer stopped with error
- ⏸️ **Pause** - print paused
- 🏁 **Print Complete** - model ready, need to remove and start next print

### 📺 Display Mode

The program is **ideally suited for display on a large monitor or TV** in production environment:
- ✅ Large interface elements visible from distance
- ✅ Color coding - instant status recognition
- ✅ Dynamic sorting - important always on top
- ✅ Responsive design - works on any resolution

> **"Keep operators alert"** - Windows XP sound plays on events (error/pause/complete).  
> *(Sound looping was considered a bad idea and is not implemented)*

### 🎯 Smart Card Sorting

**Dynamic printer card ordering is not random:**

The closer to a problem and need for attention - the higher the priority and position in queue.

#### Priorities (from highest to lowest):
1. 🔴 **Error** - requires immediate attention
2. ⏸️ **Pause** - printer waiting for action
3. 🏁 **Complete** - need to remove model
4. 🟢 **Printing 95-100%** - **automatically moves up!**
5. 🟡 **Ready** - waiting for job
6. 🟢 **Printing** - working normally
7. ⚫ **Offline** - doesn't interfere, at bottom

> **Key feature:** When approaching print completion (95-100%), the card **automatically moves higher** in the list so the operator can prepare for model change.

### 📏 Interface Scalability

**If all printer cards don't fit on monitor - that's okay!**

- Print percentages are **intentionally enlarged** for distance visibility
- Critical printers always on top and visible
- Can scroll list to view all printers
- Printers requiring attention always visible without scrolling

### 💡 Work Concept

1. **Operator sees large screen** with control panel
2. **Printers working** - cards green, bottom of list
3. **Printer approaching completion** - card moves up
4. **Print completed** - card on top, blinking red, **sound alert**
5. **Operator responds** - removes model, starts next print
6. **Cycle repeats** for maximum farm efficiency

---

## 🌟 Main Features

### 📊 Printer Monitoring
- **🔢 Multi-printer support** - simultaneous tracking of multiple printers
- **🎨 Visual statuses** with color indication and animations:
  - 🔴 **Error/Pause/Complete** - red blinking + sound alert
  - 🟡 **Ready** - yellow blinking
  - 🟢 **Printing** - green blinking (95-100% - automatically moves higher)
  - ⚫ **Offline** - no animation
- **📈 Detailed information** for each printer:
  - 🌡️ **Smart temperature sensors** with visual warnings:
    - 🔥 Nozzle > 170°C displayed in **red** (hot surface warning)
    - 🔥 MCU > 60°C displayed in **red and enlarged** (critical overheating!)
  - 🌡️ **Flexible sensor configuration**:
    - Automatic detection of chamber/MCU/Raspberry Pi
    - Advanced mode for selecting specific sensors
    - Custom names for any sensors
  - 📊 **Print progress in large font** - visible from distance on large monitors
  - 📁 Current file name
  - 🔄 Print state
  - ⏰ Last update time
- **📲 Telegram bot** - important notifications on your phone!
- **🔊 Sound alerts** - Windows XP sound on critical events

### 🔌 Connection Technologies
- **🔄 Dual protocol** - HTTP polling + WebSocket for real-time
- **🔁 Automatic reconnection** on connection loss
- **🌙 Moonraker API support** with full sensor discovery
- **🎋 MQTT for Bambu Lab** printers
- **⚡ Quick connection test** for all printers

### ⚙️ Printer Management
- **➕ Add/🗑️ delete** printers through intuitive interface
- **✏️ Edit settings** (name, IP, ports)
- **🌐 Quick access** to printer web interfaces (Fluidd/Mainsail)
- **🌡️ Temperature sensor configuration** - choose what to display on printer card
- **⏱️ Configurable polling interval** (10-90 seconds)

### 📱 Interface and UX
- **📱 Responsive design** for computers and monitors of any size
- **🔢 Smart dynamic sorting** of printers by priority
- **📋 Log system** with export and cleanup
- **🪟 Modal windows** for configuration
- **⌨️ Hotkey support** (Enter to confirm)
- **🌍 Multilanguage** - automatic detection of Russian/English

### 📈 Analytics and Monitoring (for managers)
- **📊 Professional Chart.js graphs** - interactive visualizations
- **⚡ Power consumption** - detailed electricity usage calculation
- **💰 Energy cost** - automatic electricity cost calculation
- **📈 Work efficiency** - analysis of print time vs idle time
- **⏱️ Inefficiency periods** - tracking pauses and downtime with operator comments
- **📊 Operator reports** - why there were downtimes, who is responsible
- **🗑️ Data management** - cleanup of outdated data
- **📖 Power calculation guide** - setup instructions

---

## 🚀 Installation

Download the installer from [**releases**](https://github.com/Tombraider2006/KCP/releases/)

### Platforms:
- ✅ **Windows** 10/11 (automatic installation)
- ✅ **macOS** 10.15+ (DMG installer)
- ✅ **Linux** (AppImage, portable version)

---

## 🎋 Bambu Lab Support

The application supports **Bambu Lab** printers via MQTT protocol!

### Setup Instructions:
- 📖 [**Complete Bambu Lab Setup Guide**](BAMBU_LAB_SETUP.md)

### Main Requirements:
- ✅ Developer mode enabled on printer
- ✅ Access Code from printer settings
- ✅ Printer serial number
- ✅ Connected to local network

---

## 📋 Adding Printers

### For Klipper Printers:
1. ➕ Click "Add Printer"
2. 📝 Select "Klipper" type and fill in data:
   - **🏷️ Name** - any printer name
   - **🌐 IP address** - local printer IP on network
   - **🔌 Moonraker port** - usually `7125`
   - **🖥️ Web interface port** - usually `80` or `4408`/`4409`

### Temperature Sensor Configuration (Klipper):
After adding a printer, click the **🌡️** button on the printer card to configure temperature sensor display.

**Two operating modes:**
- **Simple (default)** - automatic chamber detection, no setup needed
- **Advanced** - select specific sensors and give them custom names

### For Bambu Lab Printers:
1. ➕ Click "Add Printer"
2. 📝 Select "Bambu Lab" type and fill in data:
   - **🏷️ Name** - any printer name
   - **🌐 IP address** - local printer IP on network
   - **🔑 Access Code** - 8-digit code from developer mode
   - **🔢 Serial Number** - serial number from printer

📖 **Detailed instructions**: [BAMBU_LAB_SETUP.md](BAMBU_LAB_SETUP.md)

---

## 🎯 System Features

### 🎯 Status Priorities (smart dynamic sorting)

The closer to a problem and need for attention - the higher the priority:

1. 🔴 **Error** - critical problem, requires immediate attention
2. ⏸️ **Pause** - printer stopped, needs action
3. 🏁 **Complete** - model ready, need to remove and start next print
4. 🟢 **Printing 95-100%** - **automatically moves up!** Operator prepares for change
5. 🟡 **Ready** - waiting for job
6. 🟢 **Printing** - working normally
7. ⚫ **Offline** - doesn't interfere, at bottom

> **Important:** If cards don't fit on monitor - no problem! When approaching completion (95-100%), the card **automatically moves higher** in the list, and the operator will always see printers requiring attention.

### 🌡️ Visual Temperature Warnings
- **🔥 Nozzle > 170°C** - red color (hot surface!)
- **🔥 MCU > 60°C** - red color + enlarged font x2 (critical overheating!)
- Automatic detection of MCU/Board/Mainboard sensors

### 🔊 Sound Alerts
- **Windows XP sound** plays on critical events:
  - 🏁 Print complete
  - ⏸️ Pause
  - 🔴 Error
- Plays **3 times** to attract attention
- Looping was considered a bad idea and is not implemented

### 🧠 Smart Status Detection
System analyzes multiple data sources for accurate state determination:
- `print_stats.state`
- `virtual_sdcard.is_active` 
- `display_status.progress`
- 📁 Print activity by file name

---

## 🔧 Technical Details

### 🛠️ Technologies Used:
- **Electron 22.0+** - cross-platform framework
- **Node.js 14.0+** - JavaScript server platform
- **Chart.js 4.5+** - charting library
- **MQTT 5.3+** - for Bambu Lab communication
- **WebSocket** - for real-time with Klipper
- **electron-store** - for settings storage
- **HTML/CSS/JavaScript** - modern interface

### ✅ Compatibility

#### Supported Printers:
- ✅ **Klipper** with **Moonraker** (via HTTP/WebSocket)
- ✅ **Bambu Lab** (via MQTT) - X1, X1C, P1P, P1S, A1, A1 Mini and others
- ✅ **Fluidd** and **Mainsail** web interfaces

---

## 📋 Changelog

### 🆕 v1.4.0 (Current) - Smart Temperature Monitoring
- **🌡️ Smart temperature sensors** - flexible display configuration
- **🔥 Visual warnings** - critical temperatures highlighted
- **⚙️ Automatic sensor discovery** - full list from Moonraker API
- **🎨 Advanced configuration** - select specific sensors with custom names
- **🌍 Full localization** - all interfaces translated
- **🐛 Fixes** - improved stability

### 📊 v1.3.2 - Enhanced Analytics
- **📊 Chart.js integration** - professional interactive graphs
- **🎯 Fixed filtering** - correct data separation by printers
- **💰 Accurate calculations** - proper power consumption counting

📝 **Full changelog**: [changelog.md](changelog.md)

---

## 🆘 Troubleshooting

### ❌ Klipper Printer Not Connecting
- 🔍 Check IP address and Moonraker port (usually 7125)
- 🌐 Ensure printer is accessible on network
- 🛡️ Check firewall settings
- 🔧 Check CORS settings in Moonraker

### 🎋 Bambu Lab Printer Not Connecting

**🚀 Quick Fix:**
1. **Reboot printer** (power off and on)
2. Check **developer mode** (must be enabled)
3. Check **IP address** on printer screen
4. **Delete and re-add printer** in application

**📖 Detailed Instructions:**
- 🔧 [**Complete Troubleshooting Guide**](BAMBU_TROUBLESHOOTING_EN.md) - **START HERE**
- 📋 [Bambu Lab Setup Guide](BAMBU_LAB_SETUP.md)

**Common Causes:**
- 🔑 Developer mode not enabled or **printer not rebooted** after enabling
- 📝 Wrong **Access Code** (8 digits, no spaces)
- 🔢 Wrong **serial number** (15 characters, format: `01P00A123456789`)
- 🌐 Printer and PC on **different networks** (check ping)
- 🛡️ Firewall blocking **port 8883**
- 📍 IP address changed after router reboot

### 🌡️ Additional Temperature Sensors Not Visible (Klipper)
- ⚙️ Ensure sensors are configured in Klipper configuration
- 🔍 Click **🌡️** button on printer card for setup
- 📋 Select desired sensors and give them names
- ℹ️ Chamber is detected automatically (by default)

### 🔥 MCU Shows High Temperature
- ⚠️ This is a critical board overheating warning!
- ✅ Improve electronics cooling
- ✅ Lower chamber temperature
- ✅ Move control board outside the chamber

---

## 🎉 Advantages

- **🆓 Free** - full source code
- **🚀 Simple** - ready solution with installer
- **🎋 Universal** - Klipper and Bambu Lab in one app
- **📱 Convenient** - single panel for all printers
- **⚡ Fast** - optimized requests
- **🔧 Flexible** - configurable parameters
- **🌍 Multilingual** - Russian/English
- **📺 For large monitors** - enlarged elements, visible from distance
- **🎯 For farm operators** - smart sorting, sound alerts

---

## 📚 Additional Documentation

- 📖 [Bambu Lab Setup](BAMBU_LAB_SETUP.md)
- 📝 [Changelog](changelog.md)

---

## 🤝 Contributing

Pull requests and improvement suggestions are welcome!

---

## 💝 Support the Project

If this app helps you manage your 3D printer farm, I'd appreciate any support!

### ⭐ Telegram Stars
Send Telegram Stars to [@Tom_Tomich](https://t.me/Tom_Tomich)

### ₿ Cryptocurrency
Support via crypto (no card needed):
- **Bitcoin (BTC)**: `1BbmWrors1aT1Dzaxr7mZ1wAPrW742hpx4`
- **USDT (TRC20)**: `TK4dBymE4aZbXVQ8XRwxojh7i4JRamnfz6`
- **ETH/USDT (ERC20)**: `0xb041D2F44b79453DFB4344f8350a4Fd9Ba82D977`

> 💡 Any support motivates me to keep developing and adding new features!

---

## 📄 License

MIT License - free use and modification.

---

<div align="center">

*Developed for 3D farm operators and production managers*

**⭐ Don't forget to star if you like the project!**

**Support: Klipper + Bambu Lab = Convenient management of all your printers! 🖨️🎋**

</div>

