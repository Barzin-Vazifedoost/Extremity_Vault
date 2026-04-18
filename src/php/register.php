<?php
/**
 * register.php
 * Registers a new user account.
 * Accepts JSON POST body with 'name', 'email', and 'password' fields.
 * Validates the email format, hashes the password with bcrypt,
 * and inserts the new user row. Rejects duplicate email addresses.
 *
 * @author Barzin Vazifedoost
 *
 * @param string name     Display name for the new user.
 * @param string email    Email address (must be unique, validated).
 * @param string password Plain-text password (hashed with PASSWORD_BCRYPT).
 *
 * @return JSON {success: bool, message?: string, error?: string}
 */
header('Content-Type: application/json');

require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

$name     = $data['name']     ?? '';
$password = $data['password'] ?? '';
$email    = $data['email']    ?? '';

$hash = password_hash($password, PASSWORD_BCRYPT);
$name = filter_var($name, FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$validEmail = filter_var($email, FILTER_VALIDATE_EMAIL);

if (!$validEmail){
    echo json_encode(['success' => false, 'error' => 'Invalid Email']);
    exit();
}
try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $hash]);
    echo json_encode(['success' => true, 'message' => 'User registered']);
    

}
catch (PDOException $e) {
        $msg = $e->getMessage();
        if (strpos($msg, 'Duplicate entry') !== false) {
            echo json_encode(['success' => false, 'error' => 'Email already exists']);
        } else {
            echo json_encode(['success' => false, 'error' => 'DB error: ' . $msg]);
        }
        exit();
}

?>
