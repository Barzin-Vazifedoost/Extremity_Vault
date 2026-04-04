<?php
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'localhost') {
    // Local XAMPP settings
    $host = 'localhost';
    $dbname = 'vazifedb_local';
    $username = 'root';
    $password = '';
} else {
    // School server settings (or fallback for command line)
    $host = 'localhost';
    $dbname = 'vazifedb_local';  // Using local DB for now
    $username = 'root';
    $password = '';
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8;unix_socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Only echo when running from command line for testing
    if (php_sapi_name() === 'cli') {
        echo "Connected successfully!";
    }
} catch (PDOException $e) {
    if (php_sapi_name() === 'cli') {
        die("Connection failed: " . $e->getMessage());
    }
    // For web requests, just die silently or log the error
    error_log("Database connection failed: " . $e->getMessage());
}
?>
