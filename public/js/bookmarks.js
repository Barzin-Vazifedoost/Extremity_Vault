/**
 * Anika Agnihotri
 * March 2026
 * Bookmarks page controller for Extremity Vault.
 * Loads the authenticated user's saved articles and allows AJAX bookmark removal.
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

/**
 * Verifies the user's session with the server.
 * Redirects to login if the session is invalid.
 *
 * @param {Function|null} onSuccess - Callback invoked with session data on success.
 */
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
    const navUser = document.getElementById('nav-user');
    if (navUser && data.name) navUser.textContent = data.name;
    loadBookmarks();
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

document.getElementById('category-filter').addEventListener('change', function () {
    renderBookmarks(allBookmarks, this.value);
});
let allBookmarks = [];

/**
 * Fetches the current user's bookmarks from the server and renders
 * each article card with a Remove Bookmark button in #bookmarks-container.
 */
function loadBookmarks() {
    fetch(`${BASE}/src/php/get_bookmarks.php`)
    .then(response => response.json())
    .then(data => {
        const message = document.getElementById('message');

        if (!data.success) {
            message.innerText = data.error;
            return;
        }

        allBookmarks = data.bookmarks;
        renderBookmarks(allBookmarks, '');
    });
}

/**
 * Renders a filtered subset of bookmarks into #bookmarks-container.
 *
 * @param {Array}  bookmarks  - Full bookmark array.
 * @param {string} categoryId - Category ID to filter by, or '' for all.
 */
function renderBookmarks(bookmarks, categoryId) {
    const container = document.getElementById('bookmarks-container');
    container.innerHTML = '';

    const filtered = categoryId
        ? bookmarks.filter(b => String(b.category_id) === categoryId)
        : bookmarks;

    if (filtered.length === 0) {
        container.innerHTML = '<p>No bookmarks found.</p>';
        return;
    }

    filtered.forEach(article => {
        const date = new Date(article.created_at).toLocaleDateString();
        const words = article.content.trim().split(/\s+/).length;
        const mins  = Math.max(1, Math.ceil(words / 200));
        const div = document.createElement('div');
        div.className = 'article';
        div.dataset.articleId = article.id;

        const titleEl = document.createElement('h2');
        titleEl.textContent = article.title;
        const dateEl = document.createElement('small');
        dateEl.textContent = `${article.category || 'Uncategorized'} — ${date}`;
        const readEl = document.createElement('span');
        readEl.className = 'reading-time';
        readEl.textContent = `${mins} min read`;
        const contentEl = document.createElement('p');
        contentEl.textContent = article.content;
        const buttonEl = document.createElement('button');
        buttonEl.className = 'remove-bookmark';
        buttonEl.dataset.id = article.id;
        buttonEl.textContent = 'Remove Bookmark';

        if (article.image_url) {
            const imgEl = document.createElement('img');
            imgEl.className = 'article-image';
            imgEl.src = article.image_url;
            imgEl.alt = '';
            imgEl.loading = 'lazy';
            div.appendChild(imgEl);
        }
        div.appendChild(titleEl);
        div.appendChild(dateEl);
        div.appendChild(readEl);
        div.appendChild(contentEl);
        div.appendChild(buttonEl);
        container.appendChild(div);
    });

    document.querySelectorAll('.remove-bookmark').forEach(btn => {
        btn.addEventListener('click', function () {
            const articleId = this.dataset.id;
            fetch(`${BASE}/src/php/remove_bookmark.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: articleId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    allBookmarks = allBookmarks.filter(b => String(b.id) !== String(articleId));
                    document.querySelector(`.article[data-article-id="${articleId}"]`).remove();
                    if (container.children.length === 0) {
                        container.innerHTML = '<p>No bookmarks found.</p>';
                    }
                } else {
                    document.getElementById('message').innerText = data.error;
                }
            });
        });
    });
}
