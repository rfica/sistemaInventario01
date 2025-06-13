const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sequelize } = require('../config/database');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const testUser = await User.create({
      Username: 'admin',
      Email: 'test@inventario.local',
      PasswordHash: hashedPassword,
      RoleId: 1
    });

    console.log('Usuario de prueba creado:');
    console.log('Username:', testUser.Username);
    console.log('Password:', password);
    console.log('Hash:', testUser.PasswordHash);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser(); 