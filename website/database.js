const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// ВАЖНО: Используем website.db чтобы не конфликтовать с telemetry.db на порту 3000
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'website.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize database tables
function init() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // News table
        db.run(`
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                published BOOLEAN DEFAULT 0,
                author_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id)
            )
        `);

        // Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create default admin user if not exists
        const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

        db.get('SELECT id FROM users WHERE username = ?', [defaultUsername], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [defaultUsername, hashedPassword, 'admin'],
                    (err) => {
                        if (err) {
                            console.error('❌ Error creating default admin user:', err);
                        } else {
                            console.log(`✅ Default admin user created: ${defaultUsername}`);
                            console.log(`⚠️  Please change the password immediately!`);
                        }
                    }
                );
            }
        });

        // Initialize default settings
        const defaultSettings = [
            { key: 'site_name', value: '3D Printer Control Panel' },
            { key: 'github_repo', value: 'Tombraider2006/KCP' },
            { key: 'github_token', value: process.env.GITHUB_TOKEN || '' }
        ];

        defaultSettings.forEach(setting => {
            db.run(
                'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
                [setting.key, setting.value]
            );
        });
    });

    console.log('✅ Database initialized successfully');
}

// Helper functions
const queries = {
    // Users
    getUserByUsername: (username, callback) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], callback);
    },

    getUserById: (id, callback) => {
        db.get('SELECT id, username, role, created_at FROM users WHERE id = ?', [id], callback);
    },

    createUser: (username, password, role, callback) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role],
            callback
        );
    },

    // News
    getAllNews: (publishedOnly, callback) => {
        const query = publishedOnly 
            ? 'SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC'
            : 'SELECT * FROM news ORDER BY created_at DESC';
        db.all(query, callback);
    },

    getNewsById: (id, callback) => {
        db.get('SELECT * FROM news WHERE id = ?', [id], callback);
    },

    getNewsBySlug: (slug, callback) => {
        db.get('SELECT * FROM news WHERE slug = ?', [slug], callback);
    },

    createNews: (title, slug, content, excerpt, published, authorId, callback) => {
        db.run(
            'INSERT INTO news (title, slug, content, excerpt, published, author_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, slug, content, excerpt, published, authorId],
            callback
        );
    },

    updateNews: (id, title, slug, content, excerpt, published, callback) => {
        db.run(
            'UPDATE news SET title = ?, slug = ?, content = ?, excerpt = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, slug, content, excerpt, published, id],
            callback
        );
    },

    deleteNews: (id, callback) => {
        db.run('DELETE FROM news WHERE id = ?', [id], callback);
    },

    // Settings
    getSetting: (key, callback) => {
        db.get('SELECT value FROM settings WHERE key = ?', [key], callback);
    },

    setSetting: (key, value, callback) => {
        db.run(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [key, value],
            callback
        );
    }
};

module.exports = {
    init,
    db,
    queries
};

