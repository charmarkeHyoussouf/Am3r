<?php
/**
 * Verify a CAPTCHA token
 * Called internally by other endpoints (not exposed directly)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';

function verifyCaptchaToken($token) {
    // (a) Decode
    $decoded = base64_decode($token, true);
    if ($decoded === false) {
        return ['valid' => false, 'reason' => 'malformed token'];
    }

    $data = json_decode($decoded, true);
    if (!$data || !isset($data['ts'], $data['score'], $data['pid'], $data['sig'])) {
        return ['valid' => false, 'reason' => 'malformed token'];
    }

    // (b) Check timestamp — within 120 seconds
    $age = time() - intval($data['ts']);
    if ($age < 0 || $age > TOKEN_EXPIRY) {
        return ['valid' => false, 'reason' => 'token expired'];
    }

    // (c) Check behavior score
    if (floatval($data['score']) < MIN_SCORE) {
        return ['valid' => false, 'reason' => 'low behavior score'];
    }

    // (d) Verify HMAC signature (timing-safe)
    $expectedSig = hash_hmac('sha256', $data['ts'] . '|' . $data['score'] . '|' . $data['pid'], CAPTCHA_SECRET);
    if (!hash_equals($expectedSig, $data['sig'])) {
        return ['valid' => false, 'reason' => 'invalid signature'];
    }

    // (e) Replay prevention
    $pdo = getDB();
    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare("SELECT token_hash FROM captcha_tokens_used WHERE token_hash = :hash");
    $stmt->execute([':hash' => $tokenHash]);
    if ($stmt->fetch()) {
        return ['valid' => false, 'reason' => 'token already used'];
    }

    // Mark as used
    $stmt = $pdo->prepare("INSERT INTO captcha_tokens_used (token_hash) VALUES (:hash)");
    $stmt->execute([':hash' => $tokenHash]);

    // Cleanup old tokens (older than 5 minutes)
    $cutoff = date('Y-m-d H:i:s', time() - 300);
    $pdo->prepare("DELETE FROM captcha_tokens_used WHERE used_at < :cutoff")
        ->execute([':cutoff' => $cutoff]);

    return ['valid' => true];
}
