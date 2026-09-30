<?php
require_once "conexion.php";
exigirMetodo('PUT');

// leerJSON() hace json_decode(file_get_contents("php://input"), true)
// y comprueba que el cuerpo sea un objeto JSON válido.
$datos = leerJSON();
$id = validarID($datos["id"] ?? null);
$first_name = $datos["first_name"] ?? null;
$year = $datos["year"] ?? null;
$birth_year = $datos["birth_year"] ?? null;
$documento = $datos["documento"] ?? null;
validarCampos($first_name, $year, $birth_year, $documento);

$sql = "UPDATE estudiante
        SET first_name = :first_name, year = :year,
            birth_year = :birth_year, documento = :documento
        WHERE id = :id";
$stmt = $conn->prepare($sql);
$stmt->execute([
    "first_name" => $first_name,
    "year" => $year,
    "birth_year" => $birth_year,
    "documento" => $documento,
    "id" => $id
]);

if ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);
header("Content-Type: text/plain; charset=utf-8");
echo "Actualizado";
