const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword,
  getBusinessSettings,
  updateBusinessSettings,
  uploadLogo
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Configure multer for logo upload (memory storage for base64 conversion)
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Validation middleware for business settings
const validateBusinessSettings = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  body('gstNumber')
    .optional({ values: 'falsy' })
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format'),
  body('planValidity')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid date format'),
  body('enableGst')
    .optional()
    .isBoolean()
    .withMessage('Enable GST must be a boolean'),
  body('sgstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('SGST rate must be between 0 and 100'),
  body('cgstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('CGST rate must be between 0 and 100')
];

// New Business Settings API routes
router.get('/business', protect, getBusinessSettings);
router.put('/business', protect, validateBusinessSettings, updateBusinessSettings);
router.post('/logo', protect, logoUpload.single('logo'), uploadLogo);

// Legacy Settings routes (Admin and Cashier) - keep at /settings for backward compatibility
router.get('/settings', protect, authorize('admin', 'cashier'), getSettings);
router.put('/settings', protect, authorize('admin', 'cashier'), updateSettings);

// Profile routes (All authenticated users)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
