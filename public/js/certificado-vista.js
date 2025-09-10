// js/certificado-vista.js

function renderCertificate(data) {
    // Rellenar datos del paciente
    document.getElementById("fullName").innerText = `${data.nombre} ${data.apellido}`;
    document.getElementById("documentNumber").innerText = data.cedula;
    document.getElementById("issuedDate").innerText = new Date().toLocaleDateString("es-CO");

    // Rellenar la tabla con TODAS las dosis de vacunación
    const tbody = document.getElementById("vaccineRows");
    tbody.innerHTML = ""; 

    if (data.dosis && data.dosis.length > 0) {
        data.dosis.forEach(dosis => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${new Date(dosis.fecha_aplicacion).toLocaleDateString("es-CO")}</td>
                <td>${dosis.nombre_vacuna}</td>
                <td>${dosis.fabricante}</td>
                <td>${dosis.numero_lote || '(No asignado)'}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999">No hay dosis registradas</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. CORRECCIÓN: Obtener la CÉDULA de la URL, no el id_cita
    const params = new URLSearchParams(window.location.search);
    const cedula = params.get('cedula');

    if (!cedula) {
        document.body.innerHTML = "<h1>Error: No se ha especificado una cédula de paciente.</h1>";
        return;
    }

    // 2. Llamar a la nueva API para obtener todos los datos del certificado
    try {
        const response = await fetch(`http://localhost:3000/api/certificados/paciente/${cedula}`);
        const result = await response.json();

        if (result.success) {
            // 3. Renderizar el certificado con los datos del paciente y su array de dosis
            renderCertificate(result.certificado);
        } else {
            document.body.innerHTML = `<h1>Error: ${result.message}</h1>`;
        }
    } catch (error) {
        document.body.innerHTML = "<h1>Error de conexión con el servidor.</h1>";
    }

    // --- LÓGICA DE LOS BOTONES DE ACCIÓN (se mantiene igual) ---
    const printButton = document.getElementById('btnPrint');
    if(printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }

    const downloadButton = document.getElementById('btnDownloadImage');
    const certificateDiv = document.getElementById('certificado-div');
    if(downloadButton && certificateDiv) {
        downloadButton.addEventListener('click', () => {
            html2canvas(certificateDiv, { scale: 2 }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Certificado_${document.getElementById("documentNumber").innerText}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }
});