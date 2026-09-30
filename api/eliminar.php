<?php
require_once __DIR__ . '/_helpers.php';
exigirMetodo('DELETE');

$datos = leerJSON();
$id = validarID($datos['id'] ?? null);
require_once __DIR__ . '/conexion.php';

try {
    $sql = 'DELETE FROM estudiante WHERE id = :id RETURNING id';
    $stmt = $conn->prepare($sql);
    $stmt->execute(['id' => $id]);
    $fila = $stmt->fetch();
    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);
    responder(['mensaje' => 'Estudiante eliminado', 'id' => (int) $fila['id']]);
} catch (PDOException $e) {
    errorBaseDatos($e);
}
