document.getElementById('register_page').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('/Extremity_Vault/src/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('message').innerText = data.error;
        }
    })
});