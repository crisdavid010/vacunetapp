// js/menu.js

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcomeModal');
    const closeButton = document.querySelector('#welcomeModal .close-button');
    const closeModalButton = document.getElementById('closeModalButton');

    if (!modal || !closeButton || !closeModalButton) {
        console.error("No se encontraron los elementos del modal de bienvenida.");
        return; 
    }

    // --- LÓGICA DE VISUALIZACIÓN EN EL NAVEGADOR ---
    // Revisa si existe la "nota" en la memoria de la sesión
    if (sessionStorage.getItem('showWelcomeMessage') === 'true') {
        // Si existe, muestra el modal
        modal.classList.add('visible');

        // Y lo más importante: borra la "nota" para que no vuelva a aparecer
        sessionStorage.removeItem('showWelcomeMessage');
    }

    // --- LÓGICA PARA CERRAR EL MODAL ---
    function closeModal() {
        modal.classList.remove('visible');
    }

    closeButton.addEventListener('click', closeModal);
    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });
});