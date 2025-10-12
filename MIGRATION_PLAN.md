# 📋 План миграции на приватный репозиторий

## 🎯 Цель
Перенести код в приватный репо, оставив публичную заглушку. Сохранить работоспособность проверки обновлений.

---

## 🔍 Что найдено (файлы с упоминанием репо)

### 📱 Приложение (критично!):
1. **src/main.js** - строки 1264-1265, 2910
   ```javascript
   const repoOwner = 'Tombraider2006';
   const repoName = 'KCP';
   ```
   - 2 функции `checkForUpdates()` - проверяют GitHub API
   - Без токена получат 404 на приватном репо
   - **Проблема:** Все старые версии не смогут проверить обновления!

2. **src/renderer.js** - строки 1220, 6562-6567
   - Ссылки на документацию в GitHub
   - Кнопки помощи ведут на GitHub

3. **src/index.html** - строка 81
   - Ссылка на LICENSE в GitHub

4. **src/web-interface/index.html** - строка 56
   - Ссылка на GitHub в футере

### 🌐 Сайт (переделывается легко):
5. **website/.env** (на сервере)
   ```bash
   GITHUB_OWNER=Tombraider2006
   GITHUB_REPO=KCP
   GITHUB_TOKEN=ghp_xxx
   ```

6. **website/public/js/downloads.js** - строки 32-33, 81-82
   ```javascript
   window.githubOwner = 'Tombraider2006';
   window.githubRepo = 'KCP';
   ```

7. **website/routes/api.js** - строки 244-245 (fallback)
8. **website/database.js** - строка 73 (default при установке)

