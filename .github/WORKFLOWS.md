# GitHub Actions Workflows

## Автоматическая сборка релизов / Automatic Release Building

Этот репозиторий использует GitHub Actions для автоматической сборки приложения на всех платформах.

This repository uses GitHub Actions to automatically build the application for all platforms.

### Как это работает / How it works

1. **При создании тега** вида `v*.*.*` (например, `v1.5.0`), GitHub Actions автоматически:
   - Собирает приложение на Linux (Ubuntu)
   - Собирает приложение на macOS
   - Собирает приложение на Windows
   - Загружает все файлы в релиз

2. **When creating a tag** like `v*.*.*` (e.g., `v1.5.0`), GitHub Actions automatically:
   - Builds the app on Linux (Ubuntu)
   - Builds the app on macOS
   - Builds the app on Windows
   - Uploads all files to the release

### Создание релиза / Creating a Release

#### Вариант 1: Создание тега локально (Local tag creation)

```bash
# 1. Убедитесь что все изменения закоммичены
git add .
git commit -m "Release v1.6.0"

# 2. Создайте тег
git tag -a v1.6.0 -m "v1.6.0: New features"

# 3. Запушьте тег (это запустит автоматическую сборку)
git push origin v1.6.0
```

#### Вариант 2: Через GitHub CLI

```bash
# Создайте релиз с пустым описанием (файлы добавятся автоматически)
gh release create v1.6.0 --title "v1.6.0: New features" --notes "Release notes here"
```

#### Вариант 3: Через веб-интерфейс GitHub

1. Перейдите на https://github.com/Tombraider2006/KCP/releases/new
2. Создайте новый тег `v1.6.0`
3. Заполните описание
4. Нажмите "Publish release"
5. Через несколько минут файлы для всех платформ появятся автоматически

### Результат / Result

После завершения GitHub Actions к релизу будут прикреплены:
- ✅ `3D-Printer-Control-Panel-Setup-X.X.X.exe` - установщик для Windows
- ✅ `3D-Printer-Control-Panel-X.X.X.dmg` - образ диска для macOS
- ✅ `3D-Printer-Control-Panel-X.X.X.AppImage` - портативная версия для Linux

After GitHub Actions completes, the release will have:
- ✅ `3D-Printer-Control-Panel-Setup-X.X.X.exe` - Windows installer
- ✅ `3D-Printer-Control-Panel-X.X.X.dmg` - macOS disk image
- ✅ `3D-Printer-Control-Panel-X.X.X.AppImage` - Linux portable version

### Время сборки / Build Time

Обычно сборка занимает 5-10 минут для всех платформ.

Typically, building takes 5-10 minutes for all platforms.

### Отслеживание процесса / Monitoring Progress

Следите за процессом сборки здесь:
https://github.com/Tombraider2006/KCP/actions

Monitor the build progress here:
https://github.com/Tombraider2006/KCP/actions

### Требования / Requirements

- Node.js 18
- npm
- electron-builder (уже в package.json)

### Troubleshooting

Если сборка не запустилась:
1. Проверьте, что тег начинается с `v` (например, `v1.5.0`, а не `1.5.0`)
2. Проверьте логи в Actions tab
3. Убедитесь, что в package.json есть скрипты `build:win`, `build:mac`, `build:linux`

If the build didn't start:
1. Check that the tag starts with `v` (e.g., `v1.5.0`, not `1.5.0`)
2. Check logs in Actions tab
3. Ensure package.json has `build:win`, `build:mac`, `build:linux` scripts

