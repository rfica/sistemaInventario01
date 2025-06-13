// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { sequelize } = require('./config/database');
const config = require('./config/config');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a SQL Server establecida correctamente.');
    return sequelize.sync(); // Sincronizar modelos
  })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
  })
  .catch(err => {
    console.error('Error al conectar a SQL Server:', err);
  });

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

// Iniciar servidor
const PORT = config.server.port || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});