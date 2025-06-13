// backend/models/Product.js
const sql = require('mssql');
const dbConfig = require('../config/database');

class Product {
    static async findAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM [Product]');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findById(productId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .query('SELECT * FROM [Product] WHERE ProductId = @ProductId');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByCategory(categoryId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('CategoryId', sql.Int, categoryId)
                .query('SELECT * FROM [Product] WHERE CategoryId = @CategoryId');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async create(productData) {
        try {
            const code = productData.productCode || productData.ProductCode;
            const name = productData.name || productData.Name;
            const description = productData.description || productData.Description;
            const categoryId = productData.categoryId || productData.CategoryId;
            const minimumStock = productData.minimumStock || productData.MinimumStock;
            if (!code || code.trim() === '') {
                throw new Error('El código de producto es obligatorio');
            }
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductCode', sql.VarChar(50), code.trim())
                .input('Name', sql.VarChar(100), name || '')
                .input('Description', sql.Text, description || '')
                .input('CategoryId', sql.Int, categoryId)
                .input('MinimumStock', sql.Int, minimumStock || 0)
                .input('CreatedAt', sql.DateTime, new Date())
                .query(`
                    INSERT INTO [Product] (ProductCode, Name, Description, CategoryId, MinimumStock, CreatedAt)
                    OUTPUT INSERTED.*
                    VALUES (@ProductCode, @Name, @Description, @CategoryId, @MinimumStock, @CreatedAt)
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en Product.create:', error, error?.message, error?.stack, error?.sqlMessage);
            throw error;
        }
    }

    static async update(productId, productData) {
        try {
            const code = productData.productCode || productData.ProductCode;
            const name = productData.name || productData.Name;
            const description = productData.description || productData.Description;
            const categoryId = productData.categoryId || productData.CategoryId;
            const minimumStock = productData.minimumStock || productData.MinimumStock;
            console.log('Product.update - id:', productId);
            console.log('Product.update - data:', { code, name, description, categoryId, minimumStock });
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .input('ProductCode', sql.VarChar(50), code)
                .input('Name', sql.VarChar(100), name)
                .input('Description', sql.Text, description)
                .input('CategoryId', sql.Int, categoryId)
                .input('MinimumStock', sql.Int, minimumStock)
                .query(`
                    UPDATE [Product]
                    SET ProductCode = @ProductCode,
                        Name = @Name,
                        Description = @Description,
                        CategoryId = @CategoryId,
                        MinimumStock = @MinimumStock
                    OUTPUT INSERTED.*
                    WHERE ProductId = @ProductId
                `);
            console.log('Product.update - resultado:', result.recordset[0]);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en Product.update:', error, error?.message, error?.stack, error?.sqlMessage);
            throw error;
        }
    }

    static async delete(productId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('ProductId', sql.Int, productId)
                .query('DELETE FROM [Product] WHERE ProductId = @ProductId');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async findByCodeOrName(query) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('query', sql.VarChar(100), `%${query}%`)
                .query(`
                    SELECT * FROM [Product]
                    WHERE ProductCode LIKE @query OR Name LIKE @query
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Product;