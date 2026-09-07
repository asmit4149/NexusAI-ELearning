import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { sendWelcomeEmail, sendPurchaseEmail } from '../services/emailService.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Amount in cents/paise
    const amount = course.price * 100;

    const options = {
      amount,
      currency: 'USD',
      receipt: `receipt_course_${courseId}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment & Enroll
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user._id;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const course = await Course.findById(courseId);
      
      await Payment.create({
        user: userId,
        course: courseId,
        amount: course.price,
        currency: 'USD',
        status: 'Completed',
        paymentMethod: 'Razorpay',
        transactionId: razorpay_payment_id,
        paidAt: Date.now()
      });

      // Automatically enroll student
      await Enrollment.create({
        user: userId,
        course: courseId,
        status: 'Active',
        progress: 0
      });

      course.enrolledStudents.push(userId);
      await course.save();

      // Send Welcome & Purchase Emails
      await sendWelcomeEmail(req.user.email, req.user.name, course.title);
      await sendPurchaseEmail(req.user.email, req.user.name, course.title, course.price);

      res.status(200).json({
        success: true,
        message: 'Payment verified and enrolled successfully',
      });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    next(error);
  }
};
