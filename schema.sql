-- Execute este script no seu MySQL antes de rodar a aplicação

CREATE DATABASE IF NOT EXISTS api
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE api;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A tabela "sessions" é criada automaticamente pelo pacote
-- express-mysql-session na primeira execução da aplicação.