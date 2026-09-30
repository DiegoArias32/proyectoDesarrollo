# CRUD / Manual de consulta

Guía en español para consultar y copiar ejemplos de PHP nativo, JavaScript y PostgreSQL. Incluye GET, POST, PUT, PATCH, DELETE, renderizado de tablas, explicación por pasos y una demo local.

## Abrir la guía

Abre `index.html` directamente en tu navegador. No necesita instalación ni internet. Navega por los métodos y usa **Copiar**. La búsqueda también reconoce conceptos de los ejemplos.

La demo usa datos ficticios en memoria: no llama a los endpoints ni guarda información en una base de datos.

## Ejecutar los endpoints reales

1. Usa PHP 8.1 o superior con `pdo_pgsql` y `mbstring`, y PostgreSQL 10 o superior.
2. Crea una base llamada `prueba_crud`. Ejecuta `database.sql` dentro de esa base desde pgAdmin o psql. Los INSERT de muestra se ejecutan una sola vez.
3. Configura las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` en tu entorno local. `.env.example` es solo una referencia; no se carga automáticamente. No subas contraseñas reales a Git.
4. Desde la carpeta del proyecto, inicia `php -S 127.0.0.1:8000` y abre `http://127.0.0.1:8000`.
5. Copia los ejemplos de JavaScript a tu frontend y ejecuta las funciones desde un formulario o botón. Para la tabla, copia la sección **Renderizar tabla** y también la función de **GET**.

En PowerShell, antes de iniciar el servidor:

```powershell
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '5432'
$env:DB_NAME = 'prueba_crud'
$env:DB_USER = 'postgres'
$env:DB_PASSWORD = 'TU_CLAVE_LOCAL'
php -S 127.0.0.1:8000
```

## Contratos

| Método | Archivo | Entrada | Operación |
| --- | --- | --- | --- |
| GET | `api/listar.php` | Sin cuerpo | Lista todos los estudiantes |
| POST | `api/guardar.php` | FormData: `first_name`, `email` | Crea un estudiante activo |
| PUT | `api/actualizar.php` | JSON: `id`, `first_name`, `email`, `activo` | Reemplaza todos los campos editables |
| PATCH | `api/modificar.php` | JSON: `id`, `activo` | Cambia únicamente el estado |
| DELETE | `api/eliminar.php` | JSON: `id` | Elimina un estudiante |

Los archivos PHP dependen de `api/_helpers.php` y `api/conexion.php`. Las rutas del JS parten de la raíz del proyecto. `activo` es un booleano JSON, sin comillas. Las consultas usan parámetros preparados. Una fila inexistente responde 404; entradas inválidas, 400/415/422; método incorrecto, 405.

El esquema agrega `email` y `activo` al ejemplo previo con `first_name`. Adapta los campos si tu prueba usa otra tabla.

Los endpoints son material de práctica local. Antes de usarlos en una aplicación publicada, agrega autenticación y permisos según el proyecto. GitHub y GitHub Pages no ejecutan PHP: necesitas un servidor PHP para la API.

## Referencias

- [PHP: PDO::prepare](https://www.php.net/manual/en/pdo.prepare.php)
- [MDN: usar fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT)
- [MDN: PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH)
