import express from 'express';
import {
  getActiveTheme,
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  duplicateTheme,
  activateTheme,
  deleteTheme,
  resetPresets
} from '../controllers/themeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';
import { uploadThemeMedia } from '../middleware/themeMediaUpload.js';

const router = express.Router();

// Public: Used by customer storefront header
router.get('/active', getActiveTheme);

// Protected Admin Routes
router.use(protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', getAllThemes);
router.get('/:id', getThemeById);
router.post('/', createTheme);
router.put('/:id', updateTheme);
router.post('/:id/duplicate', duplicateTheme);
router.post('/:id/activate', activateTheme);
router.delete('/:id', deleteTheme);
router.post('/reset-presets', resetPresets);

// Media asset upload endpoint (for admin custom video/image upload)
router.post('/upload-media', uploadThemeMedia.single('media'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/themes/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      mediaUrl: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
});

export default router;
