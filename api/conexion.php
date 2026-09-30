<?php
// Variables de entorno: configura tus valores en el servidor local.
// No guardes contraseñas reales en Git.
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '5432';
$base = getenv('DB_NAME') ?: 'prueba_crud';
$usuario = getenv('DB_USER') ?: 'postgres';
$clave = getenv('DB_PASSWORD') ?: '';

try {
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
} catch (PDOException $e) {
    errorBaseDatos($e);
}
