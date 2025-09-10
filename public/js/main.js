// js/main.js

/**
 * Muestra un modal de alerta simple (éxito o error).
 * @param {string} titulo - El título del modal.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {boolean} esExito - True para ícono de éxito, false para error.
 */
function mostrarAlerta(titulo, mensaje, esExito) {
    const modal = document.getElementById('alertaModal');
    if (!modal) return;

    const modalIcon = document.getElementById('alerta-icon');
    const modalTitle = document.getElementById('alerta-title');
    const modalMessage = document.getElementById('alerta-message');

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensaje;
    modalIcon.innerHTML = esExito ? `<span class="material-symbols-outlined">check_circle</span>` : `<span class="material-symbols-outlined">error</span>`;
    modalIcon.className = esExito ? 'success' : 'error';
    modal.classList.add('visible');
}

/**
 * Muestra un modal de confirmación con botones Sí/No.
 * @param {string} titulo - El título del modal.
 * @param {string} texto - La pregunta de confirmación.
 * @param {string} confirmClass - Clase CSS para el botón de confirmación (ej. 'confirm-cancel').
 * @param {function} callback - La función a ejecutar si el usuario presiona "Sí".
 */
function mostrarConfirmacion(titulo, texto, confirmClass, callback) {
    const confirmModal = document.getElementById('confirmacionAccionModal');
    if (!confirmModal) return;

    const confirmTitle = document.getElementById('confirm-modal-title');
    const confirmText = document.getElementById('confirm-modal-text');
    const btnConfirmYes = document.getElementById('confirm-btn-yes');

    confirmTitle.textContent = titulo;
    confirmText.textContent = texto;
    btnConfirmYes.className = 'modal-button';
    btnConfirmYes.classList.add(confirmClass);
    confirmModal.classList.add('visible');

    btnConfirmYes.onclick = () => {
        callback();
        confirmModal.classList.remove('visible');
    };
}

// --- LÓGICA PARA CERRAR LOS MODALES ---
document.addEventListener('DOMContentLoaded', () => {
    // Selectores
    const alertaModal = document.getElementById('alertaModal');
    const alertaButton = document.getElementById('alerta-button');
    const alertaCloseSpan = document.getElementById('alertaClose');

    const confirmModal = document.getElementById('confirmacionAccionModal');
    const btnConfirmNo = document.getElementById('confirm-btn-no');

    // Eventos de cierre
    if (alertaButton) alertaButton.addEventListener('click', () => alertaModal.classList.remove('visible'));
    if (alertaCloseSpan) alertaCloseSpan.addEventListener('click', () => alertaModal.classList.remove('visible'));
    if (btnConfirmNo) btnConfirmNo.addEventListener('click', () => confirmModal.classList.remove('visible'));
});