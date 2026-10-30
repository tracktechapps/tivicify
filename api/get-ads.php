<?php
// Public Endpoint: Fetch Active Ads & Unity Ads Configuration
require_once __DIR__ . '/admin/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$settings = getSettingsArray($db);
$category = trim($_GET['category'] ?? 'all');

$sql = "SELECT id, title, sponsor_name, format, media_url, target_url, cta_text, category_target 
        FROM ads 
        WHERE is_active = 1 
          AND (max_impressions = 0 OR impressions_count < max_impressions)";

if ($category !== 'all') {
    $sql .= " AND (category_target = 'all' OR category_target = :cat)";
    $stmt = $db->prepare($sql);
    $stmt->execute([':cat' => $category]);
} else {
    $stmt = $db->query($sql);
}

$ads = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'custom_ads' => $ads,
    'unity_config' => [
        'enabled' => ($settings['unity_enabled'] ?? '1') === '1',
        'game_id_android' => $settings['unity_game_id_android'] ?? '5738491',
        'game_id_ios' => $settings['unity_game_id_ios'] ?? '5738492',
        'test_mode' => ($settings['unity_test_mode'] ?? '1') === '1',
        'interval_minutes' => (int)($settings['unity_ad_interval_minutes'] ?? 5)
    ],
    'billing_config' => [
        'public_key' => $settings['bachs_public_key'] ?? 'bachs_pk_live_tivicify2026',
        'environment' => $settings['bachs_environment'] ?? 'sandbox',
        'pro_price_ngn' => (int)($settings['pro_price_ngn'] ?? 1500),
        'pro_price_usd' => (float)($settings['pro_price_usd'] ?? 2.99),
        'vip_price_ngn' => (int)($settings['vip_price_ngn'] ?? 3500),
        'vip_price_usd' => (float)($settings['vip_price_usd'] ?? 5.99)
    ]
]);
