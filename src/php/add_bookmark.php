<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$article_id = filter_var($data['article_id'] ?? 0, FILTER_VALIDATE_INT);

if (!$article_id) {
    echo json_encode(['success' => false, 'error' => 'Invalid article.']);
    exit();
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?)");
    $stmt->execute([$user_id, $article_id]);
    echo json_encode(['success' => true, 'message' => 'Bookmarked']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Already bookmarked or database error.']);
}
?>
