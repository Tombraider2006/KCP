const express = require('express');
const router = express.Router();
const path = require('path');

// Downloads page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'downloads.html'));
});

module.exports = router;



