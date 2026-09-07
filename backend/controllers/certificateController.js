import PDFDocument from 'pdfkit';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import crypto from 'crypto';

// @desc    Download Certificate as PDF
// @route   GET /api/certificates/:courseId/download
// @access  Private (Student)
export const downloadCertificate = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const user = req.user;

    // Check if enrolled and completed
    const enrollment = await Enrollment.findOne({ user: user._id, course: courseId });
    if (!enrollment || enrollment.status !== 'Completed') {
      res.status(403);
      throw new Error('You have not completed this course yet');
    }

    const course = await Course.findById(courseId);

    // Create or fetch certificate record
    let certificate = await Certificate.findOne({ user: user._id, course: courseId });
    
    if (!certificate) {
      certificate = await Certificate.create({
        user: user._id,
        course: courseId,
        credentialId: crypto.randomBytes(8).toString('hex').toUpperCase(),
        certificateUrl: 'Generated PDF',
      });
    }

    // Generate PDF
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${course.title.replace(/\\s+/g, '_')}.pdf`);

    doc.pipe(res);

    // Build the PDF visually
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0F172A'); // Dark Blue background
    
    doc.fillColor('#FFFFFF').fontSize(40).text('CERTIFICATE OF COMPLETION', 0, 150, { align: 'center' });
    
    doc.fontSize(20).text('This is to certify that', 0, 230, { align: 'center' });
    
    doc.fillColor('#8B5CF6').fontSize(35).text(user.name, 0, 270, { align: 'center' });
    
    doc.fillColor('#FFFFFF').fontSize(20).text('has successfully completed the course', 0, 330, { align: 'center' });
    
    doc.fontSize(30).text(course.title, 0, 370, { align: 'center' });

    doc.fontSize(15).text(`Date: ${certificate.issuedAt.toDateString()}`, 100, 480);
    doc.fontSize(15).text(`Credential ID: ${certificate.credentialId}`, 450, 480);

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates for logged-in user
// @route   GET /api/certificates
// @access  Private (Student)
export const getUserCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).populate('course', 'title thumbnail category');
    res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a certificate publicly
// @route   GET /api/certificates/verify/:credentialId
// @access  Public
export const verifyCertificate = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    
    const certificate = await Certificate.findOne({ credentialId })
      .populate('user', 'name')
      .populate('course', 'title');

    if (!certificate) {
      res.status(404);
      throw new Error('Invalid Certificate ID');
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};
