/**
 * Ammar Khan
 * March 2026
 * Archive page controller for Extremity Vault.
 * Fetches all published articles and renders them with AJAX comment loading and posting.
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch(`${BASE}/src/php/logout.php`)
    .then(() => { window.location.href = '../html/login.html'; });
});

// Show logged-in user name in navbar (best-effort, public page)
fetch(`${BASE}/src/php/session_check.php`)
    .then(r => r.json())
    .then(function(data) {
        const navUser = document.getElementById('nav-user');
        if (navUser && data.logged_in && data.name) navUser.textContent = data.name;
    })
    .catch(function() {});

/**
 * Fetches all published articles and renders each one with a comment
 * section. Attaches AJAX submit listeners to every comment form.
 */
function loadArticles() {
    fetch(`${BASE}/src/php/get_articles.php`)
    .then(response => response.json())
    .then(articles => {
        const container = document.getElementById('articles-container');

        if (articles.length === 0) {
            container.innerHTML = '<p>No articles published yet.</p>';
            return;
        }

        articles.forEach(article => {
            const date = new Date(article.created_at).toLocaleDateString();
            const words = article.content.trim().split(/\s+/).length;
            const mins  = Math.max(1, Math.ceil(words / 200));
            const div = document.createElement('div');
            div.className = 'article';
            const titleEl = document.createElement('h2');
            titleEl.textContent = article.title;
            const dateEl = document.createElement('small');
            dateEl.textContent = date;
            const readEl = document.createElement('span');
            readEl.className = 'reading-time';
            readEl.textContent = `${mins} min read`;
            const contentEl = document.createElement('p');
            contentEl.textContent = article.content;
            
            div.innerHTML = `
                ${article.image_url ? `<img class="article-image" src="${article.image_url}" alt="" loading="lazy">` : ''}
                <button class="bookmark-btn" data-id="${article.id}">Bookmark</button>
                <div class="comments-section">
                    <h3>Comments</h3>
                    <div class="comments-list" id="comments-list-${article.id}"></div>
                    <form class="comment-form" data-article-id="${article.id}">
                        <input type="text" class="comment-input" placeholder="Write a comment..." required>
                        <button type="submit">Post</button>
                        <div class="comment-message"></div>
                    </form>
                </div>
            `;
            
            div.insertBefore(contentEl, div.firstChild);
            div.insertBefore(readEl, div.firstChild);
            div.insertBefore(dateEl, div.firstChild);
            div.insertBefore(titleEl, div.firstChild);
            container.appendChild(div);
            loadComments(article.id);
        });

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

        fetch(`${BASE}/src/php/get_bookmarks.php`)
            .then(r => r.json())
            .then(data => {
                if (!data.success) return;
                const bookmarkedIds = new Set(data.bookmarks.map(b => String(b.id)));
                document.querySelectorAll('.bookmark-btn').forEach(btn => {
                    if (bookmarkedIds.has(btn.dataset.id)) {
                        btn.textContent = 'Bookmarked ✦';
                        btn.disabled = true;
                    }
                });
            })
            .catch(() => {});

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
                        messageEl.textContent = data.error;
                    }
                });
            });
        });
    });
}

/**
 * Loads existing comments for the given article and appends them
 * to the article's #comments-list-{id} element.
 *
 * @param {number|string} articleId - The article whose comments to load.
 */
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

document.addEventListener('DOMContentLoaded', loadArticles);