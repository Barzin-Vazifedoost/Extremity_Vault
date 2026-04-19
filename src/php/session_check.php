<?php
/**
 * Barzin Vazifedoost
 * March 2026
 * Returns the current user's session state as JSON. Sets no cache headers to prevent stale responses. Called on every page load.
 */
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user_id'   => $_SESSION['user_id'],
        'name'      => $_SESSION['name'],
        'role'      => $_SESSION['role']
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>
