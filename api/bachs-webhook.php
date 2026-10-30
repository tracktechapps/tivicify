<?php
// Tivicify Streaming - Bachs.io Webhook Handler
header('Content-Type: application/json');

$rawInput = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_BACHS_SIGNATURE'] ?? '';

if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'No payload received']);
    exit;
}

$event = json_decode($rawInput, true);
$eventType = $event['event'] ?? 'unknown';

// Log webhook event
$logEntry = date('Y-m-d H:i:s') . " - Bachs Event: " . $eventType . " - Data: " . $rawInput . PHP_EOL;
@file_put_contents(__DIR__ . '/bachs_events.log', $logEntry, FILE_APPEND);

switch ($eventType) {
    case 'collection.succeeded':
    case 'checkout.completed':
        $customFields = $event['data']['custom_fields'] ?? [];
        $planId = $customFields['plan_id'] ?? 'tivicify_pro_monthly';
        // Webhook confirmed payment
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Subscription provisioned for ' . $planId]);
        exit;

    default:
        http_response_code(200);
        echo json_encode(['status' => 'received', 'event' => $eventType]);
        exit;
}
