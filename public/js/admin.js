// Session guard — admin only
fetch('/Extremity_Vault/src/php/session_check.php')
.then(response => response.json())
.then(data => {
    if (!data.logged_in) {
        window.location.href = '../html/login.html';
        return;
    }
    if (data.role !== 'admin') {
        window.location.href = '../html/index.html';
        return;
    }
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch('/Extremity_Vault/src/php/logout.php')
    .then(() => { window.location.href = '../html/login.html'; });
});

document.getElementById('article_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title      = document.getElementById('title').value;
    const category_id = document.getElementById('category_id').value;
    const content    = document.getElementById('content').value;
    const messageEl  = document.getElementById('message');

    fetch('/Extremity_Vault/src/php/create_article.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category_id, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageEl.innerText = 'Article created!';
            messageEl.className = 'success';
            document.getElementById('article_form').reset();
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
