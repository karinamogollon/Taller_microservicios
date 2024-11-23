document.addEventListener('DOMContentLoaded', function () {
    const formRegistrarEstudiante = document.getElementById('formRegistrarEstudiante');
    const formActualizarEstudiante = document.getElementById('formActualizarEstudiante');
    const formFiltros = document.getElementById('formFiltros');
    const estudiantesTable = document.getElementById('tablaEstudiantes').getElementsByTagName('tbody')[0];
    const detalleEstudiante = document.getElementById('detalleEstudiante');
    const detalleCodigo = document.getElementById('detalleCodigo');
    const detalleNombre = document.getElementById('detalleNombre');
    const detalleEmail = document.getElementById('detalleEmail');
    const detalleEstado = document.getElementById('detalleEstado');
    const detallePromedio = document.getElementById('detallePromedio');
    const tablaNotas = document.getElementById('tablaNotas').getElementsByTagName('tbody')[0];
    const formRegistrarNota = document.getElementById('formRegistrarNota');
    const formModificarNota = document.getElementById('formModificarNota');

    // Función para obtener los estudiantes y actualizar la tabla
    function obtenerEstudiantes(filtros = {}) {
        let url = 'http://localhost:8000/api/estudiantes';

        const params = new URLSearchParams(filtros);
        if (params.toString()) {
            url += '?' + params.toString();
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                estudiantesTable.innerHTML = '';
                data.data.forEach(estudiante => {
                    const row = estudiantesTable.insertRow();
                    row.insertCell().innerText = estudiante.cod;
                    row.insertCell().innerText = estudiante.nombres;
                    row.insertCell().innerText = estudiante.email;
                    row.insertCell().innerText = estudiante.nota_definitiva === 'No hay nota' ? 'No hay nota' : parseFloat(estudiante.nota_definitiva).toFixed(2);
                    row.insertCell().innerText = estudiante.nota_definitiva >= 3.0 ? 'Aprobado' : 'Reprobado';

                    const verNotasButton = document.createElement('button');
                    verNotasButton.textContent = 'Ver Notas';
                    verNotasButton.onclick = () => verNotas(estudiante);

                    const editarButton = document.createElement('button');
                    editarButton.textContent = 'Editar';
                    editarButton.onclick = () => editarEstudiante(estudiante);

                    const eliminarButton = document.createElement('button');
                    eliminarButton.textContent = 'Eliminar';
                    eliminarButton.onclick = () => eliminarEstudiante(estudiante.cod);

                    const accionesCell = row.insertCell();
                    accionesCell.appendChild(verNotasButton);
                    accionesCell.appendChild(editarButton);
                    accionesCell.appendChild(eliminarButton);
                });
            })
            .catch(error => {
                console.error('Error al obtener estudiantes:', error);
            });
    }

    function verNotas(estudiante) {
        console.log('Detalles del estudiante:', estudiante);
    
        detalleEstudiante.style.display = 'block';
    
        // Mostrar los detalles del estudiante
        detalleCodigo.innerText = estudiante.cod;
        detalleNombre.innerText = estudiante.nombres;
        detalleEmail.innerText = estudiante.email;
    
        // Mostrar si aprobó o reprobó
        detalleEstado.innerText = estudiante.nota_definitiva >= 3.0 ? 'Aprobado' : 'Reprobado';
    
        // Verificar que el estudiante tenga notas
        const notas = estudiante.notas || [];
        console.log('Notas del estudiante:', notas);
        
        if (notas.length === 0) {
            tablaNotas.innerHTML = '<tr><td colspan="5">No hay notas registradas</td></tr>';
            document.getElementById('notasBajo3').innerText = 'Notas por debajo de 3: 0';
            document.getElementById('notasMayores3').innerText = 'Notas mayores o iguales a 3: 0';
            return;
        }
    
        const totalNotas = notas.length;
        const sumaNotas = notas.reduce((total, nota) => total + parseFloat(nota.nota), 0);
        const promedio = totalNotas > 0 ? (sumaNotas / totalNotas).toFixed(2) : 'No hay nota';
        detallePromedio.innerText = promedio;
    
        tablaNotas.innerHTML = '';
    
        let contadorBajo3 = 0;
        let contadorMayor3 = 0;
    
        notas.forEach(nota => {
            const row = tablaNotas.insertRow();
    
            row.insertCell().innerText = nota.actividad;
    
            const notaCell = row.insertCell();
            const notaValue = parseFloat(nota.nota);
            notaCell.innerText = nota.nota;
    
            if (notaValue >= 0 && notaValue <= 2) {
                notaCell.style.backgroundColor = 'red';
                contadorBajo3++;
            } else if (notaValue > 2 && notaValue < 3) {
                notaCell.style.backgroundColor = 'yellow';
            } else if (notaValue >= 3 && notaValue < 4) {
                notaCell.style.backgroundColor = 'lightgreen';
                contadorMayor3++;
            } else if (notaValue >= 4) {
                notaCell.style.backgroundColor = 'green';
                contadorMayor3++;
            }
    
            const editarButton = document.createElement('button');
            editarButton.textContent = 'Editar';
            editarButton.onclick = () => mostrarFormularioEdicionNota(nota);
    
            const accionesCell = row.insertCell();
            accionesCell.appendChild(editarButton);
        });
    
        document.getElementById('notasBajo3').innerText = `Notas por debajo de 3: ${contadorBajo3}`;
        document.getElementById('notasMayores3').innerText = `Notas mayores o iguales a 3: ${contadorMayor3}`;
    }

    function editarEstudiante(estudiante) {
        formActualizarEstudiante.style.display = 'block';
        
        // Cargar los datos del estudiante en los campos del formulario
        document.getElementById('codigoActualizar').value = estudiante.cod;
        document.getElementById('nombreActualizar').value = estudiante.nombres;
        document.getElementById('emailActualizar').value = estudiante.email;
    }
    
    formActualizarEstudiante.addEventListener('submit', function (e) {
        e.preventDefault();
    
        // Obtener los valores del formulario
        const codEstudiante = document.getElementById('codigoActualizar').value;
        const nombre = document.getElementById('nombreActualizar').value;
        const email = document.getElementById('emailActualizar').value;
    
        // Validar los campos
        if (!nombre || !email) {
            alert('Por favor, completa todos los campos.');
            return;
        }
    
        // Preparar los datos para la actualización
        const data = {
            nombres: nombre,
            email: email,
        };
    
        // Realizar la solicitud PUT para actualizar el estudiante
        fetch(`http://localhost:8000/api/estudiantes/${codEstudiante}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar el estudiante.');
            }
            return response.json();
        })
        .then(data => {
            // Verificar si la respuesta contiene un mensaje de éxito
            if (data.msg) {
                alert(data.msg);
                obtenerEstudiantes();  // Recargar la lista de estudiantes
                formActualizarEstudiante.style.display = 'none';  // Cerrar el formulario
            } else {
                alert('Hubo un problema al actualizar al estudiante.');
            }
        })
        .catch(error => {
            console.error('Error al actualizar el estudiante:', error);
            alert('Hubo un error al actualizar el estudiante. Ver consola para detalles.');
        });
    });
    

    formModificarNota.addEventListener('submit', function (e) {
        e.preventDefault();
    
        const idNota = document.getElementById('idNota').value;
        const actividad = document.getElementById('actividadModificar').value;
        const nota = parseFloat(document.getElementById('notaModificar').value);
    
        if (nota < 0 || nota > 5 || isNaN(nota)) {
            alert('La nota debe estar entre 0 y 5.');
            return;
        }
    
        const codEstudiante = detalleCodigo.innerText;
    
        const data = {
            actividad: actividad,
            nota: nota.toFixed(2),
        };
    
        fetch(`http://localhost:8000/api/estudiantes/${codEstudiante}/notas/${idNota}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.msg) {
                alert(data.msg);
                verNotas({ cod: detalleCodigo.innerText });
            } else {
                alert('Error al actualizar la nota: ' + JSON.stringify(data));
            }
        })
        .catch(error => {
            console.error('Error al actualizar la nota:', error);
            alert('Hubo un error al actualizar la nota. Ver consola para detalles.');
        });
    });

    formRegistrarNota.addEventListener('submit', function (e) {
        e.preventDefault();
    
        const codEstudiante = detalleCodigo.innerText;
        const actividad = document.getElementById('actividad').value;
        const nota = parseFloat(document.getElementById('nota').value);
    
        if (!codEstudiante) {
            alert('Por favor, selecciona un estudiante antes de registrar una nota.');
            return;
        }
    
        if (nota < 0 || nota > 5 || isNaN(nota)) {
            alert('La nota debe estar entre 0 y 5.');
            return;
        }
    
        const data = {
            actividad: actividad,
            nota: nota.toFixed(2),
        };
    
        fetch(`http://localhost:8000/api/estudiantes/${codEstudiante}/notas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.msg) {
                alert(data.msg);
                verNotas({ cod: codEstudiante });
            } else {
                alert('Error al registrar la nota.');
            }
        })
        .catch(error => {
            console.error('Error al registrar la nota:', error);
            alert('Hubo un error al registrar la nota. Ver consola para detalles.');
        });
    });

    function eliminarEstudiante(codEstudiante) {
        if (confirm('¿Estás seguro de eliminar al estudiante?')) {
            fetch(`http://localhost:8000/api/estudiantes/${codEstudiante}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    if (data.msg) {
                        alert(data.msg);
                        obtenerEstudiantes();
                    } else {
                        alert('Error al eliminar el estudiante');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el estudiante:', error);
                });
        }
    }

    obtenerEstudiantes();
});
