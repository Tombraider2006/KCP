#!/bin/bash

##############################################################################
# Скрипт автоматической установки сайта 3D Printer Control Panel на сервер
# Версия: 1.0
# Автор: Tom Tomich
##############################################################################

set -e  # Останавливаться при ошибках

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🖨️  3D Printer Control Panel - Website Installer      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Проверка что скрипт запущен из папки website
if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
    error "Запустите этот скрипт из папки website/"
fi

info "Текущая директория: $(pwd)"
echo ""

# ============================================================================
# ШАГ 1: Проверка Node.js и npm
# ============================================================================

info "Шаг 1/7: Проверка Node.js и npm..."

if ! command -v node &> /dev/null; then
    error "Node.js не установлен! Установите Node.js 14+ и запустите скрипт снова."
fi

if ! command -v npm &> /dev/null; then
    error "npm не установлен! Установите npm и запустите скрипт снова."
fi

NODE_VERSION=$(node -v)
success "Node.js установлен: $NODE_VERSION"
echo ""

# ============================================================================
# ШАГ 2: Проверка портов
# ============================================================================

info "Шаг 2/7: Проверка портов..."

# Проверяем что порт 3000 занят (telemetry сервер)
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    success "Порт 3000 занят (telemetry сервер работает) ✅"
elif ss -tuln 2>/dev/null | grep -q ":3000 "; then
    success "Порт 3000 занят (telemetry сервер работает) ✅"
else
    warning "Порт 3000 свободен. Убедитесь, что telemetry сервер запущен!"
fi

# Проверяем что порт 8080 свободен
if netstat -tuln 2>/dev/null | grep -q ":8080 "; then
    error "Порт 8080 уже занят! Измените PORT в .env или освободите порт."
elif ss -tuln 2>/dev/null | grep -q ":8080 "; then
    error "Порт 8080 уже занят! Измените PORT в .env или освободите порт."
else
    success "Порт 8080 свободен ✅"
fi

echo ""

# ============================================================================
# ШАГ 3: Создание .env конфигурации
# ============================================================================

info "Шаг 3/7: Создание конфигурации..."

if [ ! -f ".env" ]; then
    info "Создаю .env файл из шаблона..."
    
    # Генерируем случайный SESSION_SECRET
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    
    # Создаем .env
    cat > .env << EOF
# Server Configuration
PORT=8080
NODE_ENV=production

# Session Secret (автоматически сгенерирован)
SESSION_SECRET=$SESSION_SECRET

# Admin Credentials (ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123

# GitHub Configuration
GITHUB_TOKEN=
GITHUB_OWNER=Tombraider2006
GITHUB_REPO=KCP

# Website Configuration
SITE_URL=https://tomich.fun
SITE_NAME=3D Printer Control Panel

# Database Configuration
DATABASE_PATH=./website.db
EOF
    
    success ".env файл создан!"
    warning "⚠️  ВАЖНО: Измените ADMIN_PASSWORD в .env файле!"
    echo ""
    
    read -p "Нажмите Enter для продолжения или Ctrl+C для редактирования .env..."
else
    success ".env файл уже существует"
fi

echo ""

# ============================================================================
# ШАГ 4: Установка зависимостей
# ============================================================================

info "Шаг 4/7: Установка npm зависимостей..."

if [ ! -d "node_modules" ]; then
    info "Устанавливаю пакеты..."
    npm install --production
    success "Зависимости установлены!"
else
    info "Обновляю зависимости..."
    npm install --production
    success "Зависимости обновлены!"
fi

echo ""

# ============================================================================
# ШАГ 5: Проверка базы данных
# ============================================================================

info "Шаг 5/7: Проверка базы данных..."

if [ -f "website.db" ]; then
    warning "База данных website.db уже существует"
    read -p "Пересоздать базу данных? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Создаю резервную копию..."
        mv website.db "website.db.backup.$(date +%Y%m%d_%H%M%S)"
        success "Старая база сохранена как backup"
    fi
else
    success "База данных будет создана при первом запуске"
fi

echo ""

# ============================================================================
# ШАГ 6: Установка PM2 и запуск сервера
# ============================================================================

