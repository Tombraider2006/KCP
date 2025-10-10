# Changelog - Batch Add & Export/Import Features

## Version: 1.5.28 (October 10, 2025)

### 🎉 New Features

#### 1. Batch Printer Addition
- **Checkbox selection** in network scan results
- **Select All / Deselect All** functionality
- **Batch add selected** printers with one click
- **Add all new** printers automatically
- **Automatic name numbering** for duplicates (e.g., "Printer", "Printer (1)", "Printer (2)")
- Real-time counter showing number of selected printers

#### 2. Export Printer Configuration
- **Export all printers** to JSON file with one click
- **Encrypted credentials** for Bambu Lab printers (Access Code, Serial Number)
- **Timestamped filenames** (`3d-printers-config-YYYY-MM-DD.json`)
- Includes all printer settings:
  - Name, IP address, type
  - Klipper: ports (Moonraker, web interface)
  - Bambu Lab: encrypted credentials
- **Version control** for future compatibility

#### 3. Import Printer Configuration
- **Import printers** from previously exported JSON files
- **Automatic validation** of file format
- **Smart duplicate handling**:
  - Skips printers with existing IP addresses
  - Generates unique names for duplicate names
- **Automatic connection testing** for imported printers
- Shows import statistics (added/skipped counts)

### 🎨 UI Improvements

#### Main Window
- Added **"📤 Export"** button to toolbar
- Added **"📥 Import"** button to toolbar
- Responsive layout with proper spacing
- Full bilingual support (Russian/English)

#### Network Scanner Modal
- **Checkboxes** for each printer in scan results
- **Batch operation controls**:
  - Select All / Deselect All buttons
  - Add Selected (N) button with counter
  - Add All New button
- **Visual indicators** for already added printers
- Enhanced hover effects for better UX

### 🌐 Localization

Added translations for all new features:
- Russian (Русский)
- English

New translation keys:
- `batch_add_selected`, `batch_add_all`
- `export_printers`, `import_printers`
- `printers_exported`, `printers_imported`
- `select_all`, `deselect_all`
- `selected_count`, `batch_add_success`
- And more...

### 🔒 Security

- **Encryption** for sensitive Bambu Lab credentials
- **Validation** of imported file format
- **Error handling** for corrupted or invalid files
- Safe handling of decryption failures

### 🎨 Styling

New CSS classes:
- `.scan-result-checkbox-wrapper` - checkbox container
- `.scan-result-checkbox` - styled checkbox with accent color
- `.scan-result-item` - improved scan result item with hover effects
- Smooth transitions and animations

### 📝 Technical Changes

**Modified Files:**
- `src/renderer.js` - Added batch add, export/import functions
- `src/translations.js` - Added new translation keys
- `src/index.html` - Updated UI with new buttons and controls
- `src/styles.css` - Added styles for new UI elements

**New Functions:**
- `generateUniquePrinterName()` - automatic name numbering
- `togglePrinterSelection()` - checkbox management
- `selectAllPrinters()` / `deselectAllPrinters()` - bulk selection
- `batchAddSelectedPrinters()` - batch add selected
- `batchAddAllPrinters()` - batch add all new
- `exportPrinters()` - export configuration
- `importPrinters()` - import configuration
- `updateBatchAddButtons()` - UI state management

### 🔧 Compatibility

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+, Debian, Fedora)
- ✅ Klipper printers
- ✅ Bambu Lab printers
- ✅ Bilingual (RU/EN)

### 📚 Documentation

New documentation files:
- `docs/BATCH_ADD_EXPORT_IMPORT.md` - Technical documentation
- `docs/USER_GUIDE_BATCH_EXPORT_RU.md` - User guide in Russian

### 🧪 Testing Recommendations

Please test:
1. Network scanning and batch printer addition
2. Export with different printer types (Klipper + Bambu Lab)
3. Import on different computer
4. Automatic name numbering with duplicates
5. Error handling with invalid import files
6. UI responsiveness and translations

### 📦 Use Cases

#### Setup Print Farm
1. Scan network
2. Select all found printers
3. Click "Add Selected"
4. Done!

#### Migrate to New Computer
1. Old PC: Click "Export"
2. Copy file to new PC
3. New PC: Click "Import"
4. All printers restored!

#### Regular Backups
- Export configuration monthly
- Keep backups in safe location
- Quick restore when needed

### 🐛 Bug Fixes

None (new feature release)

### 📌 Known Limitations

- Export/import **does not include**:
  - Print history
  - Analytics data
  - Event logs
- Bambu Lab credentials require manual entry if decryption fails
- Import skips printers with duplicate IP addresses

### 🔜 Future Improvements

Potential enhancements for future versions:
- Export/import of analytics data
- Selective export (choose specific printers)
- Cloud sync capabilities
- Auto-backup functionality

---

**Contributors:** AI Assistant  
**Date:** October 10, 2025  
**Version:** 1.5.28


