const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080; // Порт 3000 занят telemetry сервером

// Trust proxy (для работы за Traefik/Nginx)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware with different CSP for admin panel
app.use((req, res, next) => {
    const isAdmin = req.path.startsWith('/admin');
    
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: isAdmin 
                    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.tiny.cloud"]
                    : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.tiny.cloud"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                frameSrc: ["'self'", "https://telemetry.tomich.fun"],
                connectSrc: ["'self'", "https://telemetry.tomich.fun"]
            }
        }
    })(req, res, next);
});
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // максимум 100 запросов с одного IP
});
app.use('/api/', limiter);

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Установите true только если используете HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database initialization
const db = require('./database');
db.init();

// Routes
const indexRouter = require('./routes/index');
const downloadsRouter = require('./routes/downloads');
const newsRouter = require('./routes/news');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const telemetryRouter = require('./routes/telemetry');
const uploadRouter = require('./routes/upload');
const featuresRouter = require('./routes/features');
const docsRouter = require('./routes/docs');

app.use('/', indexRouter);
app.use('/downloads', downloadsRouter);
app.use('/news', newsRouter);
app.use('/features', featuresRouter);
app.use('/docs', docsRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/telemetry', telemetryRouter);
app.use('/api', uploadRouter);

// License page (используя docs роутер для рендеринга markdown)
app.get('/license', (req, res) => {
    const fs = require('fs');
    const { marked } = require('marked');
    const mdPath = path.join(__dirname, 'docs-content', 'license.md');
    
    fs.readFile(mdPath, 'utf8', (err, markdown) => {
        if (err) {
            return res.status(500).send('Error loading license');
        }
        
        const htmlContent = marked(markdown);
        res.render('layout', {
            title: 'Лицензия',
            currentPage: 'license',
            showLicense: true,
            showCommercialNote: true,
            body: require('ejs').render(
                require('fs').readFileSync(path.join(__dirname, 'views/pages/license.ejs'), 'utf8'),
                { content: htmlContent }
            )
        });
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🖨️  3D Printer Control Panel - Website Server         ║
║                                                           ║
║   Server running on: http://localhost:${PORT}             ║
║   Environment: ${process.env.NODE_ENV || 'development'}   ║
║                                                           ║
║   📁 Routes:                                             ║
║   • Homepage:    http://localhost:${PORT}/                ║
║   • Downloads:   http://localhost:${PORT}/downloads       ║
║   • News:        http://localhost:${PORT}/news            ║
║   • Admin:       http://localhost:${PORT}/admin           ║
║                                                           ║
║   ⚠️  NOTE: Port 3000 is used by telemetry server       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;

