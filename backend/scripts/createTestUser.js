const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sequelize } = require('../config/database'); // Línea corregida

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const testUser = await User.create({
      Username: 'cerrador',
      Email: 'cerradort@inventario.local',
      PasswordHash: hashedPassword,
      RoleId: 2
    });

    console.log('Usuario de prueba creado
