import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateNotes = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Invalid semester'),
  handleValidationErrors
];

export const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Group name must be at least 3 characters'),
  handleValidationErrors
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
