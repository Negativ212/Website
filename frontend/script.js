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
//вот это короче будет изменять возможно, если будет лень перенесу в css

const charactersData = [
    { name: "Lorem Ipsum", role: "Dolor Sit Amet", desc: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt." },
    { name: "Ut Enim", role: "Ad Minim Veniam", desc: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea." },
    { name: "Duis Aute", role: "Irure Dolor", desc: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat." },
    { name: "Excepteur Sint", role: "Occaecat", desc: "Cupidatat non proident, sunt in culpa qui officia deserunt." }
];

const galleryImagesCount = 6; 
const forumTopics = [
    { title: "Lorem ipsum dolor sit amet", author: "Consectetur", replies: 47, lastPost: "сегодня" },
    { title: "Adipiscing elit sed do", author: "Eiusmod", replies: 23, lastPost: "вчера" },
    { title: "Tempor incididunt ut labore", author: "Dolore", replies: 112, lastPost: "2 часа назад" },
    { title: "Magna aliqua ut enim", author: "Minim", replies: 9, lastPost: "5 дней назад" }
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

function renderCharacters() {
    const container = document.getElementById('charactersGrid');
    if (!container) return;
    container.innerHTML = charactersData.map(ch => `
        <div class="character-card">
            <div class="white-square" style="height:280px;"></div>
            <h3>${ch.name}</h3>
            <p><strong>${ch.role}</strong><br>${ch.desc}</p>
        </div>
    `).join('');
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

function renderForum() {
    const container = document.getElementById('forumTopics');
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
    modalBody.innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    modal.style.display = 'flex';
    document.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

let currentQuote = 0;
const quotes = document.querySelectorAll('.quote-card');
function showQuote(index) {
    if (!quotes.length) return;
    quotes.forEach((q, i) => q.classList.toggle('active', i === index));
}
if (quotes.length) {
    document.getElementById('prevQuote')?.addEventListener('click', () => {
        currentQuote = (currentQuote - 1 + quotes.length) % quotes.length;
        showQuote(currentQuote);
    });
    document.getElementById('nextQuote')?.addEventListener('click', () => {
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

document.addEventListener('DOMContentLoaded', () => {
    renderNews(3);
    renderCharacters();
    renderGallery();
    renderForum();
    document.querySelector('.scroll-down')?.addEventListener('click', () => {
        document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
    });
});