<?php
/**
 * Erin Sobers
 * March 2026
 * Permanently deletes a draft article (admin only).
 * Published articles must be unpublished first to prevent accidental content loss.
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden. Admin access required.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$article_id = filter_var($data['article_id'] ?? 0, FILTER_VALIDATE_INT);

if (!$article_id) {
    echo json_encode(['success' => false, 'error' => 'Invalid article ID.']);
    exit();
}

try {
    // Only allow deletion of drafts
    $check = $pdo->prepare("SELECT status FROM articles WHERE id = ?");
    $check->execute([$article_id]);
    $article = $check->fetch();

    if (!$article) {
        echo json_encode(['success' => false, 'error' => 'Article not found.']);
        exit();
    }

    if ($article['status'] !== 'draft') {
        echo json_encode(['success' => false, 'error' => 'Only drafts can be deleted. Unpublish first.']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ? AND status = 'draft'");
    $stmt->execute([$article_id]);
    echo json_encode(['success' => true, 'message' => 'Article deleted.']);
} catch (PDOException $e) {
    error_log("Article deletion failed: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
