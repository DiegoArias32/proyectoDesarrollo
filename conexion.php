<?php
require_once __DIR__ . '/_helpers.php';

// Configura estos valores en el entorno de tu servidor local.
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '5432';
$base = getenv('DB_NAME') ?: 'prueba_crud';
$usuario = getenv('DB_USER') ?: 'postgres';
$clave = getenv('DB_PASSWORD') ?: '';

set_exception_handler(function (Throwable $error) {
    error_log($error->getMessage());
    fallar('Error del servidor; revisa la conexión y el registro de PHP', 500);
});

$conn = new PDO(
    "pgsql:host=$host;port=$port;dbname=$base",
    $usuario,
    $clave,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]
);
