import mongoose from 'mongoose';

const FirmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    logo: { type: String, trim: true }, // URL or data URL (base64)
  },
  { timestamps: true }
);

if (mongoose.models.Firm) {
  delete mongoose.models.Firm;
}

export default mongoose.model('Firm', FirmSchema);
