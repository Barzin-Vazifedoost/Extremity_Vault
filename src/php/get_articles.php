<?php
/**
 * Ammar Khan
 * March 2026
 * Returns all published articles as a JSON array.
 * Public endpoint, no authentication required. Used by the Archive page.
 */
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = 'published'");
    $stmt->execute();
    $articles = $stmt->fetchAll();
    echo json_encode($articles);
}
catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'View Failed']);
    exit();

}
?>
