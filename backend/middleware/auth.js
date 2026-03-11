// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate a JWT token for a user
 * @param {Object} user - The user document from MongoDB
 * @param {string} role - 'student' | 'counselor' | 'admin'
 * @returns {string} signed JWT token
 */
function generateToken(user, role) {
  const payload = {
    userId: user._id.toString(),
    role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Express middleware: verifies the JWT from the Authorization header.
 * On success, attaches `req.user = { userId, role }` and calls next().
 * On failure, returns 401.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
}

/**
 * Express middleware: restricts access to specific roles.
 * Must be used AFTER verifyToken.
 * Usage: router.get('/admin-only', verifyToken, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Express middleware: ensures the authenticated user owns the resource (by :id param)
 * OR has one of the allowed override roles (e.g. admin, counselor).
 * Must be used AFTER verifyToken.
 * Usage: router.put('/:id/profile', verifyToken, requireOwnerOrRole('admin','counselor'), handler)
 * 
 * @param {string} paramName - The route param to compare against (default: 'id')
 */
function requireOwnerOrRole(...allowedRoles) {
  return (req, res, next) => {
    const resourceId = req.params.id || req.params.userId;
    const tokenUserId = req.user?.userId;

    // Owner check: token userId matches the resource id
    if (tokenUserId && resourceId && tokenUserId === resourceId) {
      return next();
    }

    // Role override: admins/counselors can access other users' data
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ success: false, error: 'Forbidden. You can only access your own data.' });
  };
}

module.exports = { generateToken, verifyToken, requireRole, requireOwnerOrRole };
