const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// @desc    Get business settings
// @route   GET /api/settings/business
// @access  Private
const getBusinessSettings = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    let settings = await Settings.findOne({ userId });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({
        userId,
        businessName: 'My Business',
        email: req.user.email || 'info@business.com',
        phone: 'Not provided',
        address: 'Not provided yet'
      });
    }
    
    res.json({
      success: true,
      message: 'Business settings retrieved successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      errors: [error.message]
    });
  }
};

// @desc    Update business settings
// @route   PUT /api/settings/business
// @access  Private
const updateBusinessSettings = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user._id || req.user.id;
    const {
      businessName,
      email,
      phone,
      address,
      gstNumber,
      logo,
      planValidity,
      enableGst,
      sgstRate,
      cgstRate
    } = req.body;
    
    const updateData = {
      businessName,
      email,
      phone,
      address
    };
    
    // Add optional fields only if provided
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (logo !== undefined) updateData.logo = logo;
    if (planValidity !== undefined) updateData.planValidity = planValidity;
    if (enableGst !== undefined) updateData.enableGst = enableGst;
    if (sgstRate !== undefined) updateData.sgstRate = sgstRate;
    if (cgstRate !== undefined) updateData.cgstRate = cgstRate;
    
    const settings = await Settings.findOneAndUpdate(
      { userId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      message: 'Business settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      errors: [error.message]
    });
  }
};

// @desc    Upload business logo
// @route   POST /api/settings/logo
// @access  Private
const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const userId = req.user._id || req.user.id;
    
    // Convert to base64
    const logoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Update settings with logo
    await Settings.findOneAndUpdate(
      { userId },
      { logo: logoBase64 },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoBase64
      }
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      errors: [error.message]
    });
  }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const {
      cafeName,
      address,
      phone,
      email,
      businessHours,
      tax,
      currency,
      currencySymbol
    } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      // Update fields
      if (cafeName !== undefined) settings.cafeName = cafeName;
      if (address !== undefined) settings.address = address;
      if (phone !== undefined) settings.phone = phone;
      if (email !== undefined) settings.email = email;
      
      if (businessHours) {
        if (businessHours.openingTime) settings.businessHours.openingTime = businessHours.openingTime;
        if (businessHours.closingTime) settings.businessHours.closingTime = businessHours.closingTime;
      }
      
      if (tax && tax.gstRate !== undefined) {
        settings.tax.gstRate = tax.gstRate;
      }
      
      if (currency !== undefined) settings.currency = currency;
      if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
      
      settings.isInitialized = true;
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/admin/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/admin/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/admin/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword,
  getBusinessSettings,
  updateBusinessSettings,
  uploadLogo
};
