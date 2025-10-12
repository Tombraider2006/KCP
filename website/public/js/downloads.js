// Downloads page - GitHub releases loader

document.addEventListener('DOMContentLoaded', () => {
    loadReleases();
});

async function loadReleases() {
    const container = document.getElementById('releases-container');
    
    try {
        const response = await fetch('/api/releases');
        
        if (!response.ok) {
            throw new Error('Failed to fetch releases');
        }
        
        const releases = await response.json();
        
        if (releases.length === 0) {
            container.innerHTML = `
                <div class="card text-center" style="padding: 60px 20px;">
                    <h3>📦 Релизов пока нет</h3>
                    <p style="margin-top: 20px; color: var(--text-secondary);">
                        Скоро здесь появятся доступные для загрузки версии приложения
                    </p>
                </div>
            `;
            return;
        }
        
        // Store GitHub repo info globally (will be same for all releases)
        window.githubOwner = 'Tombraider2006';
        window.githubRepo = '3DPC-Private';
        
        // Update quick download links
        updateQuickDownloadLinks(releases[0]);
        
        // Render releases
        const releasesHTML = releases.map(release => renderRelease(release)).join('');
        container.innerHTML = releasesHTML;
        
    } catch (error) {
        console.error('Error loading releases:', error);
        container.innerHTML = `
            <div class="card" style="background: rgba(220, 53, 69, 0.2); border-color: rgba(220, 53, 69, 0.5);">
                <h3>❌ Ошибка загрузки</h3>
                <p style="margin-top: 15px;">
                    Не удалось загрузить список релизов. Пожалуйста, попробуйте позже или свяжитесь с 
                    <a href="https://t.me/Tom_Tomich" target="_blank" style="color: var(--primary-color);">администратором</a>
                </p>
            </div>
        `;
    }
}

function updateQuickDownloadLinks(latestRelease) {
    if (!latestRelease || !latestRelease.assets) return;
    
    const windowsAsset = latestRelease.assets.find(a => a.name.includes('Windows') && a.name.endsWith('.exe'));
    const macAsset = latestRelease.assets.find(a => a.name.includes('macOS') && a.name.endsWith('.dmg'));
    const linuxAsset = latestRelease.assets.find(a => a.name.includes('Linux') && a.name.endsWith('.AppImage'));
    
    if (windowsAsset) {
        const btn = document.querySelector('a[href="#latest-windows"]');
        if (btn) btn.href = getProxyDownloadUrl(latestRelease.tag_name, windowsAsset.name);
    }
    
    if (macAsset) {
        const btn = document.querySelector('a[href="#latest-mac"]');
        if (btn) btn.href = getProxyDownloadUrl(latestRelease.tag_name, macAsset.name);
    }
    
    if (linuxAsset) {
        const btn = document.querySelector('a[href="#latest-linux"]');
        if (btn) btn.href = getProxyDownloadUrl(latestRelease.tag_name, linuxAsset.name);
    }
}

// Generate proxy download URL
function getProxyDownloadUrl(tag, filename) {
    const owner = window.githubOwner || 'Tombraider2006';
    const repo = window.githubRepo || '3DPC-Private';
    return `/api/download/${owner}/${repo}/${tag}/${filename}`;
}

function renderRelease(release) {
    const date = new Date(release.published_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const badges = [];
    if (release.prerelease) {
        badges.push('<span style="background: rgba(255, 193, 7, 0.2); color: #ffd54f; padding: 3px 10px; border-radius: 12px; font-size: 0.8em; margin-left: 10px;">Pre-release</span>');
    }
    if (release.draft) {
        badges.push('<span style="background: rgba(158, 158, 158, 0.2); color: #bdbdbd; padding: 3px 10px; border-radius: 12px; font-size: 0.8em; margin-left: 10px;">Draft</span>');
    }
    
    let assetsHTML = '';
    if (release.assets && release.assets.length > 0) {
        assetsHTML = `
            <div class="release-assets">
                <h4 style="color: var(--primary-color); margin-bottom: 15px;">📦 Файлы для загрузки:</h4>
                ${release.assets.map(asset => renderAsset(asset, release.tag_name)).join('')}
            </div>
        `;
    }
    
    const bodyHTML = release.body ? marked.parse(release.body) : '<p style="color: var(--text-secondary);">Описание отсутствует</p>';
    
    return `
        <div class="release-item" id="${release.tag_name}">
            <div class="release-header">
                <div>
                    <span class="release-title">${release.name || release.tag_name}</span>
                    ${badges.join('')}
                </div>
                <div>
                    <span class="release-tag">${release.tag_name}</span>
                </div>
                <span class="release-date">📅 ${date}</span>
            </div>
            
            ${assetsHTML}
            
            <div class="release-body">
                <h4 style="color: var(--primary-color); margin-bottom: 15px;">📝 Описание изменений:</h4>
                ${bodyHTML}
            </div>
        </div>
    `;
}

function renderAsset(asset, releaseTag) {
    const sizeInMB = (asset.size / 1024 / 1024).toFixed(2);
    const icon = getAssetIcon(asset.name);
    const downloadUrl = getProxyDownloadUrl(releaseTag, asset.name);
    
    return `
        <a href="${downloadUrl}" class="asset-item" style="text-decoration: none; color: inherit;">
            <div>
                <span style="font-size: 1.5em; margin-right: 10px;">${icon}</span>
                <span class="asset-name">${asset.name}</span>
                <span class="asset-info">(${sizeInMB} MB | Скачиваний: ${asset.download_count})</span>
            </div>
            <span class="btn btn-primary" style="padding: 8px 20px; font-size: 0.9em;">
                ⬇️ Скачать
            </span>
        </a>
    `;
}

function getAssetIcon(filename) {
    if (filename.includes('Windows') || filename.endsWith('.exe')) return '🪟';
    if (filename.includes('macOS') || filename.endsWith('.dmg')) return '🍎';
    if (filename.includes('Linux') || filename.endsWith('.AppImage')) return '🐧';
    return '📦';
}

// Simple markdown parser (basic functionality)
const marked = {
    parse: (text) => {
        if (!text) return '';
        
        // Convert markdown to HTML (basic implementation)
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h2>$1</h2>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" style="color: var(--primary-color);">$1</a>')
            // Line breaks
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>')
            // Lists
            .replace(/^\- (.*)$/gim, '<li>$1</li>')
            // Wrap in paragraphs
            .replace(/^(.+)$/gim, '<p>$1</p>')
            // Clean up
            .replace(/<p><h/gim, '<h')
            .replace(/<\/h([1-6])><\/p>/gim, '</h$1>')
            .replace(/<p><li>/gim, '<ul><li>')
            .replace(/<\/li><\/p>/gim, '</li></ul>');
    }
};

