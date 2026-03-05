# System Architecture

## Technology Stack

```
┌─────────────────────────────────────────────┐
│            Frontend Layer                    │
├─────────────────────────────────────────────┤
│  Next.js 14 (App Router)                    │
│  React 18                                    │
│  Tailwind CSS                                │
│  JavaScript                                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          API Layer (Next.js)                │
├─────────────────────────────────────────────┤
│  /api/auth/*      - Authentication          │
│  /api/users/*     - User Management         │
│  /api/tasks/*     - Task Operations         │
│  /api/dashboard/* - Statistics              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database Layer                      │
├─────────────────────────────────────────────┤
│  MongoDB                                    │
│  Mongoose ODM                               │
│  Collections: Users, Tasks                  │
└─────────────────────────────────────────────┘
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'employee',
  designation: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  priority: 'Low' | 'Medium' | 'High',
  status: 'Pending' | 'In Progress' | 'Completed',
  dueDate: Date,
  assignedTo: ObjectId (ref: User),
  assignedBy: ObjectId (ref: User),
  remarks: [{
    note: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## User Flow Diagrams

### Admin Flow
```
Login → Admin Dashboard
  ├── View Statistics
  ├── Manage Employees
  │   ├── Create Employee
  │   ├── Edit Employee
  │   └── Delete Employee
  ├── Manage Tasks
  │   ├── Create Task
  │   ├── Edit Task
  │   ├── Delete Task
  │   └── Filter Tasks
  └── View Employee Distribution
```

### Employee Flow
```
Login → Employee Dashboard
  ├── View Assigned Tasks
  ├── View Statistics
  ├── Update Task Status
  │   ├── Change Status
  │   └── Add Remarks
  └── Filter Tasks by Status
```

## Authentication Flow

```
1. User enters credentials
   ↓
2. POST /api/auth/login
   ↓
3. Verify credentials
   ↓
4. Generate JWT token
   ↓
5. Set HTTP-only cookie
   ↓
6. Redirect based on role
   ├── Admin → /admin/dashboard
   └── Employee → /employee/dashboard
```

## API Request Flow

```
Client Request
   ↓
Middleware (Auth Check)
   ↓
Extract JWT from Cookie
   ↓
Verify Token
   ↓
[Valid] → Process Request → Return Response
   ↓
[Invalid] → Return 401 Unauthorized
```

## Component Architecture

```
App (Root Layout)
  │
  ├── Login Page (/)
  │
  ├── Admin Dashboard (/admin/dashboard)
  │   ├── Navbar
  │   ├── Stats Cards
  │   ├── Task Cards
  │   ├── Task Modal
  │   └── Employee Modal
  │
  └── Employee Dashboard (/employee/dashboard)
      ├── Navbar
      ├── Stats Cards
      ├── Task Cards
      └── Remark Modal
```

## Security Measures

1. **Password Security**
   - Passwords hashed using bcryptjs
   - Salt rounds: 10
   - Never stored in plain text

2. **Authentication**
   - JWT tokens for session management
   - HTTP-only cookies prevent XSS attacks
   - 7-day token expiration

3. **Authorization**
   - Role-based access control (RBAC)
   - Middleware checks on protected routes
   - API endpoints verify user permissions

4. **Database Security**
   - Mongoose schema validation
   - Input sanitization
   - No direct MongoDB queries from frontend

## Performance Optimizations

1. **Database**
   - Indexed fields: email (unique)
   - Population used for relationships
   - Connection pooling via Mongoose

2. **Frontend**
   - Next.js App Router for optimal loading
   - Component-level code splitting
   - Optimized re-renders with React hooks

3. **Caching**
   - Static assets cached by browser
   - API responses fresh on each request
   - MongoDB connection cached globally

## Deployment Considerations

### Environment Variables
- MONGODB_URI - Database connection
- JWT_SECRET - Token signing key
- NEXTAUTH_SECRET - NextAuth secret
- NODE_ENV - Environment flag

### Build Process
```bash
npm run build    # Creates optimized production build
npm start        # Starts production server
```

### Database Migration
- No migrations needed (NoSQL)
- Schema changes handled by Mongoose
- Seed script for initial data

## Scalability

### Horizontal Scaling
- Stateless API design
- Session stored in JWT (not server)
- Can run multiple instances

### Vertical Scaling
- MongoDB can handle millions of documents
- Indexes improve query performance
- Connection pooling reduces overhead

### Future Considerations
- Redis for caching
- Message queue for notifications
- File storage service (S3, Cloudinary)
- WebSocket for real-time updates
