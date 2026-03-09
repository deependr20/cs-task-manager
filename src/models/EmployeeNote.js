import mongoose from 'mongoose';

const EmployeeNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.EmployeeNote) {
  delete mongoose.models.EmployeeNote;
}

export default mongoose.model('EmployeeNote', EmployeeNoteSchema);
