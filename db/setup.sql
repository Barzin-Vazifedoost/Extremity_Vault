Create table if not exists user_id(
    id int primary key auto_increment,
    name varchar(255) not null,
    email varchar(255) not null unique
);

create table if not exists user_profile(
    references user_id
    email varchar(255) not null unique
    
)