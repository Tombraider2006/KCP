# План консолидации документации

## Анализ текущего состояния: 50 MD файлов

### Группы для объединения:

1. **WEB_SERVER группа** (14 файлов → 1 файл)
   - WEB_SERVER.md (основной)
   - WEB_SERVER_QUICKSTART.md
   - WEB_SERVER_UPDATES.md
   - WEB_SERVER_BUTTONS_FIX.md
   - WEB_SERVER_FINAL_FIXES.md
   - WEB_SERVER_SUMMARY.md
   - WEB_SERVER_FINAL.md
   - WEB_SERVER_STATUS_FIX.md
   - WEB_SERVER_FEATURES_COMPLETE.md
   - WEB_SERVER_MODAL_FIX.md
   - WEB_SERVER_STATUS_LINE_FIX.md
   - WEB_SERVER_ARCHITECTURE_FIX.md
   - WEB_SERVER_COMPLETE.md
   - WEB_INTERFACE_CARDS_UPDATE.md
   → **WEB_SERVER.md** (полная документация)

2. **BAMBU_LAB группа** (6 файлов → 2 файла)
   - BAMBU_LAB_SETUP_RU.md + BAMBU_LAB_SETUP.md → **BAMBU_LAB_SETUP.md** (билингвальный)
   - BAMBU_TROUBLESHOOTING_EN.md + BAMBU_TROUBLESHOOTING_RU.md → **BAMBU_TROUBLESHOOTING.md** (билингвальный)
   - BAMBU_OFFLINE_FIX.md + BAMBU_OFFLINE_SYNC_FIX.md → включить в changelog

3. **ANALYTICS группа** (3 файла → 1 файл)
   - ANALYTICS_FIXES_APPLIED.md
   - ANALYTICS_LOGIC_ISSUES.md
   - ANALYTICS_SUMMARY_RU.md
   → **ANALYTICS_DOCUMENTATION.md**

4. **VERSION группа** (2 файла → changelog)
   - VERSION_1.5.28.md
   - VERSION_FIX_1.5.28.md
   → включить в **changelog.md**

5. **BUILD группа** (2 файла → 1 файл)
   - BUILD_CONFIGURATION.md
   - BUILD_FIX_SUMMARY.md
   → **BUILD_CONFIGURATION.md**

6. **CHANGELOG группа** (5 файлов → 1 файл)
   - changelog.md (основной)
   - CHANGELOG_BATCH_EXPORT_2025_10_10.md
   - FINAL_UPDATE_SUMMARY_2025_10_10.md
   - FIX_SUMMARY_2025_10_10.md
   - HELP_BUTTON_ADDED_2025_10_10.md
   → **changelog.md**

7. **Разовые фиксы** (удалить после включения в changelog):
   - CLEANUP_SUMMARY.md
   - FINAL_SUMMARY.md
   - GIT_PUSH_SUMMARY.md
   - HELP_BUTTON_ADDED.md
   - KLIPPER_STATUS_FIX.md
   - REORGANIZATION_COMPLETE.md
   - SCANNER_UX_FIX.md
   - RENDERER_STRUCTURE_ADDED.md
   - PRINTER_MANAGEMENT_UNIFIED_2025_10_10.md

8. **Оставить как есть**:
   - README_EN.md
   - README_INTEGRATION.md
   - RELEASE_NOTES.md
   - INDEX.md
   - BATCH_ADD_EXPORT_IMPORT.md
   - USER_GUIDE_BATCH_EXPORT_RU.md
   - CODE_AUDIT_REPORT.md
   - DATA_OPTIMIZATION.md
   - DATA_STRUCTURIZATION.md

## Результат: 50 → 15 файлов (-70%)

### Структура после консолидации:
1. INDEX.md - главная документация
2. changelog.md - полная история изменений
3. RELEASE_NOTES.md - релизные заметки
4. README_EN.md - основной README
5. README_INTEGRATION.md - интеграции
6. WEB_SERVER.md - веб-сервер (полная документация)
7. BAMBU_LAB_SETUP.md - настройка Bambu Lab
8. BAMBU_TROUBLESHOOTING.md - устранение проблем Bambu Lab
9. BUILD_CONFIGURATION.md - конфигурация сборки
10. BATCH_ADD_EXPORT_IMPORT.md - пакетный импорт/экспорт
11. USER_GUIDE_BATCH_EXPORT_RU.md - руководство пользователя
12. ANALYTICS_DOCUMENTATION.md - аналитика
13. CODE_AUDIT_REPORT.md - аудит кода
14. DATA_OPTIMIZATION.md - оптимизация данных
15. DATA_STRUCTURIZATION.md - структуризация данных

