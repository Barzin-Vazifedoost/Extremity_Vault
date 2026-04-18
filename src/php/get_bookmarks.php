<?php
/**
 * get_bookmarks.php
 * Returns all articles bookmarked by the authenticated user.
 * Joins the bookmarks table with articles to return full article data.
 * Results are ordered newest bookmark first.
 *
 * @author Barzin Vazifedoost
 *
 * @return JSON {success: bool, bookmarks?: array, error?: string}
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
        SELECT a.id, a.title, a.content, a.created_at
        FROM bookmarks b
        JOIN articles a ON b.article_id = a.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $bookmarks = $stmt->fetchAll();
    echo json_encode(['success' => true, 'bookmarks' => $bookmarks]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
