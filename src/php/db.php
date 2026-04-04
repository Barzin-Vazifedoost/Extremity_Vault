<?php
if ($_SERVER['HTTP_HOST'] === 'localhost') {
    // Local XAMPP settings
    $host = 'localhost';
    $dbname = 'vazifedb_local';
    $username = 'root';
    $password = '';
} else {
    // School server settings
    $host = 'localhost';
    $dbname = 'vazifedb_db';
    $username = 'vazifedb_local';  // ← replace this
    $password = 'Eb-A9,5u';  // ← replace this
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully!";
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
