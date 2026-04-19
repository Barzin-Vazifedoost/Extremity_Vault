/**
 * Erin Sobers
 * March 2026
 * Admin editor controller for Extremity Vault.
 * Handles article creation, publish/unpublish toggling, draft deletion, and autosave.
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';
const AUTOSAVE_KEY = 'ev_editor_draft';

/**
 * Verifies the user's session and enforces admin-only access.
 * Redirects to login if unauthenticated, or to home if not admin.
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
        if (data.role !== 'admin') {
            window.location.replace('../html/index.html');
            return;
        }
        if (onSuccess) onSuccess(data);
    })
    .catch(() => { window.location.replace('../html/login.html'); });
}

checkSession(function () {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
        try {
            const draft = JSON.parse(saved);
            if (draft.title)       document.getElementById('title').value       = draft.title;
            if (draft.category_id) document.getElementById('category_id').value = draft.category_id;
            if (draft.content)     document.getElementById('content').value     = draft.content;
            showMessage('Draft restored.', 'success');
        } catch (e) {  }
    }
    loadArticles();
});

// Show a local preview when the user picks an image file
document.getElementById('image_file').addEventListener('change', function () {
    const preview = document.getElementById('image_preview');
    if (this.files && this.files[0]) {
        preview.src = URL.createObjectURL(this.files[0]);
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});

(function () {
    ['title', 'category_id', 'content'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', function () {
            const draft = {
                title:       document.getElementById('title').value,
                category_id: document.getElementById('category_id').value,
                content:     document.getElementById('content').value
            };
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
        });
    });
})();

window.addEventListener('pageshow', function (event) {
    if (event.persisted) checkSession(null);
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch(`${BASE}/src/php/logout.php`)
        .then(() => { window.location.href = '../html/login.html'; });
});

document.getElementById('article_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title       = document.getElementById('title').value;
    const category_id = document.getElementById('category_id').value;
    const content     = document.getElementById('content').value;
    const fileInput   = document.getElementById('image_file');

    function saveArticle(image_url) {
        fetch(`${BASE}/src/php/create_article.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category_id, content, image_url })
        })
        .then(r => r.json())
        .then(function (data) {
            if (data.success) {
                showMessage('Article saved as draft.', 'success');
                localStorage.removeItem(AUTOSAVE_KEY);
                document.getElementById('article_form').reset();
                document.getElementById('image_preview').style.display = 'none';
                loadArticles();
            } else {
                showMessage(data.error, 'error');
            }
        })
        .catch(function () { showMessage('Server error. Try again.', 'error'); });
    }

    if (fileInput.files && fileInput.files[0]) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        fetch(`${BASE}/src/php/upload_image.php`, { method: 'POST', body: formData })
            .then(r => r.json())
            .then(function (data) {
                if (data.success) {
                    saveArticle(data.url);
                } else {
                    showMessage(data.error || 'Image upload failed.', 'error');
                }
            })
            .catch(function () { showMessage('Image upload failed.', 'error'); });
    } else {
        saveArticle(null);
    }
});

/**
 * Fetches all articles (any status) from the server and renders them
 * in the #articles-list element with Publish/Unpublish and Delete buttons.
 */
function loadArticles() {
    fetch(`${BASE}/src/php/get_all_articles.php`)
    .then(response => response.json())
    .then(function (data) {
        const list = document.getElementById('articles-list');
        list.innerHTML = '';

        if (!data.success) {
            list.innerHTML = `<p>${data.error}</p>`;
            return;
        }
        if (data.articles.length === 0) {
            list.innerHTML = '<p>No articles yet.</p>';
            return;
        }

        data.articles.forEach(function (article) {
            const div = document.createElement('div');
            div.className = 'article';
            div.id = `article-row-${article.id}`;
            const isPublished = article.status === 'published';

            const titleEl = document.createElement('strong');
            titleEl.textContent = article.title;

            const metaEl = document.createElement('span');
            metaEl.innerHTML = ` — ${article.category || 'Uncategorized'} — <em>${article.status}</em>`;

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.dataset.id = article.id;
            toggleBtn.dataset.status = article.status;
            toggleBtn.textContent = isPublished ? 'Unpublish' : 'Publish';

            div.appendChild(titleEl);
            div.appendChild(metaEl);
            div.appendChild(toggleBtn);

            if (!isPublished) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.dataset.id = article.id;
                deleteBtn.textContent = 'Delete';
                div.appendChild(deleteBtn);
            }

            list.appendChild(div);
        });

        document.querySelectorAll('.toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const articleId = this.dataset.id;
                const newStatus = this.dataset.status === 'published' ? 'draft' : 'published';
                fetch(`${BASE}/src/php/update_status.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ article_id: articleId, status: newStatus })
                })
                .then(response => response.json())
                .then(function (data) {
                    if (data.success) loadArticles();
                    else showMessage(data.error, 'error');
                });
            });
        });

        document.querySelectorAll('.delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Permanently delete this draft?')) return;
                const articleId = this.dataset.id;
                fetch(`${BASE}/src/php/delete_article.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ article_id: articleId })
                })
                .then(response => response.json())
                .then(function (data) {
                    if (data.success) document.getElementById(`article-row-${articleId}`).remove();
                    else showMessage(data.error, 'error');
                });
            });
        });
    });
}

/**
 * Displays a status message in the #message element.
 *
 * @param {string} text      - Message to display.
 * @param {string} className - CSS class ('success' or 'error').
 */
function showMessage(text, className) {
    const el = document.getElementById('message');
    el.textContent = text;
    el.className = className;
}

