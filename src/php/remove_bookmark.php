<?php
/**
 * Anika Agnihotri
 * March 2026
 * Removes a specific bookmark for the authenticated user. Only deletes the row matching both the session user_id and the given article_id.
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

if (!$article_id) {
    echo json_encode(['success' => false, 'error' => 'Invalid article.']);
    exit();
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?");
    $stmt->execute([$user_id, $article_id]);
    echo json_encode(['success' => true, 'message' => 'Bookmark removed']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
