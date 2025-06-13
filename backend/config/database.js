// backend/config/database.js
const sql = require('mssql');
const config = require('./config');

const dbConfig = {
    user: config.database.user,
    password: config.database.password,
    server: config.database.host,
    database: config.database.name,
    options: {
        encrypt: config.database.encrypt,
        trustServerCertificate: config.database.trustServerCertificate
    }
};

// Crear un pool de conexiones
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('❌ Error en el pool de conexiones:', err);
});

// Función para obtener una conexión del pool
async function getConnection() {
    try {
        await poolConnect;
        return pool;
    } catch (err) {
        console.error('❌ Error al obtener conexión:', err);
        throw err;
    }
}

// Probar la conexión
getConnection()
    .then(() => console.log('✅ Conectado exitosamente a SQL Server'))
    .catch(err => console.error('❌ Error al conectar a SQL Server:', err));

module.exports = dbConfig;
