# 📚 План подготовки документации для сайта tomich.fun

**Дата:** 12 октября 2025  
**Цель:** Разместить пользовательскую документацию на сайте для замены GitHub ссылок

---

## 📊 Обзор

После миграции на приватный репозиторий все ссылки на GitHub docs в приложении будут вести на сайт:
- ❌ `github.com/Tombraider2006/KCP/blob/main/docs/WEB_SERVER.md`
- ✅ `tomich.fun/docs/web-server`

Нужно создать динамические страницы документации на сайте.

---

## 📋 Документы для размещения

### 1. Web-сервер
**Исходный файл:** `docs/WEB_SERVER.md`  
**URL на сайте:** `/docs/web-server`  
**Приоритет:** 🔴 Высокий  
**Размер:** ~444 строки, 15KB

**Используется в:**
- `src/renderer.js:1220` - кнопка помощи по Web-серверу

**Содержание:**
- Описание web-сервера
- Быстрый старт
- REST API документация
- WebSocket API
- Примеры использования
- Решение проблем

---

### 2. Руководство по Tuya Smart Plugs
**Исходный файл:** `docs/TUYA_USER_GUIDE.md`  
**URL на сайте:** `/docs/tuya-guide`  
**Приоритет:** 🔴 Высокий  
**Размер:** ~824 строки, 35KB

**Используется в:**
- `src/renderer.js:6562-6563` - помощь при настройке Tuya розеток

**Содержание:**
- Что такое Tuya
- Пошаговая инструкция регистрации
- Настройка Cloud Project
- Получение Access ID и Secret
- Настройка в приложении
- Привязка розеток к принтерам
- Решение проблем
- FAQ

---

### 3. Руководство по Home Assistant
**Исходный файл:** `docs/HOME_ASSISTANT_USER_GUIDE.md`  
**URL на сайте:** `/docs/homeassistant-guide`  
**Приоритет:** 🔴 Высокий  
**Размер:** Нужно проверить

**Используется в:**
- `src/renderer.js:6566-6567` - помощь при настройке Home Assistant

**Содержание:**
- Настройка Home Assistant
- Получение Long-lived токена
- Настройка в приложении
- Управление розетками
- Решение проблем

---

### 4. Лицензия (опционально)
**Исходный файл:** `LICENSE.md`  
**URL на сайте:** `/license`  
**Приоритет:** 🟡 Средний

**Используется в:**
- `src/index.html:81` - ссылка в футере

---

### 5. Bambu Lab документация (опционально)
**Исходные файлы:** 
- `docs/BAMBU_LAB_SETUP.md`
- `docs/BAMBU_LAB_SETUP_RU.md`
- `docs/BAMBU_TROUBLESHOOTING_EN.md`
- `docs/BAMBU_TROUBLESHOOTING_RU.md`

**URL на сайте:** 
- `/docs/bambu-setup`
- `/docs/bambu-troubleshooting`

**Приоритет:** 🟢 Низкий (пока не используется в приложении)

---

## 🏗️ План реализации динамических страниц

### Архитектура

```
website/
├── routes/
│   └── docs.js              # Новый роутер для документации
├── public/
│   └── docs/
│       ├── template.html    # Шаблон страницы документации
│       ├── docs.css         # Стили для документации
│       └── docs.js          # Скрипты (подсветка кода, навигация)
├── docs-content/            # Контент документов (Markdown или HTML)
│   ├── web-server.md
│   ├── tuya-guide.md
│   ├── homeassistant-guide.md
│   └── license.md
└── server.js                # Подключить routes/docs.js
```

---

## 📝 Вариант 1: Статические HTML страницы (БЫСТРО)

### Преимущества:
- ✅ Быстрая реализация (2-3 часа)
- ✅ Не нужен парсер Markdown
- ✅ Полный контроль над оформлением
- ✅ SEO-оптимизация

### Недостатки:
- ⚠️ Нужно вручную обновлять HTML при изменении документов
- ⚠️ Дублирование контента

### Реализация:

#### Шаг 1: Конвертация Markdown → HTML
Можно использовать онлайн-конвертер или Node.js библиотеку:
```bash
npm install marked --save
```

#### Шаг 2: Создание шаблона
**Файл:** `public/docs/template.html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - 3D Printer Control Panel</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/docs/docs.css">
</head>
<body>
    <header class="docs-header">
        <div class="container">
            <a href="/" class="logo">3D Printer Control Panel</a>
            <nav>
                <a href="/downloads">Загрузки</a>
                <a href="/docs" class="active">Документация</a>
                <a href="/news">Новости</a>
            </nav>
        </div>
    </header>

    <main class="docs-main">
        <aside class="docs-sidebar">
            <h3>Документация</h3>
            <ul>
                <li><a href="/docs/web-server">Web-сервер</a></li>
                <li><a href="/docs/tuya-guide">Tuya Smart Plugs</a></li>
                <li><a href="/docs/homeassistant-guide">Home Assistant</a></li>
                <li><a href="/docs/bambu-setup">Bambu Lab Setup</a></li>
                <li><a href="/license">Лицензия</a></li>
            </ul>
        </aside>

        <article class="docs-content">
            {{CONTENT}}
        </article>
    </main>

    <footer>
        <p>&copy; 2024-2025 3D Printer Control Panel</p>
    </footer>
</body>
</html>
```

