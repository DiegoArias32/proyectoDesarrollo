window.GUIDE_DATA = {
  "methods": {
    "get": {
      "number": "01",
      "method": "GET",
      "title": "Leer registros.",
      "subtitle": "Consulta los estudiantes y recibe un arreglo JSON para mostrar en tu tabla.",
      "endpoint": "api/listar.php",
      "sql": "SELECT",
      "input": "Sin cuerpo",
      "output": "200 · Arreglo JSON",
      "steps": [
        [
          "JavaScript pide los datos",
          "fetch() usa GET por defecto. La URL apunta al archivo PHP que hará la consulta."
        ],
        [
          "PHP consulta PostgreSQL",
          "prepare() crea la consulta; execute() la ejecuta; fetchAll() recupera todas las filas."
        ],
        [
          "El navegador recibe JSON",
          "response.json() convierte la respuesta en un arreglo. Usa ese arreglo para construir la tabla."
        ]
      ],
      "remember": "GET → SELECT → fetchAll() → JSON → tabla",
      "tip": "Un GET vacío debe responder [] con estado 200. No es un error: simplemente no hay registros.",
      "php": "<?php\nrequire_once __DIR__ . '/_helpers.php';\nexigirMetodo('GET');\nrequire_once __DIR__ . '/conexion.php';\n\ntry {\n    $sql = 'SELECT id, first_name, email, activo FROM estudiante ORDER BY id';\n    $stmt = $conn->prepare($sql);\n    $stmt->execute();\n    $datos = $stmt->fetchAll();\n    responder(array_map('normalizar', $datos));\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
      "js": "async function listarEstudiantes() {\n    const response = await fetch('api/listar.php');\n    const datos = await response.json();\n\n    if (!response.ok) {\n        throw new Error(datos.error || 'No se pudo listar');\n    }\n\n    return datos; // Un arreglo de estudiantes.\n}\n\n// Dentro de otra función async:\n// const estudiantes = await listarEstudiantes();\n// renderizarTabla(estudiantes);\n",
      "response": "[\n  { \"id\": 1, \"first_name\": \"Ana Torres\",\n    \"email\": \"ana@example.com\", \"activo\": true }\n]"
    },
    "post": {
      "number": "02",
      "method": "POST",
      "title": "Crear un registro.",
      "subtitle": "Envía el formulario, guarda el estudiante y recibe su nuevo identificador.",
      "endpoint": "api/guardar.php",
      "sql": "INSERT",
      "input": "FormData → $_POST",
      "output": "201 · Registro creado",
      "steps": [
        [
          "Arma el formulario",
          "FormData reúne first_name y email. No agregues Content-Type: el navegador incluye el boundary correcto."
        ],
        [
          "PHP lee y valida $_POST",
          "Los nombres de append() deben coincidir con las claves de $_POST. prepare() mantiene los valores separados del SQL."
        ],
        [
          "INSERT guarda y devuelve",
          "RETURNING entrega el registro creado. activo toma TRUE por defecto; después puedes volver a cargar la tabla."
        ]
      ],
      "remember": "POST → FormData → $_POST → INSERT",
      "tip": "Usa $_POST para este formulario. $_REQUEST mezcla orígenes según la configuración y no deja tan claro de dónde viene el dato.",
      "php": "<?php\nrequire_once __DIR__ . '/_helpers.php';\nexigirMetodo('POST');\n\n// FormData de JavaScript llega a $_POST.\n$first_name = validarNombre($_POST['first_name'] ?? null);\n$email = validarEmail($_POST['email'] ?? null);\nrequire_once __DIR__ . '/conexion.php';\n\ntry {\n    $sql = 'INSERT INTO estudiante (first_name, email)\n            VALUES (:first_name, :email)\n            RETURNING id, first_name, email, activo';\n    $stmt = $conn->prepare($sql);\n    $stmt->execute(['first_name' => $first_name, 'email' => $email]);\n    responder(normalizar($stmt->fetch()), 201);\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
      "js": "async function guardarEstudiante(first_name, email) {\n    const formulario = new FormData();\n    formulario.append('first_name', first_name);\n    formulario.append('email', email);\n\n    const response = await fetch('api/guardar.php', {\n        method: 'POST',\n        body: formulario\n        // FormData: el navegador configura Content-Type.\n    });\n    const datos = await response.json();\n    if (!response.ok) throw new Error(datos.error || 'No se pudo guardar');\n    return datos; // Incluye el id generado.\n}\n\n// await guardarEstudiante('Ana Torres', 'ana@example.com');\n",
      "response": "{\n  \"id\": 4, \"first_name\": \"Ana Torres\",\n  \"email\": \"ana@example.com\", \"activo\": true\n}"
    },
    "put": {
      "number": "03",
      "method": "PUT",
      "title": "Actualizar completo.",
      "subtitle": "Reemplaza todos los campos editables del estudiante identificado por su id.",
      "endpoint": "api/actualizar.php",
      "sql": "UPDATE",
      "input": "JSON → php://input",
      "output": "200 · Registro actualizado",
      "steps": [
        [
          "Envía todos los campos",
          "Este contrato exige id, first_name, email y activo. JSON.stringify() convierte el objeto en texto JSON."
        ],
        [
          "PHP lee el cuerpo JSON",
          "leerJSON() usa file_get_contents(\"php://input\") y json_decode(). PUT con JSON no llena $_POST."
        ],
        [
          "UPDATE cambia esa fila",
          "WHERE id = :id delimita el registro. Si no existe, responde 404. El id identifica la fila y no se reemplaza."
        ]
      ],
      "remember": "PUT → JSON completo → UPDATE ... WHERE id",
      "tip": "PUT representa el reemplazo de los campos editables. En este proyecto, omitir uno responde 422. Para cambiar solo activo, usa PATCH.",
      "php": "<?php\nrequire_once __DIR__ . '/_helpers.php';\nexigirMetodo('PUT');\n\n// PUT reemplaza los tres campos editables del estudiante.\n$datos = leerJSON();\n$id = validarID($datos['id'] ?? null);\n$first_name = validarNombre($datos['first_name'] ?? null);\n$email = validarEmail($datos['email'] ?? null);\n$activo = validarActivo($datos['activo'] ?? null);\nrequire_once __DIR__ . '/conexion.php';\n\ntry {\n    $sql = 'UPDATE estudiante\n            SET first_name = :first_name, email = :email, activo = :activo\n            WHERE id = :id\n            RETURNING id, first_name, email, activo';\n    $stmt = $conn->prepare($sql);\n    $stmt->bindValue(':id', $id, PDO::PARAM_INT);\n    $stmt->bindValue(':first_name', $first_name);\n    $stmt->bindValue(':email', $email);\n    $stmt->bindValue(':activo', $activo, PDO::PARAM_BOOL);\n    $stmt->execute();\n    $fila = $stmt->fetch();\n    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);\n    responder(normalizar($fila));\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
      "js": "async function actualizarEstudiante(id, first_name, email, activo) {\n    const response = await fetch('api/actualizar.php', {\n        method: 'PUT',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ id, first_name, email, activo })\n    });\n\n    const datos = await response.json();\n    if (!response.ok) throw new Error(datos.error || 'No se pudo actualizar');\n    return datos;\n}\n\n// Envía TODOS los campos editables:\n// await actualizarEstudiante(1, 'Ana Torres', 'ana@example.com', true);\n",
      "response": "{\n  \"id\": 1, \"first_name\": \"Ana Torres\",\n  \"email\": \"ana@example.com\", \"activo\": true\n}"
    },
    "patch": {
      "number": "04",
      "method": "PATCH",
      "title": "Cambiar un campo.",
      "subtitle": "Modifica solo el estado activo y conserva el nombre y el correo existentes.",
      "endpoint": "api/modificar.php",
      "sql": "UPDATE",
      "input": "JSON parcial → php://input",
      "output": "200 · Estado actualizado",
      "steps": [
        [
          "Envía id y activo",
          "Este PATCH tiene un contrato concreto: cambia únicamente activo. true y false son booleanos, sin comillas."
        ],
        [
          "PHP valida lo recibido",
          "leerJSON() procesa el cuerpo. validarActivo() exige un booleano; los campos adicionales se rechazan para evitar falsas expectativas."
        ],
        [
          "UPDATE toca solo activo",
          "SET activo = :activo conserva first_name y email. PARAM_BOOL transmite el tipo correcto a PostgreSQL."
        ]
      ],
      "remember": "PATCH → JSON parcial → UPDATE de un campo",
      "tip": "PUT y PATCH pueden usar UPDATE. La diferencia está en el contrato: reemplazo completo frente a modificación parcial.",
      "php": "<?php\nrequire_once __DIR__ . '/_helpers.php';\nexigirMetodo('PATCH');\n\n// En este ejemplo PATCH modifica únicamente el campo activo.\n$datos = leerJSON();\nif (array_diff(array_keys($datos), ['id', 'activo'])) {\n    responder(['error' => 'Este PATCH acepta únicamente id y activo'], 422);\n}\n$id = validarID($datos['id'] ?? null);\n$activo = validarActivo($datos['activo'] ?? null);\nrequire_once __DIR__ . '/conexion.php';\n\ntry {\n    $sql = 'UPDATE estudiante SET activo = :activo WHERE id = :id\n            RETURNING id, first_name, email, activo';\n    $stmt = $conn->prepare($sql);\n    $stmt->bindValue(':id', $id, PDO::PARAM_INT);\n    $stmt->bindValue(':activo', $activo, PDO::PARAM_BOOL);\n    $stmt->execute();\n    $fila = $stmt->fetch();\n    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);\n    responder(normalizar($fila));\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
      "js": "async function cambiarEstado(id, activo) {\n    const response = await fetch('api/modificar.php', {\n        method: 'PATCH',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ id, activo })\n    });\n\n    const datos = await response.json();\n    if (!response.ok) throw new Error(datos.error || 'No se pudo modificar');\n    return datos;\n}\n\n// Cambia solo el estado; conserva nombre y correo:\n// await cambiarEstado(1, false);\n",
      "response": "{\n  \"id\": 1, \"first_name\": \"Ana Torres\",\n  \"email\": \"ana@example.com\", \"activo\": false\n}"
    },
    "delete": {
      "number": "05",
      "method": "DELETE",
      "title": "Eliminar un registro.",
      "subtitle": "Envía el id y elimina únicamente el estudiante que corresponde a ese identificador.",
      "endpoint": "api/eliminar.php",
      "sql": "DELETE",
      "input": "JSON { id } → php://input",
      "output": "200 · Confirmación JSON",
      "steps": [
        [
          "Confirma en la interfaz",
          "Antes de llamar esta función desde un botón, pide confirmación al usuario y envía el id del registro seleccionado."
        ],
        [
          "PHP valida el identificador",
          "El id debe ser un entero mayor que cero. Una consulta preparada recibe el valor como parámetro."
        ],
        [
          "DELETE elimina y confirma",
          "WHERE limita la eliminación a ese id. RETURNING permite verificar si existía. Después refresca la tabla."
        ]
      ],
      "remember": "DELETE → id → DELETE ... WHERE id → recargar",
      "tip": "Nunca omitas WHERE en el DELETE de un registro. Este ejemplo responde JSON con 200; si usas 204, no debes llamar response.json().",
      "php": "<?php\nrequire_once __DIR__ . '/_helpers.php';\nexigirMetodo('DELETE');\n\n$datos = leerJSON();\n$id = validarID($datos['id'] ?? null);\nrequire_once __DIR__ . '/conexion.php';\n\ntry {\n    $sql = 'DELETE FROM estudiante WHERE id = :id RETURNING id';\n    $stmt = $conn->prepare($sql);\n    $stmt->execute(['id' => $id]);\n    $fila = $stmt->fetch();\n    if (!$fila) responder(['error' => 'Estudiante no encontrado'], 404);\n    responder(['mensaje' => 'Estudiante eliminado', 'id' => (int) $fila['id']]);\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
      "js": "async function eliminarEstudiante(id) {\n    const response = await fetch('api/eliminar.php', {\n        method: 'DELETE',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ id })\n    });\n\n    const datos = await response.json();\n    if (!response.ok) throw new Error(datos.error || 'No se pudo eliminar');\n    return datos;\n}\n\n// await eliminarEstudiante(1);\n",
      "response": "{\n  \"mensaje\": \"Estudiante eliminado\",\n  \"id\": 1\n}"
    }
  },
  "setup": {
    "connection": "<?php\n// Variables de entorno: configura tus valores en el servidor local.\n// No guardes contraseñas reales en Git.\n$host = getenv('DB_HOST') ?: '127.0.0.1';\n$port = getenv('DB_PORT') ?: '5432';\n$base = getenv('DB_NAME') ?: 'prueba_crud';\n$usuario = getenv('DB_USER') ?: 'postgres';\n$clave = getenv('DB_PASSWORD') ?: '';\n\ntry {\n    $conn = new PDO(\n        \"pgsql:host=$host;port=$port;dbname=$base\",\n        $usuario,\n        $clave,\n        [\n            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n            PDO::ATTR_EMULATE_PREPARES => false\n        ]\n    );\n} catch (PDOException $e) {\n    errorBaseDatos($e);\n}\n",
    "helpers": "<?php\n// Funciones compartidas por los cinco endpoints.\nfunction responder(array $datos, int $estado = 200): never {\n    http_response_code($estado);\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode($datos, JSON_UNESCAPED_UNICODE);\n    exit;\n}\n\nfunction exigirMetodo(string $metodo): void {\n    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {\n        header('Allow: ' . $metodo);\n        responder(['error' => 'Método no permitido'], 405);\n    }\n}\n\nfunction leerJSON(): array {\n    $tipo = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));\n    if ($tipo !== 'application/json') {\n        responder(['error' => 'Envía Content-Type: application/json'], 415);\n    }\n    try {\n        $objeto = json_decode(file_get_contents('php://input'), false, 512, JSON_THROW_ON_ERROR);\n    } catch (JsonException $e) {\n        responder(['error' => 'El JSON no es válido'], 400);\n    }\n    if (!is_object($objeto)) {\n        responder(['error' => 'El cuerpo debe ser un objeto JSON'], 400);\n    }\n    return get_object_vars($objeto);\n}\n\nfunction validarID(mixed $valor): int {\n    if (!is_int($valor) && !is_string($valor)) {\n        responder(['error' => 'El id debe ser un entero positivo'], 422);\n    }\n    $id = filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);\n    if ($id === false) responder(['error' => 'El id debe ser un entero positivo'], 422);\n    return $id;\n}\n\nfunction validarNombre(mixed $valor): string {\n    if (!is_string($valor) || trim($valor) === '' || mb_strlen(trim($valor)) > 80) {\n        responder(['error' => 'first_name es obligatorio; máximo 80 caracteres'], 422);\n    }\n    return trim($valor);\n}\n\nfunction validarEmail(mixed $valor): string {\n    if (!is_string($valor) || strlen(trim($valor)) > 160 || !filter_var(trim($valor), FILTER_VALIDATE_EMAIL)) {\n        responder(['error' => 'email debe ser un correo válido; máximo 160 caracteres'], 422);\n    }\n    return trim($valor);\n}\n\nfunction validarActivo(mixed $valor): bool {\n    if (!is_bool($valor)) responder(['error' => 'activo debe ser true o false, sin comillas'], 422);\n    return $valor;\n}\n\nfunction normalizar(array $fila): array {\n    $fila['id'] = (int) $fila['id'];\n    $fila['activo'] = in_array($fila['activo'], [true, 1, '1', 't', 'true'], true);\n    return $fila;\n}\n\nfunction errorBaseDatos(PDOException $e): never {\n    error_log($e->getMessage());\n    responder(['error' => 'No se pudo completar la operación en la base de datos'], 500);\n}\n",
    "sql": "-- Crea primero la base prueba_crud desde pgAdmin o psql.\n-- Luego ejecuta este archivo dentro de esa base.\nCREATE TABLE IF NOT EXISTS estudiante (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    first_name VARCHAR(80) NOT NULL,\n    email VARCHAR(160) NOT NULL,\n    activo BOOLEAN NOT NULL DEFAULT TRUE\n);\n\n-- Datos ficticios para practicar (ejecutar una sola vez).\nINSERT INTO estudiante (first_name, email, activo) VALUES\n    ('Ana Torres', 'ana@example.com', TRUE),\n    ('Carlos Ruiz', 'carlos@example.com', TRUE),\n    ('Laura Díaz', 'laura@example.com', FALSE);\n"
  },
  "table": {
    "html": "<table class=\"table table-striped\">\n    <thead>\n        <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Estado</th></tr>\n    </thead>\n    <tbody id=\"tabla-estudiantes\"></tbody>\n</table>\n<p id=\"mensaje\" role=\"status\"></p>\n\n<!-- Bootstrap es opcional: solo aporta estilos. -->\n<!-- Carga tu JS al final del body o con defer. -->\n",
    "js": "function renderizarTabla(estudiantes) {\n    const tbody = document.getElementById('tabla-estudiantes');\n    tbody.replaceChildren(); // Evita duplicar filas.\n\n    for (const estudiante of estudiantes) {\n        const fila = document.createElement('tr');\n        const valores = [estudiante.id, estudiante.first_name,\n                         estudiante.email, estudiante.activo ? 'Activo' : 'Inactivo'];\n\n        for (const valor of valores) {\n            const celda = document.createElement('td');\n            celda.textContent = valor; // Muestra texto, no ejecuta HTML.\n            fila.appendChild(celda);\n        }\n        tbody.appendChild(fila);\n    }\n}\n\nasync function cargarTabla() {\n    const mensaje = document.getElementById('mensaje');\n    mensaje.textContent = 'Cargando...';\n    try {\n        const datos = await listarEstudiantes(); // Copia también el JS de GET.\n        renderizarTabla(datos);\n        mensaje.textContent = datos.length ? '' : 'No hay estudiantes';\n    } catch (error) {\n        mensaje.textContent = error.message;\n    }\n}\n\ncargarTabla(); // Después de que exista el tbody.\n// Tras guardar, actualizar o eliminar: await cargarTabla();\n"
  }
};
