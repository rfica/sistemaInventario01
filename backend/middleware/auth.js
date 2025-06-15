// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
 console.log('🔑 authMiddleware is executing...', req.method, req.url); // Log to confirm execution
 console.log('Auth middleware: Processing request to', req.originalUrl);
  // Obtener token del header
  const authHeader = req.header('Authorization');
 console.log('Auth middleware: Authorization header:', authHeader);
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    // Verificar token
 console.log('Auth middleware: Verifying token:', token);
    const decoded = jwt.verify(token, config.jwt.secret);
 console.log('Auth middleware: Token verified. Decoded payload:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
 console.error('Auth middleware: Token verification failed:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado.' 
    });
  }
};