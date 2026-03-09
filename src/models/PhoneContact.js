import mongoose from 'mongoose';

const PhoneContactSchema = new mongoose.Schema(
  {
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', default: null },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.PhoneContact) {
  delete mongoose.models.PhoneContact;
}

export default mongoose.model('PhoneContact', PhoneContactSchema);

