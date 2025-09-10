document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // SELECTORES DE ELEMENTOS DEL DOM
    // =================================================
    const btnVerInventario = document.getElementById('btnVerInventario');
    const btnIngresarLote = document.getElementById('btnIngresarLote');
    const vistaInventario = document.getElementById('vistaInventario');
    const vistaIngresoLote = document.getElementById('vistaIngresoLote');
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const loteForm = document.getElementById('loteForm');
    const vacunaSelect = document.getElementById('id_vacuna_tipo');
    const formTitle = vistaIngresoLote.querySelector('.blockTittle p');
    const formButton = loteForm.querySelector('button[type="submit"]');
    const paginationControls = document.getElementById('pagination-controls');

    const LOTES_PER_PAGE = 5; // Define cuántos lotes quieres ver por página

    // =================================================
    // LÓGICA DE VISTAS (TABS)
    // =================================================
    function cambiarVista(vista) {
        if (vista === 'inventario') {
            vistaInventario.classList.remove('hidden');
            vistaIngresoLote.classList.add('hidden');
            btnVerInventario.classList.add('active');
            btnIngresarLote.classList.remove('active');
            prepararFormularioParaCrear(); // Resetea el form al volver a la vista principal
            cargarInventario(); // Carga la primera página del inventario
        } else if (vista === 'ingreso') {
            vistaInventario.classList.add('hidden');
            vistaIngresoLote.classList.remove('hidden');
            btnVerInventario.classList.remove('active');
            btnIngresarLote.classList.add('active');
        }
    }

    btnVerInventario.addEventListener('click', () => cambiarVista('inventario'));
    btnIngresarLote.addEventListener('click', () => {
        prepararFormularioParaCrear();
        cambiarVista('ingreso');
    });

    // =================================================
    // CARGA DE DATOS Y PAGINACIÓN
    // =================================================
    async function cargarInventario(page = 1) {
    try {
        const response = await fetch(`http://localhost:3000/api/lotes?page=${page}&limit=${LOTES_PER_PAGE}`, {
    credentials: 'include' 
});
        
        // AÑADIMOS ESTA VERIFICACIÓN CRÍTICA
        if (!response.ok) {
            // Si la respuesta no fue exitosa (ej. error 404 o 500), lanza un error
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        console.log('Respuesta recibida del servidor:', result); 
        
        inventoryTableBody.innerHTML = '';
        const lotes = result.data;

        // Ahora esta sección es segura
        if (lotes.length === 0 && page === 1) {
            inventoryTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay lotes en el inventario.</td></tr>`;
        } else {
            lotes.forEach(lote => {
                const tr = document.createElement('tr');
                const fechaCaducidad = new Date(lote.fecha_caducidad);
                const hoy = new Date();
                const diferenciaDias = (fechaCaducidad - hoy) / (1000 * 60 * 60 * 24);

                if (diferenciaDias < 30 && diferenciaDias >= 0) {
                    tr.classList.add('lote-por-vencer');
                }

                tr.innerHTML = `
                    <td>${lote.nombre_vacuna}</td>
                    <td>${lote.numero_lote}</td>
                    <td class="${lote.cantidad_disponible <= 20 ? 'lote-pocas-dosis' : ''}">${lote.cantidad_disponible}</td>
                    <td>${fechaCaducidad.toLocaleDateString('es-CO', {timeZone: 'UTC'})}</td>
                    <td>
                        <button class="action-btn-edit" data-id="${lote.id_lote_inventario}">Editar</button>
                    </td>
                `;
                inventoryTableBody.appendChild(tr);
            });
        }
        
        renderPaginationControls(result.pagination);

    } catch (error) {
        console.error("Error al cargar inventario:", error);
        inventoryTableBody.innerHTML = `<tr><td colspan="5" class="error">Error al cargar el inventario. Revise la consola del servidor.</td></tr>`;
    }
}
    
    function renderPaginationControls({ currentPage, totalPages }) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled = false) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.dataset.page = page;
            button.disabled = isDisabled;
            return button;
        };

        paginationControls.appendChild(createButton('« Anterior', currentPage - 1, currentPage === 1));

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createButton(i, i);
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            paginationControls.appendChild(pageButton);
        }
        
        paginationControls.appendChild(createButton('Siguiente »', currentPage + 1, currentPage === totalPages));
    }

    paginationControls.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.dataset.page) {
            const page = parseInt(event.target.dataset.page);
            cargarInventario(page);
        }
    });

    async function cargarTiposDeVacuna() {
        try {
            const response = await fetch('http://localhost:3000/api/vacunas');
            const vacunas = await response.json();
            vacunaSelect.innerHTML = '<option value="">-- Seleccione un tipo de vacuna --</option>';
            vacunas.forEach(vacuna => {
                const option = document.createElement('option');
                option.value = vacuna.id_vacunas;
                option.textContent = `${vacuna.nombre} (${vacuna.fabricante})`;
                vacunaSelect.appendChild(option);
            });
        } catch (error) {
            vacunaSelect.innerHTML = '<option value="">Error al cargar vacunas</option>';
        }
    }
    
    const vacunasCargadasPromise = cargarTiposDeVacuna();

    // =================================================
    // LÓGICA DEL FORMULARIO (CREAR Y ACTUALIZAR)
    // =================================================
    loteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(loteForm);
        const data = Object.fromEntries(formData.entries());
        
        const modo = loteForm.dataset.mode || 'crear';
        const id = loteForm.dataset.id;
        
        let url = 'http://localhost:3000/api/lotes';
        let method = 'POST';

        if (modo === 'editar') {
            url = `http://localhost:3000/api/lotes/${id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success) {
                mostrarAlerta('¡Éxito!', result.message, true);
                cambiarVista('inventario');
            } else {
                mostrarAlerta('Error', result.message, false);
            }
        } catch (error) {
            mostrarAlerta('Error de Conexión', 'No se pudo conectar al servidor.', false);
        }
    });

    // =================================================
    // LÓGICA PARA INICIAR LA EDICIÓN
    // =================================================
    inventoryTableBody.addEventListener('click', async (event) => {
        if (event.target && event.target.classList.contains('action-btn-edit')) {
            await vacunasCargadasPromise; // Asegura que las vacunas estén cargadas
            const id = event.target.dataset.id;
            try {
                const response = await fetch(`http://localhost:3000/api/lotes/${id}`);
                const result = await response.json();
                if(result.success) {
                    prepararFormularioParaEditar(result.lote);
                    cambiarVista('ingreso');
                } else {
                    mostrarAlerta('Error', result.message, false);
                }
            } catch (error) {
                mostrarAlerta('Error de Conexión', 'No se pudo obtener los datos del lote.', false);
            }
        }
    });

    // =================================================
    // FUNCIONES AUXILIARES
    // =================================================
    function prepararFormularioParaEditar(lote) {
        loteForm.dataset.mode = 'editar';
        loteForm.dataset.id = lote.id_lote_inventario;
        formTitle.textContent = 'Actualizar Lote de Vacuna';
        formButton.textContent = 'Guardar Cambios';

        // Rellenar el formulario
        vacunaSelect.value = lote.id_vacuna_tipo;
        document.getElementById('numero_lote').value = lote.numero_lote;
        document.getElementById('cantidad_disponible').value = lote.cantidad_disponible;
        document.getElementById('fecha_caducidad').value = new Date(lote.fecha_caducidad).toISOString().split('T')[0];
    }

    function prepararFormularioParaCrear() {
        loteForm.dataset.mode = 'crear';
        loteForm.removeAttribute('data-id');
        formTitle.textContent = 'Ingresar Nuevo Lote de Vacuna';
        formButton.textContent = 'Guardar Lote';
        loteForm.reset();
    }

    // =================================================
    // INICIALIZACIÓN
    // =================================================
    cambiarVista('inventario');
});