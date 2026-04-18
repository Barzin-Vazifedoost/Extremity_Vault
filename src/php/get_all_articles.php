<?php
/**
 * get_all_articles.php
 * Returns all articles regardless of status (admin only).
 * Used by the Editor page to list every article with its publish state.
 * Requires an active admin session.
 *
 * @author Barzin Vazifedoost
 *
 * @return JSON {success: bool, articles?: array, error?: string}
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.status, a.created_at, c.name AS category
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.created_at DESC
    ");
    $stmt->execute();
    $articles = $stmt->fetchAll();
    echo json_encode(['success' => true, 'articles' => $articles]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
