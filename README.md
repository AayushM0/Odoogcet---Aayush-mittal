# Dayflow HRMS

**Clarity-first Human Resource Management System for small enterprises (<50 employees)**

Built with the BMad Method (BMM) - Standard Greenfield Track

---

## 📋 Project Status

**Current Phase:** BMM Phase 1 - Analysis

**Status:** Planning and requirements gathering in progress

---

## 🎯 Project Vision

Dayflow will be a hackathon-scale HRMS that prioritizes **explainability over automation**. Every attendance mark, leave decision, and payroll calculation will be human-approved, deterministic, and fully traceable.

### Planned Core Features

- 🔄 **Attendance Management** - Daily marking with auto-checkout at 6 PM
- 🔄 **Leave Management** - Request-approval workflow with immutable finality
- 🔄 **Payroll System** - Transparent calculation with full breakdown visibility
- 🔄 **Notifications** - Real-time updates for leave and payroll events
- 🔄 **Audit Logging** - Complete traceability for all state changes

---

## 🏗️ Planned Architecture

### Tech Stack (To Be Implemented)

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Custom (bcrypt + sessions)
- **Deployment**: Vercel/Docker

### Planned Project Structure

```
dayflow-hrms/
├── src/
│   ├── app/
│   │   ├── api/              # API route handlers (To be built)
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── users/        # User management
│   │   │   ├── attendance/   # Attendance endpoints
│   │   │   ├── leave/        # Leave endpoints
│   │   │   ├── payroll/      # Payroll endpoints
│   │   │   └── notifications/# Notification endpoints
│   │   ├── login/            # Login page (To be built)
│   │   ├── home/             # Dashboard (To be built)
│   │   ├── attendance/       # Attendance page (To be built)
│   │   ├── leave/            # Leave page (To be built)
│   │   ├── payroll/          # Payroll page (To be built)
│   │   └── notifications/    # Notifications page (To be built)
│   ├── components/           # Shared components (To be built)
│   ├── lib/                  # Utilities (To be built)
│   └── models/               # Data models (To be designed)
├── scripts/                  # Build scripts (To be created)
└── README.md
```

---

## 🚀 Getting Started (Coming Soon)

### Prerequisites (For Future Implementation)

- Node.js 18+ 
- MongoDB 6+ (local or cloud)
- npm or yarn

### Installation (Not Yet Available)

1. **Clone the repository**

```bash
git clone <repository-url>
cd dayflow-hrms
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/dayflow
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

4. **Start MongoDB**

If running locally:

```bash
# macOS/Linux
mongod --dbpath /path/to/data

# Windows
mongod --dbpath C:\path\to\data

# Or use Docker
docker run -d -p 27017:27017 --name dayflow-mongo mongo:latest
```

5. **Seed the database**

```bash
npm run seed
```

This will create:
- 1 admin user
- 5 employee users
- Sample attendance records for the current month
- Sample leave requests (approved, pending, rejected)
- Notifications and audit logs

6. **Start the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 👥 Demo Credentials (To Be Created)

### Planned Admin Account
- **Email**: `admin@dayflow.com`
- **Password**: `admin123`

### Planned Employee Accounts
- Multiple test accounts will be seeded during implementation

---

## 📋 Business Rules Enforced

### 1. Admin-Only Onboarding
- Only admins can create new employee accounts
- Route: `POST /api/users` (requires admin role)

### 2. Email Verification
- All users must verify email before login
- Enforced in `POST /api/auth/login`

### 3. Attendance Auto-Checkout
- If not manually checked out, system auto-checks out at 6 PM
- Implemented in `attendanceService.autoCheckout()`
- Run as scheduled job in production

### 4. Leave Finality
- Once approved/rejected, leave status is **immutable**
- Enforced in `leaveService.reviewLeave()` with status check
- Prevents data manipulation disputes

### 5. Payroll Visibility
- Employees can **only** see finalized payroll
- Draft payroll visible only to admins
- Enforced in `GET /api/payroll` with role-based filtering

### 6. Payroll Calculation Transparency
- Every payroll record includes:
  - Calculation formula
  - Attendance breakdown
  - Leave breakdown
  - Full audit trail

---

## 🎨 User Flows

### Admin Workflow

1. **Login** → Dashboard with quick stats
2. **Mark Attendance** → Select date, mark employees as Present/Absent/Half-Day/Late
3. **Review Leaves** → Approve/reject pending requests with comments
4. **Generate Payroll** → Select month/year, generate draft payroll
5. **Finalize Payroll** → Make payroll visible to employees

### Employee Workflow

1. **Login** → Dashboard with leave balances and attendance summary
2. **View Attendance** → See personal attendance history
3. **Apply for Leave** → Select type, dates, provide reason
4. **Check Notifications** → See leave approval/rejection, payroll updates
5. **View Payroll** → See finalized payslips with calculation breakdown

---

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/verify-email?token=xyz` - Verify email

### Users
- `GET /api/users` - List employees (admin only)
- `POST /api/users` - Create employee (admin only)

### Attendance
- `GET /api/attendance` - Get attendance records (role-scoped)
- `POST /api/attendance` - Mark attendance (admin only)

### Leave
- `GET /api/leave` - Get leave requests (role-scoped)
- `POST /api/leave` - Submit leave request (employee only)
- `PATCH /api/leave/[id]` - Approve/reject leave (admin only)

