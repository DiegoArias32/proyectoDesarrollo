<?php
require_once "conexion.php";
exigirMetodo('GET');

$sql = "SELECT * FROM estudiante ORDER BY id";
$stmt = $conn->prepare($sql);
$stmt->execute();
$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header("Content-Type: application/json; charset=utf-8");
echo json_encode($datos, JSON_UNESCAPED_UNICODE);
