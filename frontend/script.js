const newsData = [
    {
        id: 1,
        title: "Lorem ipsum dolor sit amet",
        date: "14 мая 2026",
        excerpt: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        fullText: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        image: "https://i.imgur.com/placeholder1.jpg"
    },
    {
        id: 2,
        title: "Sed do eiusmod tempor",
        date: "10 мая 2026",
        excerpt: "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        fullText: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        image: "https://i.imgur.com/placeholder2.jpg"
    },
    {
        id: 3,
        title: "Duis aute irure dolor",
        date: "5 мая 2026",
        excerpt: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: "https://i.imgur.com/placeholder3.jpg"
    },
    {
        id: 4,
        title: "Excepteur sint occaecat",
        date: "28 апреля 2026",
        excerpt: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        fullText: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        image: "https://i.imgur.com/placeholder4.jpg"
    }
];

const charactersData = [
    { name: "Дольф", role: "Король Междугорья, коронованный некромант", desc: "Жестокий, прагматичный правитель, чья изуродованная даром внешность и циничный взгляд на мир объясняются тяжелой судьбой." },
    { name: "Оскар", role: "Князь Сумерек", desc: "Четырехсотлетний вампир, который служит Дольфу не только из-за зависимости от его «драгоценной» крови, но и по искренней многолетней привязанности." },
    { name: "Магдала", role: "Королева Перелесья", desc: "Холодная, расчетливая «ледяная леди», чей острый ум и железная воля сделали ее идеальной партнершей и единственной настоящей любовью Дольфа." },
    { name: "Людвиг", role: "Старший брат и антипод Дольфа", desc: "Красивый, благородный и добрый наследный принц, который из-за своей слабости и жестокости по отношению к брату в итоге проигрывает в борьбе за власть." },
    { name: "Король Гуго Милосердный", role: "Бывший король Междугорья", desc: "Добрый, но недальновидный отец Дольфа. Слепо верил в рыцарские идеалы и религиозные заповеди, закрывая глаза на дворцовые интриги." },
    { name: "Нэд", role: "Первая любовь Дольфа и паж при дворе", desc: "Был казнен отцом и братом Дольфа за их связь. Его трагическая гибель стала переломным моментом, окончательно сформировавшим мрачную личность будущего короля." },
    { name: "Бернард", role: "Верный призрак и первый вассал Дольфа", desc: "При жизни был искусным шпионом и советником, а после смерти продолжает служить королю как незаменимый информатор, следящий за порядком среди гвардейцев." }
];

const portraitImages = [
    "https://i.ibb.co/qMqJ0HXX/1779789167.png", 
    "https://i.ibb.co/4nSkQVhR/1779789062.png",
    "https://i.ibb.co/fGCNhMJB/1779789068.png",
    "https://i.ibb.co/VpkW3Z9W/1779789074.png",
    "https://i.ibb.co/bMZ7KDP4/1779789668.png",
    "https://i.ibb.co/DfswPZMX/1779789788.png",
    "https://i.ibb.co/YKkWvcC/1779789953.png",
];

const thumbnailImages = portraitImages;

const galleryImages = [
    "https://i.imgur.com/арт1.jpg",
    "https://i.imgur.com/арт2.jpg",
    "https://i.imgur.com/арт3.jpg",
    "https://i.imgur.com/арт4.jpg",
    "https://i.imgur.com/арт5.jpg",
    "https://i.imgur.com/арт6.jpg"
];

const forumTopics = [
    { title: "Теория: кто на самом деле стоит за восстанием мертвецов?", author: "Лор, лор", replies: 47, lastPost: "сегодня" },
    { title: "Любимый персонаж и почему", author: "Фанбой", replies: 23, lastPost: "вчера" },
    { title: "Обсуждение первой главы (спойлеры)", author: "Книголюб", replies: 112, lastPost: "2 часа назад" },
    { title: "Фан-арт конкурс — приём работ", author: "Модератор", replies: 9, lastPost: "5 дней назад" },
    { title: "Нужна ли экранизация?", author: "Киноман", replies: 56, lastPost: "3 дня назад" },
    { title: "Ваши теории о финале", author: "Теоретик", replies: 34, lastPost: "вчера" },
    { title: "Какая магия сильнее?", author: "Маг", replies: 78, lastPost: "6 часов назад" },
    { title: "Обмен фан-артами", author: "Художник", replies: 201, lastPost: "1 час назад" }
];

