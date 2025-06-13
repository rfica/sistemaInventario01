// backend/config/config.js
module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  database: {
    name: process.env.DB_NAME || 'InventarioDigital',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'your_password',
    host: process.env.DB_HOST || 'localhost',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES || '24h'
  }
};