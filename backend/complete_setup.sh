#!/bin/bash

echo "=== Fitvisor Database Complete Setup ==="
echo ""

# Get MySQL root password
echo "Please enter your MySQL root password (press Enter if no password):"
read -s MYSQL_ROOT_PASSWORD

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root"
else
    MYSQL_CMD="mysql -u root -p$MYSQL_ROOT_PASSWORD"
fi

echo ""
echo "Setting up database and user..."

# Create database, user, and tables
$MYSQL_CMD << 'EOSQL'
-- Create database
CREATE DATABASE IF NOT EXISTS fitvisor_db;

-- Create user (if not exists)
CREATE USER IF NOT EXISTS 'fitvisor_user'@'localhost' IDENTIFIED BY 'fitvisor_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON fitvisor_db.* TO 'fitvisor_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE fitvisor_db;

-- Create users table
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
    verification_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT 0,
    reset_token VARCHAR(10),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exercise_sessions table
CREATE TABLE IF NOT EXISTS exercise_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    reps INT NOT NULL,
    video_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT 'Database setup completed!' as Status;
EOSQL

if [ $? -eq 0 ]; then
    echo "✓ Database setup completed successfully!"
    echo ""
    
    # Update .env file
    if [ -f .env ]; then
        # Backup existing .env
        cp .env .env.backup
        echo "✓ Backed up existing .env to .env.backup"
    fi
    
    # Update or create .env with correct credentials
    cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_USER=fitvisor_user
DB_PASSWORD=fitvisor_password
DB_NAME=fitvisor_db

# SendGrid Configuration (add your API key)
SENDGRID_API_KEY=
MAIL_DEFAULT_SENDER=no-reply@fitvisor.com
EOF
    
    echo "✓ Updated .env file with database credentials"
    echo ""
    echo "Database Details:"
    echo "  Database: fitvisor_db"
    echo "  User: fitvisor_user"
    echo "  Password: fitvisor_password"
    echo ""
    echo "Tables created:"
    echo "  - users"
    echo "  - exercise_sessions"
    echo ""
    echo "✅ Setup complete! You can now run: python show_users.py"
else
    echo "✗ Database setup failed. Please check your MySQL root password."
    exit 1
fi
