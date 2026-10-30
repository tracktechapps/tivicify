<?php
require_once __DIR__ . '/db.php';
$admin = requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($method === 'GET') {
    // Calculate KPI Stats
    $totalCount = (int)$db->query("SELECT COUNT(*) FROM subscriptions")->fetchColumn();
    $activeCount = (int)$db->query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)")->fetchColumn();
    $activePro = (int)$db->query("SELECT COUNT(*) FROM subscriptions WHERE tier = 'pro' AND status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)")->fetchColumn();
    $activeVip = (int)$db->query("SELECT COUNT(*) FROM subscriptions WHERE tier = 'vip' AND status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)")->fetchColumn();
    $totalRevenueNgn = (float)$db->query("SELECT SUM(amount) FROM subscriptions WHERE currency = 'NGN'")->fetchColumn();
    $totalRevenueUsd = (float)$db->query("SELECT SUM(amount) FROM subscriptions WHERE currency = 'USD'")->fetchColumn();

    // Query Subscriptions List
    $search = trim($_GET['search'] ?? '');
    $filterTier = trim($_GET['tier'] ?? '');
    
    $sql = "SELECT * FROM subscriptions WHERE 1=1";
    $params = [];

    if ($search !== '') {
        $sql .= " AND (user_id LIKE :s OR transaction_id LIKE :s)";
        $params[':s'] = "%$search%";
    }
    if ($filterTier !== '' && in_array($filterTier, ['pro', 'vip'])) {
        $sql .= " AND tier = :t";
        $params[':t'] = $filterTier;
    }

    $sql .= " ORDER BY created_at DESC LIMIT 100";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $subscriptions = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_subscribers' => $totalCount,
            'active_subscribers' => $activeCount,
            'active_pro' => $activePro,
            'active_vip' => $activeVip,
            'revenue_ngn' => $totalRevenueNgn,
            'revenue_usd' => $totalRevenueUsd
        ],
        'subscriptions' => $subscriptions
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? $action;

    if ($action === 'grant') {
        $userId = trim($input['user_id'] ?? '');
        $tier = in_array($input['tier'] ?? '', ['pro', 'vip']) ? $input['tier'] : 'pro';
        $durationDays = max(1, (int)($input['duration_days'] ?? 30));
        $amount = (float)($input['amount'] ?? 0);
        $currency = strtoupper(trim($input['currency'] ?? 'NGN'));
        $gateway = trim($input['gateway'] ?? 'manual');

        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'User ID / Email required.']);
            exit;
        }

        $startsAt = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', strtotime("+$durationDays days"));
        $txId = 'MANUAL-' . strtoupper(bin2hex(random_bytes(4)));

        $ins = $db->prepare("
            INSERT INTO subscriptions (user_id, tier, status, amount, currency, gateway, transaction_id, starts_at, expires_at)
            VALUES (:uid, :tier, 'active', :amt, :curr, :gw, :tx, :start, :exp)
        ");
        $ins->execute([
            ':uid' => $userId,
            ':tier' => $tier,
            ':amt' => $amount,
            ':curr' => $currency,
            ':gw' => $gateway,
            ':tx' => $txId,
            ':start' => $startsAt,
            ':exp' => $expiresAt
        ]);

        echo json_encode([
            'success' => true,
            'message' => "Successfully granted $tier subscription to $userId for $durationDays days.",
            'subscription_id' => $db->lastInsertId()
        ]);
        exit;
    }

    if ($action === 'revoke') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid subscription ID.']);
            exit;
        }

        $db->prepare("UPDATE subscriptions SET status = 'revoked' WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Subscription revoked.']);
        exit;
    }

    if ($action === 'extend') {
        $id = (int)($input['id'] ?? 0);
        $days = max(1, (int)($input['days'] ?? 30));

        $stmt = $db->prepare("SELECT * FROM subscriptions WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $sub = $stmt->fetch();

        if (!$sub) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Subscription not found.']);
            exit;
        }

        $baseTime = (!empty($sub['expires_at']) && strtotime($sub['expires_at']) > time()) 
            ? strtotime($sub['expires_at']) 
            : time();
        $newExpiresAt = date('Y-m-d H:i:s', strtotime("+$days days", $baseTime));

        $db->prepare("UPDATE subscriptions SET expires_at = :exp, status = 'active' WHERE id = :id")->execute([
            ':exp' => $newExpiresAt,
            ':id' => $id
        ]);

        echo json_encode(['success' => true, 'message' => "Subscription extended by $days days to $newExpiresAt."]);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Unsupported action']);
