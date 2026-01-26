# Settings API Documentation

## Overview
The Settings module provides comprehensive API endpoints for managing business settings, including business information, logos, and plan management.

## Base URL
```
http://localhost:5000/api/settings
```

## Authentication
All endpoints require Bearer token authentication.

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Get Business Settings

**Endpoint:** `GET /api/settings/business`

**Description:** Retrieves all business settings for the authenticated user. If settings don't exist, creates default settings automatically.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Business settings retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
    "businessName": "CIFICAP Cafe",
    "email": "contact@cificapcafe.com",
    "phone": "+91 9876543210",
    "address": "123 Main Street, Mumbai, Maharashtra 400001",
    "gstNumber": "27AABCU9603R1ZX",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "planType": "premium",
    "planValidity": "2026-12-31T00:00:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-20T14:45:00.000Z"
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve settings",
  "errors": ["Error message"]
}
```

---

### 2. Update Business Settings

**Endpoint:** `PUT /api/settings/business`

**Description:** Updates business settings for the authenticated user. Creates new settings if they don't exist.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "CIFICAP Cafe",
  "email": "contact@cificapcafe.com",
  "phone": "+91 9876543210",
  "address": "123 Main Street, Mumbai, Maharashtra 400001",
  "gstNumber": "27AABCU9603R1ZX",
  "logo": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "planValidity": "2026-12-31"
}
```

**Field Validations:**

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| businessName | Yes | String | Min 2 chars, Max 100 chars |
| email | Yes | String | Valid email format |
| phone | Yes | String | Not empty |
| address | Yes | String | Min 10 chars |
| gstNumber | No | String | 15 alphanumeric chars matching pattern: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` |
| logo | No | String | Base64 encoded image or URL |
| planValidity | No | Date | ISO 8601 format |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Business settings updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
    "businessName": "CIFICAP Cafe",
    "email": "contact@cificapcafe.com",
    "phone": "+91 9876543210",
    "address": "123 Main Street, Mumbai, Maharashtra 400001",
    "gstNumber": "27AABCU9603R1ZX",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "planType": "premium",
    "planValidity": "2026-12-31T00:00:00.000Z",
    "updatedAt": "2026-01-27T10:30:00.000Z"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Business name is required",
      "path": "businessName",
      "location": "body"
    }
  ]
}
```

---

### 3. Upload Business Logo

**Endpoint:** `POST /api/settings/logo`

**Description:** Upload business logo as multipart file. Automatically converts to base64 and updates settings.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
logo: <file> (image file)
```

**File Validations:**
- Max size: 5MB
- Allowed formats: jpg, jpeg, png, gif, webp
- Recommended: Square aspect ratio

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "logoBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Error Response - No File (400):**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**Error Response - Invalid File Type:**
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

---

## Database Schema

### Settings Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User - unique
  businessName: String,          // Required, 2-100 chars
  email: String,                 // Required, valid email
  phone: String,                 // Required
  address: String,               // Required, min 10 chars
  gstNumber: String,             // Optional, 15 chars pattern
  logo: String,                  // Optional, base64 or URL
  planType: String,              // 'free', 'premium', 'enterprise'
  planValidity: Date,            // Optional
  
  // Legacy fields (backward compatibility)
  cafeName: String,
  businessHours: {
    openingTime: String,
    closingTime: String
  },
  tax: {
    gstRate: Number
  },
  currency: String,
  currencySymbol: String,
  isInitialized: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`: unique index
- `gstNumber`: regular index

---

## Testing with cURL

### 1. Get Settings
```bash
curl -X GET http://localhost:5000/api/settings/business \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Update Settings
```bash
curl -X PUT http://localhost:5000/api/settings/business \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "CIFICAP Cafe",
    "email": "contact@cificapcafe.com",
    "phone": "+91 9876543210",
    "address": "123 Main Street, Mumbai, Maharashtra 400001",
    "gstNumber": "27AABCU9603R1ZX",
    "planValidity": "2026-12-31"
  }'
```

### 3. Upload Logo
```bash
curl -X POST http://localhost:5000/api/settings/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

