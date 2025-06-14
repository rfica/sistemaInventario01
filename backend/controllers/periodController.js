// backend/controllers/periodController.js

const sql = require('mssql'); // Asumiendo que estás usando la librería mssql

// Función para obtener los períodos cerrados
exports.getClosedPeriods = async (req, res) => {
 try {
 // Asegúrate de que la conexión a la base de datos está establecida antes de ejecutar la consulta
 // Si tienes un módulo de conexión a la base de datos, deberías usarlo aquí.
 // Ejemplo: const pool = await require('../config/database');
 // const result = await pool.request().query('SELECT MonthYear FROM ClosedPeriod');

 // Si estás usando sql.query directamente, asegúrate de que la configuración global esté lista.
 const result = await sql.query('SELECT MonthYear FROM ClosedPeriod');

 // Asegurarse de que result.recordset es un array antes de enviarlo
 if (result && Array.isArray(result.recordset)) {
 res.json(result.recordset); // Envía los resultados como JSON
 } else {
 // Si no hay recordset o no es un array, devolver un array vacío
 res.json([]);
 }
 } catch (err) {
 console.error('Error al obtener períodos cerrados:', err);
 // Podrías querer enviar un mensaje más detallado en desarrollo, pero en producción es mejor ser genérico.
 res.status(500).send('Error interno del servidor al obtener períodos cerrados.');
 }
};

// Función para cerrar un período
exports.closePeriod = async (req, res) => {
 const { monthYear } = req.body; // Obtiene monthYear del cuerpo de la solicitud
 // Asumiendo que el ID del usuario autenticado está en req.user.UserId
 // Esto depende de tu middleware de autenticación.
 const userId = req.user ? req.user.UserId : null; // Obtiene el ID del usuario (manejar caso sin autenticación si aplica)

 // Validar que monthYear fue proporcionado y tiene el formato esperado 'YYYY-MM'
 if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
 return res.status(400).send('Formato de mes y año inválido. Debe ser YYYY-MM.');
 }

 // Validar que hay un usuario autenticado si es necesario para la lógica de negocio
 if (!userId) {
 return res.status(401).send('Usuario no autenticado.'); // O el código de estado apropiado
 }

 try {
 // Asegúrate de que la conexión a la base de datos está establecida

 // 1. Verificar si el período ya está cerrado
 const checkResult = await sql.query`SELECT COUNT(*) AS count FROM ClosedPeriod WHERE MonthYear = ${monthYear}`;

 if (checkResult.recordset[0].count > 0) {
 return res.status(400).send(`El período ${monthYear} ya ha sido cerrado.`);
 }

 // 2. Si no está cerrado, insertar el nuevo registro
 // Usamos un request seguro para prevenir inyección SQL
 const insertResult = await sql.query`INSERT INTO ClosedPeriod (MonthYear, ClosedBy, ClosedAt) VALUES (${monthYear}, ${userId}, GETDATE())`;

 // Verificar si la inserción fue exitosa (por ejemplo, si insertó 1 fila)
 if (insertResult.rowsAffected && insertResult.rowsAffected[0] === 1) {
 res.status(201).send(`Período ${monthYear} cerrado exitosamente.`);
 } else {
 // Esto podría indicar un problema, aunque la consulta no lanzó un error.
 console.error('Error al insertar en ClosedPeriod: rowsAffected indica problema', insertResult);
 res.status(500).send('Error interno del servidor al cerrar el período.');
 }


 } catch (err) {
 console.error('Error en closePeriod:', err);
 res.status(500).send('Error interno del servidor al cerrar el período.');
 }
};