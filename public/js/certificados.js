// js/certificados.js
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchCertificadoForm');
    const cedulaInput = document.getElementById('searchCedula');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cedula = cedulaInput.value;
        if (!cedula) {
            mostrarAlerta('Error', 'Por favor, ingrese un número de cédula.', false);
            return;
        }

        // Simplemente abrimos la página de vista, pasando la CÉDULA en la URL
        window.open(`certificado-vista.html?cedula=${cedula}`, '_blank');
    });
});