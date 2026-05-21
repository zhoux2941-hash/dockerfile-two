const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        message: 'Token error'
      });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        message: 'Token malformatted'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal token error'
    });
  }
}

function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        const decoded = jwt.verify(parts[1], JWT_SECRET);
        req.user = {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuth
};