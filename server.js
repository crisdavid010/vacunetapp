// =============================================================
// SERVIDOR PRINCIPAL DE LA API PARA VACUNET (VERSIÓN FINAL)
// =============================================================

console.log("--- INICIANDO SERVIDOR VACUNET 1.0 ---");

// 1. IMPORTACIÓN DE MÓDULOS
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();



// 2. CONFIGURACIÓN INICIAL DE EXPRESS
app.use(express.static('public'));
const allowedOrigins = ['http://localhost', 'http://127.0.0.1:5500', 'http://localhost:5500'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('La política de CORS para este sitio no permite acceso.'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 3. SECRETO PARA JWT
const JWT_SECRET = 'este-es-un-secreto-muy-largo-y-dificil-de-adivinar-para-vacunet';

// 4. CONFIGURACIÓN DE LA BASE DE DATOS
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vacunetapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
});

// ===============================================
// MIDDLEWARE DE SEGURIDAD
// ===============================================
const protegerRutaAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401); // No autorizado
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.rol !== 'admin') return res.sendStatus(403); // Prohibido
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.sendStatus(401);
    }
};

// ===============================================
// RUTAS DE LA API
// ===============================================

// --- RUTAS PÚBLICAS (NO REQUIEREN LOGIN) ---
app.post('/api/login', async (req, res) => {
    try {
        const { cedula, password } = req.body;
        if (!cedula || !password) return res.status(400).json({ success: false, message: 'Cédula y contraseña son requeridas.' });

        const query = 'SELECT * FROM administradores WHERE cedula = ?';
        const [results] = await db.query(query, [cedula]);

        if (results.length === 0) return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });

        const admin = results[0];
        const passwordMatch = await bcrypt.compare(password, admin.password_hash);

        if (passwordMatch) {
            const payload = { id: admin.id_admin, rol: admin.rol };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 8 * 60 * 60 * 1000
            });
            res.json({ success: true, message: 'Inicio de sesión exitoso.', rol: admin.rol });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.get('/api/vacunas', async (req, res) => {
    try {
        const query = 'SELECT id_vacunas, nombre, fabricante FROM vacunas ORDER BY nombre';
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error("Error al obtener vacunas:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA ÚNICA Y MEJORADA PARA GENERAR CERTIFICADO POR CÉDULA ---
app.get('/api/certificados/paciente/:cedula', async (req, res) => {
    const { cedula } = req.params;
    try {
        // 1. Obtenemos los datos básicos del paciente
        const pacienteQuery = 'SELECT nombre, apellido, cedula, fecha_nacimiento FROM paciente WHERE cedula = ?';
        const [pacientes] = await db.query(pacienteQuery, [cedula]);

        if (pacientes.length === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
        }
        const pacienteData = pacientes[0];

        // 2. Obtenemos TODAS las dosis completadas de ese paciente
        const dosisQuery = `
            SELECT 
                ci.fecha_hora AS fecha_aplicacion,
                v.nombre AS nombre_vacuna,
                v.fabricante,
                li.numero_lote
            FROM cita AS ci
            JOIN vacunas AS v ON ci.id_vacuna_tipo = v.id_vacunas
            LEFT JOIN lotes_inventario AS li ON ci.id_lote_asignado = li.id_lote_inventario
            WHERE ci.paciente = (SELECT id_paciente FROM paciente WHERE cedula = ?) 
            AND ci.status = 'completada'
            ORDER BY ci.fecha_hora ASC;
        `;
        const [dosisData] = await db.query(dosisQuery, [cedula]);

        if (dosisData.length === 0) {
            return res.status(404).json({ success: false, message: 'El paciente no tiene vacunas registradas como completadas.' });
        }

        // 3. Devolvemos un solo objeto con los datos del paciente y su lista de dosis
        res.json({
            success: true,
            certificado: {
                ...pacienteData,
                dosis: dosisData
            }
        });

    } catch (error) {
        console.error("Error al generar el certificado completo:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// --- RUTA DE VERIFICACIÓN DE AUTH (PROTEGIDA) ---
app.get('/api/auth/status', protegerRutaAdmin, (req, res) => {
    res.json({ success: true, usuario: req.usuario });
});


// --- RUTAS DE PACIENTES (PROTEGIDAS) ---
app.post('/api/pacientes', protegerRutaAdmin, async (req, res) => {
    try {
        const { nombre, apellido, cedula, telefono, email, direccion, fecha_nacimiento } = req.body;
        if (!nombre || !apellido || !cedula) return res.status(400).json({ success: false, message: 'Nombre, apellido y cédula son requeridos.' });
        const query = 'INSERT INTO paciente (nombre, apellido, cedula, telefono, email, direccion, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [nombre, apellido, cedula, telefono, email, direccion, fecha_nacimiento]);
        res.status(201).json({ success: true, message: 'Paciente registrado exitosamente.', pacienteId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Ya existe un paciente con esa cédula.' });
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.get('/api/pacientes/:cedula', protegerRutaAdmin, async (req, res) => {
    try {
        const { cedula } = req.params;
        const [results] = await db.query('SELECT * FROM paciente WHERE cedula = ?', [cedula]);
        if (results.length > 0) res.json({ success: true, paciente: results[0] });
        else res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.put('/api/pacientes/:id', protegerRutaAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, cedula, telefono, email, direccion, fecha_nacimiento } = req.body;
        if (!nombre || !apellido || !cedula) return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
        const query = 'UPDATE paciente SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, email = ?, direccion = ?, fecha_nacimiento = ? WHERE id_paciente = ?';
        const [result] = await db.query(query, [nombre, apellido, cedula, telefono, email, direccion, fecha_nacimiento, id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
        res.json({ success: true, message: 'Paciente actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.delete('/api/pacientes/:id', protegerRutaAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT COUNT(*) AS total_citas FROM cita WHERE paciente = ?', [id]);
        if (rows[0].total_citas > 0) {
            return res.status(409).json({ success: false, message: `No se puede eliminar. El paciente tiene ${rows[0].total_citas} cita(s) programada(s).` });
        }
        const [deleteResult] = await db.query('DELETE FROM paciente WHERE id_paciente = ?', [id]);
        if (deleteResult.affectedRows === 0) return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
        res.json({ success: true, message: 'Paciente eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});


// --- RUTAS DE INVENTARIO (PROTEGIDAS) ---
app.get('/api/lotes', protegerRutaAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const countQuery = 'SELECT COUNT(*) AS total FROM lotes_inventario;';
        const dataQuery = `SELECT li.id_lote_inventario, v.nombre AS nombre_vacuna, li.numero_lote, li.cantidad_disponible, li.fecha_caducidad
                        FROM lotes_inventario AS li JOIN vacunas AS v ON li.id_vacuna_tipo = v.id_vacunas
                        ORDER BY li.fecha_caducidad ASC LIMIT ? OFFSET ?;`;
        const [results] = await db.query(countQuery + dataQuery, [limit, offset]);
        const totalPages = Math.ceil(results[0][0].total / limit);
        res.json({ data: results[1], pagination: { currentPage: page, totalPages: totalPages } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});

app.get('/api/lotes/:id', protegerRutaAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.query('SELECT * FROM lotes_inventario WHERE id_lote_inventario = ?', [id]);
        if (results.length === 0) return res.status(404).json({ success: false, message: "Lote no encontrado." });
        res.json({ success: true, lote: results[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.post('/api/lotes', protegerRutaAdmin, async (req, res) => {
    try {
        const { id_vacuna_tipo, numero_lote, cantidad_disponible, fecha_caducidad } = req.body;
        if (!id_vacuna_tipo || !numero_lote || !cantidad_disponible || !fecha_caducidad) return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
        await db.query('INSERT INTO lotes_inventario (id_vacuna_tipo, numero_lote, cantidad_disponible, fecha_caducidad) VALUES (?, ?, ?, ?)', [id_vacuna_tipo, numero_lote, cantidad_disponible, fecha_caducidad]);
        res.status(201).json({ success: true, message: 'Lote ingresado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.put('/api/lotes/:id', protegerRutaAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { id_vacuna_tipo, numero_lote, cantidad_disponible, fecha_caducidad } = req.body;
        if (!id_vacuna_tipo || !numero_lote || !cantidad_disponible || !fecha_caducidad) return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
        const [result] = await db.query('UPDATE lotes_inventario SET id_vacuna_tipo = ?, numero_lote = ?, cantidad_disponible = ?, fecha_caducidad = ? WHERE id_lote_inventario = ?', [id_vacuna_tipo, numero_lote, cantidad_disponible, fecha_caducidad, id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Lote no encontrado.' });
        res.json({ success: true, message: 'Lote actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});


// --- RUTAS DE CITAS (PROTEGIDAS) ---
const archivarCitasPerdidas = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const [citasPerdidas] = await connection.query("SELECT * FROM cita WHERE status = 'pendiente' AND fecha_hora < NOW()");
        if (citasPerdidas.length > 0) {
            for (const cita of citasPerdidas) {
                await connection.query('INSERT INTO citas_perdidas (id_cita_original, paciente, fecha_hora, id_vacuna_tipo, numero_dosis_aplicada) VALUES (?, ?, ?, ?, ?)', [cita.id_cita, cita.paciente, cita.fecha_hora, cita.id_vacuna_tipo, cita.numero_dosis_aplicada]);
                await connection.query('DELETE FROM cita WHERE id_cita = ?', [cita.id_cita]);
            }
        }
        await connection.commit();
    } catch (error) {
        if (connection) await connection.rollback();
    } finally {
        if (connection) connection.release();
    }
};

app.get('/api/citas', protegerRutaAdmin, async (req, res) => {
    try {
        await archivarCitasPerdidas();
        const query = `SELECT c.id_cita, c.fecha_hora, c.status, p.nombre AS nombre_paciente, p.apellido AS apellido_paciente, v.nombre AS nombre_vacuna
                    FROM cita AS c JOIN paciente AS p ON c.paciente = p.id_paciente JOIN vacunas AS v ON c.id_vacuna_tipo = v.id_vacunas
                    WHERE c.status = 'pendiente' ORDER BY c.fecha_hora ASC;`;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

app.post('/api/citas', protegerRutaAdmin, async (req, res) => {
    try {
        const { cedula, fecha_hora, vacunas_ids } = req.body;
        if (!cedula || !fecha_hora || !vacunas_ids || !vacunas_ids.length) return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
        const [pacientes] = await db.query('SELECT id_paciente FROM paciente WHERE cedula = ?', [cedula]);
        if (pacientes.length === 0) return res.status(404).json({ success: false, message: 'No se encontró un paciente con esa cédula.' });
        const id_paciente = pacientes[0].id_paciente;
        const query = 'INSERT INTO cita (paciente, fecha_hora, id_vacuna_tipo, numero_dosis_aplicada, status) VALUES (?, ?, ?, ?, ?)';
        for (const id_vacuna of vacunas_ids) {
            await db.query(query, [id_paciente, fecha_hora, id_vacuna, 1, 'pendiente']);
        }
        res.status(201).json({ success: true, message: 'Cita(s) agendada(s) exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor al agendar la cita.' });
    }
});

app.put('/api/citas/:id/completar', protegerRutaAdmin, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [updateResult] = await connection.query("UPDATE cita SET status = 'completada' WHERE id_cita = ?", [id]);
        if (updateResult.affectedRows === 0) throw new Error('Cita no encontrada');
        await connection.query('INSERT INTO certificado (id_cita_origen, fecha_envio) VALUES (?, NOW())', [id]);
        await connection.commit();
        res.json({ success: true, message: 'Cita marcada como completada y certificado generado.' });
    } catch (error) {
        await connection.rollback();
        res.status(error.message === 'Cita no encontrada' ? 404 : 500).json({ success: false, message: error.message || 'Error en el servidor.' });
    } finally {
        connection.release();
    }
});

app.put('/api/citas/:id/cancelar', protegerRutaAdmin, async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.query('SELECT * FROM cita WHERE id_cita = ?', [id]);
        if (rows.length === 0) throw new Error('Cita no encontrada');
        const citaParaMover = rows[0];
        await connection.query('INSERT INTO citas_canceladas (id_cita_original, paciente, fecha_hora, id_vacuna_tipo, numero_dosis_aplicada) VALUES (?, ?, ?, ?, ?)', [citaParaMover.id_cita, citaParaMover.paciente, citaParaMover.fecha_hora, citaParaMover.id_vacuna_tipo, citaParaMover.numero_dosis_aplicada]);
        await connection.query('DELETE FROM cita WHERE id_cita = ?', [id]);
        await connection.commit();
        res.json({ success: true, message: 'Cita cancelada y archivada correctamente.' });
    } catch (error) {
        await connection.rollback();
        res.status(error.message === 'Cita no encontrada' ? 404 : 500).json({ success: false, message: error.message || 'Error en el servidor.' });
    } finally {
        connection.release();
    }
});


// ===============================================
// RUTAS DE INFORMES (PROTEGIDAS)
// ===============================================

// --- RUTA PARA INFORME MENSUAL ---
app.post('/api/informes/mensual', protegerRutaAdmin, async (req, res) => {
    try {
        const { fecha } = req.body;
        if (!fecha) {
            return res.status(400).json({ success: false, message: 'La fecha es requerida.' });
        }

        const targetDate = new Date(fecha);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1; // getMonth() es 0-11, MySQL es 1-12

        const query = `
            SELECT 
                v.nombre AS nombre_vacuna,
                COUNT(c.id_cita) AS total_aplicadas
            FROM cita AS c
            JOIN vacunas AS v ON c.id_vacuna_tipo = v.id_vacunas
            WHERE 
                c.status = 'completada' AND
                YEAR(c.fecha_hora) = ? AND 
                MONTH(c.fecha_hora) = ?
            GROUP BY v.nombre
            ORDER BY total_aplicadas DESC;
        `;

        const [results] = await db.query(query, [year, month]);

        res.json({ 
            success: true, 
            reportData: results,
            periodo: { mes: month, anio: year }
        });

    } catch (error) {
        console.error("Error al generar informe mensual:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA INFORME SEMESTRAL ---
app.post('/api/informes/semestral', protegerRutaAdmin, async (req, res) => {
    try {
        const { anio, semestre } = req.body;
        if (!anio || !semestre) {
            return res.status(400).json({ success: false, message: 'Año y semestre son requeridos.' });
        }

        const mesInicio = (semestre == 1) ? 1 : 7;
        const mesFin = (semestre == 1) ? 6 : 12;

        const query = `
            SELECT v.nombre AS nombre_vacuna, COUNT(c.id_cita) AS total_aplicadas
            FROM cita AS c JOIN vacunas AS v ON c.id_vacuna_tipo = v.id_vacunas
            WHERE c.status = 'completada' AND YEAR(c.fecha_hora) = ? AND MONTH(c.fecha_hora) BETWEEN ? AND ?
            GROUP BY v.nombre ORDER BY total_aplicadas DESC;
        `;
        const [results] = await db.query(query, [anio, mesInicio, mesFin]);
        res.json({ success: true, reportData: results, periodo: `${semestre}º Semestre de ${anio}` });
    } catch (error) {
        console.error("Error al generar informe semestral:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA INFORME ANUAL ---
app.post('/api/informes/anual', protegerRutaAdmin, async (req, res) => {
    try {
        const { anio } = req.body;
        if (!anio) {
            return res.status(400).json({ success: false, message: 'El año es requerido.' });
        }
        const query = `
            SELECT v.nombre AS nombre_vacuna, COUNT(c.id_cita) AS total_aplicadas
            FROM cita AS c JOIN vacunas AS v ON c.id_vacuna_tipo = v.id_vacunas
            WHERE c.status = 'completada' AND YEAR(c.fecha_hora) = ?
            GROUP BY v.nombre ORDER BY total_aplicadas DESC;
        `;
        const [results] = await db.query(query, [anio]);
        res.json({ success: true, reportData: results, periodo: `Año ${anio}` });
    } catch (error) {
        console.error("Error al generar informe anual:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});


// 6. INICIAR EL SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});