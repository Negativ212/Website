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
        const response = await fetch('defaultData.json');
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
        document.body.innerHTML = '<div style="padding: 50px; text-align: center; color: red;">Ошибка загрузки данных. Убедитесь, что файл defaultData.json находится в той же папке.</div>';
    }
}

function loadUserData() {
    const savedGallery = localStorage.getItem('fanartGallery');
    const savedForum = localStorage.getItem('forumTopics');
    
    if (savedGallery) {
        currentGallery = JSON.parse(savedGallery);
    } else {
        currentGallery = [];
    }
    
    if (savedForum) {
        currentForumTopics = JSON.parse(savedForum);
    } else {
        currentForumTopics = [];
    }
}

function saveGallery() {
    localStorage.setItem('fanartGallery', JSON.stringify(currentGallery));
}

function saveForum() {
    localStorage.setItem('forumTopics', JSON.stringify(currentForumTopics));
}

function resetToDefault() {
    if (confirm('Сбросить все пользовательские данные? Галерея и темы форума станут пустыми. Это действие нельзя отменить.')) {
        currentGallery = [];
        currentForumTopics = [];
        localStorage.removeItem('fanartGallery');
        localStorage.removeItem('forumTopics');
        renderGallery();
        renderForum(4);
        alert('Данные сброшены. Теперь галерея и форум пусты.');
    }
}

function renderNews(limit = 3) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const newsToShow = STATIC_DATA.newsData.slice(0, limit);
    grid.innerHTML = newsToShow.map(news => `
        <div class="news-card" data-id="${news.id}">
            <img class="news-img" src="${news.image}" alt="${escapeHtml(news.title)}" style="height:260px; width:100%; object-fit:cover;">
            <div class="news-content">
                <div class="news-date">${escapeHtml(news.date)}</div>
                <h3 class="news-title">${escapeHtml(news.title)}</h3>
                <p class="news-excerpt">${escapeHtml(news.excerpt)}</p>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.getAttribute('data-id'));
            const news = STATIC_DATA.newsData.find(n => n.id === id);
            if (news) showModal(escapeHtml(news.title), escapeHtml(news.fullText));
        });
    });
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    if (currentGallery.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">Пока нет изображений. Добавьте первое!</div>';
        return;
    }
    container.innerHTML = currentGallery.map(url => `
        <div class="gallery-item">
            <img src="${escapeHtml(url)}" alt="Фанарт" style="width:100%; height:300px; object-fit:cover;">
        </div>
    `).join('');
}

function renderForum(limit = 4) {
    const container = document.getElementById('forumTopics');
    if (!container) return;
    if (currentForumTopics.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);">Пока нет тем. Создайте первую!</div>';
        return;
    }
    const topicsToShow = currentForumTopics.slice(0, limit);
    container.innerHTML = topicsToShow.map(topic => `
        <div class="forum-topic" data-topic-id="${topic.id}">
            <div class="topic-title"><a href="#" class="topic-link">${escapeHtml(topic.title)}</a></div>
            <div class="topic-meta">${escapeHtml(topic.author)} | Ответов: ${topic.messages ? topic.messages.length : 0} | ${escapeHtml(topic.lastPost)}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.forum-topic .topic-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const topicDiv = link.closest('.forum-topic');
            const id = parseInt(topicDiv.getAttribute('data-topic-id'));
            openTopic(id);
        });
    });
}

function openTopic(topicId) {
    const topic = currentForumTopics.find(t => t.id === topicId);
    if (!topic) return;
    currentTopicId = topicId;
    document.getElementById('topicModalTitle').innerText = topic.title;
    renderTopicMessages(topicId);
    const modal = document.getElementById('topicModal');
    modal.style.display = 'flex';
}

function renderTopicMessages(topicId) {
    const topic = currentForumTopics.find(t => t.id === topicId);
    const container = document.getElementById('topicMessagesList');
    if (!container) return;
    if (!topic.messages || topic.messages.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Пока нет сообщений. Будьте первым!</p>';
        return;
    }
    container.innerHTML = topic.messages.map(msg => `
        <div style="background: var(--bg-card); border-radius: 12px; padding: 12px; margin-bottom: 12px; border-left: 3px solid var(--accent);">
            <strong>${escapeHtml(msg.author)}</strong> <span style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(msg.date)}</span>
            <p style="margin-top: 8px;">${escapeHtml(msg.text)}</p>
        </div>
    `).join('');
}

