import express from 'express';
import { downloadCertificate, getUserCertificates, verifyCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserCertificates);
router.get('/verify/:credentialId', verifyCertificate);
router.get('/:courseId/download', protect, downloadCertificate);

export default router;
