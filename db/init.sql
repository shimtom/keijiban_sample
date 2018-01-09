-- bulletin_board db 作成
CREATE DATABASE IF NOT EXISTS bulletin_board DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE bulletin_board;

-- users table 作成
CREATE TABLE IF NOT EXISTS users (
  name VARCHAR(30) NOT NULL PRIMARY KEY,
  display_name VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admin userを追加
INSERT INTO users (name, display_name, password) VALUES ("admin", "Administrator", "admin");

-- boards tabel 作成
CREATE TABLE IF NOT EXISTS bulletin_board.boards (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creator_name VARCHAR(30) NOT NULL
);

-- anonymous board を追加
INSERT INTO bulletin_board.boards (title, creator_name) VALUES ('keijiban', 'admin');

-- comments table 作成
CREATE TABLE IF NOT EXISTS bulletin_board.comments (
  id INT AUTO_INCREMENT NOT NULL,
  board_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creator_name VARCHAR(30) NOT NULL,
  PRIMARY KEY(id, board_id)
);
