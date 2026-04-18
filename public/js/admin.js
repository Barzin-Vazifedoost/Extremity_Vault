/**
 * admin.js
 * Admin article-creation page controller for Extremity Vault.
 * Enforces admin-only access via session check, then handles
 * the Create Article form submission via AJAX.
 *
 * @author Barzin Vazifedoost
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

/**
 * Verifies the user's session and enforces admin-only access.
 * Redirects to login if unauthenticated, or to home if not admin.
 */
function checkSession() {
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
    })
    .catch(() => { window.location.replace('../html/login.html'); });
}

checkSession();

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        checkSession();
    }
});

document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    fetch(`${BASE}/src/php/logout.php`)
    .then(() => { window.location.href = '../html/login.html'; });
});

document.getElementById('article_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title      = document.getElementById('title').value;
    const category_id = document.getElementById('category_id').value;
    const content    = document.getElementById('content').value;
    const messageEl  = document.getElementById('message');

    fetch(`${BASE}/src/php/create_article.php`, {
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
