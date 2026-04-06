<?php
header('Content-Type: application/json');

require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

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
