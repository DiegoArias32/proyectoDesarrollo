<?php
// Validaciones compartidas. conexion.php carga este archivo automáticamente.
function fallar(string $mensaje, int $estado): never {
    http_response_code($estado);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => $mensaje], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/plain; charset=utf-8');
        echo $mensaje;
    }
    exit;
}

function exigirMetodo(string $metodo): void {
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        fallar('Método no permitido', 405);
    }
}

function leerJSON(): array {
    $tipo = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($tipo !== 'application/json') fallar('Envía Content-Type: application/json', 415);
    try {
        $objeto = json_decode(file_get_contents('php://input'), false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        fallar('El JSON no es válido', 400);
    }
    if (!is_object($objeto)) fallar('El cuerpo debe ser un objeto JSON', 400);
    return get_object_vars($objeto);
}

function validarID(mixed $valor): int {
    if (!is_int($valor) && !is_string($valor)) fallar('id debe ser un entero positivo', 422);
    $id = filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) fallar('id debe ser un entero positivo', 422);
    return $id;
}

function validarNombre(mixed $nombre): void {
    if (!is_string($nombre) || trim($nombre) === '' || mb_strlen($nombre) > 80) {
        fallar('Nombre obligatorio; máximo 80 caracteres', 422);
    }
}

function validarCampos(mixed $nombre, mixed $year, mixed $birth_year, mixed $documento): void {
    validarNombre($nombre);
    foreach (['year' => $year, 'birth_year' => $birth_year] as $campo => $valor) {
        if ((!is_int($valor) && !is_string($valor)) || filter_var($valor, FILTER_VALIDATE_INT) === false) {
            fallar($campo . ' debe ser un entero', 422);
        }
    }
    if (!is_string($documento) || trim($documento) === '' || mb_strlen($documento) > 100) {
        fallar('Documento obligatorio; máximo 100 caracteres', 422);
    }
}
