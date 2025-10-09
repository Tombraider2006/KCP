# 🔧 Bambu Lab Troubleshooting Guide

## 🚨 Printer Won't Connect

If your Bambu Lab printer won't connect despite entering all data correctly and enabling developer mode, follow this step-by-step guide.

---

## ✅ Checklist (check in order)

### 1️⃣ **Verify Developer Mode**

**On printer's touchscreen:**
1. Navigate to: **Settings** → **Network** → **LAN Only Mode** (or **Developer Mode**)
2. Make sure the toggle is **ENABLED** (green)
3. Write down the **Access Code** (8 digits) - it's permanent, doesn't change

⚠️ **IMPORTANT**: 
- After enabling developer mode, **reboot the printer** (power off and on)
- Access Code must be **exactly 8 digits**
- Case sensitive? **NO** - numbers only

### 2️⃣ **Verify IP Address**

**On printer's touchscreen:**
1. Navigate to: **Settings** → **Network** → **Network Information**
2. Find the **IP address** (e.g., `192.168.1.100`)
3. Ensure IP address starts with the same subnet as your PC

**Test printer accessibility:**
```bash
# Windows (PowerShell or CMD)
ping 192.168.1.100

# You should get responses:
# Reply from 192.168.1.100: bytes=32 time=1ms TTL=64
```

❌ **If ping fails:**
- Printer and PC are on different networks
- Router is blocking connections
- Wrong IP address

### 3️⃣ **Verify Serial Number**

**Serial number format**: `01P00A123456789` (15 characters)

**Where to find:**
- On **label** on printer body
- In **Bambu Handy** app: Settings → About Printer
- On **touchscreen**: Settings → About Printer

⚠️ **IMPORTANT**: 
- Serial number must be **exact**
- Check for extra spaces at beginning/end
- Case matters: `01P00A` (uppercase letters)

### 4️⃣ **Check Firewall**

Bambu Lab uses **port 8883** for MQTT connection.

**Windows:**
1. Open **Windows Defender Firewall**
2. Go to: **Advanced settings** → **Outbound Rules**
3. Find **3D Printer Control Panel** application
4. Ensure it's **allowed**

**Or create rule manually:**
```
Port: 8883
Protocol: TCP
Direction: Outbound
Action: Allow
```

**Quick test** (temporarily disable firewall):
- **NOT RECOMMENDED** for permanent use
- For diagnostics only

### 5️⃣ **Test MQTT Connection**

