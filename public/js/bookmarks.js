fetch('/Extremity_Vault/src/php/get_bookmarks.php')
.then(response => response.json())
.then(data => {
    const container = document.getElementById('bookmarks-container');
    const message = document.getElementById('message');

    if (!data.success) {
        message.innerText = data.error;
        return;
    }

    if (data.bookmarks.length === 0) {
        container.innerHTML = '<p>No bookmarks yet.</p>';
        return;
    }

    data.bookmarks.forEach(article => {
        const div = document.createElement('div');
        div.className = 'article';
        div.dataset.articleId = article.id;
        div.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.content}</p>
            <button class="remove-bookmark" data-id="${article.id}">Remove Bookmark</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.remove-bookmark').forEach(btn => {
        btn.addEventListener('click', function () {
            const articleId = this.dataset.id;
            fetch('/Extremity_Vault/src/php/remove_bookmark.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: articleId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`.article[data-article-id="${articleId}"]`).remove();
                } else {
                    message.innerText = data.error;
                }
            });
        });
    });
});
