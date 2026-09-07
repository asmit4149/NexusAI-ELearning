import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Get all active subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
export const getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    // Call Razorpay API to create a subscription
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      total_count: plan.billingCycle === 'Yearly' ? 10 : 120, // Example: 10 years or 120 months max
    });

    // Create a local subscription record as pending
    const subscription = await Subscription.create({
      user: userId,
      plan: plan._id,
      razorpaySubscriptionId: rzpSubscription.id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: rzpSubscription.id,
        planId: plan._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's active subscription
// @route   GET /api/subscriptions/me
// @access  Private
export const getMySubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'activeSubscription',
      populate: { path: 'plan' }
    });

    if (!user.activeSubscription) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: user.activeSubscription });
  } catch (error) {
    next(error);
  }
};
