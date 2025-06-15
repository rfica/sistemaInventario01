// backend/controllers/periodController.js

const { sql, poolPromise } = require('../config/db'); // Importar sql y poolPromise desde la configuración de la base de datos

// Función para obtener los períodos cerrados
exports.getClosedPeriods = async (req, res) => {
 try {
 console.log('--- Iniciando getClosedPeriods ---');
 console.log('Ejecutando consulta SQL: SELECT MonthYear FROM ClosedPeriod');
 const pool = await poolPromise; // Obtener una conexión del pool
 const result = await pool.request().query('SELECT MonthYear FROM ClosedPeriod'); // Ejecutar la consulta usando el request del pool
 console.log('Resultado de la consulta SQL para getClosedPeriods:', result.recordset);
 
 // Asegurarse de que result.recordset es un array antes de enviarlo
 if (result && Array.isArray(result.recordset)) {
 res.json(result.recordset); // Envía los resultados como JSON
 } else {
 console.log('La consulta SQL no devolvió un recordset válido.');
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
 console.log('--- Iniciando closePeriod ---');
 const { monthYear } = req.body; // Obtiene monthYear del cuerpo de la solicitud
 // Asumiendo que el ID del usuario autenticado está en req.user.UserId
 // Esto depende de tu middleware de autenticación.
 const userId = req.user ? req.user.userId : null; // Obtiene el ID del usuario (manejar caso sin autenticación si aplica)

 // Validar que monthYear fue proporcionado y tiene el formato esperado 'YYYY-MM'
 console.log(`Datos recibidos: { monthYear: "${monthYear}", userId: ${userId} }`);
 if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
 console.warn('Validación fallida: Formato de mes y año inválido.');
 return res.status(400).send('Formato de mes y año inválido. Debe ser YYYY-MM.');
 }
 // Validar que hay un usuario autenticado si es necesario para la lógica de negocio
 if (!userId) {
 return res.status(401).send('Usuario no autenticado.'); // O el código de estado apropiado
 }

 try {
 console.log('Verificando si el período ya está cerrado con MonthYear:', monthYear);

 // 1. Verificar si el período ya está cerrado
    const pool = await poolPromise; // Obtener una conexión del pool
    const checkResult = await pool.request().input('monthYear', sql.VarChar, monthYear).query('SELECT COUNT(*) AS count FROM ClosedPeriod WHERE MonthYear = @monthYear'); // Usar parámetros para seguridad
 console.log('Ejecutando consulta SQL para verificar período cerrado...');
    console.log('Resultado de la verificación de período cerrado:', checkResult.recordset[0].count);

 if (checkResult.recordset[0].count > 0) {
 console.warn(`El período ${monthYear} ya ha sido cerrado.`);
 return res.status(400).send(`El período ${monthYear} ya ha sido cerrado.`);
 }

 // 2. Si no está cerrado, insertar el nuevo registro
 // Usamos un request seguro para prevenir inyección SQL
 console.log('El período no está cerrado. Ejecutando consulta SQL INSERT...');
 const insertResult = await sql.query`INSERT INTO ClosedPeriod (MonthYear, ClosedBy, ClosedAt) VALUES (${monthYear}, ${userId}, GETDATE())`;
    console.log('Resultado de la inserción:', insertResult);

 // Verificar si la inserción fue exitosa
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
 console.error('--- Error en closePeriod ---', err);
 res.status(500).send('Error interno del servidor al cerrar el período.');
 }
  console.log('Finalizando closePeriod.');
};

// Función utilitaria para verificar si un período está cerrado
exports.isPeriodClosed = async (monthYear) => {
 console.log(`--- Verificando si el período ${monthYear} está cerrado ---`);
 if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
 console.warn(`Validación de formato fallida para isPeriodClosed: ${monthYear}`);
 return false; // Considerar formato inválido como no cerrado o manejar como error
 }

 try {
 const pool = await poolPromise;
 const result = await pool.request()
 .input('monthYear', sql.VarChar, monthYear)
 .query('SELECT COUNT(*) AS count FROM ClosedPeriod WHERE MonthYear = @monthYear');
 return result.recordset[0].count > 0;
 } catch (err) {
 console.error(`Error al verificar si el período ${monthYear} está cerrado:`, err.message, err.stack);
 throw new Error('Error al verificar estado del período.'); // Relanzar o manejar el error según necesites
 }
};