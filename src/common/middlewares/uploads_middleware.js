const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;
        if (req.path.includes('serviceProvider')) {
            uploadPath = path.join(__dirname, '../../assets/serviceProviders');
        } else if (req.path.includes('apartment')) {
            uploadPath = path.join(__dirname, '../../assets/apartments');
        } else {
            uploadPath = path.join(__dirname, '../../assets/tmp');
        }
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Use original file extension
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;
