<?php
/**
 * Erin Sobers
 * March 2026
 * Creates a new draft article (admin only). Accepts a JSON POST body, sanitizes all inputs, and inserts via prepared statements.
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden. Admin access required.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$title = filter_var($data['title'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
$category_id = filter_var($data['category_id'] ?? 0, FILTER_VALIDATE_INT);
$content = filter_var($data['content'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$user_id = $_SESSION['user_id'];

if (!$title || !$category_id || !$content) {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO articles (user_id, category_id, title, content, status) VALUES (?, ?, ?, ?, 'draft')");
    $stmt->execute([$user_id, $category_id, $title, $content]);
    echo json_encode(['success' => true, 'message' => 'Article created']);
} catch (PDOException $e) {
    error_log("Article creation failed: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