info "Шаг 6/7: Настройка PM2 и запуск сервера..."

if ! command -v pm2 &> /dev/null; then
    warning "PM2 не установлен. Устанавливаю..."
    if command -v sudo &> /dev/null; then
        sudo npm install -g pm2
    else
        npm install -g pm2
    fi
    success "PM2 установлен!"
fi

# Останавливаем старый процесс если есть
if pm2 describe 3dpc-website &> /dev/null; then
    info "Останавливаю старый процесс..."
    pm2 delete 3dpc-website
fi

# Запускаем новый процесс
info "Запускаю сервер..."
pm2 start server.js --name "3dpc-website" --time

# Сохраняем конфигурацию
pm2 save

success "Сервер запущен!"
echo ""

# Проверяем статус
pm2 list

echo ""

# ============================================================================
# ШАГ 7: Настройка автозапуска
# ============================================================================

info "Шаг 7/7: Настройка автозапуска при перезагрузке..."

read -p "Настроить автозапуск при перезагрузке сервера? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    info "Генерирую команду настройки автозапуска..."
    
    # Получаем команду от pm2 startup
    STARTUP_CMD=$(pm2 startup | grep "sudo env PATH" || pm2 startup | grep "sudo")
    
    if [ -z "$STARTUP_CMD" ]; then
        warning "Не удалось получить команду автозапуска."
        info "Выполните вручную после установки:"
        echo "   pm2 startup"
        echo "   # Затем выполните команду, которую покажет PM2"
        echo "   pm2 save"
    else
        info "Команда автозапуска:"
        echo "   $STARTUP_CMD"
        echo ""
        
        if command -v sudo &> /dev/null; then
            read -p "Выполнить команду? (требуется sudo) (Y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                eval "$STARTUP_CMD"
                pm2 save
                success "Автозапуск настроен!"
            else
                info "Выполните команду вручную для настройки автозапуска"
            fi
        else
            warning "sudo не доступен. Выполните команду вручную:"
            echo "$STARTUP_CMD"
            info "После выполнения команды запустите: pm2 save"
        fi
    fi
else
    info "Автозапуск пропущен"
    info "Для настройки позже выполните: pm2 startup && pm2 save"
fi

echo ""

# ============================================================================
# ИТОГОВАЯ ИНФОРМАЦИЯ
# ============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Установка завершена успешно!                        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

success "Сервер запущен на порту 8080"
echo ""

info "🌐 URL сайта:"
echo "   • Локально:       http://localhost:8080"
echo "   • Внешний адрес:  https://tomich.fun (после настройки Nginx)"
echo ""

info "🔐 Админ-панель:"
echo "   • URL:      http://localhost:8080/admin/login"
echo "   • Логин:    admin (или из .env)"
echo "   • Пароль:   из файла .env"
echo ""

warning "⚠️  ОБЯЗАТЕЛЬНО СДЕЛАЙТЕ:"
echo "   1. Измените ADMIN_PASSWORD в .env файле"
echo "   2. Перезапустите сервер: pm2 restart 3dpc-website"
echo "   3. Настройте Nginx для доступа через домен"
echo ""

info "📊 Управление сервером:"
echo "   • Логи:        pm2 logs 3dpc-website"
echo "   • Статус:      pm2 list"
echo "   • Перезапуск:  pm2 restart 3dpc-website"
echo "   • Остановка:   pm2 stop 3dpc-website"
echo "   • Мониторинг:  pm2 monit"
echo ""

info "📁 Файлы:"
echo "   • База данных: $(pwd)/website.db"
echo "   • Конфигурация: $(pwd)/.env"
echo "   • Логи PM2: ~/.pm2/logs/"
echo ""

info "🔧 Следующие шаги:"
echo "   1. Добавьте скриншоты в: $(pwd)/public/screenshots/"
echo "   2. Создайте первую новость через админ-панель"
echo "   3. Настройте GitHub Token для приватного репозитория"
echo ""

# Показываем логи
read -p "Показать логи сервера? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    pm2 logs 3dpc-website --lines 20
fi

echo ""
success "Готово! Сайт работает! 🚀"
echo ""

