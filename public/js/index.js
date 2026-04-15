const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

let allArticles = [];

// Session guard
function checkSession(onSuccess) {
    fetch(`${BASE}/src/php/session_check.php`)
    .then(response => response.json())
    .then(data => {
        if (!data.logged_in) {
            window.location.replace('../html/login.html');
            return;
        }
        if (onSuccess) onSuccess(data);
    })
    .catch(() => { window.location.replace('../html/login.html'); });
}

checkSession(function(data) {
    if (data.role === 'admin') {
        document.getElementById('sidebar-admin').style.display = 'block';
    }
    fetchAllArticles();
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        checkSession(null);
    }
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch(`${BASE}/src/php/logout.php`)
    .then(() => { window.location.href = '../html/login.html'; });
});

// Search button
document.getElementById('search-btn').addEventListener('click', applyFilter);

// Enter key in search
document.getElementById('search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyFilter();
});

// Sidebar category links
document.querySelectorAll('#sidebar-categories a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const cat = this.dataset.category;
        document.getElementById('category-filter').value = cat;
        document.querySelectorAll('#sidebar-categories a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
        applyFilter();
    });
});

// Fetch all published articles once, then filter client-side
function fetchAllArticles() {
    fetch(`${BASE}/src/php/search_articles.php`)
    .then(response => response.json())
    .then(articles => {
        if (Array.isArray(articles)) {
            allArticles = articles;
        }
        applyFilter();
    });
}

function applyFilter() {
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    const category_id = document.getElementById('category-filter').value;

    const filtered = allArticles.filter(function(article) {
        const matchQ = !q ||
            article.title.toLowerCase().includes(q) ||
            article.content.toLowerCase().includes(q);
        const matchCat = !category_id || String(article.category_id) === category_id;
        return matchQ && matchCat;
    });

    renderArticles(filtered);
}

function renderArticles(articles) {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';

    if (articles.length === 0) {
        container.innerHTML = '<p style="font-style:italic;color:var(--ink-muted);">No entries found in the vault.</p>';
        return;
    }

    articles.forEach(article => {
        const date = new Date(article.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
        const div = document.createElement('div');
        div.className = 'article';

        const titleEl = document.createElement('h2');
        titleEl.textContent = article.title;
        const dateEl = document.createElement('small');
        dateEl.textContent = `${article.category || 'Uncategorized'} — ${date}`;
        const contentEl = document.createElement('p');
        contentEl.textContent = article.content;

        div.innerHTML = `
            <button class="bookmark-btn" data-id="${article.id}">Bookmark</button>
            <div class="comments-section">
                <h3>Discussion</h3>
                <div class="comments-list" id="comments-list-${article.id}"></div>
                <form class="comment-form" data-article-id="${article.id}">
                    <input type="text" class="comment-input" placeholder="Leave a note…" required>
                    <button type="submit">Post</button>
                    <div class="comment-message"></div>
                </form>
            </div>
        `;

        div.insertBefore(contentEl, div.firstChild);
        div.insertBefore(dateEl, div.firstChild);
        div.insertBefore(titleEl, div.firstChild);

        container.appendChild(div);
        loadComments(article.id);
    });

    // Bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const articleId = this.dataset.id;
            fetch(`${BASE}/src/php/add_bookmark.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: articleId })
            })
            .then(response => response.json())
            .then(data => {
                this.innerText = data.success ? 'Bookmarked ✦' : data.error;
                this.disabled = data.success;
            });
        });
    });

    // Comment forms
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const articleId = this.dataset.articleId;
            const input = this.querySelector('.comment-input');
            const messageEl = this.querySelector('.comment-message');

            fetch(`${BASE}/src/php/add_comment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: articleId, content: input.value.trim() })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const list = document.getElementById(`comments-list-${articleId}`);
                    const comment = document.createElement('div');
                    comment.className = 'comment';
                    const nameEl = document.createElement('strong');
                    nameEl.textContent = data.name;
                    const contentEl = document.createElement('p');
                    contentEl.textContent = input.value.trim();
                    comment.appendChild(nameEl);
                    comment.appendChild(contentEl);
                    list.appendChild(comment);
                    input.value = '';
                } else {
                    messageEl.innerText = data.error;
                }
            });
        });
    });
}

function loadComments(articleId) {
    fetch(`${BASE}/src/php/get_comments.php?article_id=${articleId}`)
    .then(response => response.json())
    .then(data => {
        if (!data.success) return;
        const list = document.getElementById(`comments-list-${articleId}`);
        data.comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment';
            const nameEl = document.createElement('strong');
            nameEl.textContent = comment.name;
            const contentEl = document.createElement('p');
            contentEl.textContent = comment.content;
            div.appendChild(nameEl);
            div.appendChild(contentEl);
            list.appendChild(div);
        });
    });
}
