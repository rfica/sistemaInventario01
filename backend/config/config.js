// backend/config/config.js
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    name: process.env.DB_NAME || 'InventarioDigital',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Poly.9800', // Cambia si usas otra
    host: process.env.DB_HOST || 'localhost',         // Cambia por tu host real si estás en Azure
    dialect: 'mssql',
    encrypt: true,
    trustServerCertificate: true,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES || '24h'
  }
};
