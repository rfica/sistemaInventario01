// backend/models/Role.js
const sql = require('mssql');
const dbConfig = require('../config/database');

class Role {
    static async findAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM [Role]');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findById(roleId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('RoleId', sql.Int, roleId)
                .query('SELECT * FROM [Role] WHERE RoleId = @RoleId');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('Name', sql.VarChar(50), roleData.Name)
                .input('Description', sql.Text, roleData.Description)
                .query(`
                    INSERT INTO [Role] (Name, Description)
                    OUTPUT INSERTED.*
                    VALUES (@Name, @Description)
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(roleId, roleData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('RoleId', sql.Int, roleId)
                .input('Name', sql.VarChar(50), roleData.Name)
                .input('Description', sql.Text, roleData.Description)
                .query(`
                    UPDATE [Role]
                    SET Name = @Name,
                        Description = @Description
                    OUTPUT INSERTED.*
                    WHERE RoleId = @RoleId
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(roleId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('RoleId', sql.Int, roleId)
                .query('DELETE FROM [Role] WHERE RoleId = @RoleId');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Role;
