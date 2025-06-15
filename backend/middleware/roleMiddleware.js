// backend/middleware/roleMiddleware.js

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user and roleId exist on the request object (added by auth middleware)
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
    }

    // Check if the user's roleId is in the allowedRoles array
    if (!allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Rol insuficiente.' });
    }

    // If role is allowed, proceed to the next middleware/controller
    next();
  };
};

module.exports = roleMiddleware;