<?php
// Public Endpoint: Track Ad Impressions and Clicks
require_once __DIR__ . '/admin/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$adId = (int)($input['ad_id'] ?? 0);
$type = in_array($input['type'] ?? '', ['impression', 'click']) ? $input['type'] : 'impression';
$deviceId = trim($input['device_id'] ?? '');
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

if ($adId > 0) {
    if ($type === 'impression') {
        $db->prepare("UPDATE ads SET impressions_count = impressions_count + 1 WHERE id = :id")->execute([':id' => $adId]);
    } else {
        $db->prepare("UPDATE ads SET clicks_count = clicks_count + 1 WHERE id = :id")->execute([':id' => $adId]);
    }

    try {
        $db->prepare("INSERT INTO ad_events (ad_id, event_type, device_id, ip_address) VALUES (:a, :e, :d, :ip)")
           ->execute([':a' => $adId, ':e' => $type, ':d' => $deviceId, ':ip' => $ip]);
    } catch (Exception $e) {
        // Continue quietly
    }
}

echo json_encode(['success' => true]);
