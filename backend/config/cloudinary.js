const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Validate env vars are present before configuring
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌ Cloudinary ENV vars missing:');
  console.error('   CLOUDINARY_CLOUD_NAME :', CLOUD_NAME  ? '✅' : '❌ MISSING');
  console.error('   CLOUDINARY_API_KEY    :', API_KEY     ? '✅' : '❌ MISSING');
  console.error('   CLOUDINARY_API_SECRET :', API_SECRET  ? '✅' : '❌ MISSING');
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key:    API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

// Use memory storage — stream directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadToCloudinary = (buffer, folder = 'pakka-famous') => {
  return new Promise((resolve, reject) => {
    if (!API_KEY || !API_SECRET || !CLOUD_NAME) {
      return reject(new Error(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
      ));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error.message);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = { cloudinary, upload, uploadToCloudinary, deleteFromCloudinary };
