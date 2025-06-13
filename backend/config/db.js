// backend/config/db.js
const sql = require('mssql');
require('dotenv').config(); // permite usar archivo .env

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || 'Poly.9800',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'InventarioDigital',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false, // para entorno local, desactivamos
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('[SQL SERVER] Conectado exitosamente');
    return pool;
  })
  .catch(err => {
    console.log('[SQL SERVER] Error de conexión:', err);
  });

module.exports = { sql, poolPromise };
