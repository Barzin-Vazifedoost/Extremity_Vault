<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$validEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$validEmail) {
    echo json_encode(['success' => false, 'error' => 'Invalid Email']);
    exit();
}


?>