function addMessageToTopic(topicId, author, text) {
    if (!text || text.trim() === '') {
        alert('Введите сообщение');
        return;
    }
    if (!author || author.trim() === '') author = 'Аноним';
    const topic = currentForumTopics.find(t => t.id === topicId);
    if (!topic) return;
    if (!topic.messages) topic.messages = [];
    topic.messages.push({
        author: author.trim(),
        text: text.trim(),
        date: new Date().toLocaleString()
    });
    topic.replies = topic.messages.length;
    topic.lastPost = 'только что';
    saveForum();
    renderForum(4);
    renderTopicMessages(topicId);
    document.getElementById('newMessageText').value = '';
}

function addForumTopic(title, author) {
    if (!title || title.trim() === '') {
        alert('Введите название темы');
        return;
    }
    if (!author || author.trim() === '') author = 'Аноним';
    const newId = Date.now();
    const newTopic = {
        id: newId,
        title: title.trim(),
        author: author.trim(),
        replies: 0,
        lastPost: 'только что',
        messages: []
    };
    currentForumTopics.unshift(newTopic);
    saveForum();
    renderForum(4);
    document.getElementById('newTopicTitle').value = '';
    document.getElementById('newTopicAuthor').value = '';
}

function addGalleryImage(url) {
    if (!url || url.trim() === '') {
        alert('Введите URL изображения');
        return;
    }
    currentGallery.push(url.trim());
    saveGallery();
    renderGallery();
    document.getElementById('newImageUrl').value = '';
}

function showModal(title, content) {
    const modal = document.getElementById('newsModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal) return;
    modalBody.innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    modal.style.display = 'flex';
    const closeBtn = document.querySelector('#newsModal .modal-close');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function applyTheme(theme) {
    const body = document.body;
    const select = document.getElementById('themeSelect');
    if (theme === 'system') {
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.className = darkMode ? 'theme-dark' : 'theme-light';
        if (select) select.value = 'system';
    } else {
        body.className = `theme-${theme}`;
        if (select) select.value = theme;
    }
    localStorage.setItem('siteTheme', theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('system');
    }
    const select = document.getElementById('themeSelect');
    if (select) {
        select.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('siteTheme') === 'system') {
            applyTheme('system');
        }
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
            <img class="thumbnail-avatar" src="${STATIC_DATA.portraitImages[idx]}" alt="${escapeHtml(char.name)}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; margin-right:12px;">
            <div class="thumbnail-info">
                <strong>${escapeHtml(char.name)}</strong>
                <span>${escapeHtml(char.role)}</span>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-index'));
            currentCharIndex = idx;
            updateCharacterCard(currentCharIndex);
            if (document.getElementById('characterDetails')) {
                document.getElementById('characterDetails').classList.add('hidden');
                detailsVisible = false;
            }
        });
    });
    if (STATIC_DATA.charactersData.length > 0) updateCharacterCard(currentCharIndex);
}

function initDetailsButton() {
    const btn = document.getElementById('showDetailsBtn');
    if (!btn) return;
    const detailsDiv = document.getElementById('characterDetails');
    btn.addEventListener('click', () => {
        const char = STATIC_DATA.charactersData[currentCharIndex];
        if (char) {
            document.getElementById('charFullDesc').innerText = char.desc;
        }
        detailsDiv.classList.toggle('hidden');
        detailsVisible = !detailsDiv.classList.contains('hidden');
    });
}

function initAddButtons() {
    const addImageBtn = document.getElementById('addImageBtn');
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
            const urlInput = document.getElementById('newImageUrl');
            addGalleryImage(urlInput.value);
        });
    }
    
    const addTopicBtn = document.getElementById('addTopicBtn');
    if (addTopicBtn) {
        addTopicBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('newTopicTitle');
            const authorInput = document.getElementById('newTopicAuthor');
            addForumTopic(titleInput.value, authorInput.value);
        });
    }
    
    const resetBtn = document.getElementById('resetToDefaultBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefault);
    }
    
    const sendMsgBtn = document.getElementById('sendMessageBtn');
    if (sendMsgBtn) {
        sendMsgBtn.addEventListener('click', () => {
            addMessageToTopic(currentTopicId, 'Пользователь', document.getElementById('newMessageText').value);
        });
    }
    
    const topicModalClose = document.getElementById('topicModalClose');
    if (topicModalClose) {
        topicModalClose.onclick = () => {
            document.getElementById('topicModal').style.display = 'none';
        };
    }
    
    window.onclick = (e) => {
        const topicModal = document.getElementById('topicModal');
        if (e.target === topicModal) topicModal.style.display = 'none';
    };
}

