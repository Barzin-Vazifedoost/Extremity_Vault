<?php
header('Content-Type: application/json');
require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);

try{
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = 'published'");
    $stmt->execute();
    $articles = $stmt->fetchAll();
    echo json_encode($articles);
}
catch(PDOException $e){
    echo json_encode(['success' => false, 'error' => 'View Failed']);
    exit();

}
?>
