const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sequelize } = require('../config/database'); // Importación corregida

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    const password = '123'; // Contraseña temporal para el usuario de prueba
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario de prueba 'admin'
    const testUser = await User.create({
      Username: 'cerrador',
      Email: 'cerrador@inventario.local', // Correo temporal
      PasswordHash: hashedPassword,
      RoleId: 2// Asignar el RoleId 1 (Admin)
    });

    console.log('Usuario de prueba creado:'); // Línea corregida
    console.log('Username:', testUser.Username);
    // console.log('Password:', password); // Considera omitir la contraseña por seguridad
    console.log('Hash:', testUser.PasswordHash);

    process.exit(0); // Salir con éxito
  } catch (error) {
    console.error('Error:', error); // Mostrar cualquier error
    process.exit(1); // Salir con error
  }
}

createTestUser(); // Ejecutar la función para crear el usuario
