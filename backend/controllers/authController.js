// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Intento de login para usuario:', username);

  try {
    const user = await User.findByUsername(username);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Para depuración: crear un hash de la contraseña ingresada
    const testHash = await bcrypt.hash(password, 10);
    console.log('Hash de prueba:', testHash);
    console.log('Hash almacenado:', user.PasswordHash);

    const passwordValid = await bcrypt.compare(password, user.PasswordHash);
    console.log('Contraseña válida:', passwordValid);

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { userId: user.UserId, username: user.Username, roleId: user.RoleId },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    const userResponse = {
      userId: user.UserId,
      username: user.Username,
      roleId: user.RoleId
    };

    console.log('Login exitoso para:', username);
    res.json({
      success: true,
      user: userResponse,
      token
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
