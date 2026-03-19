<?php
/**
 * Rate limiting via MySQL
 */

require_once __DIR__ . '/db.php';

function checkRateLimit($endpoint, $maxRequests) {
    $pdo = getDB();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $window = floor(time() / RATE_WINDOW) * RATE_WINDOW;

    // Try to increment existing counter
    $stmt = $pdo->prepare(
        "INSERT INTO rate_limits (ip, endpoint, window_start, count)
         VALUES (:ip, :endpoint, :window, 1)
         ON DUPLICATE KEY UPDATE count = count + 1"
    );
    $stmt->execute([
        ':ip' => $ip,
        ':endpoint' => $endpoint,
        ':window' => $window,
    ]);

    // Check current count
    $stmt = $pdo->prepare(
        "SELECT count FROM rate_limits
         WHERE ip = :ip AND endpoint = :endpoint AND window_start = :window"
    );
    $stmt->execute([
        ':ip' => $ip,
        ':endpoint' => $endpoint,
        ':window' => $window,
    ]);
    $row = $stmt->fetch();

    if ($row && $row['count'] > $maxRequests) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Try again later.']);
        exit;
    }

    // Cleanup old entries (older than 2 windows)
    $cutoff = $window - RATE_WINDOW * 2;
    $pdo->prepare("DELETE FROM rate_limits WHERE window_start < :cutoff")
        ->execute([':cutoff' => $cutoff]);
}
