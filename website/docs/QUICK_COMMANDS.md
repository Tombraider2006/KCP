# ⚡ Быстрые команды для управления сайтом

## 🔌 Подключение к серверу

```bash
ssh root@tomich.fun
cd /opt/website
```

---

## 🔄 Обновление сайта

### Через Git
```bash
git pull origin main
docker compose down && docker compose up -d --force-recreate
```

### Копирование одного файла с локального ПК
```powershell
# Windows PowerShell
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/
```

---

## 🚀 Управление контейнером

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart website

# Пересоздание (после изменений)
docker compose down && docker compose up -d --force-recreate

# Логи (живые)
docker compose logs -f website

# Логи (последние 50 строк)
docker compose logs --tail 50 website

# Статус
docker ps | grep 3dpc-website
```

---

## 📊 Мониторинг

```bash
# Все контейнеры
docker ps

# Telemetry (PM2)
pm2 list
pm2 logs 3dpc-telemetry

# Проверка сайта
curl -I https://tomich.fun

# Проверка SSL
curl -vI https://tomich.fun 2>&1 | grep issuer
```

---

## 💾 Backup

```bash
# Создать backup базы
cp website.db website.db.backup.$(date +%Y%m%d_%H%M%S)

# Создать backup .env
cp .env .env.backup

# Полный backup проекта
cd /opt
tar -czf website-backup-$(date +%Y%m%d_%H%M%S).tar.gz website/
```

---

## 🔧 Troubleshooting

```bash
# Жесткий перезапуск
docker compose down
docker rm -f 3dpc-website
docker compose up -d --force-recreate

# Проверка конфигурации
docker compose config

# Логи с ошибками
docker compose logs website --tail 100 | grep -i error

# Очистка Docker кэша
docker system prune -f
```

---

## 📝 Редактирование файлов

```bash
# Конфигурация
nano .env

# Серверный код
nano server.js

# Docker compose
nano docker-compose.yml

# После редактирования
docker compose restart website
```

---

## 🌐 Быстрая проверка

```bash
echo "=== Статус сервисов ==="
docker ps | grep -E "3dpc|traefik"
pm2 list

echo -e "\n=== Проверка сайта ==="
curl -I https://tomich.fun

echo -e "\n=== Логи (последние 10 строк) ==="
docker compose logs --tail 10 website
```

---

## 🔗 Полезные ссылки

- **Сайт:** https://tomich.fun
- **Админка:** https://tomich.fun/admin/login
- **Telemetry:** https://telemetry.tomich.fun
- **GitHub:** https://github.com/Tombraider2006/KCP

---

**Сохраните этот файл для быстрого доступа к командам!** 📌



