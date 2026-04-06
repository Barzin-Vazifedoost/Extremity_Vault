<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Admin only.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$article_id = filter_var($data['article_id'] ?? 0, FILTER_VALIDATE_INT);
$status = $data['status'] ?? '';

if (!$article_id || !in_array($status, ['draft', 'published'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid input.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE articles SET status = ? WHERE id = ?");
    $stmt->execute([$status, $article_id]);
    echo json_encode(['success' => true, 'message' => 'Status updated']);
} catch (PDOException $e) {
    error_log("Status update failed: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