**Use MQTT Explorer** (free tool):
1. Download: [mqtt-explorer.com](http://mqtt-explorer.com/)
2. Configure connection:
   - **Protocol**: `mqtts://`
   - **Host**: Your printer's IP
   - **Port**: `8883`
   - **Username**: `bblp`
   - **Password**: Your Access Code
   - **SSL/TLS**: Enabled, but without certificate verification
3. Click **Connect**

✅ **If it connects** - issue is in the app (restart app)  
❌ **If it doesn't connect** - issue is in printer settings or network

---

## 🔍 Common Issues

### ❌ "Connection timeout - exceeded connection timeout"

**Causes:**
1. Printer is off or sleeping
2. Wrong IP address
3. Firewall blocking port 8883
4. Printer and PC on different subnets

**Solution:**
- Check printer is **powered on** and not in sleep mode
- Verify IP address (may change after router reboot)
- Temporarily disable firewall for testing
- Use **static IP** for printer in router settings

### ❌ "Printer unavailable. Check IP address"

**Causes:**
1. Wrong IP address
2. Printer changed IP (DHCP)
3. Printer is off

**Solution:**
- Check IP address on printer screen
- Set up **static IP** in router
- Ensure printer is powered on

### ❌ "Invalid Access Code"

**Causes:**
1. Code written incorrectly
2. Developer mode was toggled off and on (code might have changed)
3. Extra spaces when entering

**Solution:**
- Check code on printer screen again
- Copy code **without spaces**
- Try disabling and enabling developer mode again

### ❌ "Not authorized" or authorization errors

**Causes:**
1. Developer mode is **disabled**
2. Wrong Access Code
3. Printer wasn't rebooted after enabling developer mode

**Solution:**
1. Verify developer mode is **enabled**
2. **Reboot printer** (power off and on)
3. Check Access Code
4. Wait 30-60 seconds after powering on printer

---

## 🛠️ Step-by-Step Diagnostics

If printer still won't connect, perform these steps **in order**:

### Step 1: Full Reboot
1. **Close** 3D Printer Control Panel app
2. **Power off** printer (unplug)
3. Wait **30 seconds**
4. **Power on** printer
5. Wait for full boot (screen ready)
6. **Launch** app again

### Step 2: Verify Developer Mode
1. On printer screen: **Settings** → **Network** → **Developer Mode**
2. If **disabled** - enable it
3. **Reboot printer** again
4. Write down **Access Code**

### Step 3: Ping Test
```bash
ping <printer_IP> -t
```
Should get responses. If not - network issue.

### Step 4: Check Port 8883
**Windows:**
```powershell
Test-NetConnection -ComputerName <printer_IP> -Port 8883
```

**Linux/Mac:**
```bash
nc -zv <printer_IP> 8883
```

If port is **closed** or **filtered** - firewall or router issue.

### Step 5: Recreate Printer in App
1. **Delete** printer from app
2. **Restart** app
3. **Add** printer again with correct data:
   - Type: **Bambu Lab**
   - IP: Verified IP
   - Access Code: Verified code (8 digits)
   - Serial Number: Exact serial number

---

## 🌐 Network Settings

### Recommended Configuration

#### 1. Static IP for Printer
Set up **DHCP Reservation** in router:
- Bind printer's MAC address to permanent IP
- IP won't change after reboot

#### 2. Firewall Setup
Create exception for:
- **Application**: `3D Printer Control Panel.exe`
- **Port**: `8883`
- **Protocol**: `TCP`
- **Direction**: Outbound

#### 3. Router
Some routers have AP Isolation protection:
- Ensure **AP Isolation is disabled**
- Check **Guest Network** - printer shouldn't be on guest network

---

## 📊 Logs and Diagnostics

### View Logs in App
1. Open **3D Printer Control Panel**
2. Click **"📋 Event Log"** button at bottom
3. Find connection error messages
4. Copy error text for analysis

### Typical Error Messages

#### ✅ Successful connection:
```
✅ Bambu Lab: <Name> connected successfully
```

#### ❌ Timeout error:
```
❌ Connection timeout - exceeded connection timeout (10 sec)
```
**Solution**: Check network and firewall

#### ❌ ECONNREFUSED error:
```
❌ Printer unavailable. Check IP address and ensure printer is on.
```
**Solution**: Check IP and if printer is on

#### ❌ Authorization error:
```
❌ Invalid Access Code. Check code in printer settings.
```
**Solution**: Check Access Code and developer mode

---

## 🔄 Alternative Solutions

### Option 1: Use Bambu Handy App
To verify printer works correctly:
1. Install **Bambu Handy** on phone
2. Connect to printer via **LAN Mode**
3. If connects - issue is in PC/app settings
4. If doesn't connect - issue is in printer

### Option 2: Use Bambu Studio
1. Open **Bambu Studio**
2. Try connecting via **LAN Mode**
3. If works - compare settings with app

---

## 📞 Getting Help

If nothing helped, prepare this information:

### Diagnostic Data:
```
1. Printer model: (X1, X1C, P1P, P1S, etc.)
2. Printer IP address:
3. Printer firmware version:
4. PC Operating System:
5. App version:
6. Error log screenshot:
7. Ping command result:
8. Developer mode enabled: Yes/No
9. Printer connects via Bambu Handy: Yes/No
```

### Where to Contact:
- **GitHub Issues**: [github.com/Tombraider2006/KCP/issues](https://github.com/Tombraider2006/KCP/issues)
- **Telegram**: [@Tom_Tomich](https://t.me/Tom_Tomich)

---

## ⚡ Quick Fix (90% of cases)

Most issues are solved like this:

1. ✅ **Reboot printer** (power off and on)
2. ✅ **Check developer mode** on printer screen
3. ✅ **Check IP address** (may have changed)
4. ✅ **Delete and re-add printer** in app
5. ✅ **Restart app**

---

## 🎓 Additional Information

### MQTT Connection Technical Details:
- **Protocol**: MQTTS (MQTT over TLS/SSL)
- **Port**: 8883
- **Username**: `bblp` (standard for all printers)
- **Password**: Access Code (8 digits)
- **Subscribe topic**: `device/<SerialNumber>/report`
- **Command topic**: `device/<SerialNumber>/request`

### Network Requirements:
- Printer and PC must be on **same local network**
- Router must not block port **8883**
- **Multicast** must be allowed (for printer discovery)
- **AP Isolation** must be disabled

---

## ✅ Checklist Before Asking for Help

Before asking for help, make sure you've **done everything** from this list:

- [ ] Developer mode enabled on printer
- [ ] Printer rebooted after enabling developer mode
- [ ] Access Code is correct (8 digits, no spaces)
- [ ] Serial number is correct (15 characters)
- [ ] IP address is correct and current
- [ ] Ping to printer succeeds
- [ ] Firewall not blocking app
- [ ] Port 8883 is open
- [ ] Printer and PC on same network
- [ ] App restarted
- [ ] Printer deleted and re-added in app
- [ ] Error logs reviewed in app
- [ ] Bambu Handy can connect to printer

---

**Happy printing! 🖨️🎋**

