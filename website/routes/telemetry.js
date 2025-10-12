const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Telemetry dashboard page (no auth - parent page already protected)
router.get('/dashboard', async (req, res) => {
    try {
        // Docker bridge network gateway (host machine)
        const telemetryHost = process.env.TELEMETRY_HOST || '172.17.0.1';
        const response = await axios.get(`http://${telemetryHost}:3000/dashboard`);
        res.send(response.data);
    } catch (error) {
        console.error('Telemetry proxy error:', error.message);
        res.status(500).send(`
            <html>
                <head>
                    <title>Telemetry Error</title>
                    <style>
                        body { font-family: system-ui; background: #1a1a2e; color: #e0e0e0; padding: 40px; text-align: center; }
                        .error { background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h2>❌ Telemetry Server Error</h2>
                        <p>Cannot connect to telemetry server on port 3000</p>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><a href="/admin/dashboard.html" style="color: #3498db;">← Back to Admin</a></p>
                    </div>
                </body>
            </html>
        `);
    }
});

// Proxy API requests to telemetry server (no auth - parent page already protected)
router.get('/api/:endpoint', async (req, res) => {
    try {
        const telemetryHost = process.env.TELEMETRY_HOST || '172.17.0.1';
        const endpoint = req.params.endpoint;
        const url = `http://${telemetryHost}:3000/api/${endpoint}`;
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Telemetry API proxy error:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Telemetry API error',
            message: error.message 
        });
    }
});

module.exports = router;

