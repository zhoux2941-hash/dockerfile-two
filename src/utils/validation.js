class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function validateRequired(data, fields) {
  const errors = [];
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(new ValidationError(`${field} is required`, field));
    }
  });
  
  return errors;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateLength(str, min, max) {
  if (str.length < min || str.length > max) {
    return false;
  }
  return true;
}

function validateEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
}

function validateTaskStatus(status) {
  const allowedStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  return validateEnum(status, allowedStatuses);
}

function validateTaskPriority(priority) {
  const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
  return validateEnum(priority, allowedPriorities);
}

function validateProjectStatus(status) {
  const allowedStatuses = ['planning', 'active', 'completed', 'cancelled', 'on_hold'];
  return validateEnum(status, allowedStatuses);
}

function validateUserRole(role) {
  const allowedRoles = ['admin', 'manager', 'user', 'guest'];
  return validateEnum(role, allowedRoles);
}

module.exports = {
  ValidationError,
  validateRequired,
  validateEmail,
  validateLength,
  validateEnum,
  sanitizeInput,
  validateTaskStatus,
  validateTaskPriority,
  validateProjectStatus,
  validateUserRole
};