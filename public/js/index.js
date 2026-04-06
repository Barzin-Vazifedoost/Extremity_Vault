fetch('/Extremity_Vault/src/php/get_articles.php')
.then(response => response.json())
.then(articles => {
    const container = document.getElementById('articles-container');

    if (articles.length === 0) {
        container.innerHTML = '<p>No articles published yet.</p>';
        return;
    }

    articles.forEach(article => {
        const div = document.createElement('div');
        div.className = 'article';
        div.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.content}</p>
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
        container.appendChild(div);
        loadComments(article.id);
    });

    // Bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const articleId = this.dataset.id;
            fetch('/Extremity_Vault/src/php/add_bookmark.php', {
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

    // Comment forms
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const articleId = this.dataset.articleId;
            const input = this.querySelector('.comment-input');
            const messageEl = this.querySelector('.comment-message');

            fetch('/Extremity_Vault/src/php/add_comment.php', {
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
                    comment.innerHTML = `<strong>${data.name}</strong><p>${input.value.trim()}</p>`;
                    list.appendChild(comment);
                    input.value = '';
                } else {
                    messageEl.innerText = data.error;
                }
            });
        });
    });
});

function loadComments(articleId) {
    fetch(`/Extremity_Vault/src/php/get_comments.php?article_id=${articleId}`)
    .then(response => response.json())
    .then(data => {
        if (!data.success) return;
        const list = document.getElementById(`comments-list-${articleId}`);
        data.comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `<strong>${comment.name}</strong><p>${comment.content}</p>`;
            list.appendChild(div);
        });
    });
}

// Show admin link if user is admin, handle logout
fetch('/Extremity_Vault/src/php/session_check.php')
.then(response => response.json())
.then(data => {
    if (!data.logged_in) {
        window.location.href = '../html/login.html';
        return;
    }
    if (data.role === 'admin') {
        document.getElementById('admin-link').style.display = 'inline';
    }
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch('/Extremity_Vault/src/php/logout.php')
    .then(() => { window.location.href = '../html/login.html'; });
});
