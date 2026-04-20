<?php
/**
 * Barzin Vazifedoost
 * April 2026
 * Returns all categories as a JSON array ordered by name.
 * Public endpoint — no session required.
 *
 * @return JSON array of {id, name} objects
 */
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC");
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
