const multer = require('multer');
const path = require('path');

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Create multer storage configuration
const storage = multer.diskStorage({
    // Set destination directory for uploads
    destination: (req, file, cb) => {
        cb(null, path.resolve('temp/'));
    },
    
    // Generate unique filename
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for validating uploads
const fileFilter = (req, file, cb) => {
    // Check file type
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Multer configuration
const uploadConfig = {
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE, // 5MB max file size
        files: 1 // Limit to single file upload
    }
};

// Create multer upload middleware
const upload = multer(uploadConfig);

// Middleware for uploading blog images with error handling
exports.uploadBlogImage = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File is too large',
                    maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
                });
            }
            return res.status(400).json({
                message: 'File upload error',
                error: err.message
            });
        } else if (err) {
            // Custom error (like invalid file type)
            return res.status(400).json({
                message: 'Upload failed',
                error: err.message
            });
        }
        
        // If no file was uploaded, continue to next middleware
        if (!req.file) {
            return next();
        }

        // Validate file properties
        if (!req.file.path) {
            return res.status(400).json({
                message: 'File upload failed',
                error: 'No file path generated'
            });
        }

        next();
    });
};

// Optional: Helper function to clean up temporary files
exports.cleanupTempFiles = (filePath) => {
    const fs = require('fs').promises;
    
    return async () => {
        try {
            await fs.unlink(filePath);
            console.log(`Temporary file deleted: ${filePath}`);
        } catch (error) {
            console.error('Error deleting temporary file:', error);
        }
    };
};