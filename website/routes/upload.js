const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.body.folder || 'uploads';
        const uploadPath = path.join(__dirname, '../public', folder);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Keep original filename with timestamp prefix
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${timestamp}${ext}`);
    }
});

// File filter - allow all files
const fileFilter = (req, file, cb) => {
    // Allow all file types
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Upload file
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const folder = req.body.folder || 'uploads';
        res.json({
            success: true,
            file: {
                name: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                folder: folder,
                path: `/${folder}/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get list of files
router.get('/files', requireAuth, (req, res) => {
    try {
        const folders = ['screenshots', 'images', 'uploads'];
        const files = [];
        
        folders.forEach(folder => {
            const folderPath = path.join(__dirname, '../public', folder);
            
            if (fs.existsSync(folderPath)) {
                const folderFiles = fs.readdirSync(folderPath);
                
                folderFiles.forEach(file => {
                    const filePath = path.join(folderPath, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.isFile()) {
                        const ext = path.extname(file).toLowerCase();
                        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                        
                        files.push({
                            name: file,
                            folder: folder,
                            path: `/${folder}/${file}`,
                            size: stats.size,
                            modified: stats.mtime,
                            type: imageExts.includes(ext) ? 'image' : 'file'
                        });
                    }
                });
            }
        });
        
        // Sort by modified date (newest first)
        files.sort((a, b) => b.modified - a.modified);
        
        res.json(files);
    } catch (error) {
        console.error('Error getting files list:', error);
        res.status(500).json({ error: 'Failed to get files list' });
    }
});

// Upload file by direct content (for HTML, JS, CSS files)
router.post('/upload-file', requireAuth, (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        
        if (!filePath || !content) {
            return res.status(400).json({ error: 'File path and content are required' });
        }
        
        // Security check - only allow uploading to public folder
        const allowedPaths = ['public/', 'routes/'];
        const isAllowed = allowedPaths.some(prefix => filePath.startsWith(prefix));
        
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot upload to this location' });
        }
        
        const fullPath = path.join(__dirname, '..', filePath);
        const dirPath = path.dirname(fullPath);
        
        // Create directory if doesn't exist
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
        res.json({ success: true, message: 'File uploaded', path: filePath });
        
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Restart Docker container
router.post('/restart-docker', requireAuth, (req, res) => {
    try {
        const { exec } = require('child_process');
        
        // Restart self using Docker socket
        exec('docker restart 3dpc-website', (error, stdout, stderr) => {
            if (error) {
                console.error('Docker restart error:', error);
                return res.status(500).json({ 
                    error: 'Failed to restart Docker', 
                    message: error.message 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Docker container restarting...', 
                output: stdout 
            });
        });
    } catch (error) {
        console.error('Error restarting Docker:', error);
        res.status(500).json({ error: 'Failed to restart Docker' });
    }
});

// Delete file
router.delete('/files', requireAuth, (req, res) => {
    try {
        const { path: filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }
        
        // Security check - only allow deletion from allowed folders
        const allowedFolders = ['screenshots', 'images', 'uploads'];
        const isAllowed = allowedFolders.some(folder => filePath.startsWith(`/${folder}/`));
        
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot delete files from this location' });
        }
        
        const fullPath = path.join(__dirname, '../public', filePath);
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            res.json({ success: true, message: 'File deleted' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;

