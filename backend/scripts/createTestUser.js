const bcrypt = require('bcryptjs');
// Importa el pool de conexiones de mssql desde tu archivo de configuración
const { poolPromise } = require('../config/db'); // O './config/database' si ese es el archivo correcto

async function createTestUser() {

    // Ejecutar la consulta INSERT para crear el usuario
    const result = await pool.request()
      .input('username', 'cerrador') // Parámetro para el nombre de usuario
 .input('email', 'cerrador@inventario.local') // Parámetro para el correo
      .input('passwordHash', hashedPassword) // Parámetro para el hash de la contraseña
      .input('roleId', 2) // Parámetro para el RoleId (2 para Cerrador de Mes)
      .query('INSERT INTO [User] (Username, Email, PasswordHash, RoleId) VALUES (@username, @email, @passwordHash, @roleId)');

    console.log('Usuario de prueba creado exitosamente.');
    console.log('Username:', 'cerrador');
    // console.log('Password:', password); // Considera omitir la contraseña por seguridad
    console.log('Hash:', hashedPassword); // Puedes mostrar el hash generado

    process.exit(0); // Salir con éxito
  } catch (error) {
    console.error('Error:', error); // Mostrar cualquier error
    process.exit(1); // Salir con error
  }
}

createTestUser();
