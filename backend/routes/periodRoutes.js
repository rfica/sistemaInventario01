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
// Aplicar autenticación y middleware de rol a la ruta de cierre de período
router.post('/closePeriod', authMiddleware, roleMiddleware([2]), periodController.closePeriod); // Aplicar el middleware de rol para RoleId 2
module.exports = router;