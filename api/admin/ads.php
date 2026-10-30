<?php
require_once __DIR__ . '/db.php';
$admin = requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($method === 'GET') {
    // List all ads
    $ads = $db->query("
        SELECT *, 
        CASE 
            WHEN impressions_count > 0 THEN ROUND((CAST(clicks_count AS FLOAT) / impressions_count) * 100, 2)
            ELSE 0.00 
        END as ctr
        FROM ads 
        ORDER BY created_at DESC
    ")->fetchAll();

    // Calculate Ad Totals
    $totalImpressions = (int)$db->query("SELECT SUM(impressions_count) FROM ads")->fetchColumn();
    $totalClicks = (int)$db->query("SELECT SUM(clicks_count) FROM ads")->fetchColumn();
    $activeAdsCount = (int)$db->query("SELECT COUNT(*) FROM ads WHERE is_active = 1")->fetchColumn();

    // Unity Ads configuration
    $settings = getSettingsArray($db);

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_ads' => count($ads),
            'active_ads' => $activeAdsCount,
            'total_impressions' => $totalImpressions,
            'total_clicks' => $totalClicks,
            'overall_ctr' => $totalImpressions > 0 ? round(($totalClicks / $totalImpressions) * 100, 2) : 0
        ],
        'ads' => $ads,
        'unity_config' => [
            'enabled' => ($settings['unity_enabled'] ?? '1') === '1',
            'game_id_android' => $settings['unity_game_id_android'] ?? '5738491',
            'game_id_ios' => $settings['unity_game_id_ios'] ?? '5738492',
            'test_mode' => ($settings['unity_test_mode'] ?? '1') === '1',
            'interval_minutes' => (int)($settings['unity_ad_interval_minutes'] ?? 5),
            'custom_ads_enabled' => ($settings['custom_ads_enabled'] ?? '1') === '1'
        ]
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? $action;

    if ($action === 'create') {
        $title = trim($input['title'] ?? '');
        $sponsor = trim($input['sponsor_name'] ?? '');
        $format = in_array($input['format'] ?? '', ['video_interstitial', 'video_rewarded', 'banner', 'preroll', 'ticker']) 
            ? $input['format'] 
            : 'video_interstitial';
        $mediaUrl = trim($input['media_url'] ?? '');
        $targetUrl = trim($input['target_url'] ?? '');
        $ctaText = trim($input['cta_text'] ?? 'Learn More');
        $cat = trim($input['category_target'] ?? 'all');
        $maxImp = max(0, (int)($input['max_impressions'] ?? 0));
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($title) || empty($sponsor)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Campaign title and sponsor name are required.']);
            exit;
        }

        $ins = $db->prepare("
            INSERT INTO ads (title, sponsor_name, format, media_url, target_url, cta_text, category_target, max_impressions, is_active)
            VALUES (:t, :s, :f, :m, :tg, :cta, :cat, :mi, :ia)
        ");
        $ins->execute([
            ':t' => $title,
            ':s' => $sponsor,
            ':f' => $format,
            ':m' => $mediaUrl,
            ':tg' => $targetUrl,
            ':cta' => $ctaText,
            ':cat' => $cat,
            ':mi' => $maxImp,
            ':ia' => $isActive
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'New ad campaign created successfully.',
            'ad_id' => $db->lastInsertId()
        ]);
        exit;
    }

    if ($action === 'update') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid Ad ID.']);
            exit;
        }

        $title = trim($input['title'] ?? '');
        $sponsor = trim($input['sponsor_name'] ?? '');
        $format = trim($input['format'] ?? 'video_interstitial');
        $mediaUrl = trim($input['media_url'] ?? '');
        $targetUrl = trim($input['target_url'] ?? '');
        $ctaText = trim($input['cta_text'] ?? 'Learn More');
        $cat = trim($input['category_target'] ?? 'all');
        $maxImp = max(0, (int)($input['max_impressions'] ?? 0));
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        $upd = $db->prepare("
            UPDATE ads 
            SET title = :t, sponsor_name = :s, format = :f, media_url = :m, target_url = :tg, 
                cta_text = :cta, category_target = :cat, max_impressions = :mi, is_active = :ia, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $upd->execute([
            ':t' => $title,
            ':s' => $sponsor,
            ':f' => $format,
            ':m' => $mediaUrl,
            ':tg' => $targetUrl,
            ':cta' => $ctaText,
            ':cat' => $cat,
            ':mi' => $maxImp,
            ':ia' => $isActive,
            ':id' => $id
        ]);

        echo json_encode(['success' => true, 'message' => 'Ad campaign updated successfully.']);
        exit;
    }

    if ($action === 'toggle') {
        $id = (int)($input['id'] ?? 0);
        $active = !empty($input['is_active']) ? 1 : 0;
        $db->prepare("UPDATE ads SET is_active = :a, updated_at = CURRENT_TIMESTAMP WHERE id = :id")->execute([':a' => $active, ':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Ad status updated.']);
        exit;
    }

    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        $db->prepare("DELETE FROM ads WHERE id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM ad_events WHERE ad_id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Ad campaign deleted.']);
        exit;
    }

    if ($action === 'update_unity') {
        $enabled = !empty($input['enabled']) ? '1' : '0';
        $androidId = trim($input['game_id_android'] ?? '5738491');
        $iosId = trim($input['game_id_ios'] ?? '5738492');
        $testMode = !empty($input['test_mode']) ? '1' : '0';
        $interval = max(1, (int)($input['interval_minutes'] ?? 5));
        $customAds = !empty($input['custom_ads_enabled']) ? '1' : '0';

        $upsert = $db->prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (:k, :v, CURRENT_TIMESTAMP)");
        $upsert->execute([':k' => 'unity_enabled', ':v' => $enabled]);
        $upsert->execute([':k' => 'unity_game_id_android', ':v' => $androidId]);
        $upsert->execute([':k' => 'unity_game_id_ios', ':v' => $iosId]);
        $upsert->execute([':k' => 'unity_test_mode', ':v' => $testMode]);
        $upsert->execute([':k' => 'unity_ad_interval_minutes', ':v' => (string)$interval]);
        $upsert->execute([':k' => 'custom_ads_enabled', ':v' => $customAds]);

        echo json_encode(['success' => true, 'message' => 'Unity Ads & Network settings updated successfully.']);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Unsupported action']);