function renderNews(limit = 3) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const newsToShow = newsData.slice(0, limit);
    grid.innerHTML = newsToShow.map(news => `
        <div class="news-card" data-id="${news.id}">
            <img class="news-img" src="${news.image}" alt="${news.title}" style="height:260px; width:100%; object-fit:cover;">
            <div class="news-content">
                <div class="news-date">${news.date}</div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.getAttribute('data-id'));
            const news = newsData.find(n => n.id === id);
            if (news) showModal(news.title, news.fullText);
        });
    });
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    container.innerHTML = galleryImages.map(url => `
        <div class="gallery-item">
            <img src="${url}" alt="Фанарт" style="width:100%; height:300px; object-fit:cover;">
        </div>
    `).join('');
}

function renderForum(limit = 4) {
    const container = document.getElementById('forumTopics');
    if (!container) return;
    const topicsToShow = forumTopics.slice(0, limit);
    container.innerHTML = topicsToShow.map(topic => `
        <div class="forum-topic">
            <div class="topic-title"><a href="#">${topic.title}</a></div>
            <div class="topic-meta">${topic.author} | Ответов: ${topic.replies} | ${topic.lastPost}</div>
        </div>
    `).join('');
}

function renderFullForumList() {
    const container = document.getElementById('allTopicsList');
    if (!container) return;
    container.innerHTML = forumTopics.map(topic => `
        <div class="forum-topic">
            <div class="topic-title"><a href="#">${topic.title}</a></div>
            <div class="topic-meta">${topic.author} | Ответов: ${topic.replies} | ${topic.lastPost}</div>
        </div>
    `).join('');
}

function showModal(title, content) {
    const modal = document.getElementById('newsModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal) return;
    modalBody.innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    modal.style.display = 'flex';
    const closeBtn = document.querySelector('.modal-close');
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

const toggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
if (toggle) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('active'));
}

let loadedNewsCount = 3;
const loadBtn = document.getElementById('loadMoreNews');
if (loadBtn) {
    loadBtn.addEventListener('click', () => {
        loadedNewsCount = Math.min(loadedNewsCount + 2, newsData.length);
        renderNews(loadedNewsCount);
        if (loadedNewsCount >= newsData.length) loadBtn.style.display = 'none';
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

let currentCharIndex = 0;
let detailsVisible = false;

function updateCharacterCard(index) {
    const char = charactersData[index];
    document.getElementById('charName').innerText = char.name;
    document.getElementById('charRole').innerHTML = `<strong>${char.role}</strong>`;
    document.getElementById('charPortrait').src = portraitImages[index];
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
    container.innerHTML = charactersData.map((char, idx) => `
        <div class="thumbnail-item" data-index="${idx}">
            <img class="thumbnail-avatar" src="${thumbnailImages[idx]}" alt="${char.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; margin-right:12px;">
            <div class="thumbnail-info">
                <strong>${char.name}</strong>
                <span>${char.role}</span>
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
    updateCharacterCard(currentCharIndex);
}

function initDetailsButton() {
    const btn = document.getElementById('showDetailsBtn');
    if (!btn) return;
    const detailsDiv = document.getElementById('characterDetails');
    btn.addEventListener('click', () => {
        const char = charactersData[currentCharIndex];
        document.getElementById('charFullDesc').innerText = char.desc;
        detailsDiv.classList.toggle('hidden');
        detailsVisible = !detailsDiv.classList.contains('hidden');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (document.getElementById('newsGrid')) renderNews(3);
    if (document.getElementById('galleryGrid')) renderGallery();
    if (document.getElementById('forumTopics')) renderForum(4);
    if (document.getElementById('allTopicsList')) renderFullForumList();
    if (document.getElementById('thumbnailsList')) {
        renderThumbnails();
        initDetailsButton();
    }
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', () => {
            const newsSection = document.getElementById('news');
            if (newsSection) newsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

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

document.addEventListener('DOMContentLoaded', () => {
    new QuoteManager();
});