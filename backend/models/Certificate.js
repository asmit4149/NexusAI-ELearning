import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    credentialId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
