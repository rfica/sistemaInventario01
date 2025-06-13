const sql = require('mssql');
const dbConfig = require('../config/database');

class Category {
    static async findAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM [Category]');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findById(categoryId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('categoryId', sql.Int, categoryId)
                .query('SELECT * FROM [Category] WHERE categoryId = @categoryId');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(categoryData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('name', sql.VarChar(100), categoryData.name || '')
                .input('description', sql.Text, categoryData.description || '')
                .query(`
                    INSERT INTO [Category] (name, description)
                    OUTPUT INSERTED.*
                    VALUES (@name, @description)
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(categoryId, categoryData) {
        try {
            // Validar y asegurar que los campos no sean undefined o null
            const name = typeof categoryData.name === 'string' && categoryData.name.trim() !== '' ? categoryData.name : '';
            const description = typeof categoryData.description === 'string' && categoryData.description.trim() !== '' ? categoryData.description : '';
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('categoryId', sql.Int, categoryId)
                .input('name', sql.VarChar(100), name)
                .input('description', sql.Text, description)
                .query(`
                    UPDATE [Category]
                    SET name = @name,
                        description = @description
                    OUTPUT INSERTED.*
                    WHERE categoryId = @categoryId
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(categoryId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('categoryId', sql.Int, categoryId)
                .query('DELETE FROM [Category] WHERE categoryId = @categoryId');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category; 