const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const mime = require('mime-types');
const path = require('path');
require('dotenv').config();

// Configure AWS SDK with error handling
const configureAWS = () => {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
        throw new Error('Missing AWS configuration. Check your environment variables.');
    }
};

// Create S3 client
const createS3Client = () => {
    try {
        configureAWS();
        return new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    } catch (error) {
        console.error('S3 Client Configuration Error:', error);
        throw error;
    }
};

/**
 * Upload image to S3 with robust error handling and flexibility
 * @param {string} filePath - Local file path
 * @param {string} fileName - Desired filename in S3
 * @param {Object} options - Additional upload options
 * @returns {Promise<string>} S3 file URL
 */
const uploadImageToS3 = async (filePath, fileName, options = {}) => {
    const s3 = createS3Client();

    try {
        const fileBuffer = await fs.readFile(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        const uniqueFileName = options.uniqueFileName 
            ? `${Date.now()}-${fileName}` 
            : fileName;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: contentType,
            // ACL: 'public-read',
        };

        const command = new PutObjectCommand(params);
        const data = await s3.send(command);

        if (options.deleteLocalFile) {
            await fs.unlink(filePath);
        }

        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    } catch (error) {
        console.error('S3 Upload Error:', { message: error.message, filePath, fileName });
        throw new Error(`S3 Upload Failed: ${error.message}`);
    }
};


// Helper function to generate S3 key
const generateS3Key = (originalFileName, prefix = 'uploads/') => {
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFileName);
    const baseFileName = path.basename(originalFileName, fileExtension);
    
    return `${prefix}${baseFileName}-${timestamp}${fileExtension}`;
};

module.exports = {
    uploadImageToS3,
    generateS3Key
};
