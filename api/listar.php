<?php
require_once __DIR__ . '/_helpers.php';
exigirMetodo('GET');
require_once __DIR__ . '/conexion.php';

try {
    $sql = 'SELECT id, first_name, email, activo FROM estudiante ORDER BY id';
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $datos = $stmt->fetchAll();
    responder(array_map('normalizar', $datos));
} catch (PDOException $e) {
    errorBaseDatos($e);
}
