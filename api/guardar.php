<?php
require_once __DIR__ . '/_helpers.php';
exigirMetodo('POST');

// FormData de JavaScript llega a $_POST.
$first_name = validarNombre($_POST['first_name'] ?? null);
$email = validarEmail($_POST['email'] ?? null);
require_once __DIR__ . '/conexion.php';

try {
    $sql = 'INSERT INTO estudiante (first_name, email)
            VALUES (:first_name, :email)
            RETURNING id, first_name, email, activo';
    $stmt = $conn->prepare($sql);
    $stmt->execute(['first_name' => $first_name, 'email' => $email]);
    responder(normalizar($stmt->fetch()), 201);
} catch (PDOException $e) {
    errorBaseDatos($e);
}
