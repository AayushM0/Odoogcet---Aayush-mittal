# Dayflow HRMS - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup MongoDB (1 min)

**Option A: Local MongoDB**
```bash
mongod --dbpath ./data
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name dayflow-mongo mongo:latest
```

**Option C: MongoDB Atlas (Cloud)**
- Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `.env.local` with connection string

### Step 3: Configure Environment (30 sec)
```bash
# .env.local is already created with defaults
# If using MongoDB Atlas, update MONGODB_URI:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayflow
```

### Step 4: Seed Database (1 min)
```bash
npm run seed
```

Expected output:
```
Connected to MongoDB
Clearing existing data...
Creating admin user...
Creating employee users...
Creating attendance records...
Creating leave requests...
Creating notifications...
✅ Seed completed successfully!

Demo Credentials:
Admin: admin@dayflow.com / admin123
Employee: john@dayflow.com / password123
...
```

### Step 5: Start Development Server (30 sec)
```bash
npm run dev
```

### Step 6: Open Browser (30 sec)
Navigate to: **http://localhost:3000**

---

## 🎯 First Login

1. **Login as Admin**
   - Email: `admin@dayflow.com`
   - Password: `admin123`

2. **Explore Dashboard**
   - See total employees
   - Check pending leave requests
   - View payroll status

3. **Try Core Features**
   - Mark attendance
   - Review leave requests
   - Generate payroll

---

## 🧪 Testing the System

### Test 1: Mark Attendance (2 min)
1. Go to **Attendance** page
2. Select today's date
3. Mark employees as Present/Absent/Half-Day/Late
4. Verify status badges update

### Test 2: Leave Workflow (3 min)
1. Logout, login as `john@dayflow.com` / `password123`
2. Go to **Leave** page
3. Check leave balances
4. Click "Apply for Leave"
5. Fill form and submit
6. Logout, login as admin
7. Go to **Leave** page
8. Approve the leave request
9. Logout, login as employee
10. Check **Notifications** for approval

### Test 3: Payroll Generation (3 min)
1. Login as admin
2. Go to **Payroll** page
3. Select current month/year
4. Click "Generate"
5. Click "Show" on any record to see calculation
6. Click "Finalize"
7. Logout, login as employee
8. Go to **Payroll** page
9. Verify you can see finalized payroll with breakdown

### Test 4: Business Rules (2 min)
1. Login as admin
2. Go to **Leave** page
3. Find an approved leave
4. Try to click "Approve" again
5. Verify error: "Leave already approved (final)"

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not running, start MongoDB:
mongod --dbpath ./data

# Or check MONGODB_URI in .env.local
```

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Seed Script Fails
```bash
# Make sure MongoDB is running first
mongod --dbpath ./data

# Then run seed
npm run seed

# If still fails, check MONGODB_URI
```

### Can't Login
- Make sure you ran `npm run seed`
- Check credentials:
  - Admin: `admin@dayflow.com` / `admin123`
  - Employee: `john@dayflow.com` / `password123`
- All users are email verified by default in seed data

---

## 📚 Next Steps

### For Developers
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete feature list

### For Deployment
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Setup MongoDB Atlas for cloud database
- Deploy to Vercel or Docker

### For Judges
- Read [README.md](README.md) for complete documentation
- Review business rules enforcement in code
- Test all 6 pages and core workflows

---

## 🎓 Demo Accounts

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@dayflow.com | admin123 | Mark attendance, approve leaves, generate payroll |
| Employee | john@dayflow.com | password123 | View attendance, request leave, view payroll |
| Employee | jane@dayflow.com | password123 | Has pending leave request |
| Employee | mike@dayflow.com | password123 | Has rejected leave |
| Employee | sarah@dayflow.com | password123 | Testing account |
| Employee | david@dayflow.com | password123 | Testing account |

---

## ⚡ Common Tasks

### Reset Database
```bash
npm run seed
```
This will clear all data and recreate demo accounts.

### View Logs
```bash
# In development, check terminal for console.logs
# API errors appear in terminal
# Frontend errors appear in browser console
```

### Check Database
```bash
mongosh
use dayflow
db.users.find()
db.attendance.find()
db.leaves.find()
db.payroll.find()
```

---

## 🎯 Success Checklist

- [ ] MongoDB running
- [ ] Dependencies installed
- [ ] Database seeded
- [ ] Dev server running
- [ ] Can login as admin
- [ ] Can mark attendance
- [ ] Can approve leave
- [ ] Can generate payroll
- [ ] Can see notifications
- [ ] All pages load correctly

---

## 📞 Need Help?

- Check [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Check terminal for error messages
- Check browser console for frontend errors

---

**Ready to demo! 🚀**
