// backend/controllers/periodController.js

const sql = require('mssql'); // Asumiendo que estás usando la librería mssql

// Función para obtener los períodos cerrados
exports.getClosedPeriods = async (req, res) => {
 try {
    console.log('Iniciando getClosedPeriods...');
 // Asegúrate de que la conexión a la base de datos está establecida antes de ejecutar la consulta
 // Si tienes un módulo de conexión a la base de datos, deberías usarlo aquí.
 // Ejemplo: const pool = await require('../config/database');
 // const result = await pool.request().query('SELECT MonthYear FROM ClosedPeriod');

 // Si estás usando sql.query directamente, asegúrate de que la configuración global esté lista.
 console.log('Ejecutando consulta SQL para obtener períodos cerrados...');
 const result = await sql.query('SELECT MonthYear FROM ClosedPeriod');
 console.log('Consulta SQL de getClosedPeriods ejecutada. Resultados:', result);

 // Asegurarse de que result.recordset es un array antes de enviarlo
 if (result && Array.isArray(result.recordset)) {
 res.json(result.recordset); // Envía los resultados como JSON
 } else {
 // Si no hay recordset o no es un array, devolver un array vacío
 res.json([]);
 }
    console.log('Finalizando getClosedPeriods exitosamente.');
 } catch (err) {
    console.error('Error en getClosedPeriods:', err.message, err.stack); // Log más detallado del error
 // Podrías querer enviar un mensaje más detallado en desarrollo, pero en producción es mejor ser genérico.
 res.status(500).send('Error interno del servidor al obtener períodos cerrados.');
    console.log('Finalizando getClosedPeriods con error.');
 }
};

// Función para cerrar un período
exports.closePeriod = async (req, res) => {
  console.log('Iniciando closePeriod...');
 const { monthYear } = req.body; // Obtiene monthYear del cuerpo de la solicitud
 // Asumiendo que el ID del usuario autenticado está en req.user.UserId
 // Esto depende de tu middleware de autenticación.
 const userId = req.user ? req.user.UserId : null; // Obtiene el ID del usuario (manejar caso sin autenticación si aplica)

 // Validar que monthYear fue proporcionado y tiene el formato esperado 'YYYY-MM'
 console.log(`Intentando cerrar período: ${monthYear} por usuario: ${userId}`);
 if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
 console.warn('Validación fallida: Formato de mes y año inválido.');
 return res.status(400).send('Formato de mes y año inválido. Debe ser YYYY-MM.');
 }
 // Validar que hay un usuario autenticado si es necesario para la lógica de negocio
 if (!userId) {
 return res.status(401).send('Usuario no autenticado.'); // O el código de estado apropiado
 }

 try {
 // Asegúrate de que la conexión a la base de datos está establecida
    console.log('Verificando si el período ya está cerrado...');

 // 1. Verificar si el período ya está cerrado
 const checkResult = await sql.query`SELECT COUNT(*) AS count FROM ClosedPeriod WHERE MonthYear = ${monthYear}`;
    console.log('Resultado de la verificación de período cerrado:', checkResult.recordset[0].count);

 if (checkResult.recordset[0].count > 0) {
 console.warn(`El período ${monthYear} ya ha sido cerrado.`);
 return res.status(400).send(`El período ${monthYear} ya ha sido cerrado.`);
 }

 // 2. Si no está cerrado, insertar el nuevo registro
 // Usamos un request seguro para prevenir inyección SQL
    console.log('El período no está cerrado. Procediendo a insertar...');
 const insertResult = await sql.query`INSERT INTO ClosedPeriod (MonthYear, ClosedBy, ClosedAt) VALUES (${monthYear}, ${userId}, GETDATE())`;
    console.log('Resultado de la inserción:', insertResult);

 // Verificar si la inserción fue exitosa (por ejemplo, si insertó 1 fila)
 if (insertResult.rowsAffected && insertResult.rowsAffected[0] === 1) {
 res.status(201).send(`Período ${monthYear} cerrado exitosamente.`);
      console.log(`Período ${monthYear} cerrado exitosamente.`);
 } else {
 // Esto podría indicar un problema, aunque la consulta no lanzó un error.
 console.error('Fallo al cerrar el período: rowsAffected indica problema', insertResult);
 res.status(500).send('Error interno del servidor al cerrar el período.');
      console.log('Finalizando closePeriod con error interno.');
 }


 } catch (err) {
 console.error('Error en closePeriod:', err);
 res.status(500).send('Error interno del servidor al cerrar el período.');
 }
  console.log('Finalizando closePeriod.');
};