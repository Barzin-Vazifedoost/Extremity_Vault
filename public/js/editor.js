const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

// Session guard — admin only
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

const AUTOSAVE_KEY = 'ev_editor_draft';

// Restore any saved draft on load
checkSession(function() {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
        try {
            const draft = JSON.parse(saved);
            if (draft.title)       document.getElementById('title').value       = draft.title;
            if (draft.category_id) document.getElementById('category_id').value = draft.category_id;
            if (draft.content)     document.getElementById('content').value     = draft.content;
            const msgEl = document.getElementById('message');
            msgEl.textContent = 'Draft restored.';
            msgEl.className = 'success';
        } catch (e) { /* ignore corrupt data */ }
    }
    loadArticles();
});

// Autosave on any field change
(function () {
    const fields = ['title', 'category_id', 'content'];
    fields.forEach(function (id) {
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

document.getElementById('article_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const category_id = document.getElementById('category_id').value;
    const content = document.getElementById('content').value;
    const messageEl = document.getElementById('message');

    fetch(`${BASE}/src/php/create_article.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category_id, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageEl.innerText = 'Article saved as draft.';
            messageEl.className = 'success';
            localStorage.removeItem(AUTOSAVE_KEY);
            document.getElementById('article_form').reset();
            loadArticles();
        } else {
            messageEl.innerText = data.error;
            messageEl.className = 'error';
        }
    })
    .catch(() => {
        messageEl.innerText = 'Server error. Try again.';
        messageEl.className = 'error';
    });
});

function loadArticles() {
    fetch(`${BASE}/src/php/get_all_articles.php`)
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('articles-list');
        list.innerHTML = '';

        if (!data.success) {
            const errorEl = document.createElement('p');
            errorEl.textContent = data.error;
            list.appendChild(errorEl);
            return;
        }

        if (data.articles.length === 0) {
            list.innerHTML = '<p>No articles yet.</p>';
            return;
        }

        data.articles.forEach(article => {
            const div = document.createElement('div');
            div.className = 'article';
            div.id = `article-row-${article.id}`;
            const isPublished = article.status === 'published';
            
            const titleEl = document.createElement('strong');
            titleEl.textContent = article.title;
            const categoryEl = document.createElement('span');
            categoryEl.innerHTML = ` — ${article.category || 'Uncategorized'} — <em>${article.status}</em>`;
            const buttonEl = document.createElement('button');
            buttonEl.className = 'toggle-btn';
            buttonEl.dataset.id = article.id;
            buttonEl.dataset.status = article.status;
            buttonEl.textContent = isPublished ? 'Unpublish' : 'Publish';
            
            div.appendChild(titleEl);
            div.appendChild(categoryEl);
            div.appendChild(buttonEl);
            list.appendChild(div);
        });

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const articleId = this.dataset.id;
                const currentStatus = this.dataset.status;
                const newStatus = currentStatus === 'published' ? 'draft' : 'published';

                fetch(`${BASE}/src/php/update_status.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ article_id: articleId, status: newStatus })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadArticles();
                    } else {
                        document.getElementById('message').innerText = data.error;
                        document.getElementById('message').className = 'error';
                    }
                });
            });
        });
    });
}
