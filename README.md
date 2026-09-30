# CRUD / Manual de consulta

Guía en español adaptada al formulario de Diego con `first_name`, `year`, `birth_year` y `documento`. Conserva `formEstudiante`, `tablaEstudiantes`, `prompt()` para editar y `confirm()` para eliminar.

## Consulta inmediata

Abre `index.html`. Incluye ejemplos copiables PHP + JS, explicaciones, el HTML del formulario y `app.js` completo, una demo local y solución de errores. La guía funciona sin servidor e internet. La demo usa datos ficticios en memoria.

## CRUD conectado a PostgreSQL

1. PHP 8.1+ con `pdo_pgsql` y `mbstring`; PostgreSQL 10+.
2. Crea `prueba_crud` y ejecuta `database.sql` en esa base. Si ya existe estudiante con otro esquema, adapta la tabla: CREATE TABLE IF NOT EXISTS no migra columnas.
3. Configura `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` en el entorno de tu servidor. `.env.example` no se carga automáticamente.
4. Ejecuta `php -S 127.0.0.1:8000` desde la carpeta pagina.
5. Abre `http://127.0.0.1:8000/ejemplo.html` para usar el formulario con la base real.

```powershell
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '5432'
$env:DB_NAME = 'prueba_crud'
$env:DB_USER = 'postgres'
$env:DB_PASSWORD = 'TU_CLAVE_LOCAL'
php -S 127.0.0.1:8000
```

| Método | Archivo | Entrada | Respuesta |
| --- | --- | --- | --- |
| GET | listar.php | Sin cuerpo | Arreglo JSON |
| POST | guardar.php | FormData con los cuatro campos | Texto, estado 201 |
| PUT | actualizar.php | JSON con id y los cuatro campos | Texto, estado 200 |
| PATCH | modificar.php | JSON con id y first_name | Texto, estado 200 |
| DELETE | eliminar.php | JSON con id | Texto, estado 200 |

Los endpoints están en la misma carpeta que `ejemplo.html` y `app.js`; requieren `conexion.php`, que carga `_helpers.php`. GET usa response.json(); los cambios usan response.text(). Las consultas usan parámetros preparados. El documento se mantiene como texto para conservar ceros iniciales.

Correcciones del código pegado: POST y PUT guardan los cuatro campos; cancelar un prompt no envía cambios; response.ok se comprueba antes de borrar el formulario; los botones se construyen con funciones y textContent, evitando interpolar nombres dentro de onclick; se agrega PATCH para el nombre.

GitHub y GitHub Pages no ejecutan PHP. Los endpoints requieren el servidor PHP y PostgreSQL. La guía es material de práctica local.

Referencias: [PDO::prepare](https://www.php.net/manual/en/pdo.prepare.php), [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT), [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH).
