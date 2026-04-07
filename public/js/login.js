document.getElementById('login_page').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('../../src/php/login.php', {
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
