# Extremity Vault

A collaborative web platform for managing and sharing lore articles — characters, settings, and items — with bookmarks, comments, and editorial tools. Built with PHP 8, MySQL, and vanilla HTML/CSS/JS (no frameworks).

## Features

- **Article browsing** — published articles with category filtering and full-text search
- **Bookmarks** — save articles; dynamic category filter populated from the database
- **Comments** — threaded comments per article
- **Editor** — create/edit articles with draft/published status toggle and autosave
- **Admin panel** — approve/reject/delete articles; manage all users' submissions
- **Authentication** — register, login, logout with session fixation protection (`session_regenerate_id`)
- **Active-user indicator** — logged-in username shown in the nav bar on every page

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.2 (PDO, no ORM) |
| Database | MySQL 8 |
| Frontend | Vanilla JS (ES6), HTML5, CSS3 |
| Server | XAMPP (local) / Apache (production) |
| Font | Cinzel (Google Fonts) |

## Database Schema

Five tables: `users`, `categories`, `articles`, `comments`, `bookmarks`.

- `bookmarks` enforces `UNIQUE KEY (user_id, article_id)` — no duplicate bookmarks at the DB level
- `articles.status` is `ENUM('draft','published')` — only published articles are visible to regular users

Run `db/setup.sql` to create the schema and seed three default categories and one admin account.

**Default admin credentials** (change immediately on production):
```
email:    admin@extremityvault.com
password: password
```

## Project Structure

```
html/          HTML pages (index, articles, bookmarks, editor, admin, login, register)
public/
  css/         style.css — single stylesheet
  js/          one JS file per page
src/php/       PHP API endpoints (all return JSON)
db/            setup.sql
```

## API Endpoints (`src/php/`)

| File | Method | Description |
|---|---|---|
| `login.php` | POST | Authenticate user, start session |
| `logout.php` | POST | Destroy session |
| `register.php` | POST | Create new user account |
| `session_check.php` | GET | Return session status + user info |
| `get_articles.php` | GET | Get published articles (with optional search/category filter) |
| `get_all_articles.php` | GET | Admin: get all articles regardless of status |
| `create_article.php` | POST | Create a new article (auth required) |
| `delete_article.php` | POST | Delete an article (admin only) |
| `update_status.php` | POST | Publish or draft an article (admin only) |
| `get_comments.php` | GET | Get comments for an article |
| `add_comment.php` | POST | Post a comment (auth required) |
| `get_bookmarks.php` | GET | Get current user's bookmarked articles |
| `add_bookmark.php` | POST | Bookmark an article (auth required) |
| `remove_bookmark.php` | POST | Remove a bookmark (auth required) |
| `get_categories.php` | GET | List all categories |
| `search_articles.php` | GET | Full-text search across articles |

## Local Setup

1. Start XAMPP (Apache + MySQL)
2. Import `db/setup.sql` into a database named `vazifedb_local`
3. Open `http://localhost/Extremity_Vault/html/index.html`

## Authors

Barzin Vazifedoost — April 2026

