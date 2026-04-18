/**
 * register.js
 * Registration form controller for Extremity Vault.
 * Submits name, email, and password to register.php via AJAX (fetch),
 * then redirects to login on success or displays an inline error.
 *
 * @author Barzin Vazifedoost
 */

const BASE = window.location.hostname === 'localhost' ? '/Extremity_Vault' : '/~vazifedb/Extremity_Vault';

document.getElementById('register_page').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch(`${BASE}/src/php/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '../html/login.html';
        } else {
            document.getElementById('message').innerText = data.error;
        }
    })
    .catch(() => {
        document.getElementById('message').innerText = 'Registration failed. Please try again.';
    });
});
