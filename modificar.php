<?php
require_once "conexion.php";
exigirMetodo('PATCH');

$datos = leerJSON();
if (array_diff(array_keys($datos), ['id', 'first_name'])) {
    fallar('Este PATCH acepta únicamente id y first_name', 422);
}
$id = validarID($datos["id"] ?? null);
$first_name = $datos["first_name"] ?? null;
validarNombre($first_name);

$sql = "UPDATE estudiante
        SET first_name = :first_name
        WHERE id = :id";
$stmt = $conn->prepare($sql);
$stmt->execute([
    "first_name" => $first_name,
    "id" => $id
]);

if ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);
header("Content-Type: text/plain; charset=utf-8");
echo "Nombre actualizado";
