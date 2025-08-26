// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // <-- 1. IMPORTAMOS BCRYPT

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vacunetapp'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado exitosamente a la base de datos MySQL.');
});

// La ruta de nuestra API para el login (VERSIÓN SEGURA) utilizando bcrypt metodo Final, no solo utilizamos hash sino que comparamos con bcrypt
app.post('/api/login', (req, res) => {
  const { cedula, password } = req.body;

  if (!cedula || !password) {
    return res.status(400).json({ success: false, message: 'Cédula y contraseña son requeridas.' });
  }

  const query = 'SELECT * FROM administradores WHERE cedula = ?';
  db.query(query, [cedula], async (err, results) => { // <-- 2. AÑADIMOS ASYNC
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }

    if (results.length === 0) {
      // Usamos el mismo mensaje para no dar pistas a atacantes
      return res.json({ success: false, message: 'Credenciales incorrectas.' });
    }

    const admin = results[0];

    // <-- ESTA ES LA LÓGICA DE SEGURIDAD CORREGIDA
    try {
      // Comparamos la contraseña enviada con el hash de la base de datos
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);

      if (passwordMatch) {
        // Si las contraseñas coinciden, el inicio de sesión es exitoso
        res.json({ success: true, message: 'Inicio de sesión exitoso.' });
      } else {
        // Si no coinciden, las credenciales son incorrectas
        res.json({ success: false, message: 'Credenciales incorrectas.' });
      }
    } catch (compareError) {
      console.error("Error al comparar contraseñas:", compareError);
      res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor API VacunetApp corriendo en http://localhost:${PORT}`);
});