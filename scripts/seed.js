const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ca-task-manager';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  designation: String,
  isActive: Boolean,
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: String,
  status: String,
  dueDate: Date,
  completionDate: Date,
  companyName: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: Date,
  }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedManagerPassword = await bcrypt.hash('manager123', 10);
    const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ca.com',
      password: hashedAdminPassword,
      role: 'admin',
      designation: 'Managing Partner',
      isActive: true,
    });

    // Create Manager
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@ca.com',
      password: hashedManagerPassword,
      role: 'manager',
      designation: 'Team Lead',
      isActive: true,
    });

    // Create Employees
    const employees = await User.insertMany([
      {
        name: 'Rahul Sharma',
        email: 'employee@ca.com',
        password: hashedEmployeePassword,
        role: 'employee',
        designation: 'CA',
        isActive: true,
      },
      {
        name: 'Priya Patel',
        email: 'priya@ca.com',
        password: hashedEmployeePassword,
        role: 'employee',
        designation: 'CS',
        isActive: true,
      },
      {
        name: 'Amit Kumar',
        email: 'amit@ca.com',
        password: hashedEmployeePassword,
        role: 'employee',
        designation: 'Junior Associate',
        isActive: true,
      },
    ]);

    console.log('Created users');

    // Create sample tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    await Task.insertMany([
      {
        title: 'GST Return Filing - Q4',
        description: 'Complete GST return filing for Q4 for ABC Ltd. Ensure all invoices are properly recorded and tax calculations are accurate.',
        priority: 'High',
        status: 'In Progress',
        dueDate: tomorrow,
        companyName: 'ABC Ltd.',
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
        remarks: [
          {
            note: 'Started reviewing the invoices. Found some discrepancies in input tax credit claims.',
            addedBy: employees[0]._id,
            addedAt: new Date(),
          },
        ],
      },
      {
        title: 'Annual Audit - XYZ Company',
        description: 'Conduct annual audit for XYZ Company. Review financial statements, internal controls, and compliance with accounting standards.',
        priority: 'High',
        status: 'Pending',
        dueDate: nextMonth,
        companyName: 'XYZ Company',
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Company Secretary Compliance',
        description: 'Prepare and file annual compliance forms for listed company as per Companies Act requirements.',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: nextWeek,
        companyName: 'Listed Company',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
        remarks: [
          {
            note: 'Collected all required documents. Will start drafting the forms tomorrow.',
            addedBy: employees[1]._id,
            addedAt: new Date(),
          },
        ],
      },
      {
        title: 'Board Meeting Preparation',
        description: 'Prepare agenda, minutes, and resolutions for upcoming board meeting.',
        priority: 'High',
        status: 'Pending',
        dueDate: tomorrow,
        companyName: 'Board Client',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Tax Planning Consultation',
        description: 'Meet with client to discuss tax planning strategies for FY 2024-25.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: today,
        completionDate: today,
        companyName: 'Tax Client',
        assignedTo: employees[2]._id,
        assignedBy: admin._id,
        remarks: [
          {
            note: 'Meeting completed successfully. Client satisfied with the strategies proposed.',
            addedBy: employees[2]._id,
            addedAt: new Date(),
          },
        ],
      },
      {
        title: 'Bookkeeping - January',
        description: 'Complete bookkeeping entries for January month for multiple small business clients.',
        priority: 'Low',
        status: 'Completed',
        dueDate: today,
        completionDate: today,
        companyName: 'Bookkeeping Client',
        assignedTo: employees[2]._id,
        assignedBy: admin._id,
      },
      {
        title: 'ITR Filing - Individual Client',
        description: 'File income tax return for individual client with salary and capital gains income.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: nextWeek,
        companyName: 'Individual Client',
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
      },
      {
        title: 'ROC Annual Filing',
        description: 'Complete ROC annual filing for 5 private limited companies.',
        priority: 'High',
        status: 'Pending',
        dueDate: nextWeek,
        companyName: 'ROC Clients',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
      },
    ]);

    console.log('Created sample tasks');
    console.log('\n=== Database seeded successfully! ===');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@ca.com / admin123');
    console.log('Manager: manager@ca.com / manager123');
    console.log('Employee: employee@ca.com / employee123');
    console.log('Employee 2: priya@ca.com / employee123');
    console.log('Employee 3: amit@ca.com / employee123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
