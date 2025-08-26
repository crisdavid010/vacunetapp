// js/login.js

// Seleccionar el formulario y el párrafo de error
const loginForm = document.getElementById('loginForm');
const errorParagraph = document.querySelector('p.incorrecta'); // Seleccionamos el párrafo con la clase 'incorrecta'

loginForm.addEventListener('submit', async function(event) {
  //    Prevenir el envío tradicional del formulario
  event.preventDefault();

  // Ocultar cualquier mensaje de error anterior
  errorParagraph.style.display = 'none'; 

  // Obtener los valores de los inputs
  const cedula = document.getElementById('adminName').value;
  const password = document.getElementById('password').value;

  //  Enviar los datos a nuestra API usando fetch
  try {
    // Asegúrate de que esta URL sea la correcta para tu backend
    const apiUrl = 'http://localhost:3000/api/login'; // Para Node.js o caulquier backend
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cedula: cedula, password: password })
    });

    const result = await response.json();

    //  Reaccionar a la respuesta de la API
    if (result.success) {
      alert('¡Bienvenido! Inicio de sesión correcto.');
      // Redirigir al panel de administrador
      // window.location.href = 'panelAdmin.html';
    } else {
      // Mostrar el mensaje de error que viene de la API
      errorParagraph.textContent = result.message || 'Contraseña o cédula incorrecta';
      errorParagraph.style.display = 'block'; // Hacer visible el mensaje
    }

  } catch (error) {
    console.error('Error al conectar con la API:', error);
    errorParagraph.textContent = 'Error de conexión con el servidor.';
    errorParagraph.style.display = 'block';
  }
});