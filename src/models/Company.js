import mongoose from 'mongoose';

const DirectorSchema = new mongoose.Schema(
  {
    directorName: { type: String, trim: true },
    din: { type: String, trim: true },
    mcaCredentials: { type: String, trim: true },
    password: { type: String, trim: true },
    dir3KycStatus: { type: String, trim: true },
    mobileNo: { type: String, trim: true },
    emailId: { type: String, trim: true },
  },
  { _id: true }
);

const CompanySchema = new mongoose.Schema(
  {
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', default: null },
    name: { type: String, required: true, trim: true },
    companyUserId: { type: String, trim: true },
    password: { type: String, trim: true },
    emailId: { type: String, trim: true },
    registeredOfficeAddress: { type: String, trim: true },
    cin: { type: String, trim: true },
    dateOfIncorporation: { type: Date },
    puc: { type: String, trim: true },
    directors: [DirectorSchema],
  },
  { timestamps: true }
);

if (mongoose.models.Company) {
  delete mongoose.models.Company;
}

export default mongoose.model('Company', CompanySchema);
