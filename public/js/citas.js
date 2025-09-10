// js/citas.js

// --- FUNCIONES GLOBALES PARA ACCIONES DE CITAS ---
// (Llaman a la función global 'mostrarConfirmacion' de main.js)
function completarCita(id) {
    mostrarConfirmacion(
        'Completar Cita',
        '¿Estás seguro de que deseas marcar esta cita como completada?',
        'confirm-complete',
        () => actualizarEstadoCita(id, 'completar')
    );
}

function cancelarCita(id) {
    mostrarConfirmacion(
        'Cancelar Cita',
        '¿Estás seguro de que deseas cancelar esta cita?',
        'confirm-cancel',
        () => actualizarEstadoCita(id, 'cancelar')
    );
}

async function actualizarEstadoCita(id, accion) {
    try {
        const response = await fetch(`http://localhost:3000/api/citas/${id}/${accion}`, {
            method: 'PUT',
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            mostrarAlerta('¡Éxito!', result.message, true);
            document.getElementById('btnProgramadas').click(); // Recargar la lista
        } else {
            mostrarAlerta('Error', result.message, false);
        }
    } catch (error) {
        mostrarAlerta('Error de Conexión', 'No se pudo conectar con el servidor.', false);
    }
}

// --- LÓGICA PRINCIPAL DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // Selectores
    const btnAgendar = document.getElementById('btnAgendar');
    const btnProgramadas = document.getElementById('btnProgramadas');
    const vistaAgendar = document.getElementById('vistaAgendar');
    const vistaProgramadas = document.getElementById('vistaProgramadas');
    const citaForm = document.getElementById('citaForm');
    const listaCitasDiv = document.getElementById('lista-citas');
    const multiselectButton = document.getElementById('multiselect-button');
    const multiselectLabel = document.getElementById('multiselect-label');
    const vacunasChecklist = document.getElementById('vacunas-checklist');

    // --- LÓGICA DE VISTAS (TABS) ---
    function cambiarVista(vista) {
        if (vista === 'agendar') {
            vistaAgendar.classList.remove('hidden');
            vistaProgramadas.classList.add('hidden');
            btnAgendar.classList.add('active');
            btnProgramadas.classList.remove('active');
        } else {
            vistaAgendar.classList.add('hidden');
            vistaProgramadas.classList.remove('hidden');
            btnAgendar.classList.remove('active');
            btnProgramadas.classList.add('active');
            cargarCitasProgramadas();
        }
    }
    btnAgendar.addEventListener('click', () => cambiarVista('agendar'));
    btnProgramadas.addEventListener('click', () => cambiarVista('programadas'));

    // --- LÓGICA DEL DROPDOWN DE VACUNAS ---
    multiselectButton.addEventListener('click', () => vacunasChecklist.classList.toggle('hidden'));
    window.addEventListener('click', (e) => {
        const container = document.querySelector('.multiselect-container');
        if (container && !container.contains(e.target)) {
            vacunasChecklist.classList.add('hidden');
        }
    });
    vacunasChecklist.addEventListener('change', () => {
        const seleccionadas = vacunasChecklist.querySelectorAll('input:checked');
        multiselectLabel.textContent = seleccionadas.length === 0 ? 'Seleccionar vacunas...' : `${seleccionadas.length} vacuna(s) seleccionada(s)`;
    });

    // --- LÓGICA DEL FORMULARIO DE AGENDAMIENTO ---
    citaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(citaForm);
        const data = {
            cedula: formData.get('cedula'),
            fecha_hora: `${formData.get('fecha')}T${formData.get('hora')}`,
            vacunas_ids: formData.getAll('vacunas')
        };
        if (data.vacunas_ids.length === 0) {
            return mostrarAlerta('Error de Validación', 'Debes seleccionar al menos una vacuna.', false);
        }
        try {
            const response = await fetch('http://localhost:3000/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                mostrarAlerta('¡Éxito!', result.message, true);
                citaForm.reset();
                multiselectLabel.textContent = 'Seleccionar vacunas...';
            } else {
                mostrarAlerta('Error', result.message, false);
            }
        } catch (error) {
            mostrarAlerta('Error de Conexión', 'No se pudo conectar con el servidor.', false);
        }
    });

    // --- CARGA DE DATOS ---
    async function cargarVacunas() {
        try {
            const response = await fetch('http://localhost:3000/api/vacunas');
            const vacunas = await response.json();
            vacunasChecklist.innerHTML = '';
            vacunas.forEach(vacuna => {
                vacunasChecklist.innerHTML += `<label><input type="checkbox" name="vacunas" value="${vacuna.id_vacunas}"> ${vacuna.nombre}</label>`;
            });
        } catch (error) {
            vacunasChecklist.innerHTML = '<p class="error">No se pudieron cargar las vacunas.</p>';
        }
    }

    async function cargarCitasProgramadas() {
        try {
            const response = await fetch('http://localhost:3000/api/citas', { credentials: 'include' });
            if (!response.ok) throw new Error('No autorizado');
            const citas = await response.json();
            listaCitasDiv.innerHTML = '';
            if (citas.length === 0) {
                listaCitasDiv.innerHTML = '<p>No hay citas programadas.</p>';
                return;
            }
            citas.forEach(cita => {
                const fecha = new Date(cita.fecha_hora).toLocaleDateString('es-CO', {day: '2-digit', month: 'long', year: 'numeric'});
                const hora = new Date(cita.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                listaCitasDiv.innerHTML += `
                    <div class="appointmentCard">
                        <div class="appointmentInfo">
                            <p class="paciente-nombre">${cita.nombre_paciente} ${cita.apellido_paciente}</p>
                            <p class="cita-vacuna">${cita.nombre_vacuna}</p>
                            <div class="cita-detalle"><span class="material-symbols-outlined">calendar_today</span> ${fecha}</div>
                            <div class="cita-detalle"><span class="material-symbols-outlined">schedule</span> ${hora}</div>
                        </div>
                        <div class="appointmentActions">
                            <button class="action-button complete" onclick="completarCita(${cita.id_cita})"><span class="material-symbols-outlined">check_circle</span> Completar</button>
                            <button class="action-button cancel" onclick="cancelarCita(${cita.id_cita})"><span class="material-symbols-outlined">cancel</span> Cancelar</button>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            listaCitasDiv.innerHTML = '<p class="error">No se pudieron cargar las citas. Inicia sesión de nuevo.</p>';
        }
    }
    
    // --- INICIALIZACIÓN ---
    cambiarVista('agendar');
    cargarVacunas();
});