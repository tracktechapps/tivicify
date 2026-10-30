<?php
require_once __DIR__ . '/db.php';
$admin = requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $settings = getSettingsArray($db);
    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $allowedKeys = [
        'bachs_public_key',
        'bachs_secret_key',
        'bachs_environment',
        'pro_price_ngn',
        'pro_price_usd',
        'vip_price_ngn',
        'vip_price_usd',
        'unity_enabled',
        'unity_game_id_android',
        'unity_game_id_ios',
        'unity_test_mode',
        'unity_ad_interval_minutes',
        'custom_ads_enabled'
    ];

    $upsert = $db->prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (:k, :v, CURRENT_TIMESTAMP)");

    foreach ($input as $k => $v) {
        if (in_array($k, $allowedKeys)) {
            $upsert->execute([':k' => $k, ':v' => (string)$v]);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Settings saved successfully.',
        'settings' => getSettingsArray($db)
    ]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Unsupported method']);
