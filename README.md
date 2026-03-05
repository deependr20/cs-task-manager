# CS Management Portal

A comprehensive and professional management system built specifically for Company Secretary (CS) firms. This modern platform enables CS managers to efficiently manage employees, assign tasks, track progress, and handle client services with an intuitive and attractive interface.

## 🎯 Features

### Admin/Manager Features
- **Dashboard with Analytics**: View comprehensive statistics including total tasks, pending, in-progress, and completed tasks
- **Employee Management**: Create and manage employee accounts
- **Task Assignment**: Assign tasks to employees with priority levels and due dates
- **Task Tracking**: Monitor task progress and employee-wise task distribution
- **Filter & Search**: Filter tasks by employee and status
- **Edit & Delete**: Full CRUD operations on tasks

### Employee Features
- **Personal Dashboard**: View assigned tasks with status overview
- **Task Updates**: Update task status (Pending → In Progress → Completed)
- **Add Remarks**: Add notes and comments while updating tasks
- **Filter Tasks**: Filter tasks by status
- **Task Details**: View complete task information including priority and due dates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, JavaScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
# If you have the zip file
unzip ca-task-manager.zip
cd ca-task-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure:

```env
MONGODB_URI=mongodb://localhost:27017/ca-task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux (using systemd)
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel or MongoDB Compass
```

### 5. Seed the Database (Optional)

To populate the database with demo users and tasks:

```bash
node scripts/seed.js
```

This will create:
- 1 Admin account
- 3 Employee accounts
- 8 Sample tasks

### 6. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Demo Accounts

After running the seed script, you can login with:

### Admin Account
- **Email**: admin@ca.com
- **Password**: admin123

### Employee Accounts
- **Email**: employee@ca.com | **Password**: employee123
- **Email**: priya@ca.com | **Password**: employee123
- **Email**: amit@ca.com | **Password**: employee123

## 📁 Project Structure

```
ca-task-manager/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   │       └── page.js          # Admin dashboard
│   │   ├── employee/
│   │   │   └── dashboard/
│   │   │       └── page.js          # Employee dashboard
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/           # Login API
│   │   │   │   ├── logout/          # Logout API
│   │   │   │   └── me/              # Get current user
│   │   │   ├── users/               # User CRUD APIs
│   │   │   ├── tasks/               # Task CRUD APIs
│   │   │   └── dashboard/           # Dashboard stats API
│   │   ├── page.js                  # Login page
│   │   ├── layout.js                # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── Navbar.js                # Navigation component
│   │   ├── StatsCard.js             # Statistics card
│   │   └── TaskCard.js              # Task card component
│   ├── lib/
│   │   ├── mongodb.js               # MongoDB connection
│   │   ├── auth.js                  # Authentication utilities
│   │   └── middleware.js            # Auth middleware
│   └── models/
│       ├── User.js                  # User model
│       └── Task.js                  # Task model
├── scripts/
│   └── seed.js                      # Database seeding script
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🎨 Design Features

- **Professional UI**: Clean, modern design suitable for professional CA/CS firms
- **Responsive**: Fully responsive design works on desktop, tablet, and mobile
- **Smooth Animations**: Subtle animations for better user experience
- **Color-Coded**: Priority and status badges for quick visual identification
- **Accessibility**: Semantic HTML and accessible form controls

## 🔐 Security Features

- **Password Hashing**: Using bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies
- **Role-Based Access**: Different access levels for admin and employees
- **Protected Routes**: API routes protected with authentication middleware

## 🌟 Key Functionality

### Task Priority Levels
- **Low**: Regular tasks
- **Medium**: Important tasks
- **High**: Urgent/critical tasks

### Task Status Flow
1. **Pending**: Newly assigned task
2. **In Progress**: Employee is working on it
3. **Completed**: Task finished

### Remarks System
- Employees can add notes while updating tasks
- Track progress through timeline of remarks
- Each remark shows who added it and when

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - Get all employees
- `POST /api/users` - Create new employee
- `PUT /api/users/[id]` - Update employee
- `DELETE /api/users/[id]` - Delete employee

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/[id]` - Get single task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task (Admin only)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 📱 Usage Guide

### For Admins

1. **Creating Employees**
   - Click "Add Employee" button
   - Fill in name, email, password, and designation
   - Employee can now log in with their credentials

2. **Creating Tasks**
   - Click "Create Task" button
   - Fill in task details (title, description, priority, due date)
   - Select employee to assign
   - Task appears in employee's dashboard

3. **Managing Tasks**
   - Use filters to find specific tasks
   - Click edit icon to modify task details
   - Click delete icon to remove tasks
   - View employee-wise task distribution table

### For Employees

1. **Viewing Tasks**
   - All assigned tasks visible on dashboard
   - Use status filter to find specific tasks

2. **Updating Tasks**
   - Select new status from dropdown
   - Add optional remark explaining progress
   - Submit to update task

## 🚀 Production Deployment

### Environment Variables for Production

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret-min-32-chars
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Build for Production

```bash
npm run build
npm start
```

### Deployment Platforms

This app can be deployed on:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Render**
- **AWS/Google Cloud/Azure**

## 🔄 Future Enhancements

Potential features for future versions:
- Task notifications via email
- File attachments for tasks
- Task categories/tags
- Advanced reporting and analytics
- Calendar view for tasks
- Task dependencies
- Time tracking
- Client portal
- Mobile app

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list             # macOS
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

### Clear Database and Reseed
```bash
# Connect to MongoDB and drop database
mongosh
use ca-task-manager
db.dropDatabase()
exit

# Run seed script again
node scripts/seed.js
```

## 📄 License

This project is created for educational purposes.

## 🤝 Support

For issues or questions, please create an issue in the project repository.

---
Auto deploy test 123

**Built with ❤️ for CA/CS Firms**
