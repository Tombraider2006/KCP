# 🔄 Инструкция по обновлению сайта на сервере

## 📤 Копирование файлов с Windows на сервер

### Способ 1: SCP (встроен в Windows 10/11)

```powershell
# Windows PowerShell
cd D:\3DC\website

# Один файл
scp server.js root@tomich.fun:/opt/website/

# Несколько файлов
scp server.js database.js root@tomich.fun:/opt/website/

# Папка целиком
scp -r public root@tomich.fun:/opt/website/

# Скриншоты
scp public\screenshots\*.png root@tomich.fun:/opt/website/public/screenshots/
```

### Способ 2: WinSCP (графический интерфейс)

1. Скачайте [WinSCP](https://winscp.net/eng/download.php)
2. Подключитесь:
   - Хост: `tomich.fun`
   - Порт: `22`
   - Пользователь: `root`
3. Перетащите файлы мышкой
4. На сервере: `docker compose restart website`

### После копирования файлов

```bash
# Перезапустите контейнер
ssh root@tomich.fun "cd /opt/website && docker compose restart website"

# Или если изменили зависимости
ssh root@tomich.fun "cd /opt/website && docker compose down && docker compose up -d --force-recreate"
```

---

# 🔄 Инструкция по обновлению сайта на сервере

## 📋 Быстрая шпаргалка

### Обновление через Git (рекомендуется)

```bash
# 1. Подключитесь к серверу
ssh root@tomich.fun

# 2. Перейдите в папку проекта
cd /opt/website

# 3. Получите изменения из Git
git pull origin main

# 4. Пересоздайте Docker контейнер
docker compose down
docker compose up -d --force-recreate

# 5. Проверьте логи
docker compose logs -f website
```

### Обновление через SCP (копирование файлов)

**С вашего компьютера (Windows PowerShell):**

```powershell
# Перейдите в папку проекта
cd D:\3DC\website

# Скопируйте изменённые файлы
scp server.js root@tomich.fun:/opt/website/
scp database.js root@tomich.fun:/opt/website/
scp -r public/* root@tomich.fun:/opt/website/public/
scp -r routes/* root@tomich.fun:/opt/website/routes/

# Или всю папку целиком (кроме node_modules)
scp -r * root@tomich.fun:/opt/website/
```

**Затем на сервере:**

```bash
ssh root@tomich.fun
cd /opt/website
docker compose restart website
```

---

## 📁 Обновление конкретных файлов

### 1. Обновление серверного кода (server.js, database.js, routes/*)

```bash
# На сервере
cd /opt/website

# Если через Git
git pull origin main

# Перезапустите контейнер
docker compose restart website

# Проверьте логи
docker compose logs -f website
```

### 2. Обновление HTML/CSS/JS (public/*)

```bash
# Эти файлы обновляются сразу, перезапуск не нужен
cd /opt/website/public

# Скопируйте новые файлы (через scp или git pull)
# Изменения применятся сразу после обновления браузера (Ctrl+F5)
```

### 3. Обновление конфигурации (.env)

```bash
# На сервере
cd /opt/website
nano .env

# После изменений - обязательно перезапустите
docker compose restart website
```

### 4. Обновление зависимостей (package.json)

```bash
cd /opt/website

# Если изменился package.json
docker compose down
docker compose up -d --build

# Или пересоздайте контейнер
docker compose up -d --force-recreate
```

---

## 🔧 Полное обновление (если много изменений)

```bash
# 1. Подключитесь к серверу
ssh root@tomich.fun

# 2. Перейдите в папку
cd /opt/website

# 3. Создайте backup базы данных
cp website.db website.db.backup.$(date +%Y%m%d_%H%M%S)

# 4. Остановите контейнер
docker compose down

# 5. Получите изменения
git pull origin main

# 6. Пересоздайте контейнер с обновлением зависимостей
docker compose up -d --build --force-recreate

# 7. Проверьте логи
docker compose logs -f website

# 8. Проверьте сайт в браузере
curl -I https://tomich.fun
```

---

## 📤 Загрузка файлов с локального компьютера на сервер

### Способ 1: SCP (простой)

```powershell
# Windows PowerShell
cd D:\3DC\website

# Один файл
scp server.js root@tomich.fun:/opt/website/

# Папка целиком
scp -r public root@tomich.fun:/opt/website/

# Несколько файлов
scp file1.js file2.js root@tomich.fun:/opt/website/
```

### Способ 2: Git (рекомендуется)

```bash
# На локальном компьютере
cd D:\3DC
git add .
git commit -m "Описание изменений"
git push origin main

# На сервере
ssh root@tomich.fun
cd /opt/website
git pull origin main
docker compose restart website
```

### Способ 3: WinSCP или FileZilla

1. Скачайте [WinSCP](https://winscp.net/) или [FileZilla](https://filezilla-project.org/)
2. Подключитесь к серверу:
   - Хост: `tomich.fun`
   - Протокол: `SFTP`
   - Порт: `22`
   - Пользователь: `root`
   - Пароль: ваш пароль
3. Перетащите файлы в папку `/opt/website/`
4. Перезапустите контейнер через SSH

---

## 🔄 Обновление через Git (детальная инструкция)

### Первоначальная настройка Git на сервере

```bash
# Подключитесь к серверу
ssh root@tomich.fun
cd /opt/website

# Инициализируйте Git (если еще не сделано)
git init
git remote add origin https://github.com/Tombraider2006/KCP.git

# Или если репозиторий уже есть
git remote set-url origin https://github.com/Tombraider2006/KCP.git

# Настройте Git (только один раз)
git config --global user.name "Tom Tomich"
git config --global user.email "utolyana@ya.ru"
```

### Регулярное обновление

```bash
# 1. Подключитесь к серверу
ssh root@tomich.fun

# 2. Перейдите в папку website
cd /opt/website

# 3. Проверьте текущую ветку
git branch

# 4. Получите изменения
git fetch origin

# 5. Примените изменения
git pull origin main

# 6. Если есть конфликты с локальными изменениями
git stash                    # Сохранить локальные изменения
git pull origin main         # Получить обновления
git stash pop                # Вернуть локальные изменения

# 7. Перезапустите контейнер
docker compose down
docker compose up -d --force-recreate

# 8. Проверьте логи
docker compose logs -f website
```

---

## 🛠️ Troubleshooting

### Сайт не обновляется после изменений

```bash
# 1. Жесткий перезапуск контейнера
docker compose down
docker rm -f 3dpc-website
docker compose up -d --force-recreate

# 2. Очистите кэш Docker
docker compose down
docker system prune -f
docker compose up -d

# 3. Проверьте что файлы обновились
ls -la /opt/website/
cat /opt/website/server.js | head -20
```

### Ошибки при запуске контейнера

```bash
# Посмотрите подробные логи
docker compose logs website

# Запустите без -d чтобы видеть ошибки
docker compose up

# Проверьте синтаксис docker-compose.yml
docker compose config
```

### База данных не обновляется

```bash
# Остановите контейнер
docker compose down

# Удалите старую базу (будет создана заново)
cd /opt/website
mv website.db website.db.old

# Запустите контейнер (база создастся автоматически)
docker compose up -d
```

---

## 📊 Мониторинг после обновления

### Проверка работоспособности

```bash
# 1. Проверьте статус контейнеров
docker ps | grep 3dpc-website

# 2. Проверьте логи (последние 50 строк)
docker compose logs --tail 50 website

# 3. Проверьте что сайт отвечает
curl -I https://tomich.fun

# 4. Проверьте SSL сертификат
curl -vI https://tomich.fun 2>&1 | grep -i issuer

# 5. Проверьте все сервисы
docker ps
pm2 list
```

### Мониторинг в реальном времени

```bash
# Логи сайта (живые)
docker compose logs -f website

# Логи Traefik
docker logs -f n8n-compose-file-traefik-1

# Логи telemetry
pm2 logs 3dpc-telemetry

# Системный мониторинг
htop  # или top
```

---

## 🔐 Безопасность при обновлении

### Backup перед обновлением

```bash
# Создайте backup всего проекта
cd /opt
tar -czf website-backup-$(date +%Y%m%d_%H%M%S).tar.gz website/

# Или только базы данных
cp /opt/website/website.db /opt/website/backups/website.db.$(date +%Y%m%d_%H%M%S)

# Или только .env
cp /opt/website/.env /opt/website/.env.backup
```

### Восстановление из backup

```bash
# Если что-то пошло не так, восстановите из backup
cd /opt
tar -xzf website-backup-YYYYMMDD_HHMMSS.tar.gz

# Или восстановите базу данных
cp /opt/website/backups/website.db.YYYYMMDD_HHMMSS /opt/website/website.db

# Перезапустите
cd /opt/website
docker compose restart website
```

---

## 🚀 Автоматизация обновлений

### Создание скрипта автообновления

```bash
# Создайте скрипт
nano /opt/update-website.sh
```

Содержимое скрипта:

```bash
#!/bin/bash

echo "🔄 Начинаю обновление сайта..."

# Перейти в папку проекта
cd /opt/website

# Создать backup
echo "📦 Создаю backup..."
cp website.db website.db.backup.$(date +%Y%m%d_%H%M%S)

# Получить изменения из Git
echo "📥 Получаю изменения из Git..."
git pull origin main

# Перезапустить контейнер
echo "🔄 Перезапускаю контейнер..."
docker compose down
docker compose up -d --force-recreate

# Подождать запуска
sleep 5

# Проверить статус
echo "✅ Проверяю статус..."
docker ps | grep 3dpc-website

echo ""
echo "✅ Обновление завершено!"
echo "🌐 Проверьте сайт: https://tomich.fun"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /opt/update-website.sh

# Запуск
/opt/update-website.sh
```

---

## 📝 Чеклист обновления

- [ ] Создан backup базы данных
- [ ] Создан backup .env файла
- [ ] Получены изменения (git pull или scp)
- [ ] Контейнер остановлен
- [ ] Контейнер пересоздан с новыми изменениями
- [ ] Проверены логи на ошибки
- [ ] Сайт открывается в браузере
- [ ] Админка доступна и работает
- [ ] SSL сертификат валиден

---

## 📞 Контакты

Если возникли проблемы:
- **Telegram:** @Tom_Tomich
- **GitHub:** https://github.com/Tombraider2006/KCP

---

**Дата создания:** 11 октября 2025  
**Последнее обновление:** 11 октября 2025

