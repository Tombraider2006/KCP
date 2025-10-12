const express = require('express');
const router = express.Router();
const path = require('path');

// Homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Features page
router.get('/features', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'features.html'));
});

// Documentation
router.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'docs.html'));
});

module.exports = router;



