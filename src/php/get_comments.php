<?php
/**
 * Anika Agnihotri
 * March 2026
 * Returns all comments for a given article in chronological order.
 * Public endpoint, joins with users table to include each commenter's name.
 */
header('Content-Type: application/json');
require_once 'db.php';

$article_id = filter_var($_GET['article_id'] ?? 0, FILTER_VALIDATE_INT);

if (!$article_id) {
    echo json_encode(['success' => false, 'error' => 'Invalid article.']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT c.id, c.content, c.created_at, u.name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.article_id = ?
        ORDER BY c.created_at ASC
    ");
    $stmt->execute([$article_id]);
    $comments = $stmt->fetchAll();
    echo json_encode(['success' => true, 'comments' => $comments]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
