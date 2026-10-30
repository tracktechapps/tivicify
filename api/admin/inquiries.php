<?php
require_once __DIR__ . '/db.php';
$admin = requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($method === 'GET') {
    $inquiries = $db->query("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 100")->fetchAll();
    $pending = (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'pending'")->fetchColumn();
    $contacted = (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'contacted'")->fetchColumn();
    $approved = (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'approved'")->fetchColumn();

    echo json_encode([
        'success' => true,
        'stats' => [
            'total' => count($inquiries),
            'pending' => $pending,
            'contacted' => contacted,
            'approved' => $approved
        ],
        'inquiries' => $inquiries
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? $action;

    if ($action === 'status') {
        $id = (int)($input['id'] ?? 0);
        $status = in_array($input['status'] ?? '', ['pending', 'contacted', 'approved', 'rejected']) 
            ? $input['status'] 
            : 'pending';

        $db->prepare("UPDATE inquiries SET status = :s WHERE id = :id")->execute([':s' => $status, ':id' => $id]);
        echo json_encode(['success' => true, 'message' => "Inquiry marked as $status."]);
        exit;
    }

    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        $db->prepare("DELETE FROM inquiries WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Inquiry removed.']);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Unsupported action']);
