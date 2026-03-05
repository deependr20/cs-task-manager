import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'employee'],
      default: 'employee',
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      default: null,
    },
    designation: {
      type: String,
      required: [true, 'Please provide a designation'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      emailNotifications: { type: Boolean, default: true },
    },
    managerPermissions: {
      accessTaskSheet: { type: Boolean, default: true },
      accessMemoDetails: { type: Boolean, default: true },
      accessCompanies: { type: Boolean, default: true },
      canCreateTasks: { type: Boolean, default: true },
      canApproveTasks: { type: Boolean, default: true },
      canRaiseMemos: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Clear cached model so schema updates (e.g. role enum) are applied
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
