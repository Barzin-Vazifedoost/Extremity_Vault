<?php
/**
 * Anika Agnihotri
 * March 2026
 * Posts a comment on an article on behalf of the authenticated user.
 * Accepts a JSON POST body and returns the author's name for immediate display.
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$article_id = filter_var($data['article_id'] ?? 0, FILTER_VALIDATE_INT);
$content = filter_var($data['content'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
$user_id = $_SESSION['user_id'];

if (!$article_id || !$content) {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO comments (user_id, article_id, content) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $article_id, $content]);
    echo json_encode(['success' => true, 'message' => 'Comment added', 'name' => $_SESSION['name']]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
