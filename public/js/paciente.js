document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DE ELEMENTOS ---
    let pacienteActual = null;

    const btnIngresar = document.getElementById('btnIngresar');
    const btnConsultar = document.getElementById('btnConsultar');
    const vistaIngresar = document.getElementById('vistaIngresar');
    const vistaConsultar = document.getElementById('vistaConsultar');
    const patientForm = document.getElementById('patientForm');
    const searchPatientForm = document.getElementById('searchPatientForm');
    const patientResult = document.getElementById('patientResult');
    const btnActualizar = document.getElementById('btnActualizar');
    const btnEliminar = document.getElementById('btnEliminar');
    const formTitle = vistaIngresar.querySelector('.blockTittle p');
    const formSubmitButton = patientForm.querySelector('button[type="submit"]');

    // --- LÓGICA DE VISTAS (INGRESAR / CONSULTAR) ---
    function cambiarVista(vista) {
        if (vista === 'ingresar') {
            vistaIngresar.classList.remove('hidden');
            vistaConsultar.classList.add('hidden');
            btnIngresar.classList.add('active');
            btnConsultar.classList.remove('active');
        } else if (vista === 'consultar') {
            vistaIngresar.classList.add('hidden');
            vistaConsultar.classList.remove('hidden');
            btnIngresar.classList.remove('active');
            btnConsultar.classList.add('active');
            prepararFormularioParaCrear();
        }
    }
    btnIngresar.addEventListener('click', () => cambiarVista('ingresar'));
    btnConsultar.addEventListener('click', () => cambiarVista('consultar'));

    // --- LÓGICA DEL FORMULARIO PRINCIPAL (CREAR Y ACTUALIZAR) ---
    patientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(patientForm);
        const data = Object.fromEntries(formData.entries());
        const modo = patientForm.dataset.mode || 'crear';
        const id = patientForm.dataset.id;
        let url = 'http://localhost:3000/api/pacientes';
        let method = 'POST';

        if (modo === 'editar') {
            url = `http://localhost:3000/api/pacientes/${id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include' // <-- CORRECCIÓN
            });
            const result = await response.json();
            
            if (response.ok) {
                mostrarAlerta('¡Éxito!', result.message, true);
                if (modo === 'editar') {
                    cambiarVista('consultar');
                    patientResult.classList.add('hidden');
                    searchPatientForm.reset();
                } else {
                    patientForm.reset();
                }
            } else {
                mostrarAlerta('Error', result.message, false);
            }
        } catch (error) {
            mostrarAlerta('Error de Conexión', 'No se pudo conectar con el servidor.', false);
        }
    });

    // --- LÓGICA PARA BUSCAR UN PACIENTE ---
    searchPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        patientResult.classList.add('hidden');
        const cedula = document.getElementById('searchCedula').value;

        try {
            const response = await fetch(`http://localhost:3000/api/pacientes/${cedula}`, {
                credentials: 'include' // <-- CORRECCIÓN
            });
            const result = await response.json();

            if (response.ok) {
                pacienteActual = result.paciente;
                // ... Llenar la tarjeta con los datos ...
                document.getElementById('resultNombre').textContent = pacienteActual.nombre;
                document.getElementById('resultApellido').textContent = pacienteActual.apellido;
                document.getElementById('resultCedula').textContent = pacienteActual.cedula;
                document.getElementById('resultTelefono').textContent = pacienteActual.telefono;
                document.getElementById('resultEmail').textContent = pacienteActual.email;
                document.getElementById('resultDireccion').textContent = pacienteActual.direccion;
                document.getElementById('resultFechaNacimiento').textContent = new Date(pacienteActual.fecha_nacimiento).toLocaleDateString('es-CO', {timeZone: 'UTC'});
                patientResult.classList.remove('hidden');
            } else {
                mostrarAlerta('No Encontrado', result.message, false);
            }
        } catch (error) {
            mostrarAlerta('Error de Conexión', 'No se pudo conectar con el servidor.', false);
        }
    });
    
    // --- LÓGICA DE BOTONES DE ACCIÓN ---
    btnActualizar.addEventListener('click', () => {
        if (!pacienteActual) return;
        prepararFormularioParaEditar(pacienteActual);
        cambiarVista('ingresar');
    });

    btnEliminar.addEventListener('click', () => {
        if (!pacienteActual) return;
        mostrarConfirmacion(
            'Eliminar Paciente',
            `¿Estás seguro de que deseas eliminar a ${pacienteActual.nombre} ${pacienteActual.apellido}?`,
            'confirm-cancel',
            () => eliminarPaciente(pacienteActual.id_paciente)
        );
    });

    // --- FUNCIONES AUXILIARES ---
    function prepararFormularioParaEditar(paciente) {
        patientForm.dataset.mode = 'editar';
        patientForm.dataset.id = paciente.id_paciente;
        formTitle.textContent = 'Actualizar Información del Paciente';
        formSubmitButton.textContent = 'Guardar Cambios';
        // ... Llenar el formulario con los datos del paciente ...
        document.getElementById('nombrePaciente').value = paciente.nombre;
        document.getElementById('apellidoPaciente').value = paciente.apellido;
        document.getElementById('cedulaPaciente').value = paciente.cedula;
        document.getElementById('telefonoPaciente').value = paciente.telefono;
        document.getElementById('emailPaciente').value = paciente.email;
        document.getElementById('direccionPaciente').value = paciente.direccion;
        document.getElementById('fechaNacimientoPaciente').value = new Date(paciente.fecha_nacimiento).toISOString().split('T')[0];
    }

    function prepararFormularioParaCrear() {
        patientForm.dataset.mode = 'crear';
        patientForm.removeAttribute('data-id');
        formTitle.textContent = 'Ingreso del paciente';
        formSubmitButton.textContent = 'Enviar';
        patientForm.reset();
    }
    
    async function eliminarPaciente(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/pacientes/${id}`, {
                method: 'DELETE',
                credentials: 'include' // <-- CORRECCIÓN
            });
            const result = await response.json();
            
            if (response.ok) {
                mostrarAlerta('¡Éxito!', result.message, true);
                patientResult.classList.add('hidden');
                searchPatientForm.reset();
            } else {
                mostrarAlerta('Acción no Permitida', result.message, false);
            }
        } catch (error) {
            mostrarAlerta('Error de Conexión', 'No se pudo conectar con el servidor.', false);
        }
    }
    
    // --- INICIALIZACIÓN ---
    cambiarVista('ingresar');
});