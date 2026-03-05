import mongoose from 'mongoose';

const MemoSchema = new mongoose.Schema(
  {
    memoNo: { type: String, required: true, trim: true },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', default: null },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    companyName: { type: String, required: true, trim: true },
    memoDate: { type: Date, required: true },
    particulars: { type: String, default: '' },
    amount: { type: Number, required: true },
    sentTo: { type: String, trim: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followUpDate: { type: Date },
    paymentDate: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

if (mongoose.models.Memo) {
  delete mongoose.models.Memo;
}

export default mongoose.model('Memo', MemoSchema);