#### Шаг 3: Создание статических страниц
```html
public/docs/
├── web-server.html
├── tuya-guide.html
├── homeassistant-guide.html
└── license.html
```

#### Шаг 4: Настройка Express routes
**Файл:** `server.js`

```javascript
// Статические страницы документации
app.get('/docs/web-server', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs', 'web-server.html'));
});

app.get('/docs/tuya-guide', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs', 'tuya-guide.html'));
});

app.get('/docs/homeassistant-guide', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs', 'homeassistant-guide.html'));
});

app.get('/license', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs', 'license.html'));
});
```

---

## 📝 Вариант 2: Динамические страницы с Markdown (ПРАВИЛЬНО)

### Преимущества:
- ✅ Легко обновлять документы (просто заменить .md файл)
- ✅ Один шаблон для всех страниц
- ✅ Автоматическое оглавление
- ✅ Подсветка синтаксиса кода

### Недостатки:
- ⚠️ Нужна библиотека для парсинга Markdown
- ⚠️ Немного сложнее реализация

### Реализация:

#### Шаг 1: Установка зависимостей
```bash
cd website
npm install marked highlight.js --save
```

**Библиотеки:**
- `marked` - парсер Markdown
- `highlight.js` - подсветка синтаксиса кода

#### Шаг 2: Создание роутера для документации
**Файл:** `routes/docs.js`

```javascript
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Настройка marked
marked.setOptions({
    highlight: function(code, lang) {
        const hljs = require('highlight.js');
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    breaks: true,
    gfm: true
});

// Маппинг URL → файлы
const docsMap = {
    'web-server': {
        file: 'web-server.md',
        title: 'Web-сервер для удаленного доступа'
    },
    'tuya-guide': {
        file: 'tuya-guide.md',
        title: 'Руководство по Tuya Smart Plugs'
    },
    'homeassistant-guide': {
        file: 'homeassistant-guide.md',
        title: 'Руководство по Home Assistant'
    }
};

// Динамический роутер
router.get('/:docId', (req, res) => {
    const docId = req.params.docId;
    const docInfo = docsMap[docId];
    
    if (!docInfo) {
        return res.status(404).send('Document not found');
    }
    
    const mdPath = path.join(__dirname, '..', 'docs-content', docInfo.file);
    
    fs.readFile(mdPath, 'utf8', (err, markdown) => {
        if (err) {
            return res.status(500).send('Error loading document');
        }
        
        const htmlContent = marked(markdown);
        
        // Отправляем шаблон с контентом
        res.render('docs-template', {
            title: docInfo.title,
            content: htmlContent,
            currentDoc: docId
        });
    });
});

module.exports = router;
```

#### Шаг 3: Подключение в server.js
```javascript
const docsRouter = require('./routes/docs');
app.use('/docs', docsRouter);
```

#### Шаг 4: Создание EJS шаблона
**Файл:** `views/docs-template.ejs` (если используете EJS)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %> - 3D Printer Control Panel</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/docs.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github-dark.min.css">
</head>
<body>
    <header class="docs-header">
        <div class="container">
            <a href="/" class="logo">3D Printer Control Panel</a>
            <nav>
                <a href="/downloads">Загрузки</a>
                <a href="/docs/web-server" class="active">Документация</a>
                <a href="/news">Новости</a>
            </nav>
        </div>
    </header>

    <main class="docs-main">
        <aside class="docs-sidebar">
            <h3>Документация</h3>
            <ul>
                <li><a href="/docs/web-server" class="<%= currentDoc === 'web-server' ? 'active' : '' %>">Web-сервер</a></li>
                <li><a href="/docs/tuya-guide" class="<%= currentDoc === 'tuya-guide' ? 'active' : '' %>">Tuya Smart Plugs</a></li>
                <li><a href="/docs/homeassistant-guide" class="<%= currentDoc === 'homeassistant-guide' ? 'active' : '' %>">Home Assistant</a></li>
            </ul>
        </aside>

        <article class="docs-content">
            <%- content %>
        </article>
    </main>

    <footer>
        <p>&copy; 2024-2025 3D Printer Control Panel</p>
    </footer>
</body>
</html>
```

#### Шаг 5: Копирование Markdown файлов
```bash
mkdir website/docs-content
cp docs/WEB_SERVER.md website/docs-content/web-server.md
cp docs/TUYA_USER_GUIDE.md website/docs-content/tuya-guide.md
cp docs/HOME_ASSISTANT_USER_GUIDE.md website/docs-content/homeassistant-guide.md
```

---

## 🎨 Стили для документации

**Файл:** `public/css/docs.css`

```css
/* ===== DOCS LAYOUT ===== */

