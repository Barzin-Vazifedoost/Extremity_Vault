// Session guard
function checkSession(onSuccess) {
    fetch('/~vazifedb/Extremity_Vault/src/php/session_check.php')
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
        document.getElementById('admin-link').style.display = 'inline';
        document.getElementById('manage-link').style.display = 'inline';
    }
    loadArticles();
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        checkSession(null);
    }
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch('/~vazifedb/Extremity_Vault/src/php/logout.php')
    .then(() => { window.location.href = '../html/login.html'; });
});

document.getElementById('search-btn').addEventListener('click', function () {
    loadArticles();
});

document.getElementById('search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') loadArticles();
});

function loadArticles() {
    const q = document.getElementById('search-input').value.trim();
    const category_id = document.getElementById('category-filter').value;

    let url = '/~vazifedb/Extremity_Vault/src/php/search_articles.php?';
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (category_id) url += `category_id=${category_id}`;

    fetch(url)
    .then(response => response.json())
    .then(articles => {
        const container = document.getElementById('articles-container');
        container.innerHTML = '';

        if (!Array.isArray(articles) || articles.length === 0) {
            container.innerHTML = '<p>No articles found.</p>';
            return;
        }

        articles.forEach(article => {
            const date = new Date(article.created_at).toLocaleDateString();
            const div = document.createElement('div');
            div.className = 'article';
            // Create elements safely to prevent XSS
            const titleEl = document.createElement('h2');
            titleEl.textContent = article.title;
            const dateEl = document.createElement('small');
            dateEl.textContent = `${article.category || 'Uncategorized'} — ${date}`;
            const contentEl = document.createElement('p');
            contentEl.textContent = article.content;
            
            div.innerHTML = `
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
            
            // Insert safe elements
            div.insertBefore(contentEl, div.firstChild);
            div.insertBefore(dateEl, div.firstChild); 
            div.insertBefore(titleEl, div.firstChild);
            
            container.appendChild(div);
            loadComments(article.id);
        });

        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const articleId = this.dataset.id;
                fetch('/~vazifedb/Extremity_Vault/src/php/add_bookmark.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ article_id: articleId })
                })
                .then(response => response.json())
                .then(data => {
                    this.innerText = data.success ? 'Bookmarked' : data.error;
                    this.disabled = data.success;
                });
            });
        });

        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const articleId = this.dataset.articleId;
                const input = this.querySelector('.comment-input');
                const messageEl = this.querySelector('.comment-message');

                fetch('/~vazifedb/Extremity_Vault/src/php/add_comment.php', {
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
    });
}

function loadComments(articleId) {
    fetch(`/~vazifedb/Extremity_Vault/src/php/get_comments.php?article_id=${articleId}`)
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
