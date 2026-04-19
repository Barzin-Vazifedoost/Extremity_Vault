-- setup.sql
-- Ammar Khan
-- March 2026
-- Database schema and seed data for Extremity Vault. Defines tables for users, categories, articles, comments, and bookmarks.

Create table if not exists users(
    id int primary key auto_increment,
    name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role enum('admin', 'user') not null default 'user',
    created_at timestamp default current_timestamp

);


create table if not exists categories(
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table if not exists articles(
    id int primary key auto_increment,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id int not null,
    category_id int,
    title varchar(255) not null,
    content text not null,
    image_url varchar(512) null,
    status enum('draft', 'published') not null default 'draft',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    updated_at timestamp default current_timestamp on update current_timestamp

);

create table if not exists comments(
    id int primary key auto_increment,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id int not null,
    article_id int not null,
    content text not null,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

create table if not exists bookmarks(
    id int primary key auto_increment,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id int not null,
    article_id int not null,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, article_id)
);

INSERT IGNORE INTO categories (id, name) VALUES
(1, 'Characters'),
(2, 'Settings'),
(3, 'Items');

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Admin', 'admin@extremityvault.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT IGNORE INTO articles (id, user_id, category_id, title, content, status) VALUES
(1, 1, 1, 'The Warden of the Frost Gate', 'An ancient guardian bound by oath to the northern pass, the Warden has stood vigil for three centuries. Neither fully alive nor truly dead, it judges all who seek entry into the frozen realm beyond.', 'published'),
(2, 1, 2, 'The Shattered Expanse', 'A vast broken plateau where gravity behaves unpredictably. Chunks of earth float at impossible angles, connected by rope bridges that sway in winds that carry whispered secrets from civilizations long gone.', 'published'),
(3, 1, 3, 'The Ember Vial', 'A small glass vial containing a flame that never dies. It provides warmth in the coldest environments and light in magical darkness, but grows dimmer each time it is used to harm another living creature.', 'published');

