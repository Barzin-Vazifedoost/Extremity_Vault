<?php
/**
 * Barzin Vazifedoost
 * March 2026
 * Database connection module for Extremity Vault.
 * Creates a PDO instance with environment-aware credentials, sets error mode
 * to EXCEPTION and default fetch mode to ASSOC. Required by all PHP scripts.
 */
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'localhost') {
    $host     = 'localhost';
    $dbname   = 'vazifedb_local';
    $username = 'root';
    $password = '';
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4;unix_socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock";
} else {
    $host     = 'localhost';
    $dbname   = 'vazifedb_db';
    $username = 'vazifedb_local';
    $password = 'Eb-A9,5u';
    $dsn = "mysql:host=localhost;port=3306;dbname=vazifedb_db;charset=utf8mb4";
}

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die(json_encode(['success' => false, 'error' => 'DB connection failed: ' . $e->getMessage()]));
}