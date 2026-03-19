<?php
/**
 * Database connection via PDO
 */

require_once __DIR__ . '/../config.php';

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

/**
 * Initialize database tables if they don't exist
 */
function initTables() {
    $pdo = getDB();

    $pdo->exec("CREATE TABLE IF NOT EXISTS waitlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        app VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip VARCHAR(45),
        UNIQUE KEY unique_email_app (email, app)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS captcha_tokens_used (
        token_hash VARCHAR(64) PRIMARY KEY,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        endpoint VARCHAR(100) NOT NULL,
        window_start INT NOT NULL,
        count INT DEFAULT 1,
        UNIQUE KEY unique_ip_endpoint_window (ip, endpoint, window_start)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
