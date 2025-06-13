const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const stockController = require('../controllers/stockController');
const verifyToken = require('../middleware/authMiddleware');

// Validaciones comunes
const movementValidations = [
    check('ProductId').isInt().withMessage('ProductId debe ser un número entero'),
    check('Quantity').isInt({ min: 1 }).withMessage('Quantity debe ser un entero mayor a 0'),
    check('DocumentNumber').optional().isString().trim().isLength({ max: 50 }),
    check('AccountingDate').optional().isISO8601().toDate()
];

// Registrar entrada
router.post('/add', 
    verifyToken, 
    movementValidations,
    stockController.addStock
);

// Registrar salida
router.post('/remove', 
    verifyToken, 
    movementValidations,
    stockController.removeStock
);

// Listar movimientos
router.get('/', 
    verifyToken,
    stockController.listMovements
);

// Obtener movimiento específico
router.get('/:id', 
    verifyToken,
    check('id').isInt(),
    stockController.getMovement
);

// Eliminar movimiento (borrado lógico)
router.delete('/:id',
    verifyToken,
    check('id').isInt(),
    stockController.deleteMovement
);

module.exports = router;