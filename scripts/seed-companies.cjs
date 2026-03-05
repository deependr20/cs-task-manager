/**
 * One-time seed: INTELLOSOFT INFOTECH PRIVATE LIMITED and directors.
 * Run: node scripts/seed-companies.cjs (from project root; requires .env.local with MONGODB_URI)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

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

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

const SEED = {
  name: 'INTELLOSOFT INFOTECH PRIVATE LIMITED',
  companyUserId: 'NA',
  password: 'NA',
  emailId: 'gourav148@gmail.com',
  registeredOfficeAddress: 'FNO 210, SHRINATHJI AVENUE, KIBE COMPOUND, Indore Takshashila, Indore, Indore, Madhya Pradesh, India, 452001',
  cin: 'U62013MP2025PTC080815',
  dateOfIncorporation: new Date('2025-12-23'),
  puc: '1,00,000',
  directors: [
    { directorName: 'Mr. Gourav Patidar', din: '11447884', mcaCredentials: 'gourav148@gmail.com', password: 'Gourav@1992', dir3KycStatus: 'Active', mobileNo: '+91 9516333872', emailId: 'gourav@intellosoft.io' },
    { directorName: 'Ms. Palak Gujrati', din: '11447885', mcaCredentials: 'NA', password: 'NA', dir3KycStatus: 'Active', mobileNo: '+91 9516333872', emailId: 'gourav@intellosoft.io' },
  ],
};

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Company.findOne({ cin: SEED.cin });
  if (existing) {
    console.log('Company already seeded (CIN exists). Id:', existing._id.toString());
    await mongoose.disconnect();
    process.exit(0);
  }
  const company = await Company.create(SEED);
  console.log('Seeded company:', company.name, 'Id:', company._id.toString());
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
