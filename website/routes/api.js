const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { queries } = require('../database');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ========== AUTH API ==========

// Login
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    queries.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

// Get current user
router.get('/auth/me', requireAuth, (req, res) => {
    queries.getUserById(req.session.userId, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// ========== NEWS API ==========

// Get all news (public)
router.get('/news', (req, res) => {
    const publishedOnly = !req.session.userId; // Show all if admin, only published if not
    
    queries.getAllNews(publishedOnly, (err, news) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(news);
    });
});

// Get single news by ID or slug
router.get('/news/:idOrSlug', (req, res) => {
    const param = req.params.idOrSlug;
    
    // Try to parse as ID first
    const isId = !isNaN(parseInt(param));
    
    const queryFunc = isId ? queries.getNewsById : queries.getNewsBySlug;
    
    queryFunc(param, (err, news) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        
        // If not authenticated and news is not published, return 404
        if (!req.session.userId && !news.published) {
            return res.status(404).json({ error: 'News not found' });
        }
        
        res.json(news);
    });
});

// Create news (admin only)
router.post('/news', requireAuth, (req, res) => {
    const { title, slug, content, excerpt, published } = req.body;
    
    if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    queries.createNews(
        title,
        slug,
        content,
        excerpt || '',
        published ? 1 : 0,
        req.session.userId,
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Slug already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Update news (admin only)
router.put('/news/:id', requireAuth, (req, res) => {
    const { title, slug, content, excerpt, published } = req.body;
    const id = req.params.id;
    
    if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    queries.updateNews(
        id,
        title,
        slug,
        content,
        excerpt || '',
        published ? 1 : 0,
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Slug already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        }
    );
});

// Delete news (admin only)
router.delete('/news/:id', requireAuth, (req, res) => {
    queries.deleteNews(req.params.id, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// ========== GITHUB RELEASES API ==========

// Download asset from GitHub (works with private repos)
router.get('/download/:owner/:repo/:tag/:filename', async (req, res) => {
    const { owner, repo, tag, filename } = req.params;
    
    try {
        // Get GitHub token from settings or env
        queries.getSetting('github_token', async (err, setting) => {
            const token = setting?.value || process.env.GITHUB_TOKEN;
            
            if (!token) {
                return res.status(500).json({ error: 'GitHub token not configured' });
            }
            
            const headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/octet-stream',
                'User-Agent': '3D-Printer-Control-Panel-Website'
            };
            
            const downloadUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
            
            try {
                // First, get release info to find asset ID
                const releaseResponse = await axios.get(downloadUrl.replace('/tags/', '/'), {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                // Find the asset by filename
                const asset = releaseResponse.data.assets.find(a => a.name === filename);
                
                if (!asset) {
                    return res.status(404).json({ error: 'File not found' });
                }
                
                // Now download the asset using its ID
                const assetUrl = `https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`;
                
                const fileResponse = await axios({
                    method: 'get',
                    url: assetUrl,
                    headers,
                    responseType: 'stream'
                });
                
                // Set headers for file download
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Length', asset.size);
                
                // Stream the file to response
                fileResponse.data.pipe(res);
                
            } catch (error) {
                console.error('GitHub Download Error:', error.message);
                res.status(error.response?.status || 500).json({ 
                    error: 'Failed to download file',
                    message: error.response?.data?.message || error.message
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get GitHub releases
router.get('/releases', async (req, res) => {
    try {
        // Get GitHub token from settings
        queries.getSetting('github_token', async (err, setting) => {
            const token = setting?.value || process.env.GITHUB_TOKEN;
            const owner = process.env.GITHUB_OWNER || 'Tombraider2006';
            const repoName = process.env.GITHUB_REPO || 'KCP';
            const repo = `${owner}/${repoName}`;
            
            const headers = token ? {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            } : {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            try {
                const response = await axios.get(
                    `https://api.github.com/repos/${repo}/releases`,
                    { headers }
                );
                
                // Format releases data
                const releases = response.data.map(release => ({
                    id: release.id,
                    name: release.name,
                    tag_name: release.tag_name,
                    body: release.body,
                    published_at: release.published_at,
                    prerelease: release.prerelease,
                    draft: release.draft,
                    assets: release.assets.map(asset => ({
                        name: asset.name,
                        size: asset.size,
                        download_count: asset.download_count,
                        browser_download_url: asset.browser_download_url,
                        updated_at: asset.updated_at
                    }))
                }));
                
                res.json(releases);
            } catch (error) {
                console.error('GitHub API Error:', error.message);
                res.status(500).json({ 
                    error: 'Failed to fetch releases',
                    message: error.response?.data?.message || error.message
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== SETTINGS API ==========

// Get settings (admin only)
router.get('/settings', requireAuth, (req, res) => {
    const { db } = require('../database');
    
    db.all('SELECT key, value FROM settings', (err, settings) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Convert array to object
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        
        res.json(settingsObj);
    });
});

// Update setting (admin only)
router.post('/settings', requireAuth, (req, res) => {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
        return res.status(400).json({ error: 'Missing key or value' });
    }
    
    queries.setSetting(key, value, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// ========== LATEST VERSION API (для проверки обновлений приложением) ==========

/**
 * GET /api/latest-version
 * Возвращает информацию о последней версии приложения
 * Используется приложением для проверки обновлений (вместо GitHub API)
 */
router.get('/latest-version', async (req, res) => {
    try {
        // Get GitHub token from settings
        queries.getSetting('github_token', async (err, setting) => {
            if (err) {
                console.error('[API] Error getting GitHub token:', err);
                return res.status(500).json({ error: 'Failed to get GitHub token' });
            }

            const token = setting?.value || process.env.GITHUB_TOKEN;
            const owner = process.env.GITHUB_OWNER || 'Tombraider2006';
            const repoName = process.env.GITHUB_REPO || '3DPC-Private';
            
            const headers = token ? {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            } : {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            try {
                const response = await axios.get(
                    `https://api.github.com/repos/${owner}/${repoName}/releases/latest`,
                    { headers }
                );
                
                const release = response.data;
                
                // Формируем ответ в нужном формате
                res.json({
                    version: release.tag_name.replace(/^v/, ''), // Убираем 'v' если есть
                    name: release.name,
                    notes: release.body,
                    published_at: release.published_at,
                    download_url: 'https://tomich.fun/downloads'
                });
            } catch (error) {
                console.error('[API] Error fetching latest release:', error);
                
                // Если ошибка 404 или другая - возвращаем заглушку
                if (error.response?.status === 404) {
                    return res.status(404).json({ 
                        error: 'No releases found',
                        message: 'Check https://tomich.fun/downloads for manual download'
                    });
                }
                
                res.status(500).json({ 
                    error: 'Failed to check for updates',
                    message: 'Please try again later or check https://tomich.fun/downloads'
                });
            }
        });
    } catch (error) {
        console.error('[API] Unexpected error in /latest-version:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

