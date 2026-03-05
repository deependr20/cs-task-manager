# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and update MongoDB URI if needed
# Default: mongodb://localhost:27017/ca-task-manager
```

### Step 3: Start MongoDB
Make sure MongoDB is running on your machine.

### Step 4: Seed Database
```bash
node scripts/seed.js
```

### Step 5: Run Application
```bash
npm run dev
```

### Step 6: Login
Visit http://localhost:3000

**Admin Login:**
- Email: admin@ca.com
- Password: admin123

**Employee Login:**
- Email: employee@ca.com
- Password: employee123

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start           # Start production server

# Database
node scripts/seed.js # Seed database with demo data
```

## First Tasks as Admin

1. **Create an Employee**
   - Go to Dashboard
   - Click "Add Employee"
   - Fill in details
   - Save

2. **Create a Task**
   - Click "Create Task"
   - Fill task details
   - Assign to employee
   - Set priority and due date
   - Save

3. **Monitor Progress**
   - View dashboard statistics
   - Filter tasks by employee or status
   - Check employee-wise distribution

## First Tasks as Employee

1. **View Your Tasks**
   - Login with employee credentials
   - See all assigned tasks on dashboard

2. **Update Task Status**
   - Select new status from dropdown
   - Add a remark (optional)
   - Submit

3. **Track Your Progress**
   - View statistics on dashboard
   - Filter tasks by status
   - Monitor approaching due dates

## Tips

- 🔴 High priority tasks need immediate attention
- 🟡 Medium priority tasks should be completed soon
- ⚪ Low priority tasks can be done when time permits
- Use remarks to communicate progress with managers
- Keep tasks updated to reflect accurate status

## Need Help?

Refer to the main README.md for detailed documentation.
