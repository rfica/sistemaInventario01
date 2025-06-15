// backend/controllers/productController.js
const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// Listar todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    let products = await Product.findAll();

    // Para cada producto, obtener su stock actual y agregarlo a la respuesta
    products = await Promise.all(products.map(async (product) => {
      const currentStock = await StockMovement.getCurrentStock(product.ProductId);
      console.log(`Stock actual para producto ${product.ProductId}: ${currentStock}`);
      // Ensure we return a plain object with all necessary properties and the currentStock
      return {
        productId: product.ProductId,
        productCode: product.ProductCode,
        name: product.Name,
        description: product.Description,
        categoryId: product.CategoryId,
        minimumStock: product.MinimumStock,
        createdAt: product.CreatedAt, // Include CreatedAt
        currentStock: currentStock
      };
    }));
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

// Buscar productos por nombre, código o categoría
exports.searchProducts = async (req, res) => {
  try {
    const { query, CategoryId } = req.query;
    let products;

    if (query) {
      products = await Product.findByCodeOrName(query);
    } else if (CategoryId) {
      products = await Product.findByCategory(CategoryId);
    } else {
      products = await Product.findAll();
    }

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ success: false, message: 'Error al buscar productos' });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { productCode, name, description, categoryId, minimumStock } = req.body;
    if (!productCode || productCode.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'El código de producto es obligatorio.' 
      });
    }
    const newProduct = await Product.create({
      ProductCode: productCode.trim(),
      Name: name,
      Description: description,
      CategoryId: categoryId,
      MinimumStock: minimumStock
    });
    res.status(201).json({ 
      success: true, 
      data: newProduct,
      message: 'Producto creado exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear producto:', error, error?.message, error?.stack, error?.sqlMessage);
    res.status(400).json({ 
      success: false, 
      message: 'Error al crear producto', 
      detalle: error.message,
      error: error
    });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { productCode, name, description, categoryId, minimumStock } = req.body;
    console.log('Datos recibidos en updateProduct:', req.body);
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    // Validación: No permitir cambiar el código del producto
    if (productCode && productCode !== product.ProductCode) {
 return res.status(400).json({
 success: false, 
 message: 'No se puede cambiar el código del producto.' });
    }
    const updatedProduct = await Product.update(id, {
      ProductCode: productCode,
      Name: name,
      Description: description,
      CategoryId: categoryId,
      MinimumStock: minimumStock
    });
    console.log('Producto actualizado:', updatedProduct);
    res.json({ 
      success: true, 
      data: updatedProduct,
      message: 'Producto actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar producto' 
    });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }
    
    // Validación: No permitir eliminar si tiene movimientos de inventario (independientemente del stock final)
    const hasMovements = await StockMovement.hasMovements(id);
    if (hasMovements) {
 // Obtener el stock actual para incluirlo en el mensaje
 const currentStock = await StockMovement.getCurrentStock(id);
 return res.status(400).json({
 success: false,
 message: `No se puede eliminar el producto ${product.Name} porque tiene movimientos de inventario asociados. Stock actual: ${currentStock}`
      });
    }

    await Product.delete(id);
    res.json({ 
      success: true, 
      message: 'Producto eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar producto' 
    });
  }
};