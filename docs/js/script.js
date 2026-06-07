let DEFAULT_DATA = { galleryImages: [], forumTopics: [] };
let STATIC_DATA = { newsData: [], charactersData: [], portraitImages: [] };

let currentGallery = [];
let currentForumTopics = [];
let loadedNewsCount = 3;
let currentCharIndex = 0;
let detailsVisible = false;
let currentTopicId = null;

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function loadDefaultData() {
    try {
        const response = await fetch('data/defaultData.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        DEFAULT_DATA.galleryImages = data.galleryImages || [];
        DEFAULT_DATA.forumTopics = data.forumTopics || [];
        STATIC_DATA.newsData = data.newsData || [];
        STATIC_DATA.charactersData = data.charactersData || [];
        STATIC_DATA.portraitImages = data.portraitImages || [];
        initApp();
    } catch (err) {
        console.error('Ошибка загрузки defaultData.json:', err);
        document.body.innerHTML = '<div style="padding:50px;text-align:center;color:red;">Ошибка загрузки данных. Проверьте defaultData.json.</div>';
    }
}

function loadUserData() {
    currentGallery = JSON.parse(localStorage.getItem('fanartGallery')) || [];
    currentForumTopics = JSON.parse(localStorage.getItem('forumTopics')) || [];
}

function saveGallery() { localStorage.setItem('fanartGallery', JSON.stringify(currentGallery)); }
function saveForum() { localStorage.setItem('forumTopics', JSON.stringify(currentForumTopics)); }

function resetToDefault() {
    if (confirm('Сбросить все данные к исходному состоянию? Это удалит все добавленные картинки и темы.')) {
        currentGallery = [...DEFAULT_DATA.galleryImages];
        currentForumTopics = [...DEFAULT_DATA.forumTopics];
        saveGallery();
        saveForum();
        renderGallery();
        refreshForumDisplay();
        alert('Данные сброшены к исходным.');
    }
}

function renderNews(limit = 3) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const newsToShow = STATIC_DATA.newsData.slice(0, limit);
    grid.innerHTML = newsToShow.map(news => `
        <div class="news-card" data-id="${news.id}">
            <img class="news-img" src="${news.image}" alt="${escapeHtml(news.title)}">
            <div class="news-content">
                <div class="news-date">${escapeHtml(news.date)}</div>
                <h3 class="news-title">${escapeHtml(news.title)}</h3>
                <p class="news-excerpt">${escapeHtml(news.excerpt)}</p>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const news = STATIC_DATA.newsData.find(n => n.id === id);
            if (news) showModal(escapeHtml(news.title), escapeHtml(news.fullText));
        });
    });
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    if (!currentGallery.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;">Пока нет изображений. Добавьте первое!</div>';
        return;
    }
    container.innerHTML = currentGallery.map(url => `
        <div class="gallery-item" data-img-url="${escapeHtml(url)}">
            <img src="${escapeHtml(url)}" alt="Фанарт" loading="lazy">
        </div>
    `).join('');
    
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const imgUrl = item.dataset.imgUrl;
            const modal = document.getElementById('imageModal');
            const fullImg = document.getElementById('fullImage');
            if (modal && fullImg) {
                fullImg.src = imgUrl;
                modal.style.display = 'flex';
            }
        });
    });
}

function renderForum(limit = Infinity, containerId = 'forumTopics') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const topics = limit === Infinity ? currentForumTopics : currentForumTopics.slice(0, limit);
    if (!topics.length) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">Пока нет тем. Создайте первую!</div>';
        return;
    }
    container.innerHTML = topics.map(topic => `
        <div class="forum-topic" data-topic-id="${topic.id}">
            <div class="topic-title"><a href="#" class="topic-link">${escapeHtml(topic.title)}</a></div>
            <div class="topic-meta">${escapeHtml(topic.author)} | Ответов: ${topic.messages?.length || 0} | ${escapeHtml(topic.lastPost)}</div>
        </div>
    `).join('');
    container.querySelectorAll('.forum-topic .topic-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(link.closest('.forum-topic').dataset.topicId);
            openTopic(id);
        });
    });
}

function refreshForumDisplay() {
    const isAllTopicsPage = document.getElementById('allTopicsList') !== null;
    if (isAllTopicsPage) {
        renderForum(Infinity, 'allTopicsList');
    } else {
        renderForum(4, 'forumTopics');
    }
}

function openTopic(topicId) {
    const topic = currentForumTopics.find(t => t.id === topicId);
    if (!topic) return;
    currentTopicId = topicId;
    document.getElementById('topicModalTitle').innerText = topic.title;
    renderTopicMessages(topicId);
    document.getElementById('topicModal').style.display = 'flex';
}

function renderTopicMessages(topicId) {
    const topic = currentForumTopics.find(t => t.id === topicId);
    const container = document.getElementById('topicMessagesList');
    if (!container) return;
    if (!topic.messages?.length) {
        container.innerHTML = '<p style="text-align:center;">Пока нет сообщений. Будьте первым!</p>';
        return;
    }
    container.innerHTML = topic.messages.map(msg => `
        <div style="background:var(--bg-card);border-radius:12px;padding:12px;margin-bottom:12px;border-left:3px solid var(--accent);">
            <strong>${escapeHtml(msg.author)}</strong> <span style="font-size:0.8rem;">${escapeHtml(msg.date)}</span>
            <p style="margin-top:8px;">${escapeHtml(msg.text)}</p>
        </div>
    `).join('');
}

function addMessageToTopic(topicId, author, text) {
    if (!text?.trim()) return alert('Введите сообщение');
    const topic = currentForumTopics.find(t => t.id === topicId);
    if (!topic) return;
    if (!topic.messages) topic.messages = [];
    topic.messages.push({
        author: author.trim() || 'Аноним',
        text: text.trim(),
        date: new Date().toLocaleString()
    });
    topic.lastPost = 'только что';
    saveForum();
    refreshForumDisplay();
    renderTopicMessages(topicId);
    document.getElementById('newMessageText').value = '';
}

function addForumTopic(title, author) {
    if (!title?.trim()) return alert('Введите название темы');
    currentForumTopics.unshift({
        id: Date.now(),
        title: title.trim(),
        author: author.trim() || 'Аноним',
        replies: 0,
        lastPost: 'только что',
        messages: []
    });
    saveForum();
    refreshForumDisplay();
    document.getElementById('newTopicTitle').value = '';
    if (document.getElementById('newTopicAuthor')) document.getElementById('newTopicAuthor').value = '';
}

function addGalleryImage(url) {
    if (!url?.trim()) return alert('Введите URL изображения');
    currentGallery.push(url.trim());
    saveGallery();
    renderGallery();
    document.getElementById('newImageUrl').value = '';
}

function showModal(title, content) {
    const modal = document.getElementById('newsModal');
    if (!modal) return;
    document.getElementById('modalBody').innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    modal.style.display = 'flex';
    document.querySelector('#newsModal .modal-close').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function applyTheme(theme) {
    const body = document.body;
    if (theme === 'system') {
        body.className = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light';
    } else {
        body.className = `theme-${theme}`;
    }
    localStorage.setItem('siteTheme', theme);
    const select = document.getElementById('themeSelect');
    if (select) select.value = theme;
}

function initTheme() {
    const saved = localStorage.getItem('siteTheme');
    applyTheme(saved === 'system' || !saved ? 'system' : saved);
    document.getElementById('themeSelect')?.addEventListener('change', e => applyTheme(e.target.value));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('siteTheme') === 'system') applyTheme('system');
    });
}

function updateCharacterCard(index) {
    const char = STATIC_DATA.charactersData[index];
    if (!char) return;
    document.getElementById('charName').innerText = char.name;
    document.getElementById('charRole').innerHTML = `<strong>${escapeHtml(char.role)}</strong>`;
    document.getElementById('charPortrait').src = STATIC_DATA.portraitImages[index];
    if (document.getElementById('characterDetails') && !detailsVisible) {
        document.getElementById('characterDetails').classList.add('hidden');
    }
    document.querySelectorAll('.thumbnail-item').forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function renderThumbnails() {
    const container = document.getElementById('thumbnailsList');
    if (!container) return;
    container.innerHTML = STATIC_DATA.charactersData.map((char, idx) => `
        <div class="thumbnail-item" data-index="${idx}">
            <img class="thumbnail-avatar" src="${STATIC_DATA.portraitImages[idx]}" alt="${escapeHtml(char.name)}">
            <div class="thumbnail-info"><strong>${escapeHtml(char.name)}</strong><span>${escapeHtml(char.role)}</span></div>
        </div>
    `).join('');
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.addEventListener('click', () => {
            currentCharIndex = parseInt(item.dataset.index);
            updateCharacterCard(currentCharIndex);
            if (document.getElementById('characterDetails')) {
                document.getElementById('characterDetails').classList.add('hidden');
                detailsVisible = false;
            }
        });
    });
    if (STATIC_DATA.charactersData.length) updateCharacterCard(currentCharIndex);
}

function initDetailsButton() {
    const btn = document.getElementById('showDetailsBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const char = STATIC_DATA.charactersData[currentCharIndex];
        if (char) document.getElementById('charFullDesc').innerText = char.desc;
        const details = document.getElementById('characterDetails');
        details.classList.toggle('hidden');
        detailsVisible = !details.classList.contains('hidden');
    });
}

function loadHeaderFooter() {
    fetch('header.html')
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) themeSelect.value = localStorage.getItem('siteTheme') || 'system';
            initTheme();
            const toggle = document.getElementById('mobileToggle');
            const navLinks = document.getElementById('navLinks');
            if (toggle) toggle.addEventListener('click', () => navLinks.classList.toggle('active'));
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === "#") return;
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                        navLinks?.classList.remove('active');
                    }
                });
            });
        });
    fetch('footer.html')
        .then(r => r.text())
        .then(html => document.body.insertAdjacentHTML('beforeend', html));
}

function initApp() {
    loadHeaderFooter();
    loadUserData();
    renderNews(3);
    renderGallery();
    refreshForumDisplay();
    if (document.getElementById('thumbnailsList')) {
        renderThumbnails();
        initDetailsButton();
    }
    document.getElementById('addImageBtn')?.addEventListener('click', () => addGalleryImage(document.getElementById('newImageUrl').value));
    document.getElementById('addTopicBtn')?.addEventListener('click', () => addForumTopic(
        document.getElementById('newTopicTitle')?.value,
        document.getElementById('newTopicAuthor')?.value
    ));
    document.getElementById('resetToDefaultBtn')?.addEventListener('click', resetToDefault);
    document.getElementById('sendMessageBtn')?.addEventListener('click', () => addMessageToTopic(currentTopicId, 'Пользователь', document.getElementById('newMessageText')?.value));
    document.getElementById('topicModalClose')?.addEventListener('click', () => document.getElementById('topicModal').style.display = 'none');
    window.onclick = (e) => { if (e.target === document.getElementById('topicModal')) document.getElementById('topicModal').style.display = 'none'; };
    document.getElementById('loadMoreNews')?.addEventListener('click', () => {
        loadedNewsCount = Math.min(loadedNewsCount + 2, STATIC_DATA.newsData.length);
        renderNews(loadedNewsCount);
        if (loadedNewsCount >= STATIC_DATA.newsData.length) document.getElementById('loadMoreNews').style.display = 'none';
    });
    document.querySelector('.scroll-down')?.addEventListener('click', () => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }));
    
    const imageModal = document.getElementById('imageModal');
    const imageModalClose = document.getElementById('imageModalClose');
    if (imageModalClose) {
        imageModalClose.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }
    if (imageModal) {
        window.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }
    
    const fileInput = document.getElementById('uploadImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения');
                return;
            }
            const maxSize = 2 * 1024 * 1024; // 2 MB
            if (file.size > maxSize) {
                alert('Изображение слишком большое (максимум 2 МБ)');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(event) {
                addGalleryImage(event.target.result);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }
}

loadDefaultData();

if (document.getElementById('quizForm')) {
    document.getElementById('quizForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let total = [...this.querySelectorAll('select')].reduce((sum, sel) => sum + parseInt(sel.value), 0);
        let char = '', desc = '';
        if (total <= 6) { char = 'Айден, Охотник на нежить'; desc = 'Ты смел и решителен.'; }
        else if (total <= 10) { char = 'Лоремиус, Магистр Ордена'; desc = 'Ты мудр и рассудителен.'; }
        else if (total <= 14) { char = 'Моргана, Призрачная леди'; desc = 'Ты загадочен(на) и гибок.'; }
        else { char = 'Велиар, Тёмный лорд'; desc = 'Ты жаждешь власти.'; }
        document.getElementById('resultCharacter').innerText = char;
        document.getElementById('resultDesc').innerText = desc;
        document.getElementById('quizResult').style.display = 'block';
    });
}

class QuoteManager {
    constructor() {
        this.localQuotesCache = null;
        this.localBtn = document.getElementById('localQuoteBtn');
        this.externalBtn = document.getElementById('externalQuoteBtn');
        this.quoteText = document.getElementById('quoteText');
        this.errorDiv = document.getElementById('errorMessage');
        if (this.localBtn && this.externalBtn) {
            this.localBtn.addEventListener('click', () => this.displayLocalQuote());
            this.externalBtn.addEventListener('click', () => this.fetchExternalQuote());
            this.displayLocalQuote();
        }
    }
    async loadLocalQuotes() {
        if (this.localQuotesCache) return this.localQuotesCache;
        try {
            const res = await fetch('data/quotes.json');
            if (!res.ok) throw new Error();
            const data = await res.json();
            let quotes = data.quotes || (Array.isArray(data) ? data : []);
            this.localQuotesCache = quotes.map(q => typeof q === 'string' ? q : q.content || q.text || '').filter(t => t);
            if (!this.localQuotesCache.length) throw new Error();
            return this.localQuotesCache;
        } catch {
            this.showError('Ошибка загрузки цитат.');
            return [];
        }
    }
    async displayLocalQuote() {
        this.hideError();
        this.quoteText.innerText = 'Загрузка...';
        const quotes = await this.loadLocalQuotes();
        if (!quotes.length) return;
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        this.quoteText.innerText = `«${random}»`;
    }
    async fetchExternalQuote() {
        this.hideError();
        this.quoteText.innerText = 'Загрузка...';
        try {
            const res = await fetch('https://dummyjson.com/quotes/random');
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.quoteText.innerText = `«${data.quote}»`;
        } catch {
            this.showError('Ошибка сети. Проверьте соединение.');
        }
    }
    showError(msg) {
        if (this.errorDiv) {
            this.errorDiv.innerText = msg;
            this.errorDiv.style.display = 'block';
        }
        this.quoteText.innerText = 'Ошибка';
    }
    hideError() { if (this.errorDiv) this.errorDiv.style.display = 'none'; }
}

if (document.querySelector('.quotes-api-section')) new QuoteManager();

if (document.getElementById('interactiveMap')) {
    (function() {
        const container = document.getElementById('interactiveMap');
        const panContent = document.getElementById('panContent');
        const mapImage = document.getElementById('mapImage');
        const markers = document.getElementById('mapMarkers');
        let scale = 1, translateX = 0, translateY = 0, dragging = false, startX, startY;
        let currentMarker = null;

        function clamp() {
            const rect = container.getBoundingClientRect();
            const imgRect = mapImage.getBoundingClientRect();
            const maxX = Math.max(0, (imgRect.width * scale - rect.width) / 2);
            const maxY = Math.max(0, (imgRect.height * scale - rect.height) / 2);
            translateX = Math.min(maxX, Math.max(-maxX, translateX));
            translateY = Math.min(maxY, Math.max(-maxY, translateY));
        }
        function update() { panContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`; }
        function zoomAt(clientX, clientY, delta) {
            const oldScale = scale;
            let newScale = scale * (delta > 0 ? 1.1 : 0.9);
            newScale = Math.min(4, Math.max(0.8, newScale));
            if (newScale === scale) return;
            const rect = container.getBoundingClientRect();
            const x = clientX - rect.left, y = clientY - rect.top;
            const beforeX = (x - translateX) / oldScale, beforeY = (y - translateY) / oldScale;
            scale = newScale;
            translateX = x - beforeX * scale;
            translateY = y - beforeY * scale;
            clamp();
            update();
        }
        container.addEventListener('mousedown', e => { dragging = true; startX = e.clientX - translateX; startY = e.clientY - translateY; container.style.cursor = 'grabbing'; e.preventDefault(); });
        window.addEventListener('mousemove', e => { if (dragging) { translateX = e.clientX - startX; translateY = e.clientY - startY; clamp(); update(); } });
        window.addEventListener('mouseup', () => { dragging = false; container.style.cursor = 'grab'; });
        container.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? -1 : 1); }, { passive: false });
        mapImage.addEventListener('load', () => { scale = 1; translateX = 0; translateY = 0; update(); });
        document.getElementById('zoomInBtn')?.addEventListener('click', () => { const rect = container.getBoundingClientRect(); zoomAt(rect.left + rect.width/2, rect.top + rect.height/2, 1); });
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => { const rect = container.getBoundingClientRect(); zoomAt(rect.left + rect.width/2, rect.top + rect.height/2, -1); });
        container.addEventListener('click', (e) => {
            if (dragging) return;
            const rect = container.getBoundingClientRect();
            const x = e.clientX, y = e.clientY;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                const xPercent = ((x - rect.left - translateX) / scale) / mapImage.clientWidth * 100;
                const yPercent = ((y - rect.top - translateY) / scale) / mapImage.clientHeight * 100;
                if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return;
                if (currentMarker) {
                    currentMarker.remove();
                    currentMarker = null;
                }
                const marker = document.createElement('div');
                marker.className = 'map-marker';
                marker.style.left = `${xPercent}%`;
                marker.style.top = `${yPercent}%`;
                markers.appendChild(marker);
                currentMarker = marker;
                const ripple = document.createElement('div');
                ripple.className = 'map-marker-ripple';
                ripple.style.left = `${xPercent}%`;
                ripple.style.top = `${yPercent}%`;
                markers.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
                const tip = document.createElement('div');
                tip.className = 'map-tooltip';
                tip.innerText = `Метка: ${Math.round(xPercent)}%, ${Math.round(yPercent)}%`;
                document.body.appendChild(tip);
                const mr = marker.getBoundingClientRect();
                tip.style.left = mr.left + mr.width/2 - tip.offsetWidth/2 + 'px';
                tip.style.top = mr.top - 35 + 'px';
                setTimeout(() => { tip.style.opacity = '0'; setTimeout(() => tip.remove(), 300); }, 500);
            }
        });
    })();
}