function initApp() {
    loadUserData();
    initTheme();
    renderNews(3);
    renderGallery();
    renderForum(4);
    if (document.getElementById('thumbnailsList')) {
        renderThumbnails();
        initDetailsButton();
    }
    initAddButtons();
    
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (toggle) {
        toggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
    
    const loadBtn = document.getElementById('loadMoreNews');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            loadedNewsCount = Math.min(loadedNewsCount + 2, STATIC_DATA.newsData.length);
            renderNews(loadedNewsCount);
            if (loadedNewsCount >= STATIC_DATA.newsData.length) loadBtn.style.display = 'none';
        });
    }
    
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', () => {
            const newsSection = document.getElementById('news');
            if (newsSection) newsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === "#") return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                if (navLinks?.classList.contains('active')) navLinks.classList.remove('active');
            }
        });
    });
}

loadDefaultData();

const quizForm = document.getElementById('quizForm');
if (quizForm) {
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let q1 = parseInt(e.target.q1.value);
        let q2 = parseInt(e.target.q2.value);
        let q3 = parseInt(e.target.q3.value);
        let q4 = parseInt(e.target.q4.value);
        let total = q1 + q2 + q3 + q4;
        let char = '', desc = '';
        if (total <= 6) { char = 'Айден, Охотник на нежить'; desc = 'Ты смел и решителен, не боишься смотреть смерти в лицо.'; }
        else if (total <= 10) { char = 'Лоремиус, Магистр Ордена'; desc = 'Ты мудр и рассудителен, предпочитаешь знания грубой силе.'; }
        else if (total <= 14) { char = 'Моргана, Призрачная леди'; desc = 'Ты загадочен(на) и гибок, танцуешь между светом и тьмой.'; }
        else { char = 'Велиар, Тёмный лорд'; desc = 'Ты жаждешь власти и не остановишься ни перед чем.'; }
        document.getElementById('resultCharacter').innerText = char;
        document.getElementById('resultDesc').innerText = desc;
        document.getElementById('quizResult').style.display = 'block';
    });
}

class QuoteManager {
    constructor() {
        this.localBtn = document.getElementById('localQuoteBtn');
        this.externalBtn = document.getElementById('externalQuoteBtn');
        this.quoteText = document.getElementById('quoteText');
        this.errorDiv = document.getElementById('errorMessage');
        this.localQuotesCache = null;
        
        if (this.localBtn && this.externalBtn && this.quoteText) {
            this.localBtn.addEventListener('click', () => this.displayLocalQuote());
            this.externalBtn.addEventListener('click', () => this.fetchExternalQuote());
            this.displayLocalQuote();
        }
    }
    
