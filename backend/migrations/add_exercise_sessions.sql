USE fitvisor_db;

CREATE TABLE IF NOT EXISTS exercise_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    reps INT NOT NULL,
    video_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
