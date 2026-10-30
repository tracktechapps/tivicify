<?php
require_once __DIR__ . '/db.php';
$admin = requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($method === 'GET') {
    $vouchers = $db->query("
        SELECT * FROM vouchers 
        ORDER BY created_at DESC 
        LIMIT 100
    ")->fetchAll();

    $redemptions = $db->query("
        SELECT vr.*, v.tier, v.duration_days 
        FROM voucher_redemptions vr
        LEFT JOIN vouchers v ON vr.voucher_code = v.code
        ORDER BY vr.redeemed_at DESC 
        LIMIT 50
    ")->fetchAll();

    echo json_encode([
        'success' => true,
        'vouchers' => $vouchers,
        'redemptions' => $redemptions
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? $action;

    if ($action === 'generate') {
        $count = min(100, max(1, (int)($input['count'] ?? 1)));
        $prefix = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', trim($input['prefix'] ?? 'TIVI-PRO-')));
        $tier = in_array($input['tier'] ?? '', ['pro', 'vip']) ? $input['tier'] : 'pro';
        $durationDays = max(1, (int)($input['duration_days'] ?? 30));
        $maxUses = max(1, (int)($input['max_uses'] ?? 1));

        $generatedCodes = [];
        $ins = $db->prepare("
            INSERT INTO vouchers (code, tier, duration_days, max_uses, created_by)
            VALUES (:c, :t, :d, :m, :u)
        ");

        for ($i = 0; $i < $count; $i++) {
            $randomPart = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $code = $prefix . $randomPart;
            try {
                $ins->execute([
                    ':c' => $code,
                    ':t' => $tier,
                    ':d' => $durationDays,
                    ':m' => $maxUses,
                    ':u' => $admin
                ]);
                $generatedCodes[] = $code;
            } catch (Exception $e) {
                // Ignore unique constraint collisions and continue
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Generated " . count($generatedCodes) . " voucher code(s).",
            'codes' => $generatedCodes
        ]);
        exit;
    }

    if ($action === 'toggle') {
        $id = (int)($input['id'] ?? 0);
        $active = !empty($input['is_active']) ? 1 : 0;
        $db->prepare("UPDATE vouchers SET is_active = :a WHERE id = :id")->execute([':a' => $active, ':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Voucher status updated.']);
        exit;
    }

    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        $db->prepare("DELETE FROM vouchers WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Voucher deleted.']);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Unsupported action']);
