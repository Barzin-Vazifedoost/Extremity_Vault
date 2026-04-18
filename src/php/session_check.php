<?php
/**
 * session_check.php
 * Returns the current user's session state as JSON.
 * Sets no-cache headers to prevent browsers from serving a stale response.
 * Called by every page on load to enforce authentication.
 *
 * @author Barzin Vazifedoost
 *
 * @return JSON {logged_in: bool, user_id?: int, name?: string, role?: string}
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
