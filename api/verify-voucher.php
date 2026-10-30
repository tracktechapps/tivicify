<?php
// Public Endpoint: Verify & Redeem Voucher Code
require_once __DIR__ . '/admin/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$code = strtoupper(trim($input['code'] ?? ''));
$userId = trim($input['user_id'] ?? $_SERVER['REMOTE_ADDR'] ?? 'guest');
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

if (empty($code)) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'Please provide an activation code.']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM vouchers WHERE UPPER(code) = :c AND is_active = 1 LIMIT 1");
$stmt->execute([':c' => $code]);
$voucher = $stmt->fetch();

if (!$voucher) {
    http_response_code(404);
    echo json_encode(['valid' => false, 'error' => 'Invalid or unrecognized activation code.']);
    exit;
}

if ($voucher['max_uses'] > 0 && $voucher['used_count'] >= $voucher['max_uses']) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'This voucher code has already reached its maximum usage limit.']);
    exit;
}

if (!empty($voucher['expires_at']) && strtotime($voucher['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'This voucher code has expired.']);
    exit;
}

// Increment used count
$db->prepare("UPDATE vouchers SET used_count = used_count + 1 WHERE id = :id")->execute([':id' => $voucher['id']]);

// Log redemption
$db->prepare("INSERT INTO voucher_redemptions (voucher_code, user_id, ip_address) VALUES (:c, :u, :ip)")
   ->execute([':c' => $voucher['code'], ':u' => $userId, ':ip' => $ip]);

// Create or update subscription
$duration = (int)$voucher['duration_days'];
$expiresAt = date('Y-m-d H:i:s', strtotime("+$duration days"));

$db->prepare("
    INSERT INTO subscriptions (user_id, tier, status, amount, currency, gateway, transaction_id, expires_at)
    VALUES (:u, :t, 'active', 0, 'NGN', 'voucher', :tx, :exp)
")->execute([
    ':u' => $userId,
    ':t' => $voucher['tier'],
    ':tx' => 'VOUCHER-' . $voucher['code'],
    ':exp' => $expiresAt
]);

echo json_encode([
    'valid' => true,
    'tier' => $voucher['tier'],
    'durationDays' => $duration,
    'expiresAt' => $expiresAt,
    'message' => "Successfully activated {$voucher['tier']} subscription for {$duration} days!"
]);
