const newsData = [
    {
        id: 1,
        title: "Lorem ipsum dolor sit amet",
        date: "14 мая 2026",
        excerpt: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        fullText: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
        id: 2,
        title: "Sed do eiusmod tempor",
        date: "10 мая 2026",
        excerpt: "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        fullText: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        id: 3,
        title: "Duis aute irure dolor",
        date: "5 мая 2026",
        excerpt: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        id: 4,
        title: "Excepteur sint occaecat",
        date: "28 апреля 2026",
        excerpt: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        fullText: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
    }
];

const charactersData = [
    { name: "Лоремиус", role: "Магистр Ордена", desc: "Мудрый наставник, потерявший веру, но обретший надежду в битве с некромантами." },
    { name: "Айден", role: "Охотник на нежить", desc: "Бесстрашный воин с загадочным прошлым. Его клинок никогда не промахивается." },
    { name: "Моргана", role: "Призрачная леди", desc: "Полукровка, владеющая древними ритуалами. Между светом и тьмой." },
    { name: "Велиар", role: "Тёмный лорд", desc: "Главный антагонист, некромант, мечтающий подчинить себе весь мир." }
];

const galleryImagesCount = 6;

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
            <div class="white-square news-img" style="height:180px;"></div>
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
    let html = '';
    for (let i = 0; i < galleryImagesCount; i++) {
        html += `<div class="gallery-item"><div class="white-square" style="height:200px;"></div></div>`;
    }
    container.innerHTML = html;
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

let currentQuote = 0;
const quotes = document.querySelectorAll('.quote-card');
function showQuote(index) {
    if (!quotes.length) return;
    quotes.forEach((q, i) => q.classList.toggle('active', i === index));
}
if (quotes.length) {
    const prevBtn = document.getElementById('prevQuote');
    const nextBtn = document.getElementById('nextQuote');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        currentQuote = (currentQuote - 1 + quotes.length) % quotes.length;
        showQuote(currentQuote);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        currentQuote = (currentQuote + 1) % quotes.length;
        showQuote(currentQuote);
    });
    showQuote(0);
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
function updateCharacterCard(index) {
    const char = charactersData[index];
    const nameEl = document.getElementById('charName');
    const roleEl = document.getElementById('charRole');
    const descEl = document.getElementById('charDesc');
    if (nameEl) nameEl.innerText = char.name;
    if (roleEl) roleEl.innerHTML = `<strong>${char.role}</strong>`;
    if (descEl) descEl.innerText = char.desc;
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}
function initCharacterCarousel() {
    const prevBtn = document.getElementById('prevCharacter');
    const nextBtn = document.getElementById('nextCharacter');
    if (!prevBtn || !nextBtn) return;
    const dotsContainer = document.getElementById('charDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        charactersData.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentCharIndex = idx;
                updateCharacterCard(currentCharIndex);
            });
            dotsContainer.appendChild(dot);
        });
    }
    updateCharacterCard(0);
    prevBtn.addEventListener('click', () => {
        currentCharIndex = (currentCharIndex - 1 + charactersData.length) % charactersData.length;
        updateCharacterCard(currentCharIndex);
    });
    nextBtn.addEventListener('click', () => {
        currentCharIndex = (currentCharIndex + 1) % charactersData.length;
        updateCharacterCard(currentCharIndex);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (document.getElementById('newsGrid')) renderNews(3);
    if (document.getElementById('galleryGrid')) renderGallery();
    if (document.getElementById('forumTopics')) renderForum(4);
    if (document.getElementById('allTopicsList')) renderFullForumList();
    if (document.getElementById('prevCharacter')) initCharacterCarousel();
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', () => {
            const newsSection = document.getElementById('news');
            if (newsSection) newsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});