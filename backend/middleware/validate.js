const { validationResult } = require('express-validator');

// express-validator rules ke baad yeh middleware lagao - errors ho to 400 return karta hai
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
}

module.exports = validate;