### 📚 Документация (не критично):
9. **README.md** - ссылка на releases
10. **docs/*.md** - множество ссылок на GitHub
11. **website/README.md** и другие MD файлы

---

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА

**Все существующие версии приложения (1.5.34 и ниже) будут проверять обновления через:**
```
https://api.github.com/repos/Tombraider2006/KCP/releases/latest
```

Когда репо станет приватным → **404** → пользователи не узнают о новых версиях!

---

## ✅ РЕШЕНИЕ: Двухэтапная миграция

### ЭТАП 1: Подготовка (ДО закрытия KCP)
**Цель:** Выпустить последнюю версию которая проверяет обновления через сайт

#### 1.1. Добавить API на сайт
Создать `/api/latest-version` который:
- Проверяет GitHub с токеном
- Возвращает версию, changelog, download URL

#### 1.2. Изменить приложение
В `src/main.js` заменить:
```javascript
// Старый код (проверяет GitHub напрямую)
const options = {
  hostname: 'api.github.com',
  path: '/repos/Tombraider2006/KCP/releases/latest',
  ...
};

// Новый код (проверяет через сайт)
const options = {
  hostname: 'tomich.fun',
  path: '/api/latest-version',
  ...
};
```

#### 1.3. Выпустить версию 1.5.35
- Собрать с новой проверкой обновлений
- Опубликовать в KCP (пока ещё публичный)
- Подождать ~1 неделю чтобы пользователи обновились

### ЭТАП 2: День X (закрытие репо)

#### 2.1. Создать новый приватный репо
```bash
# На GitHub: Create repository "3DPC-Private" (Private)
```

#### 2.2. Перенести код
```bash
git remote rename origin old-origin
git remote add origin https://github.com/Tombraider2006/3DPC-Private.git
git push -u origin main
git push origin --tags
```

#### 2.3. Обновить сайт
Файл `.env` на сервере:
```bash
GITHUB_OWNER=Tombraider2006
GITHUB_REPO=3DPC-Private
GITHUB_TOKEN=ghp_ваш_токен_с_доступом_к_приватному_репо
```

Файл `website/public/js/downloads.js`:
```javascript
window.githubOwner = 'Tombraider2006';
window.githubRepo = '3DPC-Private';
```

#### 2.4. Заглушка в старом KCP
Заменить README.md на:
```markdown
# 🖨️ 3D Printer Control Panel

## ⚠️ Этот репозиторий закрыт

Проект перемещен в приватный репозиторий.

### 📥 Скачать приложение:
👉 **https://tomich.fun/downloads**

### 📞 Контакты:
- Telegram: [@Tom_Tomich](https://t.me/Tom_Tomich)
- Сайт: [tomich.fun](https://tomich.fun)

---
*Все releases доступны на официальном сайте.*
```

Удалить все остальные файлы из KCP, оставить только:
- README.md (заглушка)
- LICENSE.md

Сделать репо приватным.

---

## 📝 Чек-лист для "Дня X"

### ✅ ДО закрытия (проверить):
- [ ] Версия 1.5.35+ выпущена с проверкой через tomich.fun
- [ ] API `/api/latest-version` работает на сайте
- [ ] Минимум 50% пользователей обновились (смотреть телеметрию)

### ✅ В День X (выполнять последовательно):

**10:00 - Создание нового репо**
1. [ ] Создать `3DPC-Private` (Private) на GitHub
2. [ ] Скопировать настройки (Topics, Description, Website)

**10:05 - Перенос кода**
3. [ ] `git remote rename origin old-origin`
4. [ ] `git remote add origin https://github.com/Tombraider2006/3DPC-Private.git`
5. [ ] `git push -u origin main`
6. [ ] `git push origin --tags`
7. [ ] Проверить что все branches/tags перенеслись

**10:10 - Обновление сайта**
8. [ ] SSH на сервер: `ssh root@tomich.fun`
9. [ ] Редактировать `.env`:
   ```bash
   nano /opt/website/.env
   # Изменить GITHUB_REPO=3DPC-Private
   # Сохранить: Ctrl+X, Y, Enter
   ```
10. [ ] Загрузить обновленный `downloads.js` (через админку или scp)
11. [ ] Restart Docker: `docker compose restart`
12. [ ] Проверить: https://tomich.fun/downloads (должны быть релизы)

**10:20 - Заглушка в KCP**
13. [ ] Checkout старый репо: `git remote add kcp https://github.com/Tombraider2006/KCP.git`
14. [ ] `git checkout -b archive`
15. [ ] Удалить всё кроме README и LICENSE
16. [ ] Заменить README на заглушку
17. [ ] Commit: `git commit -m "Archive: Project moved to private repository"`
18. [ ] Push: `git push kcp archive:main --force` ⚠️

**10:25 - Закрытие**
19. [ ] GitHub → KCP → Settings → Change visibility → Make private
20. [ ] Или оставить публичным с заглушкой (на ваш выбор)

**10:30 - Тестирование**
21. [ ] Открыть старую версию приложения (1.5.34) - проверка НЕ работает ❌
22. [ ] Открыть новую версию (1.5.35+) - проверка работает ✅
23. [ ] Сайт tomich.fun/downloads - релизы показываются ✅
24. [ ] Скачивание работает ✅

---

## 🚀 Подготовительные файлы

### Файл 1: API для проверки версий (`website/routes/api.js`)
```javascript
// Add to existing api.js
router.get('/latest-version', async (req, res) => {
    try {
        const owner = process.env.GITHUB_OWNER || 'Tombraider2006';
        const repo = process.env.GITHUB_REPO || '3DPC-Private';
        const token = process.env.GITHUB_TOKEN;

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
            {
                headers: token ? {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                } : {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const release = response.data;
        res.json({
            version: release.tag_name.replace(/^v/, ''),
            name: release.name,
            notes: release.body,
            published_at: release.published_at,
            download_url: `https://tomich.fun/api/download/release/${release.tag_name}`
        });
    } catch (error) {
        console.error('Latest version check error:', error);
        res.status(500).json({ error: 'Failed to check version' });
    }
});
```

### Файл 2: Обновленная проверка в приложении
`src/main.js` функция `checkForUpdates()`:
```javascript
async function checkForUpdates() {
  return new Promise((resolve) => {
    const https = require('https');
    
    const options = {
      hostname: 'tomich.fun',
      path: '/api/latest-version',
      method: 'GET',
      headers: {
        'User-Agent': '3D-Printer-Control-Panel'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const info = JSON.parse(data);
            const currentVersion = APP_VERSION;

            if (compareVersions(info.version, currentVersion) > 0) {
              resolve({
                hasUpdate: true,
                latestVersion: info.version,
                currentVersion: currentVersion,
                releaseUrl: 'https://tomich.fun/downloads',
                releaseNotes: info.notes,
                releaseName: info.name
              });
            } else {
              resolve({ hasUpdate: false, currentVersion: currentVersion });
            }
          } else {
            resolve({ hasUpdate: false, currentVersion: APP_VERSION });
          }
        } catch (error) {
          resolve({ hasUpdate: false, currentVersion: APP_VERSION });
        }
      });
    });

    req.on('error', () => resolve({ hasUpdate: false, currentVersion: APP_VERSION }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ hasUpdate: false, currentVersion: APP_VERSION });
    });
    req.end();
  });
}
```

### Файл 3: Заглушка README для KCP
```markdown
# 🖨️ 3D Printer Control Panel

## ⚠️ Этот репозиторий закрыт для публичного доступа

Проект перемещен в приватный репозиторий для защиты интеллектуальной собственности.

---

## 📥 Где скачать?

### Официальный сайт: **https://tomich.fun**

- 📦 [Скачать последнюю версию](https://tomich.fun/downloads)
- 📰 [Новости и обновления](https://tomich.fun/news)
- 📖 [Документация](https://tomich.fun)

---

## 📞 Контакты

- 💬 **Telegram:** [@Tom_Tomich](https://t.me/Tom_Tomich)
- 🌐 **Сайт:** [tomich.fun](https://tomich.fun)

---

## 💼 Коммерческое использование

Для приобретения коммерческой лицензии свяжитесь со мной через Telegram.

---

*© 2024 Tom Tomich. Все права защищены.*
```

---

## ⚡ Быстрые команды для Дня X

### Батник 1: Подготовка нового репо
```batch
@echo off
echo Creating and pushing to new private repo...
cd /d D:\3DC
git remote rename origin old-origin
git remote add origin https://github.com/Tombraider2006/3DPC-Private.git
git push -u origin main
git push origin --tags
echo DONE! Code pushed to private repo
pause
```

### Батник 2: Обновление сайта
```batch
@echo off
echo Updating website for new repo...
cd /d D:\3DC\website

echo Uploading downloads.js with new repo name...
scp public/js/downloads.js root@tomich.fun:/opt/website/public/js/

echo Updating .env on server...
ssh root@tomich.fun "sed -i 's/GITHUB_REPO=KCP/GITHUB_REPO=3DPC-Private/g' /opt/website/.env"

echo Restarting website...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo DONE! Website updated
pause
```

### Батник 3: Создание заглушки в KCP
```batch
@echo off
echo Creating stub in old KCP repo...
cd /d D:\3DC

git checkout -b archive
git rm -rf src docs dist-electron build icons server-telemetry website
git rm package.json package-lock.json logo.png PRIVATE_NOTES.md

rem Создаст файлы stub-README.md и stub-LICENSE.md вручную

git add .
git commit -m "Archive: Project moved to private repository. Downloads at tomich.fun"
git push old-origin archive:main --force

echo DONE! Old repo archived
pause
```

---

## 📊 Что произойдет после миграции

### ✅ Будет работать:
- **Сайт** - релизы загружаются с приватного репо
- **Скачивание** - прокси работает с токеном
- **Новые версии** (1.5.35+) - проверяют обновления через сайт
- **Telegram бот** - не зависит от GitHub

### ❌ Перестанет работать:
- **Старые версии** (1.5.34 и ниже) - НЕ смогут проверить обновления
  - Но сайт будет доступен
  - Пользователи могут проверить вручную на tomich.fun
- **Прямые ссылки** на GitHub в документации - 404
  - Но документация есть на сайте

### ⚠️ Потребуется обновить:
- **1 релиз** - версия 1.5.35 с новой логикой проверки
- **3 файла** на сервере (env, downloads.js, api.js)
- **README** в старом репо

---

## 🎯 Рекомендуемый сценарий

### Вариант A: Плавная миграция (рекомендую)
1. **Сегодня:** Добавить API на сайт
2. **Сегодня:** Выпустить 1.5.35 с проверкой через сайт
3. **Через неделю:** Проверить телеметрию - сколько обновились
4. **День X:** Закрыть KCP, перенести в 3DPC-Private
5. **Результат:** 80%+ пользователей уже на новой версии

### Вариант B: Быстрая миграция (сегодня)
1. **Сейчас:** Добавить API на сайт + обновить приложение
2. **Сейчас:** Выпустить 1.5.35 в KCP
3. **Сразу после:** Перенести в 3DPC-Private и закрыть KCP
4. **Результат:** Старые пользователи не узнают об обновлении, но сайт работает

### Вариант C: Без изменения приложения (самый простой)
1. **Сейчас:** Перенести код в 3DPC-Private
2. **Сейчас:** Обновить сайт (.env)
3. **Сейчас:** KCP сделать заглушкой
4. **Результат:** Автопроверка у всех перестанет работать, только вручную через сайт

---

## 🤔 Какой вариант выбираем?

**Мне нужно знать:**
1. Как назовете новый репо? (рекомендую `3DPC-Private`)
2. Какой вариант миграции? (A, B или C)
3. Делать ли версию 1.5.35 с проверкой через сайт?

После вашего ответа я:
- Подготовлю все файлы
- Создам bat-файлы для миграции
- Протестирую на сайте
- Дам готовый план действий на 10 минут

**Время выполнения плана: ~10-15 минут**
**Простой сайта: 0 минут (всё работает без перерыва)**



