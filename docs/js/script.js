class DataManager {
    constructor() {
        this.defaultData = { galleryImages: [], forumTopics: [] };
        this.staticData = { newsData: [], charactersData: [], portraitImages: [] };
        this.currentGallery = [];
        this.currentForumTopics = [];
    }

    async loadDefaultData() {
        try {
            const response = await fetch('data/default-data.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.defaultData.galleryImages = data.galleryImages || [];
            this.defaultData.forumTopics = data.forumTopics || [];
            this.staticData.newsData = data.newsData || [];
            this.staticData.charactersData = data.charactersData || [];
            this.staticData.portraitImages = data.portraitImages || [];
            return true;
        } catch (err) {
            console.error('Ошибка загрузки default-data.json:', err);
            document.body.innerHTML = '<div style="padding:50px;text-align:center;color:red;">Ошибка загрузки данных. Проверьте default-data.json.</div>';
            return false;
        }
    }

    loadUserData() {
        this.currentGallery = JSON.parse(localStorage.getItem('fanartGallery')) || [];
        this.currentForumTopics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    }

    saveGallery() {
        localStorage.setItem('fanartGallery', JSON.stringify(this.currentGallery));
    }

    saveForum() {
        localStorage.setItem('forumTopics', JSON.stringify(this.currentForumTopics));
    }

    async resetToDefault() {
        const result = await Swal.fire({
            title: 'Сброс данных',
            text: 'Вы уверены? Это удалит все добавленные картинки и темы.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Да, сбросить',
            cancelButtonText: 'Отмена'
        });
        if (result.isConfirmed) {
            this.currentGallery = [...this.defaultData.galleryImages];
            this.currentForumTopics = [...this.defaultData.forumTopics];
            this.saveGallery();
            this.saveForum();
            Swal.fire('Готово', 'Данные сброшены к исходным', 'success');
            return true;
        }
        return false;
    }

    addGalleryImage(url) {
        if (!url?.trim()) return false;
        this.currentGallery.push(url.trim());
        this.saveGallery();
        return true;
    }

    addForumTopic(title, author) {
        if (!title?.trim()) return false;
        this.currentForumTopics.unshift({
            id: Date.now(),
            title: title.trim(),
            author: author.trim() || 'Аноним',
            replies: 0,
            lastPost: 'только что',
            messages: []
        });
        this.saveForum();
        return true;
    }

    addMessageToTopic(topicId, author, text) {
        if (!text?.trim()) return false;
        const topic = this.currentForumTopics.find(t => t.id === topicId);
        if (!topic) return false;
        if (!topic.messages) topic.messages = [];
        topic.messages.push({
            author: author.trim() || 'Аноним',
            text: text.trim(),
            date: new Date().toLocaleString()
        });
        topic.lastPost = 'только что';
        this.saveForum();
        return true;
    }

    getTopicById(id) {
        return this.currentForumTopics.find(t => t.id === id);
    }
}

class ThemeManager {
    constructor() {
        this.selectEl = document.getElementById('themeSelect');
        this.init();
    }

    init() {
        const saved = localStorage.getItem('siteTheme');
        this.applyTheme(saved === 'system' || !saved ? 'system' : saved);
        if (this.selectEl) {
            this.selectEl.addEventListener('change', e => this.applyTheme(e.target.value));
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('siteTheme') === 'system') this.applyTheme('system');
        });
    }

    applyTheme(theme) {
        const body = document.body;
        if (theme === 'system') {
            body.className = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light';
        } else {
            body.className = `theme-${theme}`;
        }
        localStorage.setItem('siteTheme', theme);
        if (this.selectEl) this.selectEl.value = theme;
    }
}