---

## Testing with Postman

### Setup
1. Create a new request collection named "Settings API"
2. Add environment variable `baseUrl` = `http://localhost:5000`
3. Add environment variable `token` = `<your_jwt_token>`

### Get Business Settings
- **Method:** GET
- **URL:** `{{baseUrl}}/api/settings/business`
- **Headers:** 
  - `Authorization`: `Bearer {{token}}`

### Update Business Settings
- **Method:** PUT
- **URL:** `{{baseUrl}}/api/settings/business`
- **Headers:** 
  - `Authorization`: `Bearer {{token}}`
  - `Content-Type`: `application/json`
- **Body (JSON):**
```json
{
  "businessName": "CIFICAP Cafe",
  "email": "contact@cificapcafe.com",
  "phone": "+91 9876543210",
  "address": "123 Main Street, Mumbai, Maharashtra 400001",
  "gstNumber": "27AABCU9603R1ZX",
  "planValidity": "2026-12-31"
}
```

### Upload Logo
- **Method:** POST
- **URL:** `{{baseUrl}}/api/settings/logo`
- **Headers:** 
  - `Authorization`: `Bearer {{token}}`
- **Body (form-data):**
  - Key: `logo`, Type: File, Value: Select image file

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation failed or no file) |
| 401 | Unauthorized (invalid or missing token) |
| 500 | Internal Server Error |

---

## Frontend Integration

### React/JavaScript Example

```javascript
// Get Settings
const getBusinessSettings = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/settings/business', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Settings:', data.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Update Settings
const updateBusinessSettings = async (settingsData) => {
  try {
    const response = await fetch('http://localhost:5000/api/settings/business', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settingsData)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Updated:', data.data);
    } else {
      console.error('Validation errors:', data.errors);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Upload Logo
const uploadLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch('http://localhost:5000/api/settings/logo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Logo uploaded:', data.data.logoBase64);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kora_pos
```

---

## Implementation Details

### Files Modified/Created

1. **Model:** `src/models/Settings.js`
   - Added userId field with unique index
   - Added businessName, gstNumber, logo, planType, planValidity
   - Maintained backward compatibility with legacy fields

2. **Controller:** `src/controllers/settingsController.js`
   - Added `getBusinessSettings()` - GET business settings
   - Added `updateBusinessSettings()` - PUT business settings
   - Added `uploadLogo()` - POST logo upload

3. **Routes:** `src/routes/settingsRoutes.js`
   - Added `/settings/business` GET and PUT routes
   - Added `/settings/logo` POST route
   - Added validation middleware for business settings
   - Added multer configuration for logo upload

4. **Server:** `src/server.js`
   - Increased JSON payload limit to 10mb for base64 images
   - Added `/api/settings` route mounting

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **File Size:** Logo uploads limited to 5MB
3. **File Types:** Only image files (jpeg, jpg, png, gif, webp) allowed
4. **Validation:** All inputs validated using express-validator
5. **User Isolation:** Settings are user-specific (userId-based)

---

## Best Practices

1. **Image Optimization:** Consider using Sharp library to optimize images before storage
2. **CDN Integration:** For production, upload logos to AWS S3 or Cloudinary
3. **Caching:** Implement Redis caching for frequently accessed settings
4. **Rate Limiting:** Add rate limiting on upload endpoints
5. **Audit Logging:** Track all settings changes for compliance

---

## Troubleshooting

### Issue: "No file uploaded" error
**Solution:** Ensure Content-Type is multipart/form-data and field name is 'logo'

### Issue: "Invalid GST number format" error
**Solution:** GST must be exactly 15 characters: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric

### Issue: Base64 image too large
**Solution:** Optimize image before upload or use the multipart upload endpoint

### Issue: "Validation failed" on update
**Solution:** Check all required fields are provided: businessName, email, phone, address

---

## Support

For issues or questions, please refer to:
- Main README: `README.md`
- Setup Guide: `SETUP_GUIDE.md`
- API Examples: `API_EXAMPLES.md`
