const express = require('express');
const router = express.Router();
const path = require('path');

// Feature pages
router.get('/:feature', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'feature.html'));
});

module.exports = router;



