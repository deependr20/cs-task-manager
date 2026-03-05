import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'TASK_SUBMITTED_FOR_APPROVAL',
        'TASK_APPROVED',
        'TASK_REJECTED',
        'TASK_DELETED',
        'REMARK_ADDED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', default: null },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    taskTitle: {
      type: String,
    },
    companyName: {
      type: String,
    },
    oldStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ActivitySchema.index({ performedBy: 1, createdAt: -1 });
ActivitySchema.index({ taskId: 1, createdAt: -1 });
ActivitySchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