.docs-main {
    display: grid;
    grid-template-columns: 250px 1fr;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    gap: 40px;
}

.docs-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
    background: var(--card-background);
    padding: 20px;
    border-radius: 8px;
}

.docs-sidebar h3 {
    margin-top: 0;
    color: var(--primary-color);
}

.docs-sidebar ul {
    list-style: none;
    padding: 0;
}

.docs-sidebar ul li {
    margin: 10px 0;
}

.docs-sidebar ul li a {
    color: var(--text-primary);
    text-decoration: none;
    padding: 8px 12px;
    display: block;
    border-radius: 4px;
    transition: background 0.3s;
}

.docs-sidebar ul li a:hover,
.docs-sidebar ul li a.active {
    background: var(--primary-color);
    color: white;
}

/* ===== DOCS CONTENT ===== */

.docs-content {
    background: var(--card-background);
    padding: 40px;
    border-radius: 8px;
    line-height: 1.8;
}

.docs-content h1 {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 10px;
}

.docs-content h2 {
    margin-top: 40px;
    color: var(--text-primary);
}

.docs-content h3 {
    margin-top: 30px;
}

.docs-content code {
    background: rgba(0, 212, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
}

.docs-content pre {
    background: #1e1e1e;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
}

.docs-content pre code {
    background: none;
    padding: 0;
}

.docs-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.docs-content table th,
.docs-content table td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.docs-content table th {
    background: var(--primary-color);
    color: white;
}

.docs-content blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 20px;
    margin: 20px 0;
    color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .docs-main {
        grid-template-columns: 1fr;
    }
    
    .docs-sidebar {
        position: static;
    }
}
```

---

## 📋 Чек-лист подготовки

### Шаг 1: Подготовка файлов документации
- [ ] Скопировать `WEB_SERVER.md` → `website/docs-content/web-server.md`
- [ ] Скопировать `TUYA_USER_GUIDE.md` → `website/docs-content/tuya-guide.md`
- [ ] Скопировать `HOME_ASSISTANT_USER_GUIDE.md` → `website/docs-content/homeassistant-guide.md`
- [ ] Скопировать `LICENSE.md` → `website/docs-content/license.md`
- [ ] Проверить что все изображения и ссылки корректны

### Шаг 2: Выбор подхода
- [ ] **Вариант 1:** Статические HTML (быстро, но нужно вручную обновлять)
- [ ] **Вариант 2:** Динамические с Markdown (правильно, но нужны библиотеки)

### Шаг 3: Реализация (Вариант 2 рекомендуется)
- [ ] Установить `marked` и `highlight.js`
- [ ] Создать `routes/docs.js`
- [ ] Создать шаблон `views/docs-template.ejs`
- [ ] Добавить стили `public/css/docs.css`
- [ ] Подключить роутер в `server.js`
- [ ] Настроить EJS если ещё не используется

### Шаг 4: Тестирование
- [ ] Открыть http://localhost:3000/docs/web-server
- [ ] Проверить что Markdown корректно отображается
- [ ] Проверить подсветку кода
- [ ] Проверить навигацию в sidebar
- [ ] Проверить адаптивность на мобильных

### Шаг 5: Загрузка на сервер
- [ ] Загрузить `routes/docs.js` на сервер
- [ ] Загрузить `docs-content/*.md` файлы
- [ ] Загрузить шаблон и стили
- [ ] Обновить `server.js` и перезапустить Docker
- [ ] Проверить на production: https://tomich.fun/docs/web-server

---

## 🚀 Быстрый старт для разработчика

### Минимальная реализация (30 минут):

1. **Установить зависимости:**
```bash
cd website
npm install marked highlight.js ejs --save
```

2. **Создать папку для Markdown:**
```bash
mkdir docs-content
```

3. **Скопировать документы:**
```bash
cp ../docs/WEB_SERVER.md docs-content/web-server.md
cp ../docs/TUYA_USER_GUIDE.md docs-content/tuya-guide.md
cp ../docs/HOME_ASSISTANT_USER_GUIDE.md docs-content/homeassistant-guide.md
```

4. **Создать файлы из примеров выше:**
- `routes/docs.js`
- `views/docs-template.ejs`
- `public/css/docs.css`

5. **Обновить server.js:**
```javascript
const docsRouter = require('./routes/docs');
app.use('/docs', docsRouter);

// Настроить EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

6. **Запустить и протестировать:**
```bash
node server.js
# Открыть http://localhost:3000/docs/web-server
```

---

## 💡 Рекомендация

**Использовать Вариант 2** (динамические страницы с Markdown):
- ✅ Легко обновлять документацию
- ✅ Один раз настроить - потом только менять .md файлы
- ✅ Профессиональный подход
- ✅ Подготовка к будущему расширению

**Время реализации:** 2-3 часа  
**Сложность:** 🟡 Средняя

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Версия:** 1.0

