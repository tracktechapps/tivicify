<?php
require_once __DIR__ . '/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'check';

if ($action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $username = trim($input['username'] ?? '');
    $password = (string)($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username and password required.']);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = :u LIMIT 1");
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $token = bin2hex(random_bytes(32));
        $_SESSION['tivicify_admin_user'] = $user['username'];
        $_SESSION['tivicify_admin_token'] = $token;

        $db->prepare("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP, last_token = :t WHERE id = :id")->execute([':t' => $token, ':id' => $user['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'username' => $user['username']
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid admin credentials.']);
    exit;
}

if ($action === 'check') {
    if (!empty($_SESSION['tivicify_admin_user'])) {
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'username' => $_SESSION['tivicify_admin_user'],
            'token' => $_SESSION['tivicify_admin_token'] ?? ''
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
    exit;
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

if ($action === 'change_password') {
    $currentAdmin = requireAdminAuth();
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $current = (string)($input['current_password'] ?? '');
    $new = (string)($input['new_password'] ?? '');

    if (strlen($new) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New password must be at least 8 characters.']);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = :u LIMIT 1");
    $stmt->execute([':u' => $currentAdmin]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($current, $user['password_hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect.']);
        exit;
    }

    $hash = password_hash($new, PASSWORD_BCRYPT);
    $db->prepare("UPDATE admin_users SET password_hash = :p WHERE id = :id")->execute([':p' => $hash, ':id' => $user['id']]);

    echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid action']);