class ModalManager {
    static escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }

    static showNewsModal(title, content) {
        const modal = document.getElementById('newsModal');
        if (!modal) return;
        document.getElementById('modalBody').innerHTML = `<h2>${this.escapeHtml(title)}</h2><p>${this.escapeHtml(content)}</p>`;
        modal.style.display = 'flex';
        document.querySelector('#newsModal .modal-close').onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }

    static showImageModal(imgUrl) {
        const modal = document.getElementById('imageModal');
        const fullImg = document.getElementById('fullImage');
        if (modal && fullImg) {
            fullImg.src = imgUrl;
            modal.style.display = 'flex';
        }
    }

    static hideImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    static showTopicModal(topic, dataManager, onRefresh) {
        const modal = document.getElementById('topicModal');
        if (!modal || !topic) return;
        document.getElementById('topicModalTitle').innerText = topic.title;
        const container = document.getElementById('topicMessagesList');
        if (!topic.messages?.length) {
            container.innerHTML = '<p style="text-align:center;">Пока нет сообщений. Будьте первым!</p>';
        } else {
            container.innerHTML = topic.messages.map(msg => `
                <div style="background:var(--bg-card);border-radius:12px;padding:12px;margin-bottom:12px;border-left:3px solid var(--accent);">
                    <strong>${this.escapeHtml(msg.author)}</strong>
                    <span style="font-size:0.8rem;">${this.escapeHtml(msg.date)}</span>
                    <p style="margin-top:8px;">${this.escapeHtml(msg.text)}</p>
                </div>
            `).join('');
        }
        modal.style.display = 'flex';

        const closeModal = () => modal.style.display = 'none';
        document.getElementById('topicModalClose').onclick = closeModal;
        window.onclick = (e) => { if (e.target === modal) closeModal(); };

        const sendBtn = document.getElementById('sendMessageBtn');
        const newMessageText = document.getElementById('newMessageText');
        const oldHandler = sendBtn._handler;
        if (oldHandler) sendBtn.removeEventListener('click', oldHandler);
        const handler = async () => {
            const text = newMessageText?.value;
            if (!text?.trim()) {
                await Swal.fire('Ошибка', 'Введите сообщение', 'error');
                return;
            }
            if (dataManager.addMessageToTopic(topic.id, 'Пользователь', text)) {
                if (onRefresh) onRefresh();
                if (newMessageText) newMessageText.value = '';
                const updatedTopic = dataManager.getTopicById(topic.id);
                if (updatedTopic) ModalManager.showTopicModal(updatedTopic, dataManager, onRefresh);
            } else {
                await Swal.fire('Ошибка', 'Не удалось отправить сообщение', 'error');
            }
        };
        sendBtn._handler = handler;
        sendBtn.addEventListener('click', handler);
    }
}

class NewsRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.loadedNewsCount = 3;
    }

    render(limit = null) {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;
        const count = limit !== null ? limit : this.loadedNewsCount;
        const newsToShow = this.dataManager.staticData.newsData.slice(0, count);
        grid.innerHTML = newsToShow.map(news => `
            <div class="news-card" data-id="${news.id}">
                <img class="news-img" src="${news.image}" alt="${ModalManager.escapeHtml(news.title)}">
                <div class="news-content">
                    <div class="news-date">${ModalManager.escapeHtml(news.date)}</div>
                    <h3 class="news-title">${ModalManager.escapeHtml(news.title)}</h3>
                    <p class="news-excerpt">${ModalManager.escapeHtml(news.excerpt)}</p>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.news-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const news = this.dataManager.staticData.newsData.find(n => n.id === id);
                if (news) ModalManager.showNewsModal(news.title, news.fullText);
            });
        });
    }

    loadMore() {
        if (this.loadedNewsCount >= this.dataManager.staticData.newsData.length) {
            const btn = document.getElementById('loadMoreNews');
            if (btn) btn.style.display = 'none';
            return false;
        }
        this.loadedNewsCount = Math.min(this.loadedNewsCount + 2, this.dataManager.staticData.newsData.length);
        this.render();
        if (this.loadedNewsCount >= this.dataManager.staticData.newsData.length) {
            const btn = document.getElementById('loadMoreNews');
            if (btn) btn.style.display = 'none';
        }
        return true;
    }
}

class GalleryRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    render() {
        const container = document.getElementById('galleryGrid');
        if (!container) return;
        const gallery = this.dataManager.currentGallery;
        if (!gallery.length) {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;">Пока нет изображений. Добавьте первое!</div>';
            return;
        }
        container.innerHTML = gallery.map(url => `
            <div class="gallery-item" data-img-url="${ModalManager.escapeHtml(url)}">
                <img src="${ModalManager.escapeHtml(url)}" alt="Фанарт" loading="lazy">
            </div>
        `).join('');
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                ModalManager.showImageModal(item.dataset.imgUrl);
            });
        });
    }

    async addFromUrl(url) {
        if (this.dataManager.addGalleryImage(url)) {
            this.render();
            document.getElementById('newImageUrl').value = '';
            await Swal.fire('Успех', 'Изображение добавлено в галерею', 'success');
            return true;
        }
        await Swal.fire('Ошибка', 'Введите URL изображения', 'error');
        return false;
    }

    addFromFile(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            Swal.fire('Ошибка', 'Пожалуйста, выберите файл изображения', 'error');
            return;
        }
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            Swal.fire('Ошибка', 'Изображение слишком большое (максимум 2 МБ)', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            this.addFromUrl(event.target.result);
        };
        reader.readAsDataURL(file);
    }
}

class ForumRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    render(limit = Infinity, containerId = 'forumTopics') {
        const container = document.getElementById(containerId);
        if (!container) return;
        const topics = limit === Infinity ? this.dataManager.currentForumTopics : this.dataManager.currentForumTopics.slice(0, limit);
        if (!topics.length) {
            container.innerHTML = '<div style="text-align:center;padding:40px;">Пока нет тем. Создайте первую!</div>';
            return;
        }
        container.innerHTML = topics.map(topic => `
            <div class="forum-topic" data-topic-id="${topic.id}">
                <div class="topic-title"><a href="#" class="topic-link">${ModalManager.escapeHtml(topic.title)}</a></div>
                <div class="topic-meta">${ModalManager.escapeHtml(topic.author)} | Ответов: ${topic.messages?.length || 0} | ${ModalManager.escapeHtml(topic.lastPost)}</div>
            </div>
        `).join('');
        container.querySelectorAll('.forum-topic .topic-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = parseInt(link.closest('.forum-topic').dataset.topicId);
                this.openTopic(id);
            });
        });
    }

    openTopic(topicId) {
        const topic = this.dataManager.getTopicById(topicId);
        if (!topic) return;
        ModalManager.showTopicModal(topic, this.dataManager, () => {
            this.renderAllTopicsPage();
            this.render();
        });
    }

    refreshDisplay() {
        const isAllTopicsPage = document.getElementById('allTopicsList') !== null;
        if (isAllTopicsPage) {
            this.render(Infinity, 'allTopicsList');
        } else {
            this.render(4, 'forumTopics');
        }
    }

    renderAllTopicsPage() {
        this.render(Infinity, 'allTopicsList');
    }

    async addTopic(title, author) {
        if (this.dataManager.addForumTopic(title, author)) {
            this.refreshDisplay();
            document.getElementById('newTopicTitle').value = '';
            if (document.getElementById('newTopicAuthor')) document.getElementById('newTopicAuthor').value = '';
            await Swal.fire('Успех', 'Тема создана', 'success');
            return true;
        }
        await Swal.fire('Ошибка', 'Введите название темы', 'error');
        return false;
    }
}

class CharacterRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentCharIndex = 0;
        this.detailsVisible = false;
    }

    renderThumbnails() {
        const container = document.getElementById('thumbnailsList');
        if (!container) return;
        const characters = this.dataManager.staticData.charactersData;
        const portraits = this.dataManager.staticData.portraitImages;
        container.innerHTML = characters.map((char, idx) => `
            <div class="thumbnail-item" data-index="${idx}">
                <img class="thumbnail-avatar" src="${portraits[idx]}" alt="${ModalManager.escapeHtml(char.name)}">
                <div class="thumbnail-info">
                    <strong>${ModalManager.escapeHtml(char.name)}</strong>
                    <span>${ModalManager.escapeHtml(char.role)}</span>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentCharIndex = parseInt(item.dataset.index);
                this.updateCard();
                this.hideDetails();
            });
        });
        if (characters.length) this.updateCard();
    }

    updateCard() {
        const char = this.dataManager.staticData.charactersData[this.currentCharIndex];
        if (!char) return;
        document.getElementById('charName').innerText = char.name;
        document.getElementById('charRole').innerHTML = `<strong>${ModalManager.escapeHtml(char.role)}</strong>`;
        document.getElementById('charPortrait').src = this.dataManager.staticData.portraitImages[this.currentCharIndex];
        if (document.getElementById('characterDetails') && !this.detailsVisible) {
            document.getElementById('characterDetails').classList.add('hidden');
        }
        document.querySelectorAll('.thumbnail-item').forEach((item, i) => {
            if (i === this.currentCharIndex) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    showDetails() {
        const char = this.dataManager.staticData.charactersData[this.currentCharIndex];
        if (char) document.getElementById('charFullDesc').innerText = char.desc;
        const details = document.getElementById('characterDetails');
        details.classList.toggle('hidden');
        this.detailsVisible = !details.classList.contains('hidden');
    }

    hideDetails() {
        const details = document.getElementById('characterDetails');
        if (details && !details.classList.contains('hidden')) {
            details.classList.add('hidden');
            this.detailsVisible = false;
        }
    }
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

    hideError() {
        if (this.errorDiv) this.errorDiv.style.display = 'none';
    }
}

class MapController {
    constructor() {
        this.container = document.getElementById('interactiveMap');
        if (!this.container) return;
        this.panContent = document.getElementById('panContent');
        this.mapImage = document.getElementById('mapImage');
        this.markers = document.getElementById('mapMarkers');
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.dragging = false;
        this.wasDragged = false;
        this.currentMarker = null;
        this.init();
    }

    init() {
        this.clamp = this.clamp.bind(this);
        this.update = this.update.bind(this);
        this.zoomAt = this.zoomAt.bind(this);
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.container.addEventListener('touchend', () => { this.dragging = false; });
        this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.mapImage.addEventListener('load', () => {
            this.scale = 1;
            this.translateX = 0;
            this.translateY = 0;
            this.update();
        });
        document.getElementById('zoomInBtn')?.addEventListener('click', () => {
            const rect = this.container.getBoundingClientRect();
            this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1);
        });
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
            const rect = this.container.getBoundingClientRect();
            this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, -1);
        });
        this.container.addEventListener('click', this.onClick.bind(this));
    }

    clamp() {
        const rect = this.container.getBoundingClientRect();
        const imgRect = this.mapImage.getBoundingClientRect();
        const maxX = Math.max(0, (imgRect.width * this.scale - rect.width) / 2);
        const maxY = Math.max(0, (imgRect.height * this.scale - rect.height) / 2);
        this.translateX = Math.min(maxX, Math.max(-maxX, this.translateX));
        this.translateY = Math.min(maxY, Math.max(-maxY, this.translateY));
    }

    update() {
        this.panContent.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }

    zoomAt(clientX, clientY, delta) {
        const oldScale = this.scale;
        let newScale = this.scale * (delta > 0 ? 1.1 : 0.9);
        newScale = Math.min(4, Math.max(0.8, newScale));
        if (newScale === this.scale) return;
        const rect = this.container.getBoundingClientRect();
        const x = clientX - rect.left, y = clientY - rect.top;
        const beforeX = (x - this.translateX) / oldScale;
        const beforeY = (y - this.translateY) / oldScale;
        this.scale = newScale;
        this.translateX = x - beforeX * this.scale;
        this.translateY = y - beforeY * this.scale;
        this.clamp();
        this.update();
    }

    onMouseDown(e) {
        this.dragging = true;
        this.wasDragged = false;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        this.container.style.cursor = 'grabbing';
        e.preventDefault();
    }

    onMouseMove(e) {
        if (!this.dragging) return;
        this.wasDragged = true;
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.clamp();
        this.update();
    }

    onMouseUp() {
        this.dragging = false;
        this.container.style.cursor = 'grab';
    }

    onTouchStart(e) {
        this.dragging = true;
        this.wasDragged = false;
        this.startX = e.touches[0].clientX - this.translateX;
        this.startY = e.touches[0].clientY - this.translateY;
    }

    onTouchMove(e) {
        if (!this.dragging) return;
        e.preventDefault();
        this.wasDragged = true;
        this.translateX = e.touches[0].clientX - this.startX;
        this.translateY = e.touches[0].clientY - this.startY;
        this.clamp();
        this.update();
    }

    onWheel(e) {
        e.preventDefault();
        this.zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? -1 : 1);
    }

    onClick(e) {
        if (this.wasDragged) {
            this.wasDragged = false;
            return;
        }
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX, y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
        const xPercent = ((x - rect.left - this.translateX) / this.scale) / this.mapImage.clientWidth * 100;
        const yPercent = ((y - rect.top - this.translateY) / this.scale) / this.mapImage.clientHeight * 100;
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return;
        if (this.currentMarker) this.currentMarker.remove();
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.left = `${xPercent}%`;
        marker.style.top = `${yPercent}%`;
        this.markers.appendChild(marker);
        this.currentMarker = marker;
        const ripple = document.createElement('div');
        ripple.className = 'map-marker-ripple';
        ripple.style.left = `${xPercent}%`;
        ripple.style.top = `${yPercent}%`;
        this.markers.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        const tip = document.createElement('div');
        tip.className = 'map-tooltip';
        tip.innerText = `Метка: ${Math.round(xPercent)}%, ${Math.round(yPercent)}%`;
        document.body.appendChild(tip);
        const mr = marker.getBoundingClientRect();
        tip.style.left = mr.left + mr.width / 2 - tip.offsetWidth / 2 + 'px';
        tip.style.top = mr.top - 35 + 'px';
        setTimeout(() => {
            tip.style.opacity = '0';
            setTimeout(() => tip.remove(), 300);
        }, 500);
    }
}