### Payroll
- `GET /api/payroll` - Get payroll records (role-scoped)
- `POST /api/payroll/generate` - Generate payroll (admin only)
- `POST /api/payroll/finalize` - Finalize payroll (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark as read

---

## 🧪 Testing the System

### Scenario 1: Attendance → Payroll Flow

1. Login as **admin**
2. Go to **Attendance** page
3. Mark attendance for employees for current month
4. Go to **Payroll** page
5. Generate payroll for current month
6. Review calculation details (click "Show" on any record)
7. Finalize payroll
8. Login as **employee** (e.g., john@dayflow.com)
9. Go to **Payroll** page
10. Verify you can see finalized payroll with breakdown

### Scenario 2: Leave Request Flow

1. Login as **employee** (e.g., jane@dayflow.com)
2. Go to **Leave** page
3. Check current leave balances
4. Click "Apply for Leave"
5. Fill form (type, dates, reason) and submit
6. Logout and login as **admin**
7. Go to **Leave** page
8. See pending request
9. Click "Approve" and add comment
10. Logout and login as **employee**
11. Go to **Notifications** page
12. See approval notification

### Scenario 3: Leave Finality Rule

1. Login as **admin**
2. Go to **Leave** page
3. Find an approved leave
4. Try to change status (click Approve/Reject again)
5. Verify error: "Leave already approved. Cannot change status"

---

## 🏆 Hackathon Demo Tips

### For Judges

1. **Traceability Demo** (3 minutes)
   - Show payroll calculation breakdown
   - Click "Show" on any payroll record
   - Point out formula, attendance data, leave data
   - Highlight how every number is traceable

2. **Business Rules Demo** (2 minutes)
   - Show leave finality (try to change approved leave)
   - Show payroll visibility (employee sees only finalized)
   - Show admin-only onboarding

3. **Complete Workflow** (5 minutes)
   - Mark attendance → Request leave → Approve leave → Generate payroll → Finalize payroll
   - Show notifications at each step
   - Demonstrate role-based views

### Key Talking Points

- ✅ **No black boxes** - Every calculation is explainable
- ✅ **Human-approved** - No AI/ML magic, all decisions traceable
- ✅ **Immutable audit trail** - Once finalized, records can't be changed
- ✅ **Hackathon-appropriate** - Feature-complete, no over-engineering
- ✅ **Production-ready patterns** - Role-based access, sessions, audit logs

---

## 🛠️ Production Deployment

### Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayflow
SESSION_SECRET=generate-a-secure-random-string-here
NODE_ENV=production
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP (0.0.0.0/0 for demo)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### Auto-Checkout Cron Job

In production, set up a cron job to run daily at 6 PM:

```bash
# Add to crontab or use a service like Vercel Cron
0 18 * * * curl -X POST https://your-domain.com/api/attendance/auto-checkout
```

Or create a Vercel Cron Job in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/attendance/auto-checkout",
      "schedule": "0 18 * * *"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If connection fails, check MONGODB_URI in .env
# Ensure MongoDB is accessible on the specified host/port
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Seed Script Issues

```bash
# Make sure MongoDB is running first
# Then run seed script
npm run seed

# If errors persist, check MONGODB_URI
```

---

## 📚 Database Schema

### Collections

- **users** - Admin and employee accounts
- **attendance** - Daily attendance records
- **leaves** - Leave requests and approvals
- **payroll** - Payroll records (draft and finalized)
- **notifications** - User notifications
- **auditLogs** - Complete audit trail

### Indexes

```javascript
// users
{ email: 1 } (unique)
{ role: 1 }

// attendance
{ employeeId: 1, date: 1 } (unique compound)
{ date: 1 }

// leaves
{ employeeId: 1, status: 1 }
{ status: 1 }

// payroll
{ employeeId: 1, month: 1, year: 1 } (unique compound)
{ status: 1 }

// notifications
{ userId: 1, isRead: 1 }

// auditLogs
{ entityType: 1, entityId: 1 }
{ timestamp: 1 }
```

---

## 🎓 BMM Phase Progress

### Phase 1: Analysis 🔄 IN PROGRESS
- ✅ Defining target users and core problems
- ✅ Establishing business goals
- 🔄 Creating success criteria
- 🔄 Documenting non-goals

### Phase 2: Planning 📋 UPCOMING
- Product Requirements Document (PRD)
- Page-by-page UX design
- Business rule mapping

### Phase 3: Solutioning 🔧 UPCOMING
- Architecture design
- Data model creation
- API route planning
- Authentication flow design

### Phase 4: Implementation 💻 UPCOMING
- Next.js application development
- API route implementation
- Frontend page creation
- Testing and documentation

---

## 📝 License

MIT License - Built for hackathon demonstration

---

## 🤝 Contributing

This is a hackathon project built with BMad Method. For production use:
1. Add comprehensive tests
2. Implement email service for verification
3. Add more robust error handling
4. Implement proper session storage (Redis)
5. Add rate limiting and security headers

---

## 📞 Support

For issues or questions during hackathon evaluation:
- Check troubleshooting section above
- Review business rules enforcement
- Test with provided demo credentials

---

**Built with ❤️ using the BMad Method**
