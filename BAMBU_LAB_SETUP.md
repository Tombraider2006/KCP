# Bambu Lab Integration Setup Guide

## 🎋 Bambu Lab Support

This application now supports **Bambu Lab** 3D printers in addition to Klipper-based printers!

## 📋 Requirements

### For Bambu Lab Printers:

1. **Developer Mode** must be enabled on your printer
2. **Access Code** from printer settings
3. **Serial Number** of your printer
4. **Local Network** connection (printer and PC on same network)
5. **MQTT Library** installed (see installation steps below)

## 🔧 Installation Steps

### Step 1: Install MQTT Dependency

Before using Bambu Lab printers, you need to install the MQTT library:

```bash
npm install
```

This will install all dependencies including `mqtt@^5.3.5` required for Bambu Lab communication.

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

1. **MQTT Connection**: Full MQTT support requires the application to be restarted after `npm install`
2. **Web Interface**: Bambu Lab printers don't have a local web interface like Klipper (use Bambu Handy app or Bambu Studio instead)
3. **January 2025 Firmware**: Latest Bambu Lab firmware requires Developer Mode for any third-party software

## 🔍 Troubleshooting

### "MQTT support requires npm install"

**Solution**: 
```bash
cd path/to/3DC
npm install
# Then restart the application
```

### "Developer mode must be enabled in printer settings"

**Solution**: 
1. On printer touchscreen: Settings → Network → Developer Mode
2. Enable it and note the Access Code
3. Restart the printer if needed

### Connection Failed

**Checklist**:
- ✅ Printer and PC on same network
- ✅ Developer Mode enabled
- ✅ Correct Access Code entered
- ✅ Correct Serial Number entered
- ✅ Firewall not blocking port 8883
- ✅ `npm install` completed successfully

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
4. Ensure `npm install` was run and application restarted

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

