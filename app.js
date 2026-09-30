const formEstudiante = document.getElementById("formEstudiante");
const tabla = document.getElementById("tablaEstudiantes");
const mensaje = document.getElementById("mensaje");

function mostrarError(error) {
    mensaje.textContent = error.message;
}
// POST
formEstudiante.addEventListener("submit", async function (event) {
    event.preventDefault();
    const datos = new FormData();
    datos.append("first_name", document.getElementById("first_name").value);
    datos.append("year", document.getElementById("year").value);
    datos.append("birth_year", document.getElementById("birth_year").value);
    datos.append("documento", document.getElementById("documento").value);

    const boton = formEstudiante.querySelector('button[type="submit"]');
    boton.disabled = true;
    try {
        const response = await fetch("guardar.php", {
            method: "POST",
            body: datos
        });
        const respuesta = await response.text();
        if (!response.ok) throw new Error(respuesta);
        formEstudiante.reset();
        await listarEstudiantes();
        mensaje.textContent = respuesta;
    } catch (error) {
        mostrarError(error);
    } finally {
        boton.disabled = false;
    }
});

// GET
async function listarEstudiantes() {
    const response = await fetch("listar.php");
    const estudiantes = await response.json();
    if (!response.ok) throw new Error(estudiantes.error || "No se pudo listar");

    tabla.innerHTML = "";
    estudiantes.forEach(estudiante => {
        const fila = document.createElement("tr");
        // textContent evita que un nombre con comillas rompa los botones.
        [estudiante.first_name, estudiante.year,
         estudiante.birth_year, estudiante.documento].forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const acciones = document.createElement("td");
        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.onclick = () => editarEstudiante(estudiante.id,
            estudiante.first_name, estudiante.year,
            estudiante.birth_year, estudiante.documento).catch(mostrarError);

        const nombre = document.createElement("button");
        nombre.textContent = "Solo nombre";
        nombre.onclick = () => cambiarNombre(estudiante.id,
            estudiante.first_name).catch(mostrarError);

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.onclick = () => eliminarEstudiante(estudiante.id).catch(mostrarError);
        acciones.append(editar, nombre, eliminar);
        fila.appendChild(acciones);
        tabla.appendChild(fila);
    });
    mensaje.textContent = estudiantes.length ? "" : "No hay estudiantes";
}

// PUT
async function editarEstudiante(id, first_name, year, birth_year, documento) {
    const nuevoNombre = prompt("Nombre:", first_name);
    if (nuevoNombre === null) return;
    const nuevoYear = prompt("Año:", year);
    if (nuevoYear === null) return;
    const nuevoNacimiento = prompt("Año nacimiento:", birth_year);
    if (nuevoNacimiento === null) return;
    const nuevoDocumento = prompt("Documento:", documento);
    if (nuevoDocumento === null) return;

    const response = await fetch("actualizar.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id,
            first_name: nuevoNombre,
            year: nuevoYear,
            birth_year: nuevoNacimiento,
            documento: nuevoDocumento
        })
    });
    const respuesta = await response.text();
    if (!response.ok) throw new Error(respuesta);
    await listarEstudiantes();
    mensaje.textContent = respuesta;
}

// PATCH
async function cambiarNombre(id, first_name) {
    const nuevoNombre = prompt("Nuevo nombre:", first_name);
    if (nuevoNombre === null) return;

    const response = await fetch("modificar.php", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, first_name: nuevoNombre })
    });
    const respuesta = await response.text();
    if (!response.ok) throw new Error(respuesta);
    await listarEstudiantes();
    mensaje.textContent = respuesta;
}

// DELETE
async function eliminarEstudiante(id) {
    const confirmar = confirm("¿Eliminar estudiante?");
    if (!confirmar) return;

    const response = await fetch("eliminar.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    });
    const respuesta = await response.text();
    if (!response.ok) throw new Error(respuesta);
    await listarEstudiantes();
    mensaje.textContent = respuesta;
}

listarEstudiantes().catch(mostrarError);
