<?php
/**
 * Generate CAPTCHA token after puzzle solve + behavior check
 * POST { score: float, puzzleId: string }
 * Returns { token: string }
 */

require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/rate-limit.php';
require_once __DIR__ . '/../includes/db.php';

// Init tables on first run
initTables();

// Rate limit: 20 per 15 min
checkRateLimit('captcha_generate', CAPTCHA_RATE_LIMIT);

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['score']) || !isset($input['puzzleId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$score = floatval($input['score']);
$puzzleId = substr(preg_replace('/[^a-zA-Z0-9_]/', '', $input['puzzleId']), 0, 50);

// Validate score
if ($score < MIN_SCORE) {
    http_response_code(403);
    echo json_encode(['error' => 'Behavior score too low']);
    exit;
}

// Generate token
$ts = time();
$sig = hash_hmac('sha256', "$ts|$score|$puzzleId", CAPTCHA_SECRET);

$tokenData = json_encode([
    'ts' => $ts,
    'score' => $score,
    'pid' => $puzzleId,
    'sig' => $sig,
]);

$token = base64_encode($tokenData);

echo json_encode(['token' => $token]);
