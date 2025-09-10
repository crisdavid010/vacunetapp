// js/auth-guard.js

// Esta es una función que se ejecuta a sí misma automáticamente (IIFE)
(async function () {
    try {
        // AQUÍ SE UBICA EL FETCH
        // Llama a la API para verificar si el usuario es un administrador válido
        const response = await fetch('http://localhost:3000/api/auth/status', {            
            method: 'GET',
            credentials: 'include' // Necesario para enviar las cookies
        });

        // Si la respuesta no es exitosa (ej. 401, 403), el usuario no tiene permiso
        if (!response.ok) {
            // Se le redirige inmediatamente a la página de login
            window.location.href = 'sesionAdmin.html';
        }
        
        // Si la respuesta es exitosa, no se hace nada y la página protegida carga normalmente.

    } catch (error) {
        // Si hay un error de conexión, también se le redirige por seguridad
        console.error('Error de autenticación:', error);
        window.location.href = 'sesionAdmin.html';
    }
})();