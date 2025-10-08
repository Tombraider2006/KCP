# 🚀 Quick Start Guide

## Bambu Lab Integration - Get Started in 3 Minutes!

### 📦 Step 1: Install Dependencies (30 seconds)

```bash
cd D:\3DC
npm install
```

### 🔄 Step 2: Restart Application (10 seconds)

```bash
npm start
```

Or double-click on the application icon if already built.

### 🖨️ Step 3: Add Your First Bambu Lab Printer (2 minutes)

#### A. Prepare Your Printer

1. On printer touchscreen: **Settings → Network → Developer Mode**
2. **Enable** Developer Mode
3. Write down the **Access Code** (8 digits)
4. Write down your printer's **IP Address** (in Network settings)
5. Find **Serial Number** (on printer label, format: `01P00A123456789`)

#### B. Add in Application

1. Click **"➕ Add Printer"** button
2. Select **"Bambu Lab"** from dropdown
3. Fill in:
   - **Printer Name**: "My Bambu X1C" (or any name)
   - **IP Address**: `192.168.1.100` (your printer's IP)
   - **Access Code**: `12345678` (from step A.3)
   - **Serial Number**: `01P00A123456789` (from step A.5)
4. Check ✅ **"Developer Mode enabled on printer"**
5. Click **"Add"**

### ✅ Done!

Your Bambu Lab printer is now added to the control panel!

---

## 🎯 What You Can Do Now

- ✅ View printer in the dashboard
- ✅ Edit printer settings
- ✅ See printer type indicator (🎋 Bambu Lab)
- ✅ Switch between Klipper and Bambu Lab printers

---

## ⚡ Common Issues

### "MQTT support requires npm install"
**Fix**: Run `npm install` and restart the app

### "Connection failed"
**Checklist**:
- ✅ Developer Mode enabled on printer
- ✅ Correct Access Code
- ✅ Correct Serial Number  
- ✅ Printer and PC on same network
- ✅ `npm install` completed

---

## 📚 Need More Help?

- **Detailed Setup**: See `BAMBU_LAB_SETUP.md` or `BAMBU_LAB_SETUP_RU.md`
- **Changelog**: See `CHANGELOG_BAMBU.md`
- **Full README**: See `README_INTEGRATION.md`

---

**Happy Printing! 🖨️🎋**

