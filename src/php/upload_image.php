<?php
/**
 * upload_image.php
 * Accepts a multipart image upload from an authenticated admin.
 * Validates file type and size, saves to public/images/, returns the URL.
 *
 * @author Barzin Vazifedoost
 *
 * @return JSON {success: bool, url?: string, error?: string}
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
    exit();
}
if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden.']);
    exit();
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file received.']);
    exit();
}

$allowed_mime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($_FILES['image']['tmp_name']);

if (!in_array($mime, $allowed_mime, true)) {
    echo json_encode(['success' => false, 'error' => 'Only JPEG, PNG, GIF, and WEBP images are allowed.']);
    exit();
}

$max_bytes = 5 * 1024 * 1024; // 5 MB
if ($_FILES['image']['size'] > $max_bytes) {
    echo json_encode(['success' => false, 'error' => 'Image must be under 5 MB.']);
    exit();
}

$ext      = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
$filename = bin2hex(random_bytes(12)) . '.' . strtolower($ext);
$upload_dir = __DIR__ . '/../../public/images/';
$dest = $upload_dir . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file.']);
    exit();
}

$base = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
      . '://' . $_SERVER['HTTP_HOST'];
$url  = $base . '/Extremity_Vault/public/images/' . $filename;

echo json_encode(['success' => true, 'url' => $url]);
?>
