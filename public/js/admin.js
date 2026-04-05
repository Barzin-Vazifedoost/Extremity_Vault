function debugLog(message, type = 'info') {
    if (window.debugTool) {
        window.debugTool.log(`[ADMIN] ${message}`, type);
    }
    console.log(`[ADMIN DEBUG] ${message}`);
}

document.getElementById('article_form').addEventListener('submit', function(e) {
    e.preventDefault();
    debugLog('🚀 Article form submitted');

    const title = document.getElementById('title').value;
    const category_id = document.getElementById('category_id').value;
    const content = document.getElementById('content').value;

    fetch('../src/php/create_article.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category_id, content })
    })
    .then(response => response.json())
    .then(data => {
        const messageEl = document.getElementById('message');
        if(data.success) {
            debugLog('✅ Article created successfully', 'info');
            messageEl.innerText = "Article Published!";
            messageEl.className = "success";
            document.getElementById('article_form').reset();
        } else {
            debugLog('❌ Failed to create article: ' + data.error, 'error');
            messageEl.innerText = data.error;
            messageEl.className = "error";
        }
    })
    .catch(error => {
        debugLog('💥 Fetch error: ' + error.message, 'error');
        document.getElementById('message').innerText = "Server error. Try again.";
    });
});