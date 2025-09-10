// js/informes.js
document.addEventListener('DOMContentLoaded', () => {
    // Selectores de Vistas y Botones
    const vistas = {
        mensual: document.getElementById('vistaMensual'),
        semestral: document.getElementById('vistaSemestral'),
        anual: document.getElementById('vistaAnual')
    };
    const botones = {
        mensual: document.getElementById('btnMensual'),
        semestral: document.getElementById('btnSemestral'),
        anual: document.getElementById('btnAnual')
    };

    // Selectores de Formularios
    const formMensual = document.getElementById('formMensual');
    const formSemestral = document.getElementById('formSemestral');
    const formAnual = document.getElementById('formAnual');
    const reportResultDiv = document.getElementById('reportResult');

    // --- LÓGICA DE VISTAS (TABS) ---
    function cambiarVista(vistaActiva) {
        Object.keys(vistas).forEach(key => {
            vistas[key].classList.add('hidden');
            botones[key].classList.remove('active');
        });
        vistas[vistaActiva].classList.remove('hidden');
        botones[vistaActiva].classList.add('active');
        reportResultDiv.classList.add('hidden'); // Ocultar resultados al cambiar de vista
    }

    botones.mensual.addEventListener('click', () => cambiarVista('mensual'));
    botones.semestral.addEventListener('click', () => cambiarVista('semestral'));
    botones.anual.addEventListener('click', () => cambiarVista('anual'));

    // --- LÓGICA DE FORMULARIOS ---
    formMensual.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fecha = document.getElementById('fechaMensual').value;
        const response = await fetch('http://localhost:3000/api/informes/mensual', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha })
        });
        const result = await response.json();
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const periodo = `${meses[result.periodo.mes - 1]} de ${result.periodo.anio}`;
        handleResponse(result, periodo);
    });

    formSemestral.addEventListener('submit', async (event) => {
        event.preventDefault();
        const anio = document.getElementById('anioSemestral').value;
        const semestre = document.getElementById('semestre').value;
        const response = await fetch('http://localhost:3000/api/informes/semestral', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anio, semestre })
        });
        const result = await response.json();
        handleResponse(result, result.periodo);
    });

    formAnual.addEventListener('submit', async (event) => {
        event.preventDefault();
        const anio = document.getElementById('anioAnual').value;
        const response = await fetch('http://localhost:3000/api/informes/anual', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anio })
        });
        const result = await response.json();
        handleResponse(result, result.periodo);
       
    });
    
    // --- FUNCIÓN PARA MANEJAR RESPUESTAS Y RENDERIZAR TABLA ---
    function handleResponse(result, periodo) {
        if (result.success) {
            renderReport(result.reportData, periodo);
        } else {
            reportResultDiv.innerHTML = `<p class="mensaje-error">${result.message}</p>`;
            reportResultDiv.classList.remove('hidden');
        }
    }

    function renderReport(data, periodo) {
        if (data.length === 0) {
            reportResultDiv.innerHTML = `<h4>Informe para ${periodo}</h4><p>No se encontraron vacunas aplicadas en este periodo.</p>`;
            reportResultDiv.classList.remove('hidden');
            return;
        }

        let totalGeneral = 0;
        let tableHTML = `
            <h4>Informe de Vacunas Aplicadas - ${periodo}</h4>
            <table class="report-table">
                <thead>
                    <tr><th>Tipo de Vacuna</th><th>Cantidad Aplicada</th></tr>
                </thead>
                <tbody>
        `;
        data.forEach(item => {
            tableHTML += `<tr><td>${item.nombre_vacuna}</td><td>${item.total_aplicadas}</td></tr>`;
            totalGeneral += item.total_aplicadas;
        });
        tableHTML += `
                </tbody>
                <tfoot><tr><th>Total General</th><th>${totalGeneral}</th></tr></tfoot>
            </table>
        `;
        reportResultDiv.innerHTML = tableHTML;
        reportResultDiv.classList.remove('hidden');
    }
});