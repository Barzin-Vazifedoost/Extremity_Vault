<?php
/**
 * login.php
 * Authenticates a user against the database.
 * Accepts JSON POST body with 'email' and 'password' fields.
 * Validates email format, verifies bcrypt password hash,
 * and writes user data into the PHP session on success.
 *
 * @author Barzin Vazifedoost
 *
 * @param string email    User's email address (validated with FILTER_VALIDATE_EMAIL).
 * @param string password Plain-text password (verified with password_verify).
 *
 * @return JSON {success: bool, message?: string, error?: string}
 */
session_start();
header('Content-Type: application/json');

require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

$email    = $data['email']    ?? '';
$password = $data['password'] ?? '';

$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$validEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$validEmail) {
    echo json_encode(['success' => false, 'error' => 'Invalid Email']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if($user){
       if(password_verify($password,$user['password'])){
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['role'] = $user['role'];
        echo json_encode(['success' => true, 'message' => 'User Logged In']);


       }
       else{
        echo json_encode(['success' => false, 'error' => 'Wrong password']); exit();
       }
    }
    else{
        echo json_encode(['success' => false, 'error' => 'User not found']); exit();
    }
    
}
catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Login Failed']);
        exit();
}

?>