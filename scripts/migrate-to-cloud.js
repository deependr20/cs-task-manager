const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local');
  console.log('Please create .env.local file with your MongoDB connection string.');
  process.exit(1);
}

// Updated schemas matching the current models
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
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

const ActivitySchema = new mongoose.Schema({
  action: String,
  description: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  taskTitle: String,
  companyName: String,
  oldStatus: String,
  newStatus: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

async function migrateDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB Cloud...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Cloud successfully!');

    // Clear existing models to avoid conflicts
    const models = ['User', 'Task', 'Activity'];
    for (const modelName of models) {
      if (mongoose.models[modelName]) {
        delete mongoose.models[modelName];
        delete mongoose.modelSchemas[modelName];
      }
    }

    const User = mongoose.model('User', UserSchema);
    const Task = mongoose.model('Task', TaskSchema);
    const Activity = mongoose.model('Activity', ActivitySchema);

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    const existingTasks = await Task.countDocuments();

    if (existingUsers > 0 || existingTasks > 0) {
      console.log('\n⚠️  Database already contains data:');
      console.log(`   Users: ${existingUsers}`);
      console.log(`   Tasks: ${existingTasks}`);
      console.log('\nOptions:');
      console.log('1. Keep existing data (recommended)');
      console.log('2. Clear and reseed with sample data');
      
      // For now, we'll just add sample data if database is empty
      if (existingUsers === 0) {
        console.log('\n📦 Seeding initial data...');
        await seedDatabase(User, Task, Activity);
      } else {
        console.log('\n✅ Database already has data. Migration complete!');
      }
    } else {
      console.log('\n📦 Database is empty. Seeding initial data...');
      await seedDatabase(User, Task, Activity);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Tasks: ${await Task.countDocuments()}`);
    console.log(`   Activities: ${await Activity.countDocuments()}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Tip: Make sure you replaced <db_password> in .env.local with your actual MongoDB password!');
    }
    process.exit(1);
  }
}

async function seedDatabase(User, Task, Activity) {
  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

  // Create Admin
  const admin = await User.create({
    name: 'CS Manager',
    email: 'admin@ca.com',
    password: hashedAdminPassword,
    role: 'admin',
    designation: 'Company Secretary',
    isActive: true,
  });

  console.log('✅ Created admin user');

  // Create Employees
  const employees = await User.insertMany([
    {
      name: 'Rahul Sharma',
      email: 'employee@ca.com',
      password: hashedEmployeePassword,
      role: 'employee',
      designation: 'CS Associate',
      isActive: true,
    },
    {
      name: 'Priya Patel',
      email: 'priya@ca.com',
      password: hashedEmployeePassword,
      role: 'employee',
      designation: 'CS Executive',
      isActive: true,
    },
    {
      name: 'Amit Kumar',
      email: 'amit@ca.com',
      password: hashedEmployeePassword,
      role: 'employee',
      designation: 'Junior CS',
      isActive: true,
    },
  ]);

  console.log('✅ Created employee users');

  // Create sample tasks with new fields
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);

  const tasks = await Task.insertMany([
    {
      title: 'ROC Annual Filing - ABC Ltd',
      description: 'Complete ROC annual filing for ABC Ltd. Ensure all forms are properly filled and submitted before deadline.',
      priority: 'High',
      status: 'In Progress',
      dueDate: tomorrow,
      completionDate: nextWeek,
      companyName: 'ABC Ltd',
      assignedTo: employees[0]._id,
      assignedBy: admin._id,
      remarks: [
        {
          note: 'Started reviewing the documents. All required forms are ready.',
          addedBy: employees[0]._id,
          addedAt: new Date(),
        },
      ],
    },
    {
      title: 'Board Meeting Preparation - XYZ Corp',
      description: 'Prepare agenda, minutes, and resolutions for upcoming board meeting of XYZ Corp.',
      priority: 'High',
      status: 'Pending',
      dueDate: nextMonth,
      completionDate: nextMonth,
      companyName: 'XYZ Corp',
      assignedTo: employees[0]._id,
      assignedBy: admin._id,
    },
    {
      title: 'Statutory Compliance - Tech Solutions',
      description: 'Prepare and file annual compliance forms for Tech Solutions Pvt Ltd as per Companies Act requirements.',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: nextWeek,
      completionDate: nextWeek,
      companyName: 'Tech Solutions Pvt Ltd',
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
      title: 'AGM Preparation - Global Industries',
      description: 'Prepare agenda and documents for Annual General Meeting of Global Industries Ltd.',
      priority: 'High',
      status: 'Pending',
      dueDate: tomorrow,
      completionDate: nextWeek,
      companyName: 'Global Industries Ltd',
      assignedTo: employees[1]._id,
      assignedBy: admin._id,
    },
    {
      title: 'Share Transfer Compliance - StartUp Inc',
      description: 'Process share transfer and update statutory registers for StartUp Inc.',
      priority: 'Medium',
      status: 'Completed',
      dueDate: today,
      completionDate: today,
      companyName: 'StartUp Inc',
      assignedTo: employees[2]._id,
      assignedBy: admin._id,
      remarks: [
        {
          note: 'Share transfer completed successfully. All registers updated.',
          addedBy: employees[2]._id,
          addedAt: new Date(),
        },
      ],
    },
    {
      title: 'Secretarial Audit - Finance Corp',
      description: 'Conduct secretarial audit for Finance Corp and prepare compliance report.',
      priority: 'Low',
      status: 'Completed',
      dueDate: today,
      completionDate: today,
      companyName: 'Finance Corp',
      assignedTo: employees[2]._id,
      assignedBy: admin._id,
    },
  ]);

  console.log('✅ Created sample tasks');

  // Create some sample activities
  await Activity.insertMany([
    {
      action: 'TASK_CREATED',
      description: `Created task "ROC Annual Filing - ABC Ltd" for ${employees[0].name}`,
      performedBy: admin._id,
      taskId: tasks[0]._id,
      taskTitle: tasks[0].title,
      companyName: tasks[0].companyName,
    },
    {
      action: 'TASK_STATUS_CHANGED',
      description: `Changed task "${tasks[0].title}" status from Pending to In Progress`,
      performedBy: employees[0]._id,
      taskId: tasks[0]._id,
      taskTitle: tasks[0].title,
      companyName: tasks[0].companyName,
      oldStatus: 'Pending',
      newStatus: 'In Progress',
    },
    {
      action: 'REMARK_ADDED',
      description: `Added remark to task "${tasks[0].title}"`,
      performedBy: employees[0]._id,
      taskId: tasks[0]._id,
      taskTitle: tasks[0].title,
      companyName: tasks[0].companyName,
    },
  ]);

  console.log('✅ Created sample activities');

  console.log('\n=== Database seeded successfully! ===');
  console.log('\n🔐 Login credentials:');
  console.log('   Admin: admin@ca.com / admin123');
  console.log('   Employee: employee@ca.com / employee123');
  console.log('   Employee 2: priya@ca.com / employee123');
  console.log('   Employee 3: amit@ca.com / employee123');
}

// Run migration
migrateDatabase();
