<?php
/**
 * Anika Agnihotri
 * March 2026
 * Returns all articles bookmarked by the authenticated user.
 * Joins bookmarks with articles and categories, ordered newest first.
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.content, a.created_at, a.category_id, c.name AS category
        FROM bookmarks b
        JOIN articles a ON b.article_id = a.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE b.user_id = ?
        AND a.status = 'published'
        ORDER BY b.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $bookmarks = $stmt->fetchAll();
    echo json_encode(['success' => true, 'bookmarks' => $bookmarks]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
