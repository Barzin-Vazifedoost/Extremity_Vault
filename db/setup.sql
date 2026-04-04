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
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