    async loadLocalQuotes() {
        if (this.localQuotesCache !== null) return this.localQuotesCache;
        try {
            const response = await fetch('quotes.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            let quotesArray = null;
            if (data.quotes && Array.isArray(data.quotes)) {
                quotesArray = data.quotes;
            } else if (Array.isArray(data)) {
                quotesArray = data;
            } else {
                throw new Error('Неизвестный формат');
            }
            this.localQuotesCache = quotesArray.map(item => {
                if (typeof item === 'string') return item;
                if (item.content) return item.content;
                if (item.text) return item.text;
                return String(item);
            }).filter(text => text && text.length > 0);
            if (this.localQuotesCache.length === 0) throw new Error('Нет цитат');
            return this.localQuotesCache;
        } catch (err) {
            console.error(err);
            if (this.errorDiv) {
                this.errorDiv.style.display = 'block';
                this.errorDiv.innerText = 'Ошибка загрузки локальных цитат. Проверьте quotes.json.';
            }
            return [];
        }
    }
    
    async displayLocalQuote() {
        try {
            if (this.errorDiv) this.errorDiv.style.display = 'none';
            this.quoteText.innerText = 'Загрузка...';
            const quotes = await this.loadLocalQuotes();
            if (!quotes.length) {
                this.quoteText.innerText = 'Нет доступных цитат';
                return;
            }
            const randomIndex = Math.floor(Math.random() * quotes.length);
            this.quoteText.innerText = `«${quotes[randomIndex]}»`;
        } catch (err) {
            console.error(err);
            if (this.errorDiv) {
                this.errorDiv.style.display = 'block';
                this.errorDiv.innerText = 'Ошибка при показе цитаты';
            }
            this.quoteText.innerText = 'Ошибка';
        }
    }
    
    async fetchExternalQuote() {
        try {
            if (this.errorDiv) this.errorDiv.style.display = 'none';
            this.quoteText.innerText = 'Загрузка...';
            const response = await fetch('https://dummyjson.com/quotes/random');
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            const data = await response.json();
            this.quoteText.innerText = `«${data.quote}»`;
        } catch (err) {
            console.error(err);
            if (this.errorDiv) {
                this.errorDiv.style.display = 'block';
                this.errorDiv.innerText = 'Ошибка загрузки из сети. Проверьте соединение.';
            }
            this.quoteText.innerText = 'Ошибка';
        }
    }
}

if (document.querySelector('.quotes-api-section')) {
    document.addEventListener('DOMContentLoaded', () => {
        new QuoteManager();
    });
}
(function() {
    const mapContainer = document.getElementById('interactiveMap');
    if (!mapContainer) return;
    const panContent = document.getElementById('panContent');
    const mapImage = document.getElementById('mapImage');
    const markersContainer = document.getElementById('mapMarkers');
    let scale = 1;
    let translateX = 0, translateY = 0;
    let isDragging = false;
    let startX, startY;
    let currentMarker = null;
    function clampTranslate() {
        const rect = mapContainer.getBoundingClientRect();
        const imgRect = mapImage.getBoundingClientRect();
        const maxX = Math.max(0, (imgRect.width * scale - rect.width) / 2);
        const maxY = Math.max(0, (imgRect.height * scale - rect.height) / 2);
        translateX = Math.min(maxX, Math.max(-maxX, translateX));
        translateY = Math.min(maxY, Math.max(-maxY, translateY));
    }
    function updateTransform() {
        panContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    function centerMap() {
        const imgRect = mapImage.getBoundingClientRect();
        if (imgRect.width === 0) return;
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }
    function zoomAt(clientX, clientY, delta) {
        const oldScale = scale;
        let newScale = scale * (delta > 0 ? 1.1 : 0.9);
        newScale = Math.min(4, Math.max(0.8, newScale));
        if (newScale === scale) return;
        const rect = mapContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const beforeX = (x - translateX) / oldScale;
        const beforeY = (y - translateY) / oldScale;
        scale = newScale;
        translateX = x - beforeX * scale;
        translateY = y - beforeY * scale;
        clampTranslate();
        updateTransform();
    }
    function onMouseDown(e) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mapContainer.style.cursor = 'grabbing';
        e.preventDefault();
    }
    function onMouseMove(e) {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        clampTranslate();
        updateTransform();
    }
    function onMouseUp() {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    }
    function onWheel(e) {
        e.preventDefault();
        const rect = mapContainer.getBoundingClientRect();
        zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? -1 : 1);
    }
    mapContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mapContainer.addEventListener('wheel', onWheel, { passive: false });
    mapImage.addEventListener('load', centerMap);
    centerMap();
    const zoomIn = document.getElementById('zoomInBtn');
    const zoomOut = document.getElementById('zoomOutBtn');
    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            const rect = mapContainer.getBoundingClientRect();
            zoomAt(rect.left + rect.width/2, rect.top + rect.height/2, 1);
        });
    }
    if (zoomOut) {
        zoomOut.addEventListener('click', () => {
            const rect = mapContainer.getBoundingClientRect();
            zoomAt(rect.left + rect.width/2, rect.top + rect.height/2, -1);
        });
    }
    function showMarkerAt(clientX, clientY) {
        const rect = mapContainer.getBoundingClientRect();
        const xPercent = ((clientX - rect.left - translateX) / scale) / mapImage.clientWidth * 100;
        const yPercent = ((clientY - rect.top - translateY) / scale) / mapImage.clientHeight * 100;
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return;
        if (currentMarker) currentMarker.remove();
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.left = `${xPercent}%`;
        marker.style.top = `${yPercent}%`;
        markersContainer.appendChild(marker);
        currentMarker = marker;
        const ripple = document.createElement('div');
        ripple.className = 'map-marker-ripple';
        ripple.style.left = `${xPercent}%`;
        ripple.style.top = `${yPercent}%`;
        markersContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.innerText = `Метка: ${Math.round(xPercent)}%, ${Math.round(yPercent)}%`;
        document.body.appendChild(tooltip);
        const markerRect = marker.getBoundingClientRect();
        tooltip.style.left = markerRect.left + markerRect.width/2 - tooltip.offsetWidth/2 + 'px';
        tooltip.style.top = markerRect.top - 35 + 'px';
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 300);
        }, 500);
    }
    mapContainer.addEventListener('click', (e) => {
        if (isDragging) return;
        const rect = mapContainer.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;
        if (clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom) {
            showMarkerAt(clickX, clickY);
        }
    });
})();