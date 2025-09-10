// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorParagraph = document.querySelector('p.incorrecta');

    if (!loginForm) {
        console.error('Error: No se encontró el formulario con id "loginForm".');
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        if(errorParagraph) errorParagraph.style.display = 'none'; 

        const cedula = document.getElementById('adminName').value;
        const password = document.getElementById('password').value;

        try {
            const apiUrl = 'http://localhost:3000/api/login';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cedula: cedula, password: password }),
                credentials: 'include' 
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('showWelcomeMessage', 'true');
                if (result.rol === 'admin') {
                    window.location.href = 'menu.html';
                } else if (result.rol === 'usuario') {
                    window.location.href = 'paciente.html';
                } else {
                    alert('Rol no reconocido.');
                }
            } else {
                if(errorParagraph) {
                    errorParagraph.textContent = result.message || 'Contraseña o cédula incorrecta';
                    errorParagraph.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error al conectar con la API:', error);
            if(errorParagraph) {
                errorParagraph.textContent = 'Error de conexión con el servidor.';
                errorParagraph.style.display = 'block';
            }
        }
    });
});