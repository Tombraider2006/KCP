# Bambu Lab Integration Setup Guide

## 🎋 Bambu Lab Support

This application now supports **Bambu Lab** 3D printers in addition to Klipper-based printers!

## 📋 Requirements

### For Bambu Lab Printers:

1. **Developer Mode** must be enabled on your printer (or "LAN Mode" in older firmware)
2. **Access Code** from printer settings
3. **Serial Number** of your printer
4. **Local Network** connection (printer and PC on same network)

## 🔧 Installation Steps

### Step 1: Install the Application

Download the ready installer from [**releases**](https://github.com/Tombraider2006/KCP/releases/):

- 🪟 **Windows**: `3D-Printer-Control-Panel-Setup-X.X.X.exe`
- 🍎 **macOS**: `3D-Printer-Control-Panel-X.X.X.dmg`
- 🐧 **Linux**: `3D-Printer-Control-Panel-X.X.X.AppImage`

All dependencies, including MQTT library (`mqtt@^5.3.5`), are already included in the installer!

### Step 2: Enable Developer Mode on Printer

1. Go to printer settings on the printer's touchscreen
2. Navigate to **Settings → Network → Developer Mode**
3. Enable Developer Mode
4. Note the **Access Code** displayed

⚠️ **Important**: Without Developer Mode enabled, the printer will not accept connections from third-party software.

### Step 3: Get Printer Information

You'll need:

- **IP Address**: Find in printer's network settings
- **Access Code**: 8-digit code from developer mode settings
- **Serial Number**: Found on printer label or in settings (format: `01P00A123456789`)

## 📱 Adding a Bambu Lab Printer

1. Click **"➕ Add Printer"** button
2. Select **"Bambu Lab"** from the printer type dropdown
3. Fill in the required information:
   - **Printer Name**: Any name you choose
   - **IP Address**: Your printer's local IP (e.g., `192.168.1.100`)
   - **Access Code**: 8-digit code from developer mode
   - **Serial Number**: Your printer's serial number
4. Ensure **"Developer Mode enabled on printer"** checkbox is checked
5. Click **"Add"**

## 🔌 Connection Protocol

- **Bambu Lab** printers use **MQTT** protocol (port 8883)
- **Klipper** printers use **HTTP/WebSocket** (port 7125)

## 🎯 Supported Features

### Currently Supported:
- ✅ Add/Edit/Remove Bambu Lab printers
- ✅ Store printer configuration
- ✅ Display printer type in UI
- ✅ Bilingual support (Russian/English)

### In Development:
- 🔄 Real-time MQTT connection
- 🔄 Print status monitoring
- 🔄 Temperature monitoring
- 🔄 Progress tracking
- 🔄 File information

## ⚠️ Known Limitations

1. **Web Interface**: Bambu Lab printers don't have a local web interface like Klipper (use Bambu Handy app or Bambu Studio instead)
2. **January 2025 Firmware**: Latest Bambu Lab firmware requires Developer Mode for any third-party software
3. **Camera**: Direct camera streaming not yet supported

## 🔍 Troubleshooting

### ⚠️ Printer Won't Connect?

📖 **[→ Complete Troubleshooting Guide (BAMBU_TROUBLESHOOTING_EN.md)](BAMBU_TROUBLESHOOTING_EN.md)**

### "Developer mode must be enabled in printer settings"

**Solution**: 
1. On printer touchscreen: Settings → Network → Developer Mode (LAN Only Mode)
2. Enable it and note the Access Code
3. **MUST reboot printer** (power off and on)
4. Wait 30-60 seconds after powering on

### Connection Failed - Checklist

**Check in this order**:
- ✅ Developer mode enabled **AND printer rebooted**
- ✅ Printer and PC on same network (test with `ping printer_IP`)
- ✅ IP address is current (may change after router reboot)
- ✅ Access Code is correct (exactly 8 digits, no spaces)
- ✅ Serial number is correct (15 characters, format: `01P00A123456789`)
- ✅ Firewall not blocking port 8883
- ✅ Application updated to latest version

### 🚀 Quick Fix (works in 90% of cases)

1. **Reboot printer** (unplug, wait 30 sec, plug back in)
2. **Check IP address** on printer screen (may have changed)
3. **Delete and re-add printer** in application
4. **Restart application**

If this doesn't help → **[Complete Troubleshooting Guide](BAMBU_TROUBLESHOOTING_EN.md)**

## 📚 Related Resources

- [Bambu Lab Official Website](https://bambulab.com)
- [Bambu Studio Download](https://bambulab.com/download)
- [Bambu Handy App](https://bambulab.com/download)
- [Bambu Lab Community](https://bambulab.com/community)

## 🆘 Support

If you encounter issues:

1. Check the **Event Log** in the application for error messages
2. Verify all prerequisites are met
3. Try removing and re-adding the printer
4. Restart the application

## 🔄 Version History

- **v1.3.1** (2025): Added Bambu Lab support
- **v1.3.0**: Base version with Klipper support

---

## 🎨 Screenshots

### Adding Bambu Lab Printer
When adding a printer, select "Bambu Lab" from the dropdown to see Bambu-specific fields:
- Access Code input
- Serial Number input
- Developer Mode reminder

### Printer Cards
Bambu Lab printers are displayed with a 🎋 icon and show the serial number alongside the IP address.

---

**Happy Printing! 🖨️**

