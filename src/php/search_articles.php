<?php
/**
 * search_articles.php
 * Returns published articles filtered by an optional search query and category.
 * Public endpoint — no authentication required.
 * Used by the main Vault page for live client-side-assisted search.
 *
 * @author Barzin Vazifedoost
 *
 * @param string q           Optional GET param. Substring matched against title or content.
 * @param int    category_id Optional GET param. Filters results to a specific category.
 *
 * @return JSON Array of matching article objects, or {success: false, error: string} on failure.
 */
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
