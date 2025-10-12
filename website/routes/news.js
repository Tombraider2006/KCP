const express = require('express');
const router = express.Router();
const path = require('path');

// News list page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'news.html'));
});

// Single news page
router.get('/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'news-single.html'));
});

module.exports = router;



