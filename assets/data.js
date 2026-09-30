window.GUIDE_DATA = {
  "methods": {
    "get": {
      "number": "01",
      "method": "GET",
      "title": "Leer registros.",
      "subtitle": "Consulta los estudiantes y recibe un arreglo JSON para mostrar en tu tabla.",
      "endpoint": "listar.php",
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
          "Crea las filas y los botones",
          "forEach() recorre el arreglo. textContent muestra cada campo y onclick asigna funciones sin insertar el nombre dentro de código HTML."
        ]
      ],
      "remember": "GET → SELECT → fetchAll() → JSON → tabla",
      "tip": "GET responde JSON: usa response.json(). El tbody es tablaEstudiantes y los botones llaman editarEstudiante(), cambiarNombre() y eliminarEstudiante().",
      "php": "<?php\nrequire_once \"conexion.php\";\nexigirMetodo('GET');\n\n$sql = \"SELECT * FROM estudiante ORDER BY id\";\n$stmt = $conn->prepare($sql);\n$stmt->execute();\n$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);\n\nheader(\"Content-Type: application/json; charset=utf-8\");\necho json_encode($datos, JSON_UNESCAPED_UNICODE);\n",
      "js": "async function listarEstudiantes() {\n    const response = await fetch(\"listar.php\");\n    const estudiantes = await response.json();\n    if (!response.ok) throw new Error(estudiantes.error || \"No se pudo listar\");\n\n    tabla.innerHTML = \"\";\n    estudiantes.forEach(estudiante => {\n        const fila = document.createElement(\"tr\");\n        // textContent evita que un nombre con comillas rompa los botones.\n        [estudiante.first_name, estudiante.year,\n         estudiante.birth_year, estudiante.documento].forEach(valor => {\n            const celda = document.createElement(\"td\");\n            celda.textContent = valor;\n            fila.appendChild(celda);\n        });\n\n        const acciones = document.createElement(\"td\");\n        const editar = document.createElement(\"button\");\n        editar.textContent = \"Editar\";\n        editar.onclick = () => editarEstudiante(estudiante.id,\n            estudiante.first_name, estudiante.year,\n            estudiante.birth_year, estudiante.documento).catch(mostrarError);\n\n        const nombre = document.createElement(\"button\");\n        nombre.textContent = \"Solo nombre\";\n        nombre.onclick = () => cambiarNombre(estudiante.id,\n            estudiante.first_name).catch(mostrarError);\n\n        const eliminar = document.createElement(\"button\");\n        eliminar.textContent = \"Eliminar\";\n        eliminar.onclick = () => eliminarEstudiante(estudiante.id).catch(mostrarError);\n        acciones.append(editar, nombre, eliminar);\n        fila.appendChild(acciones);\n        tabla.appendChild(fila);\n    });\n    mensaje.textContent = estudiantes.length ? \"\" : \"No hay estudiantes\";\n}\n",
      "response": "[\n  {\n    \"id\": 1,\n    \"first_name\": \"Ana Torres\",\n    \"year\": 2026,\n    \"birth_year\": 2003,\n    \"documento\": \"001234\"\n  }\n]"
    },
    "post": {
      "number": "02",
      "method": "POST",
      "title": "Crear un registro.",
      "subtitle": "Envía tu formulario con nombre, año, año de nacimiento y documento.",
      "endpoint": "guardar.php",
      "sql": "INSERT",
      "input": "FormData → $_POST",
      "output": "201 · Texto de confirmación",
      "steps": [
        [
          "Captura submit",
          "event.preventDefault() evita recargar la página. Los cuatro append() usan exactamente los nombres de tus inputs."
        ],
        [
          "PHP lee los cuatro campos",
          "FormData llega a $_POST. INSERT guarda first_name, year, birth_year y documento con una consulta preparada."
        ],
        [
          "Refresca la tabla",
          "Después de una respuesta correcta, reset() limpia el formulario y listarEstudiantes() vuelve a pedir los datos."
        ]
      ],
      "remember": "POST → FormData → $_POST → INSERT",
      "tip": "Tu PHP pegado insertaba solo first_name. Este INSERT guarda los cuatro campos. La respuesta es texto: usa response.text(), no response.json().",
      "php": "<?php\nrequire_once \"conexion.php\";\nexigirMetodo('POST');\n\n// FormData llega a $_POST.\n$first_name = $_POST[\"first_name\"] ?? null;\n$year = $_POST[\"year\"] ?? null;\n$birth_year = $_POST[\"birth_year\"] ?? null;\n$documento = $_POST[\"documento\"] ?? null;\nvalidarCampos($first_name, $year, $birth_year, $documento);\n\n$sql = \"INSERT INTO estudiante\n        (first_name, year, birth_year, documento)\n        VALUES (:first_name, :year, :birth_year, :documento)\";\n$stmt = $conn->prepare($sql);\n$stmt->execute([\n    \"first_name\" => $first_name,\n    \"year\" => $year,\n    \"birth_year\" => $birth_year,\n    \"documento\" => $documento\n]);\n\nhttp_response_code(201);\nheader(\"Content-Type: text/plain; charset=utf-8\");\necho \"Guardado correctamente\";\n",
      "js": "formEstudiante.addEventListener(\"submit\", async function (event) {\n    event.preventDefault();\n    const datos = new FormData();\n    datos.append(\"first_name\", document.getElementById(\"first_name\").value);\n    datos.append(\"year\", document.getElementById(\"year\").value);\n    datos.append(\"birth_year\", document.getElementById(\"birth_year\").value);\n    datos.append(\"documento\", document.getElementById(\"documento\").value);\n\n    const boton = formEstudiante.querySelector('button[type=\"submit\"]');\n    boton.disabled = true;\n    try {\n        const response = await fetch(\"guardar.php\", {\n            method: \"POST\",\n            body: datos\n        });\n        const respuesta = await response.text();\n        if (!response.ok) throw new Error(respuesta);\n        formEstudiante.reset();\n        await listarEstudiantes();\n        mensaje.textContent = respuesta;\n    } catch (error) {\n        mostrarError(error);\n    } finally {\n        boton.disabled = false;\n    }\n});\n",
      "response": "Guardado correctamente"
    },
    "put": {
      "number": "03",
      "method": "PUT",
      "title": "Actualizar completo.",
      "subtitle": "Edita con prompt() y envía los cuatro campos del estudiante, como en tu ejemplo.",
      "endpoint": "actualizar.php",
      "sql": "UPDATE",
      "input": "JSON → php://input",
      "output": "200 · Texto de confirmación",
      "steps": [
        [
          "Pregunta por los cuatro valores",
          "prompt() propone el valor actual. Si pulsas Cancelar, devuelve null y la función termina sin enviar cambios."
        ],
        [
          "PHP recibe el objeto",
          "JSON.stringify() envía id, first_name, year, birth_year y documento. leerJSON() procesa php://input."
        ],
        [
          "Actualiza la fila y recarga",
          "UPDATE reemplaza los cuatro campos editables con WHERE id = :id. Luego listarEstudiantes() muestra los cambios."
        ]
      ],
      "remember": "PUT → JSON completo → UPDATE ... WHERE id",
      "tip": "El PHP que pegaste solo actualizaba el nombre. Este PUT actualiza los cuatro campos. Si falta alguno, responde 422.",
      "php": "<?php\nrequire_once \"conexion.php\";\nexigirMetodo('PUT');\n\n// leerJSON() hace json_decode(file_get_contents(\"php://input\"), true)\n// y comprueba que el cuerpo sea un objeto JSON válido.\n$datos = leerJSON();\n$id = validarID($datos[\"id\"] ?? null);\n$first_name = $datos[\"first_name\"] ?? null;\n$year = $datos[\"year\"] ?? null;\n$birth_year = $datos[\"birth_year\"] ?? null;\n$documento = $datos[\"documento\"] ?? null;\nvalidarCampos($first_name, $year, $birth_year, $documento);\n\n$sql = \"UPDATE estudiante\n        SET first_name = :first_name, year = :year,\n            birth_year = :birth_year, documento = :documento\n        WHERE id = :id\";\n$stmt = $conn->prepare($sql);\n$stmt->execute([\n    \"first_name\" => $first_name,\n    \"year\" => $year,\n    \"birth_year\" => $birth_year,\n    \"documento\" => $documento,\n    \"id\" => $id\n]);\n\nif ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);\nheader(\"Content-Type: text/plain; charset=utf-8\");\necho \"Actualizado\";\n",
      "js": "async function editarEstudiante(id, first_name, year, birth_year, documento) {\n    const nuevoNombre = prompt(\"Nombre:\", first_name);\n    if (nuevoNombre === null) return;\n    const nuevoYear = prompt(\"Año:\", year);\n    if (nuevoYear === null) return;\n    const nuevoNacimiento = prompt(\"Año nacimiento:\", birth_year);\n    if (nuevoNacimiento === null) return;\n    const nuevoDocumento = prompt(\"Documento:\", documento);\n    if (nuevoDocumento === null) return;\n\n    const response = await fetch(\"actualizar.php\", {\n        method: \"PUT\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({\n            id: id,\n            first_name: nuevoNombre,\n            year: nuevoYear,\n            birth_year: nuevoNacimiento,\n            documento: nuevoDocumento\n        })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n",
      "response": "Actualizado"
    },
    "patch": {
      "number": "04",
      "method": "PATCH",
      "title": "Cambiar un campo.",
      "subtitle": "Cambia únicamente first_name; conserva year, birth_year y documento.",
      "endpoint": "modificar.php",
      "sql": "UPDATE",
      "input": "JSON parcial → php://input",
      "output": "200 · Texto de confirmación",
      "steps": [
        [
          "Pide el nuevo nombre",
          "prompt() solicita first_name. Cancelar termina la función. Solo se envían id y first_name."
        ],
        [
          "Lee y valida el JSON",
          "Este PATCH acepta únicamente id y first_name. No necesita reenviar los otros tres campos."
        ],
        [
          "Modifica solo el nombre",
          "UPDATE usa SET first_name = :first_name y conserva el resto del registro. Después recarga la tabla."
        ]
      ],
      "remember": "PATCH → { id, first_name } → UPDATE de un campo",
      "tip": "PUT actualiza los cuatro campos; este PATCH actualiza solo el nombre. Ambos usan UPDATE, con un contrato distinto.",
      "php": "<?php\nrequire_once \"conexion.php\";\nexigirMetodo('PATCH');\n\n$datos = leerJSON();\nif (array_diff(array_keys($datos), ['id', 'first_name'])) {\n    fallar('Este PATCH acepta únicamente id y first_name', 422);\n}\n$id = validarID($datos[\"id\"] ?? null);\n$first_name = $datos[\"first_name\"] ?? null;\nvalidarNombre($first_name);\n\n$sql = \"UPDATE estudiante\n        SET first_name = :first_name\n        WHERE id = :id\";\n$stmt = $conn->prepare($sql);\n$stmt->execute([\n    \"first_name\" => $first_name,\n    \"id\" => $id\n]);\n\nif ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);\nheader(\"Content-Type: text/plain; charset=utf-8\");\necho \"Nombre actualizado\";\n",
      "js": "async function cambiarNombre(id, first_name) {\n    const nuevoNombre = prompt(\"Nuevo nombre:\", first_name);\n    if (nuevoNombre === null) return;\n\n    const response = await fetch(\"modificar.php\", {\n        method: \"PATCH\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ id: id, first_name: nuevoNombre })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n",
      "response": "Nombre actualizado"
    },
    "delete": {
      "number": "05",
      "method": "DELETE",
      "title": "Eliminar un registro.",
      "subtitle": "Envía el id y elimina únicamente el estudiante que corresponde a ese identificador.",
      "endpoint": "eliminar.php",
      "sql": "DELETE",
      "input": "JSON { id } → php://input",
      "output": "200 · Texto de confirmación",
      "steps": [
        [
          "Confirma la eliminación",
          "confirm() devuelve true o false. Si el usuario cancela, return evita llamar a PHP."
        ],
        [
          "Envía únicamente el id",
          "JSON.stringify({ id }) crea el cuerpo. PHP valida el identificador y lo pasa como parámetro."
        ],
        [
          "Elimina y recarga",
          "DELETE ... WHERE id borra una fila. response.text() lee la confirmación y listarEstudiantes() actualiza la vista."
        ]
      ],
      "remember": "DELETE → id → DELETE ... WHERE id → recargar",
      "tip": "WHERE id = :id limita la eliminación. PHP responde texto con 200; si usas response.json(), fallará al leer \"Eliminado\".",
      "php": "<?php\nrequire_once \"conexion.php\";\nexigirMetodo('DELETE');\n\n$datos = leerJSON();\n$id = validarID($datos[\"id\"] ?? null);\n\n$sql = \"DELETE FROM estudiante WHERE id = :id\";\n$stmt = $conn->prepare($sql);\n$stmt->execute([\"id\" => $id]);\n\nif ($stmt->rowCount() === 0) fallar('Estudiante no encontrado', 404);\nheader(\"Content-Type: text/plain; charset=utf-8\");\necho \"Eliminado\";\n",
      "js": "async function eliminarEstudiante(id) {\n    const confirmar = confirm(\"¿Eliminar estudiante?\");\n    if (!confirmar) return;\n\n    const response = await fetch(\"eliminar.php\", {\n        method: \"DELETE\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ id: id })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n",
      "response": "Eliminado"
    }
  },
  "setup": {
    "connection": "<?php\nrequire_once __DIR__ . '/_helpers.php';\n\n// Configura estos valores en el entorno de tu servidor local.\n$host = getenv('DB_HOST') ?: '127.0.0.1';\n$port = getenv('DB_PORT') ?: '5432';\n$base = getenv('DB_NAME') ?: 'prueba_crud';\n$usuario = getenv('DB_USER') ?: 'postgres';\n$clave = getenv('DB_PASSWORD') ?: '';\n\nset_exception_handler(function (Throwable $error) {\n    error_log($error->getMessage());\n    fallar('Error del servidor; revisa la conexión y el registro de PHP', 500);\n});\n\n$conn = new PDO(\n    \"pgsql:host=$host;port=$port;dbname=$base\",\n    $usuario,\n    $clave,\n    [\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n        PDO::ATTR_EMULATE_PREPARES => false\n    ]\n);\n",
    "helpers": "<?php\n// Validaciones compartidas. conexion.php carga este archivo automáticamente.\nfunction fallar(string $mensaje, int $estado): never {\n    http_response_code($estado);\n    if ($_SERVER['REQUEST_METHOD'] === 'GET') {\n        header('Content-Type: application/json; charset=utf-8');\n        echo json_encode(['error' => $mensaje], JSON_UNESCAPED_UNICODE);\n    } else {\n        header('Content-Type: text/plain; charset=utf-8');\n        echo $mensaje;\n    }\n    exit;\n}\n\nfunction exigirMetodo(string $metodo): void {\n    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {\n        header('Allow: ' . $metodo);\n        fallar('Método no permitido', 405);\n    }\n}\n\nfunction leerJSON(): array {\n    $tipo = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));\n    if ($tipo !== 'application/json') fallar('Envía Content-Type: application/json', 415);\n    try {\n        $objeto = json_decode(file_get_contents('php://input'), false, 512, JSON_THROW_ON_ERROR);\n    } catch (JsonException $e) {\n        fallar('El JSON no es válido', 400);\n    }\n    if (!is_object($objeto)) fallar('El cuerpo debe ser un objeto JSON', 400);\n    return get_object_vars($objeto);\n}\n\nfunction validarID(mixed $valor): int {\n    if (!is_int($valor) && !is_string($valor)) fallar('id debe ser un entero positivo', 422);\n    $id = filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);\n    if ($id === false) fallar('id debe ser un entero positivo', 422);\n    return $id;\n}\n\nfunction validarNombre(mixed $nombre): void {\n    if (!is_string($nombre) || trim($nombre) === '' || mb_strlen($nombre) > 80) {\n        fallar('Nombre obligatorio; máximo 80 caracteres', 422);\n    }\n}\n\nfunction validarCampos(mixed $nombre, mixed $year, mixed $birth_year, mixed $documento): void {\n    validarNombre($nombre);\n    foreach (['year' => $year, 'birth_year' => $birth_year] as $campo => $valor) {\n        if ((!is_int($valor) && !is_string($valor)) || filter_var($valor, FILTER_VALIDATE_INT) === false) {\n            fallar($campo . ' debe ser un entero', 422);\n        }\n    }\n    if (!is_string($documento) || trim($documento) === '' || mb_strlen($documento) > 100) {\n        fallar('Documento obligatorio; máximo 100 caracteres', 422);\n    }\n}\n",
    "sql": "-- Crea prueba_crud en PostgreSQL y ejecuta este archivo dentro de esa base.\n-- Si ya existe estudiante con otro esquema, no se modifica automáticamente.\nCREATE TABLE IF NOT EXISTS estudiante (\n    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    first_name VARCHAR(80) NOT NULL,\n    year INTEGER NOT NULL,\n    birth_year INTEGER NOT NULL,\n    documento VARCHAR(100) NOT NULL\n);\n\n-- Datos ficticios. Ejecuta estos INSERT una sola vez.\nINSERT INTO estudiante (first_name, year, birth_year, documento) VALUES\n    ('Ana Torres', 2026, 2003, '001234'),\n    ('Carlos Ruiz', 2026, 2001, '009876'),\n    ('Laura Díaz', 2025, 2004, '004321');\n"
  },
  "table": {
    "html": "<form id=\"formEstudiante\">\n    <input type=\"text\" id=\"first_name\" name=\"first_name\" placeholder=\"Nombre\" maxlength=\"80\" required>\n    <input type=\"number\" id=\"year\" name=\"year\" placeholder=\"Año\" step=\"1\" required>\n    <input type=\"number\" id=\"birth_year\" name=\"birth_year\" placeholder=\"Año de nacimiento\" step=\"1\" required>\n    <input type=\"text\" id=\"documento\" name=\"documento\" placeholder=\"Documento\" maxlength=\"100\" required>\n    <button type=\"submit\">Guardar</button>\n</form>\n\n<p id=\"mensaje\" role=\"status\"></p>\n\n<table border=\"1\">\n    <thead>\n        <tr>\n            <th>Nombre</th><th>Año</th><th>Año nacimiento</th>\n            <th>Documento</th><th>Acciones</th>\n        </tr>\n    </thead>\n    <tbody id=\"tablaEstudiantes\"></tbody>\n</table>\n\n<script src=\"app.js\"></script>\n",
    "js": "const formEstudiante = document.getElementById(\"formEstudiante\");\nconst tabla = document.getElementById(\"tablaEstudiantes\");\nconst mensaje = document.getElementById(\"mensaje\");\n\nfunction mostrarError(error) {\n    mensaje.textContent = error.message;\n}\n// POST\nformEstudiante.addEventListener(\"submit\", async function (event) {\n    event.preventDefault();\n    const datos = new FormData();\n    datos.append(\"first_name\", document.getElementById(\"first_name\").value);\n    datos.append(\"year\", document.getElementById(\"year\").value);\n    datos.append(\"birth_year\", document.getElementById(\"birth_year\").value);\n    datos.append(\"documento\", document.getElementById(\"documento\").value);\n\n    const boton = formEstudiante.querySelector('button[type=\"submit\"]');\n    boton.disabled = true;\n    try {\n        const response = await fetch(\"guardar.php\", {\n            method: \"POST\",\n            body: datos\n        });\n        const respuesta = await response.text();\n        if (!response.ok) throw new Error(respuesta);\n        formEstudiante.reset();\n        await listarEstudiantes();\n        mensaje.textContent = respuesta;\n    } catch (error) {\n        mostrarError(error);\n    } finally {\n        boton.disabled = false;\n    }\n});\n\n// GET\nasync function listarEstudiantes() {\n    const response = await fetch(\"listar.php\");\n    const estudiantes = await response.json();\n    if (!response.ok) throw new Error(estudiantes.error || \"No se pudo listar\");\n\n    tabla.innerHTML = \"\";\n    estudiantes.forEach(estudiante => {\n        const fila = document.createElement(\"tr\");\n        // textContent evita que un nombre con comillas rompa los botones.\n        [estudiante.first_name, estudiante.year,\n         estudiante.birth_year, estudiante.documento].forEach(valor => {\n            const celda = document.createElement(\"td\");\n            celda.textContent = valor;\n            fila.appendChild(celda);\n        });\n\n        const acciones = document.createElement(\"td\");\n        const editar = document.createElement(\"button\");\n        editar.textContent = \"Editar\";\n        editar.onclick = () => editarEstudiante(estudiante.id,\n            estudiante.first_name, estudiante.year,\n            estudiante.birth_year, estudiante.documento).catch(mostrarError);\n\n        const nombre = document.createElement(\"button\");\n        nombre.textContent = \"Solo nombre\";\n        nombre.onclick = () => cambiarNombre(estudiante.id,\n            estudiante.first_name).catch(mostrarError);\n\n        const eliminar = document.createElement(\"button\");\n        eliminar.textContent = \"Eliminar\";\n        eliminar.onclick = () => eliminarEstudiante(estudiante.id).catch(mostrarError);\n        acciones.append(editar, nombre, eliminar);\n        fila.appendChild(acciones);\n        tabla.appendChild(fila);\n    });\n    mensaje.textContent = estudiantes.length ? \"\" : \"No hay estudiantes\";\n}\n\n// PUT\nasync function editarEstudiante(id, first_name, year, birth_year, documento) {\n    const nuevoNombre = prompt(\"Nombre:\", first_name);\n    if (nuevoNombre === null) return;\n    const nuevoYear = prompt(\"Año:\", year);\n    if (nuevoYear === null) return;\n    const nuevoNacimiento = prompt(\"Año nacimiento:\", birth_year);\n    if (nuevoNacimiento === null) return;\n    const nuevoDocumento = prompt(\"Documento:\", documento);\n    if (nuevoDocumento === null) return;\n\n    const response = await fetch(\"actualizar.php\", {\n        method: \"PUT\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({\n            id: id,\n            first_name: nuevoNombre,\n            year: nuevoYear,\n            birth_year: nuevoNacimiento,\n            documento: nuevoDocumento\n        })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n\n// PATCH\nasync function cambiarNombre(id, first_name) {\n    const nuevoNombre = prompt(\"Nuevo nombre:\", first_name);\n    if (nuevoNombre === null) return;\n\n    const response = await fetch(\"modificar.php\", {\n        method: \"PATCH\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ id: id, first_name: nuevoNombre })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n\n// DELETE\nasync function eliminarEstudiante(id) {\n    const confirmar = confirm(\"¿Eliminar estudiante?\");\n    if (!confirmar) return;\n\n    const response = await fetch(\"eliminar.php\", {\n        method: \"DELETE\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ id: id })\n    });\n    const respuesta = await response.text();\n    if (!response.ok) throw new Error(respuesta);\n    await listarEstudiantes();\n    mensaje.textContent = respuesta;\n}\n\nlistarEstudiantes().catch(mostrarError);\n"
  }
};
