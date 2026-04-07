<?php
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'localhost') {
    $host     = 'localhost';
    $dbname   = 'vazifedb_local';
    $username = 'root';
    $password = '';
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8;unix_socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock";
} else {
    // School server — update credentials before deploying
    $host     = 'localhost';
    $dbname   = 'vazifedb_db';
    $username = 'vazifedb';
    $password = 'Eb-A9,5u';
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
}

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die(json_encode(['success' => false, 'error' => 'DB connection failed']));
}
?>
