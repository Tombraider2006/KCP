const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Настройка marked
marked.setOptions({
    highlight: function(code, lang) {
        const hljs = require('highlight.js');
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (e) {
                console.error('Highlight error:', e);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Маппинг URL → файлы документации
const docsMap = {
    'web-server': {
        file: 'web-server.md',
        title: 'Web-сервер для удаленного доступа',
        description: 'Встроенный web-сервер для доступа через браузер с любого устройства'
    },
    'tuya-guide': {
        file: 'tuya-guide.md',
        title: 'Руководство по Tuya Smart Plugs',
        description: 'Пошаговая инструкция по настройке Tuya умных розеток'
    },
    'homeassistant-guide': {
        file: 'homeassistant-guide.md',
        title: 'Руководство по Home Assistant',
        description: 'Интеграция с Home Assistant для управления умными розетками'
    },
    'bambu-setup': {
        file: 'bambu-setup.md',
        title: 'Настройка Bambu Lab принтеров',
        description: 'Руководство по добавлению и настройке принтеров Bambu Lab'
    },
    'bambu-troubleshooting': {
        file: 'bambu-troubleshooting.md',
        title: 'Решение проблем Bambu Lab',
        description: 'Частые проблемы и их решения для Bambu Lab принтеров'
    }
};

// Middleware для проверки существования документа
router.param('docId', (req, res, next, docId) => {
    if (!docsMap[docId]) {
        return res.status(404).render('pages/404', {
            title: 'Документ не найден',
            currentPage: 'docs',
            message: 'Запрошенный документ не найден'
        });
    }
    next();
});

// Главная страница документации
router.get('/', (req, res) => {
    res.render('pages/docs-index', {
        title: 'Документация',
        currentPage: 'docs',
        description: 'Руководства пользователя и документация 3D Printer Control Panel',
        docs: docsMap
    });
});

// Отображение конкретного документа
router.get('/:docId', (req, res) => {
    const docId = req.params.docId;
    const docInfo = docsMap[docId];
    
    const mdPath = path.join(__dirname, '..', 'docs-content', docInfo.file);
    
    fs.readFile(mdPath, 'utf8', (err, markdown) => {
        if (err) {
            console.error('Error reading documentation file:', err);
            return res.status(500).render('pages/error', {
                title: 'Ошибка загрузки',
                currentPage: 'docs',
                error: 'Не удалось загрузить документ. Попробуйте позже.'
            });
        }
        
        try {
            const htmlContent = marked(markdown);
            
            res.render('pages/docs-viewer', {
                title: docInfo.title,
                description: docInfo.description,
                currentPage: 'docs',
                docId: docId,
                content: htmlContent,
                docs: docsMap,
                showDocs: true,
                additionalCSS: [
                    '/css/docs.css',
                    'https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github-dark.min.css'
                ]
            });
        } catch (error) {
            console.error('Error parsing markdown:', error);
            res.status(500).render('pages/error', {
                title: 'Ошибка',
                currentPage: 'docs',
                error: 'Ошибка обработки документа'
            });
        }
    });
});

module.exports = router;

