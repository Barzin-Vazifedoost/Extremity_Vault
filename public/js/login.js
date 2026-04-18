/**
 * login.js
 * Login form controller for Extremity Vault.
 * Submits credentials to login.php via AJAX (fetch) and redirects
 * to the main vault on success, or displays an error message on failure.
 *
 * @author Barzin Vazifedoost
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

document.getElementById('login_page').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch(`${BASE}/src/php/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '../html/index.html';
        } else {
            document.getElementById('message').innerText = data.error;
        }
    })
    .catch(() => {
        document.getElementById('message').innerText = 'Login failed. Please try again.';
    });
});
