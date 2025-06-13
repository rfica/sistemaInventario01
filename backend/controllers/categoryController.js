const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

exports.create = async (req, res) => {
  try {
    let name = req.body.name || req.body.Name;
    let description = req.body.description || req.body.Description;
    name = typeof name === 'string' ? name.trim() : '';
    description = typeof description === 'string' ? description.trim() : '';
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    let name = req.body.name || req.body.Name;
    let description = req.body.description || req.body.Description;
    name = typeof name === 'string' ? name.trim() : '';
    description = typeof description === 'string' ? description.trim() : '';
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    
    const updatedCategory = await Category.update(id, { name, description });
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Intentando borrar categoría con id:', id);
    const category = await Category.findById(id);
    if (!category) {
      console.log('Categoría no encontrada');
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    const productos = await Product.findByCategory(id);
    if (productos && productos.length > 0) {
      console.log('No se puede eliminar, productos asociados:', productos.length);
      return res.status(400).json({ message: 'No se puede eliminar la categoría porque existen productos asociados.' });
    }
    const deleted = await Category.delete(id);
    console.log('Resultado de borrado:', deleted);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: 'No se pudo eliminar la categoría.' });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
}; 