<?php
header('Content-Type: application/json');
require_once 'db.php';

$query = filter_var($_GET['q'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
$category_id = filter_var($_GET['category_id'] ?? 0, FILTER_VALIDATE_INT);

$sql = "SELECT a.*, c.name AS category FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.status = 'published'";
$params = [];

if ($query) {
    $sql .= " AND (a.title LIKE ? OR a.content LIKE ?)";
    $params[] = "%" . $query . "%";
    $params[] = "%" . $query . "%";
}

if ($category_id) {
    $sql .= " AND a.category_id = ?";
    $params[] = $category_id;
}

$sql .= " ORDER BY a.created_at DESC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $articles = $stmt->fetchAll();
    echo json_encode($articles);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
