// backend/models/User.js
const sql = require('mssql');
const dbConfig = require('../config/database');

class User {
    static async findById(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT * FROM [User] WHERE UserId = @UserId');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('Username', sql.VarChar(50), username)
                .query('SELECT * FROM [User] WHERE Username = @Username');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('Username', sql.VarChar(50), userData.Username)
                .input('Email', sql.VarChar(100), userData.Email)
                .input('PasswordHash', sql.Text, userData.PasswordHash)
                .input('RoleId', sql.Int, userData.RoleId)
                .query(`
                    INSERT INTO [User] (Username, Email, PasswordHash, RoleId)
                    OUTPUT INSERTED.*
                    VALUES (@Username, @Email, @PasswordHash, @RoleId)
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('UserId', sql.Int, userId)
                .input('Username', sql.VarChar(50), userData.Username)
                .input('Email', sql.VarChar(100), userData.Email)
                .input('PasswordHash', sql.Text, userData.PasswordHash)
                .input('RoleId', sql.Int, userData.RoleId)
                .query(`
                    UPDATE [User]
                    SET Username = @Username,
                        Email = @Email,
                        PasswordHash = @PasswordHash,
                        RoleId = @RoleId
                    OUTPUT INSERTED.*
                    WHERE UserId = @UserId
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('DELETE FROM [User] WHERE UserId = @UserId');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
