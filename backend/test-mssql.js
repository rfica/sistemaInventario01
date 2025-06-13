const sql = require('mssql');
const dbConfig = require('./config/database');

async function testQuery() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT TOP 10 * FROM StockMovement');
    console.log('Resultado de la consulta StockMovement:', result.recordset);
    process.exit(0);
  } catch (error) {
    console.error('Error al consultar StockMovement:', error);
    process.exit(1);
  }
}

testQuery(); 