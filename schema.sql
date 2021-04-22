DROP DATABASE IF EXISTS weplay;
CREATE DATABASE weplay;

USE weplay;

create table users (
    `id` varchar(50) not null,
    `email` varchar(50) not null,
    `passwd` varchar(50) not null,
    `name` varchar(50) not null,
    `image` varchar(500),
    `created_at` real not null,
    unique key `idx_email` (`email`),
    key `idx_created_at` (`created_at`),
    primary key (`id`)
) engine=innodb default charset=utf8;

create table rooms (
    `id` varchar(50) not null,
    `owner_id` varchar(50) not null,
    `name` varchar(50) not null,
    `passwd` varchar(50),
    `participants` varchar(500) not null,
    `number` tinyint not null,
    primary key (`id`)
) engine=innodb default charset=utf8;