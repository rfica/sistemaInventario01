require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const dbConfig = require('./config/database');
const sql = require('mssql');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const stockRoutes = require('./routes/stockRoutes');
const periodRoutes = require('./routes/periodRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/periods', periodRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente', status: 'OK' });
});

// Comentado temporalmente hasta que el frontend esté construido
// const buildPath = path.join(__dirname, '../frontend/build');
// app.use(express.static(buildPath));

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        // Probar la conexión a la base de datos
        const pool = await sql.connect(dbConfig);
        console.log('✅ Conectado exitosamente a SQL Server');
        
        // Iniciar el servidor
        const port = config.port;
        app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
            console.log(`📝 API disponible en http://localhost:${port}/api`);
        });
    } catch (err) {
        console.error('❌ Error al iniciar el servidor:', err);
        process.exit(1);
    }
}

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
    process.exit(1);
});

startServer();
