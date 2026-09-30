<?php
require_once "conexion.php";
exigirMetodo('DELETE');

$datos = leerJSON();
$id = validarID($datos["id"] ?? null);

$sql = "DELETE FROM estudiante WHERE id = :id";
$stmt = $conn->prepare($sql);
$stmt->execute(["id" => $id]);

if ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);
header("Content-Type: text/plain; charset=utf-8");
echo "Eliminado";
