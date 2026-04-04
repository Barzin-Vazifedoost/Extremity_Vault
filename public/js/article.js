fetch('../../src/php/get_articles.php')
.then(response => response.json())
.then(data => {
    const container = document.getElementById('articles-container');

    data.forEach(article => {
        container.innerHTML += `<div class="article">
            <h2>${article.title}</h2>
            <p>${article.content}</p>
        </div>`;
    });
})