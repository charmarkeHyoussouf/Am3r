<?php
/**
 * Waitlist signup endpoint
 * POST { email: string, app: string, captchaToken: string }
 * Returns { success: true } or { error: string }
 */

require_once __DIR__ . '/includes/cors.php';
require_once __DIR__ . '/includes/rate-limit.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/captcha/verify.php';

// Init tables on first run
initTables();

// Rate limit: 10 per 15 min
checkRateLimit('waitlist', WAITLIST_RATE_LIMIT);

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['email'], $input['app'], $input['captchaToken'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Validate app name
$validApps = ['linguist', 'deliber8', 'phonediet'];
$app = strtolower(trim($input['app']));
if (!in_array($app, $validApps)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid app name']);
    exit;
}

// Verify CAPTCHA token
$verification = verifyCaptchaToken($input['captchaToken']);
if (!$verification['valid']) {
    http_response_code(403);
    echo json_encode(['error' => 'CAPTCHA verification failed: ' . $verification['reason']]);
    exit;
}

// Store in database
$pdo = getDB();
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

try {
    $stmt = $pdo->prepare(
        "INSERT INTO waitlist (email, app, ip) VALUES (:email, :app, :ip)"
    );
    $stmt->execute([
        ':email' => $email,
        ':app' => $app,
        ':ip' => $ip,
    ]);

    echo json_encode(['success' => true, 'message' => 'You\'re on the list!']);
} catch (PDOException $e) {
    // Duplicate entry (already signed up)
    if ($e->getCode() == 23000) {
        echo json_encode(['success' => true, 'message' => 'You\'re already on the list!']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Server error. Please try again.']);
    }
}