class QuizController {
    constructor() {
        const form = document.getElementById('quizForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        let total = 0;
        const selects = e.target.querySelectorAll('select');
        for (let sel of selects) {
            total += parseInt(sel.value);
        }
        let char = '', desc = '';
        if (total <= 6) {
            char = 'Айден, Охотник на нежить';
            desc = 'Ты смел и решителен.';
        } else if (total <= 10) {
            char = 'Лоремиус, Магистр Ордена';
            desc = 'Ты мудр и рассудителен.';
        } else if (total <= 14) {
            char = 'Моргана, Призрачная леди';
            desc = 'Ты загадочен(на) и гибок.';
        } else {
            char = 'Велиар, Тёмный лорд';
            desc = 'Ты жаждешь власти.';
        }
        document.getElementById('resultCharacter').innerText = char;
        document.getElementById('resultDesc').innerText = desc;
        document.getElementById('quizResult').style.display = 'block';
    }
}

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.themeManager = null;
        this.newsRenderer = null;
        this.galleryRenderer = null;
        this.forumRenderer = null;
        this.characterRenderer = null;
        this.quoteManager = null;
        this.mapController = null;
        this.quizController = null;
    }

    async init() {
        await this.loadSweetAlert();
        const success = await this.dataManager.loadDefaultData();
        if (!success) return;
        this.dataManager.loadUserData();
        await this.loadHeaderFooter();
        this.themeManager = new ThemeManager();
        this.newsRenderer = new NewsRenderer(this.dataManager);
        this.galleryRenderer = new GalleryRenderer(this.dataManager);
        this.forumRenderer = new ForumRenderer(this.dataManager);
        this.characterRenderer = new CharacterRenderer(this.dataManager);
        this.newsRenderer.render();
        this.galleryRenderer.render();
        this.forumRenderer.refreshDisplay();
        if (document.getElementById('thumbnailsList')) {
            this.characterRenderer.renderThumbnails();
            const btn = document.getElementById('showDetailsBtn');
            if (btn) btn.addEventListener('click', () => this.characterRenderer.showDetails());
        }
        document.getElementById('addImageBtn')?.addEventListener('click', () => {
            const url = document.getElementById('newImageUrl').value;
            this.galleryRenderer.addFromUrl(url);
        });
        document.getElementById('addTopicBtn')?.addEventListener('click', () => {
            const title = document.getElementById('newTopicTitle')?.value;
            const author = document.getElementById('newTopicAuthor')?.value;
            this.forumRenderer.addTopic(title, author);
        });
        document.getElementById('resetToDefaultBtn')?.addEventListener('click', async () => {
            if (await this.dataManager.resetToDefault()) {
                this.galleryRenderer.render();
                this.forumRenderer.refreshDisplay();
            }
        });
        document.getElementById('loadMoreNews')?.addEventListener('click', () => this.newsRenderer.loadMore());
        document.querySelector('.scroll-down')?.addEventListener('click', () => {
            document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
        });
        const imageModalClose = document.getElementById('imageModalClose');
        if (imageModalClose) {
            imageModalClose.addEventListener('click', () => ModalManager.hideImageModal());
        }
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('imageModal')) ModalManager.hideImageModal();
        });
        const fileInput = document.getElementById('uploadImageFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.galleryRenderer.addFromFile(e.target.files[0]);
                e.target.value = '';
            });
        }
        this.quoteManager = new QuoteManager();
        if (document.getElementById('interactiveMap')) {
            this.mapController = new MapController();
        }
        this.quizController = new QuizController();
    }

    async loadSweetAlert() {
        if (window.Swal) return;
        const loadCSS = (href) => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        };
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };
        loadCSS('https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css');
        await loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
    }

    async loadHeaderFooter() {
        try {
            const headerRes = await fetch('header.html');
            const headerHtml = await headerRes.text();
            document.body.insertAdjacentHTML('afterbegin', headerHtml);
            const footerRes = await fetch('footer.html');
            const footerHtml = await footerRes.text();
            document.body.insertAdjacentHTML('beforeend', footerHtml);
            const toggle = document.getElementById('mobileToggle');
            const navLinks = document.getElementById('navLinks');
            if (toggle) {
                toggle.addEventListener('click', () => navLinks.classList.toggle('active'));
            }
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
        } catch (err) {
            console.error('Ошибка загрузки header/footer:', err);
        }
    }
}

const app = new App();
app.init();