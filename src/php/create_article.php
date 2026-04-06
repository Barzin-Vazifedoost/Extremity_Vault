<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$title = filter_var($data['title'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
$category_id = filter_var($data['category_id'] ?? 0, FILTER_VALIDATE_INT);
$content = $data['content'] ?? '';
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
