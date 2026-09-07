import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a plan name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a plan description'],
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    razorpayPlanId: {
      type: String,
      required: true,
      unique: true,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;
