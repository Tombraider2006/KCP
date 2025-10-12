// News page loader

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

async function loadNews() {
    const container = document.getElementById('news-container');
    
    try {
        const response = await fetch('/api/news');
        
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }
        
        const news = await response.json();
        
        if (news.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 60px 20px;">
                    <h3 style="color: var(--text-secondary);">📰 Новостей пока нет</h3>
                    <p style="margin-top: 20px; color: var(--text-secondary);">
                        Скоро здесь появятся новости о развитии проекта
                    </p>
                </div>
            `;
            return;
        }
        
        const newsHTML = `
            <div class="news-grid">
                ${news.map(item => renderNewsItem(item)).join('')}
            </div>
        `;
        
        container.innerHTML = newsHTML;
        
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = `
            <div style="background: rgba(220, 53, 69, 0.2); padding: 30px; border-radius: 10px; border: 1px solid rgba(220, 53, 69, 0.5);">
                <h3>❌ Ошибка загрузки</h3>
                <p style="margin-top: 15px;">
                    Не удалось загрузить новости. Пожалуйста, попробуйте позже.
                </p>
            </div>
        `;
    }
}

function renderNewsItem(item) {
    const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const excerpt = item.excerpt || 'Нажмите, чтобы прочитать полностью...';
    
    return `
        <a href="/news/${item.slug}" class="news-item">
            <h3 class="news-title">${item.title}</h3>
            <p class="news-excerpt">${excerpt}</p>
            <div class="news-meta">
                📅 ${date}
            </div>
        </a>
    `;
}



