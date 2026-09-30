<?php
// Funciones compartidas por los cinco endpoints.
function responder(array $datos, int $estado = 200): never {
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function exigirMetodo(string $metodo): void {
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        responder(['error' => 'Método no permitido'], 405);
    }
}

function leerJSON(): array {
    $tipo = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($tipo !== 'application/json') {
        responder(['error' => 'Envía Content-Type: application/json'], 415);
    }
    try {
        $objeto = json_decode(file_get_contents('php://input'), false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        responder(['error' => 'El JSON no es válido'], 400);
    }
    if (!is_object($objeto)) {
        responder(['error' => 'El cuerpo debe ser un objeto JSON'], 400);
    }
    return get_object_vars($objeto);
}

function validarID(mixed $valor): int {
    if (!is_int($valor) && !is_string($valor)) {
        responder(['error' => 'El id debe ser un entero positivo'], 422);
    }
    $id = filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) responder(['error' => 'El id debe ser un entero positivo'], 422);
    return $id;
}

function validarNombre(mixed $valor): string {
    if (!is_string($valor) || trim($valor) === '' || mb_strlen(trim($valor)) > 80) {
        responder(['error' => 'first_name es obligatorio; máximo 80 caracteres'], 422);
    }
    return trim($valor);
}

function validarEmail(mixed $valor): string {
    if (!is_string($valor) || strlen(trim($valor)) > 160 || !filter_var(trim($valor), FILTER_VALIDATE_EMAIL)) {
        responder(['error' => 'email debe ser un correo válido; máximo 160 caracteres'], 422);
    }
    return trim($valor);
}

function validarActivo(mixed $valor): bool {
    if (!is_bool($valor)) responder(['error' => 'activo debe ser true o false, sin comillas'], 422);
    return $valor;
}

function normalizar(array $fila): array {
    $fila['id'] = (int) $fila['id'];
    $fila['activo'] = in_array($fila['activo'], [true, 1, '1', 't', 'true'], true);
    return $fila;
}

function errorBaseDatos(PDOException $e): never {
    error_log($e->getMessage());
    responder(['error' => 'No se pudo completar la operación en la base de datos'], 500);
}
