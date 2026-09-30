<?php
require_once "conexion.php";
exigirMetodo('POST');

// FormData llega a $_POST.
$first_name = $_POST["first_name"] ?? null;
$year = $_POST["year"] ?? null;
$birth_year = $_POST["birth_year"] ?? null;
$documento = $_POST["documento"] ?? null;
validarCampos($first_name, $year, $birth_year, $documento);

$sql = "INSERT INTO estudiante
        (first_name, year, birth_year, documento)
        VALUES (:first_name, :year, :birth_year, :documento)";
$stmt = $conn->prepare($sql);
$stmt->execute([
    "first_name" => $first_name,
    "year" => $year,
    "birth_year" => $birth_year,
    "documento" => $documento
]);

http_response_code(201);
header("Content-Type: text/plain; charset=utf-8");
echo "Guardado correctamente";
