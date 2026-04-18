<?php
/**
 * create_article.php
 * Creates a new article as a draft (admin only).
 * Accepts JSON POST body with 'title', 'category_id', and 'content'.
 * Requires an active admin session; returns HTTP 403 for non-admins.
 * All inputs are sanitized and inserted via PDO prepared statements.
 *
 * @author Barzin Vazifedoost
 *
 * @param string title       Article title.
 * @param int    category_id Foreign key referencing the categories table.
 * @param string content     Article body text.
 *
 * @return JSON {success: bool, message?: string, error?: string}
 */
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please login.']);
    exit();
}

if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden. Admin access required.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$title = filter_var($data['title'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
$category_id = filter_var($data['category_id'] ?? 0, FILTER_VALIDATE_INT);
$content = filter_var($data['content'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$user_id = $_SESSION['user_id'];

if (!$title || !$category_id || !$content) {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO articles (user_id, category_id, title, content, status) VALUES (?, ?, ?, ?, 'draft')");
    $stmt->execute([$user_id, $category_id, $title, $content]);
    echo json_encode(['success' => true, 'message' => 'Article created']);
} catch (PDOException $e) {
    error_log("Article creation failed: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
?>
