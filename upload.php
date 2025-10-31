<?php
// Endpoint para subir comprobantes a uploads/payments
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores al cliente (solo logs)
ini_set('log_errors', 1);

// CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header('Content-Type: application/json');

// Función para detectar tipo MIME de forma compatible
function getMimeType($filePath) {
  if (function_exists('mime_content_type')) {
    return mime_content_type($filePath);
  }
  if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $filePath);
    finfo_close($finfo);
    return $mime;
  }
  // Fallback: usar extensión
  $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
  $mimeMap = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'pdf' => 'application/pdf',
  ];
  return $mimeMap[$ext] ?? 'application/octet-stream';
}

// Validar que se recibió un archivo
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
  $errorCode = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
  $errorMsg = 'missing_file';
  if ($errorCode === UPLOAD_ERR_INI_SIZE || $errorCode === UPLOAD_ERR_FORM_SIZE) {
    $errorMsg = 'file_too_large';
  } elseif ($errorCode === UPLOAD_ERR_PARTIAL) {
    $errorMsg = 'upload_partial';
  }
  http_response_code(400);
  echo json_encode(['error' => $errorMsg, 'code' => $errorCode]);
  exit;
}

$file = $_FILES['file'];
$tmpName = $file['tmp_name'];
$origName = $file['name'] ?? 'comprobante';
$size = (int)($file['size'] ?? 0);

// Validar tamaño (5 MB máximo)
if ($size <= 0 || $size > 5 * 1024 * 1024) {
  http_response_code(413);
  echo json_encode(['error' => 'file_too_large', 'size' => $size, 'max' => 5242880]);
  exit;
}

// Validar tipo MIME
$allowedMime = [
  'image/jpeg' => 'jpg',
  'image/png' => 'png',
  'application/pdf' => 'pdf',
];

// Mapeo de variantes comunes de tipos MIME
$mimeVariants = [
  'image/pjpeg' => 'image/jpeg',
  'image/x-png' => 'image/png',
  'image/x-icon' => 'image/png', // algunos sistemas detectan PNG como icon
];

// Prioridad 1: Tipo MIME que envía el navegador (más confiable)
$detectedType = $file['type'] ?? '';

// Normalizar variantes comunes
if (isset($mimeVariants[$detectedType])) {
  $detectedType = $mimeVariants[$detectedType];
}

// Prioridad 2: Detección por contenido del archivo
if (empty($detectedType) || $detectedType === 'application/octet-stream') {
  $detectedType = getMimeType($tmpName);
  // Normalizar también el tipo detectado
  if (isset($mimeVariants[$detectedType])) {
    $detectedType = $mimeVariants[$detectedType];
  }
}

// Prioridad 3: Fallback por extensión del archivo original
if (empty($detectedType) || $detectedType === 'application/octet-stream') {
  $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
  $extToMime = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'pdf' => 'application/pdf',
  ];
  if (isset($extToMime[$ext])) {
    $detectedType = $extToMime[$ext];
  }
}

// Validar que el tipo está permitido
if (!isset($allowedMime[$detectedType])) {
  http_response_code(415);
  echo json_encode([
    'error' => 'unsupported_type',
    'mime' => $detectedType,
    'browser_type' => $file['type'] ?? 'not_set',
    'filename' => $origName,
    'allowed' => array_keys($allowedMime)
  ]);
  exit;
}

// Generar nombre de archivo seguro
$safeBase = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
$ext = $allowedMime[$detectedType];
$fileName = 'proof-' . time() . '-' . $safeBase . '.' . $ext;

// Crear directorio si no existe
$targetDir = __DIR__ . '/uploads/payments/';
if (!is_dir($targetDir)) {
  if (!@mkdir($targetDir, 0775, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'cannot_create_dir', 'path' => $targetDir]);
    exit;
  }
}

// Verificar permisos de escritura
if (!is_writable($targetDir)) {
  http_response_code(500);
  echo json_encode(['error' => 'directory_not_writable', 'path' => $targetDir]);
  exit;
}

// Mover archivo
$destPath = $targetDir . $fileName;
if (!@move_uploaded_file($tmpName, $destPath)) {
  $lastError = error_get_last();
  http_response_code(500);
  echo json_encode([
    'error' => 'move_failed',
    'dest' => $destPath,
    'php_error' => $lastError['message'] ?? 'unknown'
  ]);
  exit;
}

// Establecer permisos del archivo
@chmod($destPath, 0644);

// Generar URL pública
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$publicUrl = $scheme . $_SERVER['HTTP_HOST'] . '/uploads/payments/' . $fileName;

echo json_encode([
  'url' => $publicUrl,
  'name' => $fileName,
  'size' => $size,
  'type' => $detectedType
]);
?>