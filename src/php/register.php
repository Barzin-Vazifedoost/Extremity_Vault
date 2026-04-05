<?php
header('Content-Type: application/json');

// ========== DEBUGGING - DELETE AFTER FIXING ==========
error_log('[REGISTER DEBUG] Register request received at ' . date('Y-m-d H:i:s'));
error_log('[REGISTER DEBUG] Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('[REGISTER DEBUG] Content type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
// ========== END DEBUGGING ==========

require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

// ========== DEBUGGING - DELETE AFTER FIXING ==========
error_log('[REGISTER DEBUG] Raw input: ' . file_get_contents('php://input'));
error_log('[REGISTER DEBUG] Decoded data: ' . print_r($data, true));
// ========== END DEBUGGING ==========

$name = $data['name'];
$password = $data['password'];
$email = $data['email'];

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
        echo json_encode(['success' => false, 'error' => 'Email already exists']);
        exit();
}

?>
