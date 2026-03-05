# MongoDB Cloud Setup Guide

This guide will help you connect your CS Management Portal to MongoDB Cloud and migrate all your data.

## 📋 Prerequisites

1. MongoDB Atlas account with your database password
2. Node.js installed on your system

## 🚀 Setup Steps

### Step 1: Install Dependencies

First, install the required dependencies (including dotenv):

```bash
npm install
```

### Step 2: Create Environment File

Create a `.env.local` file in the root directory of your project with the following content:

```env
# MongoDB Connection String
# IMPORTANT: Replace <db_password> with your actual MongoDB password
MONGODB_URI=mongodb+srv://satyam:YOUR_PASSWORD_HERE@deep-dev.d25dubh.mongodb.net/cs-management?retryWrites=true&w=majority

# JWT Secret for authentication (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# Next.js Environment
NODE_ENV=development
```

**Important:** 
- Replace `YOUR_PASSWORD_HERE` with your actual MongoDB Atlas password
- The database name is set to `cs-management` - you can change it if needed
- Make sure `.env.local` is in your `.gitignore` file (it should be by default)

### Step 3: Run Migration Script

Run the migration script to set up your database and seed initial data:

```bash
node scripts/migrate-to-cloud.js
```

This script will:
- ✅ Connect to your MongoDB Cloud database
- ✅ Create all necessary collections (Users, Tasks, Activities)
- ✅ Seed sample data (admin user, employees, tasks)
- ✅ Create sample activity logs

### Step 4: Verify Connection

Start your development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and try logging in with:
- **Admin:** admin@ca.com / admin123
- **Employee:** employee@ca.com / employee123

## 🔐 Default Login Credentials

After migration, you can login with:

**Admin Account:**
- Email: `admin@ca.com`
- Password: `admin123`

**Employee Accounts:**
- Email: `employee@ca.com` | Password: `employee123`
- Email: `priya@ca.com` | Password: `employee123`
- Email: `amit@ca.com` | Password: `employee123`

**⚠️ Important:** Change these passwords in production!

## 📊 Database Structure

The migration creates the following collections:

1. **users** - Stores admin and employee accounts
2. **tasks** - Stores all tasks with company names and completion dates
3. **activities** - Stores all activity logs for monitoring

## 🔄 Migrating Existing Data

If you have existing data in a local MongoDB database:

1. Export your data from local MongoDB:
```bash
mongodump --uri="mongodb://localhost:27017/ca-task-manager" --out=./backup
```

2. Import to MongoDB Cloud:
```bash
mongorestore --uri="mongodb+srv://satyam:YOUR_PASSWORD@deep-dev.d25dubh.mongodb.net/cs-management" ./backup/ca-task-manager
```

## 🛠️ Troubleshooting

### Connection Error: Authentication Failed
- Make sure you replaced `<db_password>` with your actual MongoDB password
- Check that your IP address is whitelisted in MongoDB Atlas
- Verify your MongoDB username is correct

### Connection Error: Network Timeout
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Check if your firewall is blocking the connection

### Environment Variable Not Found
- Make sure `.env.local` file exists in the root directory
- Verify the file name is exactly `.env.local` (not `.env.local.txt`)
- Restart your development server after creating the file

## 📝 Notes

- The database name in the connection string is `cs-management`
- All data will be stored in MongoDB Cloud
- Activity logs are automatically created for all employee actions
- The migration script is safe to run multiple times (it won't duplicate data)

## 🔒 Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use strong JWT_SECRET in production** (generate with: `openssl rand -base64 32`)
3. **Change default passwords** after first login
4. **Enable MongoDB Atlas IP whitelisting** for production
5. **Use MongoDB Atlas database users** with limited permissions

---

**Need Help?** If you encounter any issues, check the terminal output for detailed error messages.
