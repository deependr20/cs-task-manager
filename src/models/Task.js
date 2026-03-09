import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a task description'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Pending Manager Approval',
        'Pending Admin Approval',
        'Completed',
      ],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    completionDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    spocName: { type: String, trim: true },
    spocNumber: { type: String, trim: true },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', default: null },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign the task to an employee'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    form: { type: String, trim: true },
    srnOfeForm: { type: String, trim: true },
    srnAmount: { type: Number, default: null },
    srnDate: { type: Date, default: null },
    remarks: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Clear cached model to ensure schema updates are applied
if (mongoose.models.Task) {
  delete mongoose.models.Task;
}

export default mongoose.model('Task', TaskSchema);
