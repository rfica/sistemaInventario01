const sql = require('mssql');
const dbConfig = require('../config/database');

class StockMovement {
    static async create(movementData) {
        try {
            // Validaciones mínimas
            if (!movementData.ProductId) throw new Error('ProductId es requerido');
            if (!movementData.Quantity) throw new Error('Quantity es requerido');
            if (!movementData.Type) throw new Error('Type es requerido');
            if (!movementData.UserId) throw new Error('UserId es requerido');
            if (!movementData.AccountingDate) throw new Error('AccountingDate es requerido');

            console.log('StockMovement.create - Datos recibidos:', movementData);
            console.log('StockMovement.create - Parámetros enviados:', {
                ProductId: movementData.ProductId,
                Quantity: movementData.Quantity,
                Type: movementData.Type,
                Unit: movementData.Unit || null,
                Amount: movementData.Amount || null,
                DocumentNumber: movementData.DocumentNumber || null,
                LineNumber: movementData.LineNumber || null,
                AccountingDate: movementData.AccountingDate,
                UserId: movementData.UserId,
                Description: movementData.Description || null,
                CreatedAt: movementData.CreatedAt || new Date()
            });

            console.log('StockMovement.create - Value of AccountingDate before SQL query:', movementData.AccountingDate, 'Type:', typeof movementData.AccountingDate);
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, movementData.ProductId)
                .input('Quantity', sql.Int, movementData.Quantity)
                .input('Type', sql.VarChar(2), movementData.Type)
                .input('Unit', sql.VarChar(50), movementData.Unit || null)
                .input('Amount', sql.Decimal(18,2), movementData.Amount || null)
                .input('DocumentNumber', sql.NVarChar(50), movementData.DocumentNumber || null)
                .input('LineNumber', sql.Int, movementData.LineNumber || null)
                .input('AccountingDate', sql.DateTime, movementData.AccountingDate)
                .input('UserId', sql.Int, movementData.UserId)
                .input('Description', sql.Text, movementData.Description || null)
                .input('CreatedAt', sql.DateTime, movementData.CreatedAt || new Date())
                .query(`
                    INSERT INTO StockMovement 
                    (ProductId, Quantity, Type, Unit, Amount, DocumentNumber, LineNumber, AccountingDate, UserId, Description, CreatedAt)
                    OUTPUT INSERTED.MovementId
                    VALUES 
                    (@ProductId, @Quantity, @Type, @Unit, @Amount, @DocumentNumber, @LineNumber, @AccountingDate, @UserId, @Description, @CreatedAt)
                `);
            console.log('StockMovement.create - Resultado SQL:', result);
            if (!result.recordset || result.recordset.length === 0) {
                console.error('StockMovement.create - No se insertó ningún registro.');
            } else {
                console.log('StockMovement.create - Movimiento insertado:', result.recordset[0]);
            }
            return result.recordset[0]?.MovementId;
        } catch (error) {
            console.error('Error en StockMovement.create:', error);
            throw error;
        }
    }

    static async list() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query(`
                    SELECT sm.*, p.ProductCode, u.Username 
                    FROM StockMovement sm
                    LEFT JOIN Product p ON sm.ProductId = p.ProductId
                    LEFT JOIN [User] u ON sm.UserId = u.UserId
                    ORDER BY sm.AccountingDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getById(movementId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('MovementId', sql.Int, movementId)
                .query(`
                    SELECT * FROM StockMovement 
                    WHERE MovementId = @MovementId
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(movementId) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('MovementId', sql.Int, movementId)
                .query(`
                    DELETE FROM StockMovement 
                    WHERE MovementId = @MovementId
                `);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async getCurrentStock(productId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .query(`
                    SELECT 
                        SUM(CASE WHEN Type = '01' THEN Quantity ELSE -Quantity END) AS CurrentStock
                    FROM StockMovement
                    WHERE ProductId = @ProductId
                `);
            return result.recordset[0].CurrentStock || 0;
        } catch (error) {
            throw error;
        }
    }

    static async checkProductExists(productId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .query('SELECT 1 FROM Product WHERE ProductId = @ProductId');
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async hasMovements(productId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .query('SELECT TOP 1 1 FROM StockMovement WHERE ProductId = @ProductId');
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = StockMovement;