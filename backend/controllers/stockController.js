const { validationResult } = require('express-validator');
const StockMovement = require('../models/StockMovement');
const { isPeriodClosed } = require('./periodController');

exports.addStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación en addStock:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            ProductId, Quantity, DocumentNumber, AccountingDate, Unit, Amount, LineNumber, Description, CreatedAt, Type
        } = req.body;
        const userId = req.user?.userId;
        console.log('addStock - Datos recibidos:', req.body);

        // Validar que el producto existe
        const productExists = await StockMovement.checkProductExists(ProductId);
        if (!productExists) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Validar campos obligatorios
        if (!ProductId || !Quantity || !userId || !AccountingDate) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const accountingDate = new Date(AccountingDate);
        const monthYear = `${accountingDate.getUTCFullYear()}-${(accountingDate.getUTCMonth() + 1).toString().padStart(2, '0')}`; // Format as YYYY-MM using UTC

        const closed = await isPeriodClosed(monthYear);
        if (closed) {
            return res.status(400).json({ message: 'No se permiten movimientos de inventario en un período cerrado.' });
        }

        // Registrar entrada
        const movementId = await StockMovement.create({
            ProductId,
            Quantity,
            Type: Type || '01', // 01 para ingreso
            DocumentNumber,
            AccountingDate,
            UserId: userId,
            Unit,
            Amount,
            LineNumber,
            Description,
            CreatedAt
        });

        res.status(201).json({ 
            message: 'Entrada de stock registrada correctamente',
            movementId
        });
    } catch (error) {
        console.error('Error en addStock:', error);
        res.status(500).json({ message: 'Error al registrar entrada de stock', detalle: error.message });
    }
};

exports.removeStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación en removeStock:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            ProductId, Quantity, DocumentNumber, AccountingDate, Unit, Amount, LineNumber, Description, CreatedAt, Type
        } = req.body;
        const userId = req.user?.userId;
        console.log('removeStock - Datos recibidos:', req.body);

        // Validar que el producto existe
        const productExists = await StockMovement.checkProductExists(ProductId);
        if (!productExists) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Validar stock suficiente
        const currentStock = await StockMovement.getCurrentStock(ProductId);
        if (currentStock < Quantity) {
            return res.status(400).json({ 
                message: 'Stock insuficiente',
                currentStock,
                requiredQuantity: Quantity
            });
        }

        // Validar campos obligatorios
        if (!ProductId || !Quantity || !userId || !AccountingDate) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const accountingDate = new Date(AccountingDate);
        const monthYear = `${accountingDate.getUTCFear()}-${(accountingDate.getUTCMonth() + 1).toString().padStart(2, '0')}`; // Format as YYYY-MM using UTC

        const closed = await isPeriodClosed(monthYear);
        if (closed) {
            return res.status(400).json({ message: 'No se permiten movimientos de inventario en un período cerrado.' });
        }

        // Registrar salida o anulación
        const movementType = Type || '03'; // 03 para consumo, 04 para anulación
        const movementId = await StockMovement.create({
            ProductId,
            Quantity,
            Type: movementType,
            DocumentNumber,
            AccountingDate,
            UserId: userId,
            Unit,
            Amount,
            LineNumber,
            Description,
            CreatedAt
        });

        res.status(201).json({ 
            message: 'Salida de stock registrada correctamente',
            movementId
        });
    } catch (error) {
        console.error('Error en removeStock:', error);
        res.status(500).json({ message: 'Error al registrar salida de stock', detalle: error.message });
    }
};

exports.listMovements = async (req, res) => {
    try {
        const movements = await StockMovement.list();
        const plainMovements = movements.map(mov => ({ ...mov }));
        res.json(plainMovements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener movimientos de stock' });
    }
};

exports.getMovement = async (req, res) => {
    try {
        const movement = await StockMovement.getById(req.params.id);
        if (!movement) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }
        res.json({ ...movement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el movimiento' });
    }
};

exports.deleteMovement = async (req, res) => {
    try {
        // Verificar que el movimiento existe
        const movement = await StockMovement.getById(req.params.id);
        if (!movement) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        // Eliminar (borrado lógico)
        await StockMovement.delete(req.params.id);
        res.json({ message: 'Movimiento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el movimiento' });
    }
};