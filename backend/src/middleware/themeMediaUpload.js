import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/themes directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'themes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `theme-media-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only MP4, WebM, JPEG, PNG, and WebP are allowed.'));
  }
};

export const uploadThemeMedia = multer({
  storage,
  limits: {
    fileSize: 35 * 1024 * 1024 // 35MB max for video loops / high-res graphics
  },
  fileFilter
});
