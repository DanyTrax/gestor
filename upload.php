<?php
// Simple endpoint para subir comprobantes a uploads/payments
// Producción: ajusta límites y validaciones según tus políticas

// CORS básico si llamaras desde otro subdominio (misma raíz no lo requiere)
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json');

// Tamaño máximo (5 MB)
ini_set('upload_max_filesize', '5M');
ini_set('post_max_size', '6M');

if (!isset($_FILES['file'])) {
  http_response_code(400);
  echo json_encode(['error' => 'missing_file']);
  exit;
}

$allowedMime = [
  'image/jpeg' => 'jpg',
  'image/png' => 'png',
  'application/pdf' => 'pdf',
];

$tmpName = $_FILES['file']['tmp_name'] ?? '';
$origName = $_FILES['file']['name'] ?? 'file';
$size = (int)($_FILES['file']['size'] ?? 0);
$type = mime_content_type($tmpName);

if (!isset($allowedMime[$type])) {
  http_response_code(415);
  echo json_encode(['error' => 'unsupported_type', 'mime' => $type]);
  exit;
}

if ($size <= 0 || $size > 5 * 1024 * 1024) {
  http_response_code(413);
  echo json_encode(['error' => 'file_too_large', 'size' => $size]);
  exit;
}

$safeBase = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
$ext = $allowedMime[$type];
$fileName = 'proof-' . time() . '-' . $safeBase . '.' . $ext;

$targetDir = __DIR__ . '/uploads/payments/';
if (!is_dir($targetDir)) {
  @mkdir($targetDir, 0775, true);
}

$destPath = $targetDir . $fileName;
if (!move_uploaded_file($tmpName, $destPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'move_failed']);
  exit;
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$publicUrl = $scheme . $_SERVER['HTTP_HOST'] . '/uploads/payments/' . $fileName;

echo json_encode(['url' => $publicUrl, 'name' => $fileName]);

