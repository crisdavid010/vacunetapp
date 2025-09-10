// js/validar-certificado.js

document.addEventListener('DOMContentLoaded', () => {
    const validarForm = document.getElementById('validarCertificadoForm');
    const cedulaInput = document.getElementById('cedulaUsuario');

    if (validarForm) {
        validarForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita que la página se recargue

            const cedula = cedulaInput.value;
            if (!cedula) {
                // La función mostrarAlerta viene de main.js
                mostrarAlerta('Atención', 'Por favor, ingresa un número de cédula.', false);
                return;
            }

            // Simplemente abrimos la página de vista, pasando la CÉDULA en la URL
            window.open(`certificado-vista.html?cedula=${cedula}`, '_blank');
        });
    }
});