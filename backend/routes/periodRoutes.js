const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController'); // Asegúrate de que la ruta sea correcta

// Ruta para obtener los períodos cerrados
router.get('/closed', periodController.getClosedPeriods);

// Ruta para cerrar un período
router.post('/close', periodController.closePeriod);

module.exports = router;