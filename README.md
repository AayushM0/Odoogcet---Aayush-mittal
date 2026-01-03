# Dayflow HRMS

**Clarity-first Human Resource Management System for small enterprises (<50 employees)**

Built with the BMad Method (BMM) - Standard Greenfield Track

---

## 📋 Project Status

**Current Phase:** BMM Phase 1 - Analysis  
**Status:** Requirements gathering and planning in progress

---

## 🎯 Project Vision

Dayflow is an HRMS that prioritizes **explainability over automation**. Every attendance mark, leave decision, and payroll calculation will be human-approved, deterministic, and fully traceable.

### Core Philosophy
- **Clarity First**: No black-box algorithms
- **Human-Approved**: All decisions require explicit approval
- **Deterministic**: Same inputs always produce same outputs
- **Traceable**: Complete audit trail for compliance

---

## 🔧 Planned Features

### 1. Attendance Management
- Daily marking by admins (Present/Absent/Half-Day/Late)
- Auto-checkout at 6 PM for unclosed records
- Historical view and reporting

### 2. Leave Management
- Employee leave requests with balance tracking
- Admin approval workflow with comments
- **Immutable finality** - once approved/rejected, cannot be changed
- Leave types: Casual, Sick, Paid

### 3. Payroll System
- Generate monthly payroll based on attendance + leaves
- Transparent calculation with formula breakdown
- **Visibility rule** - employees see only finalized payroll
- Full audit trail for each calculation

### 4. Notifications
- Real-time updates for leave approvals/rejections
- Payroll finalization alerts
- System events tracking

### 5. Audit Logging
- Every state change recorded
- Actor, timestamp, before/after states
- Immutable audit trail for disputes

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Custom (bcrypt + sessions)

### Business Rules Enforcement

**1. Admin-Only Onboarding**  
Only admins can create employee accounts via `POST /api/users`

**2. Email Verification**  
Users must verify email before login access is granted

**3. Attendance Auto-Checkout**  
System auto-checks out employees at 6 PM if not manually done

**4. Leave Finality**  
Once approved/rejected, leave status becomes immutable

**5. Payroll Visibility**  
Employees can only see finalized payroll (not drafts)

**6. Calculation Transparency**  
Every payroll includes formula, attendance data, leave data

---

## 👥 User Roles

### Admin
- Onboard employees
- Mark daily attendance
- Approve/reject leave requests
- Generate and finalize payroll
- View all data and audit logs

### Employee
- View own attendance history
- Submit leave requests
- Check leave balances
- View finalized payroll with breakdown
- Receive notifications

---

## 🎓 BMM Methodology

### Phase 1: Analysis (Current)
- Define target users and problems
- Establish business goals and non-goals
- Create success criteria

### Phase 2: Planning (Upcoming)
- Product Requirements Document
- Page-by-page UX design
- Business rule mapping

### Phase 3: Solutioning (Upcoming)
- Architecture design
- Data model creation
- API route planning

### Phase 4: Implementation (Upcoming)
- Application development
- Testing and documentation

---

## 📝 License

MIT License - Built for educational/hackathon purposes

---

**Built with ❤️ using the BMad Method**
