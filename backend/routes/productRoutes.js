// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Validaciones
const productValidations = [
  // Nombre
  check('Name').if((value, { req }) => !req.body.name).notEmpty().withMessage('El nombre es requerido'),
  check('name').if((value, { req }) => !req.body.Name).notEmpty().withMessage('El nombre es requerido'),
  check('Name').optional().isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  check('name').optional().isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

  // Descripción
  check('Description').optional().isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),
  check('description').optional().isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),

  // Categoría
  check('CategoryId').if((value, { req }) => !req.body.categoryId).isInt({ min: 1 }).withMessage('La categoría es requerida'),
  check('categoryId').if((value, { req }) => !req.body.CategoryId).isInt({ min: 1 }).withMessage('La categoría es requerida'),

  // Stock mínimo
  check('MinimumStock').if((value, { req }) => !req.body.minimumStock).isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo'),
  check('minimumStock').if((value, { req }) => !req.body.MinimumStock).isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo')
];

// Todas las rutas requieren autenticación JWT
router.use(authMiddleware);

// Rutas CRUD
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.post('/', productValidations, productController.createProduct);
router.put('/:id', productValidations, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;