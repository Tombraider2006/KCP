const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Login page
router.get('/login', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/admin/dashboard');
    } else {
        res.sendFile(path.join(__dirname, '../public/admin', 'login.html'));
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/admin/login');
    });
});

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'dashboard.html'));
});

// News management
router.get('/news', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'news-editor.html'));
});

// News editor
router.get('/news/new', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'news-editor.html'));
});

router.get('/news/edit/:id', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'news-editor.html'));
});

// Settings
router.get('/settings', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'settings.html'));
});

module.exports = router;



