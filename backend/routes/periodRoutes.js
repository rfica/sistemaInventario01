const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController'); // Asegúrate de que la ruta sea correcta
const authMiddleware = require('../middleware/auth'); // Asumiendo que auth.js es tu middleware de autenticación
const roleMiddleware = require('../middleware/roleMiddleware'); // Importar el nuevo middleware de rol

// Middleware para logging de solicitud en el router de períodos
router.use((req, res, next) => {
    console.log('➡️ Period Router received request:', req.method, req.url);
    next();
});
// Ruta para obtener los períodos cerrados
router.get('/closed', periodController.getClosedPeriods);
// Todas las rutas que requieran autenticación deben usar el middleware aquí
router.post('/closePeriod', authMiddleware, roleMiddleware([1]), periodController.closePeriod); // Aplicar el middleware de rol (asumiendo RoleId 1)
module.exports = router;