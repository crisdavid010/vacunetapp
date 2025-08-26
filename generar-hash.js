// generar-hash.js
const bcrypt = require('bcrypt');

const password = 'admin123'; // La contraseña que quieres usar
const saltRounds = 10; // Un estándar de seguridad para el "costo" del hash

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error("Error al generar el hash:", err);
    return;
  }
  console.log('Tu nueva contraseña hasheada es:');
  console.log(hash);
});