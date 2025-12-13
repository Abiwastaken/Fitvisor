CREATE DATABASE IF NOT EXISTS fitvisor_db;

USE fitvisor_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    height FLOAT,
    weight FLOAT,
    phone VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(255),
    linkedin VARCHAR(255),
    instagram VARCHAR(255),
    website VARCHAR(255),
    points INT DEFAULT 0,
    streak INT DEFAULT 0,
    accepted_terms BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercise_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    reps INT NOT NULL,
    video_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
