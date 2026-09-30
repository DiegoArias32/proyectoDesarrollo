<?php
require_once __DIR__ . '/_helpers.php';
exigirMetodo('PUT');

// PUT reemplaza los tres campos editables del estudiante.
$datos = leerJSON();
$id = validarID($datos['id'] ?? null);
$first_name = validarNombre($datos['first_name'] ?? null);
$email = validarEmail($datos['email'] ?? null);
$activo = validarActivo($datos['activo'] ?? null);
require_once __DIR__ . '/conexion.php';

try {
    $sql = 'UPDATE estudiante
            SET first_name = :first_name, email = :email, activo = :activo
            WHERE id = :id
            RETURNING id, first_name, email, activo';
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':first_name', $first_name);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':activo', $activo, PDO::PARAM_BOOL);
    $stmt->execute();
    $fila = $stmt->fetch();
    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);
    responder(normalizar($fila));
} catch (PDOException $e) {
    errorBaseDatos($e);
}
