<?php
// Public Endpoint: Submit Broadcaster or Advertising Slot Inquiry
require_once __DIR__ . '/admin/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$brand = trim($input['channel_or_brand'] ?? $input['channelOrBrand'] ?? '');
$phone = trim($input['phone'] ?? '');
$type = trim($input['inquiry_type'] ?? $input['inquiryType'] ?? 'broadcaster_slot');
$message = trim($input['message'] ?? '');

if (empty($name) || empty($email) || empty($brand)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name, email, and channel/brand are required.']);
    exit;
}

$ins = $db->prepare("
    INSERT INTO inquiries (name, email, channel_or_brand, phone, inquiry_type, message)
    VALUES (:n, :e, :b, :p, :t, :m)
");
$ins->execute([
    ':n' => $name,
    ':e' => $email,
    ':b' => $brand,
    ':p' => $phone,
    ':t' => $type,
    ':m' => $message
]);

echo json_encode([
    'success' => true,
    'message' => 'Your inquiry has been submitted to Tivicify Admin. Our partnerships team will contact you shortly.',
    'inquiry_id' => $db->lastInsertId()
]);
