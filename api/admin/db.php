<?php
// Tivicify Admin Database & Utilities
header('Content-Type: application/json; charset=UTF-8');

// Ensure data directory is protected
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
$htaccess = $dataDir . '/.htaccess';
if (!file_exists($htaccess)) {
    file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
}

$dbPath = $dataDir . '/tivicify.sqlite';

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Initialize tables
$db->exec("
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    last_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'pro',
    status TEXT NOT NULL DEFAULT 'active',
    amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'NGN',
    gateway TEXT DEFAULT 'bachs',
    transaction_id TEXT,
    starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL DEFAULT 'pro',
    duration_days INTEGER NOT NULL DEFAULT 30,
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_by TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
);

CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'video_interstitial',
    media_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Learn More',
    category_target TEXT DEFAULT 'all',
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    max_impressions INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    device_id TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    channel_or_brand TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT DEFAULT 'broadcaster_slot',
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
");

// Ensure last_token column exists
try {
    $db->exec("ALTER TABLE admin_users ADD COLUMN last_token TEXT");
} catch (Exception $e) {}

// Seed default admin if empty
$stmt = $db->query("SELECT COUNT(*) FROM admin_users");
if ((int)$stmt->fetchColumn() === 0) {
    $defaultPass = 'TivicifyAdmin2026!';
    $hash = password_hash($defaultPass, PASSWORD_BCRYPT);
    $ins = $db->prepare("INSERT INTO admin_users (username, password_hash) VALUES (:u, :p)");
    $ins->execute([':u' => 'admin', ':p' => $hash]);
}

// Seed default settings if empty
$settingsSeed = [
    'bachs_public_key' => 'bachs_pk_live_tivicify2026',
    'bachs_secret_key' => 'bachs_sk_live_tivicify2026_secret',
    'bachs_environment' => 'sandbox',
    'pro_price_ngn' => '1500',
    'pro_price_usd' => '2.99',
    'vip_price_ngn' => '3500',
    'vip_price_usd' => '5.99',
    'unity_enabled' => '1',
    'unity_game_id_android' => '5738491',
    'unity_game_id_ios' => '5738492',
    'unity_test_mode' => '1',
    'unity_ad_interval_minutes' => '5',
    'custom_ads_enabled' => '1',
];

foreach ($settingsSeed as $k => $v) {
    $db->prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (:k, :v)")->execute([':k' => $k, ':v' => $v]);
}

// Seed sample ads if empty
$adsCount = (int)$db->query("SELECT COUNT(*) FROM ads")->fetchColumn();
if ($adsCount === 0) {
    $sampleAds = [
        [
            'title' => 'Stream In True 4K Ultra HD',
            'sponsor_name' => 'Tivicify Cinema Plus',
            'format' => 'video_interstitial',
            'media_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            'target_url' => 'https://tivicify.tracktechdigitals.com.ng/#multiview',
            'cta_text' => 'Upgrade to Pro 4K',
            'category_target' => 'all',
            'impressions_count' => 142,
            'clicks_count' => 19
        ],
        [
            'title' => 'Watch English Premier League & UCL Highlights',
            'sponsor_name' => 'SuperSport Max',
            'format' => 'banner',
            'media_url' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
            'target_url' => 'https://tivicify.tracktechdigitals.com.ng/#channels',
            'cta_text' => 'View Match Schedule',
            'category_target' => 'sports',
            'impressions_count' => 88,
            'clicks_count' => 12
        ],
        [
            'title' => 'Broadcasters: Air Your Live TV Station to 200,000+ Viewers',
            'sponsor_name' => 'Tivicify Broadcaster Network',
            'format' => 'ticker',
            'media_url' => '',
            'target_url' => 'https://tivicify.tracktechdigitals.com.ng/#install',
            'cta_text' => 'Partner With Us',
            'category_target' => 'all',
            'impressions_count' => 310,
            'clicks_count' => 28
        ]
    ];

    $adIns = $db->prepare("INSERT INTO ads (title, sponsor_name, format, media_url, target_url, cta_text, category_target, impressions_count, clicks_count) VALUES (:title, :sponsor, :format, :media, :target, :cta, :cat, :imp, :clk)");
    foreach ($sampleAds as $ad) {
        $adIns->execute([
            ':title' => $ad['title'],
            ':sponsor' => $ad['sponsor_name'],
            ':format' => $ad['format'],
            ':media' => $ad['media_url'],
            ':target' => $ad['target_url'],
            ':cta' => $ad['cta_text'],
            ':cat' => $ad['category_target'],
            ':imp' => $ad['impressions_count'],
            ':clk' => $ad['clicks_count']
        ]);
    }
}

// Seed sample vouchers if empty
$vouchCount = (int)$db->query("SELECT COUNT(*) FROM vouchers")->fetchColumn();
if ($vouchCount === 0) {
    $sampleVouchers = [
        ['code' => 'TIVI-PRO-2026', 'tier' => 'pro', 'duration_days' => 30, 'max_uses' => 500, 'used_count' => 24],
        ['code' => 'TIVI-VIP-PREVIEW', 'tier' => 'vip', 'duration_days' => 365, 'max_uses' => 100, 'used_count' => 8],
        ['code' => 'TIVI-WELCOME-PRO', 'tier' => 'pro', 'duration_days' => 14, 'max_uses' => 1000, 'used_count' => 73]
    ];
    $vIns = $db->prepare("INSERT INTO vouchers (code, tier, duration_days, max_uses, used_count) VALUES (:c, :t, :d, :m, :u)");
    foreach ($sampleVouchers as $sv) {
        $vIns->execute([':c' => $sv['code'], ':t' => $sv['tier'], ':d' => $sv['duration_days'], ':m' => $sv['max_uses'], ':u' => $sv['used_count']]);
    }
}

// Helper: Require Admin Authentication
function requireAdminAuth() {
    global $db;
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!empty($_SESSION['tivicify_admin_user'])) {
        return $_SESSION['tivicify_admin_user'];
    }

    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && !empty($_GET['token'])) {
        $authHeader = 'Bearer ' . $_GET['token'];
    }
    
    if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $stmt = $db->prepare("SELECT username FROM admin_users WHERE last_token = :t LIMIT 1");
        $stmt->execute([':t' => $token]);
        $u = $stmt->fetchColumn();
        if ($u) {
            $_SESSION['tivicify_admin_user'] = $u;
            return $u;
        }
    }
    
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login to continue.']);
    exit;
}

// Helper: Get Settings as Array
function getSettingsArray($db) {
    $rows = $db->query("SELECT key, value FROM settings")->fetchAll();
    $result = [];
    foreach ($rows as $r) {
        $result[$r['key']] = $r['value'];
    }
    return $result;
}
