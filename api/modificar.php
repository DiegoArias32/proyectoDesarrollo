<?php
require_once __DIR__ . '/_helpers.php';
exigirMetodo('PATCH');

// En este ejemplo PATCH modifica únicamente el campo activo.
$datos = leerJSON();
if (array_diff(array_keys($datos), ['id', 'activo'])) {
    responder(['error' => 'Este PATCH acepta únicamente id y activo'], 422);
}
$id = validarID($datos['id'] ?? null);
$activo = validarActivo($datos['activo'] ?? null);
require_once __DIR__ . '/conexion.php';

try {
    $sql = 'UPDATE estudiante SET activo = :activo WHERE id = :id
            RETURNING id, first_name, email, activo';
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':activo', $activo, PDO::PARAM_BOOL);
    $stmt->execute();
    $fila = $stmt->fetch();
    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);
    responder(normalizar($fila));
} catch (PDOException $e) {
    errorBaseDatos($e);
}
