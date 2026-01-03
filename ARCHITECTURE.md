# Architecture Documentation

## System Overview

Dayflow follows a clean 3-tier architecture:

1. **Presentation Layer** - Next.js pages and components
2. **Business Logic Layer** - Service classes enforcing domain rules
3. **Data Layer** - MongoDB with typed models

## Data Flow

```
User Action (Frontend)
    ↓
API Route (Validation & Auth)
    ↓
Service Layer (Business Rules)
    ↓
Database (MongoDB)
    ↓
Audit Log + Notification
```

## Business Rules Enforcement

### 1. Admin-Only Onboarding
**Location**: `src/app/api/users/route.ts`
```typescript
const admin = await requireAdmin(); // Throws if not admin
```

### 2. Email Verification
**Location**: `src/lib/auth.ts` → `POST /api/auth/login`
```typescript
if (!user.isEmailVerified) {
  return error("Email not verified");
}
```

### 3. Attendance Auto-Checkout
**Location**: `src/lib/services/attendanceService.ts`
```typescript
export async function autoCheckout() {
  // Find records with checkOut = null
  // Set checkOut to 6 PM
  // Mark autoCheckedOut = true
}
```
**Trigger**: Scheduled job (daily at 6 PM)

### 4. Leave Finality
**Location**: `src/lib/services/leaveService.ts`
```typescript
if (leave.status !== "pending") {
  throw new Error("Leave already final");
}
```

### 5. Payroll Visibility
**Location**: `src/lib/services/payrollService.ts`
```typescript
if (!includeAll) {
  query.status = "finalized"; // Employees see only finalized
}
```

### 6. Payroll Calculation
**Location**: `src/lib/services/payrollService.ts`
```typescript
const grossPay = (baseSalary / workingDays) × daysPresent;
const netPay = grossPay - deductions;
// Store with full calculationDetails
```

## Database Schema Design

### Normalization Strategy
- Users collection stores base data
- Attendance, Leave, Payroll reference users by ObjectId
- No embedded documents (keeps data clean)

### Indexes
```javascript
// Performance-critical queries
users: { email: 1 } (unique)
attendance: { employeeId: 1, date: 1 } (compound)
leaves: { employeeId: 1, status: 1 }
payroll: { employeeId: 1, month: 1, year: 1 }
```

### Audit Trail
Every state change creates an auditLog:
```typescript
{
  actor: ObjectId,
  action: "leave.approved",
  entityType: "leave",
  entityId: ObjectId,
  changes: { before, after },
  timestamp: Date
}
```

## Security

### Authentication
- Custom session-based (not JWT)
- Sessions stored in httpOnly cookies
- bcrypt for password hashing (10 rounds)

### Authorization
- Middleware checks session on protected routes
- API routes use `requireAuth()` or `requireAdmin()`
- Role-based data filtering in services

### Data Validation
- TypeScript ensures type safety
- API routes validate input before service calls
- MongoDB schema validation (not enforced in hackathon scope)

## API Design Principles

### RESTful Conventions
- `GET` for reads
- `POST` for creates
- `PATCH` for updates (leave review, notification read)
- No `PUT` or `DELETE` (immutability)

### Error Handling
```typescript
try {
  // Business logic
} catch (error) {
  if (error.message === "Unauthorized") {
    return NextResponse.json({ error }, { status: 403 });
  }
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
```

### Response Format
```typescript
// Success
{ data: {...} }
{ users: [...] }
{ success: true }

// Error
{ error: "Error message" }
```

## Frontend Architecture

### State Management
- Local component state (useState)
- No Redux/Zustand (hackathon scope)
- API calls in useEffect

### Routing
- Next.js App Router (server components where possible)
- Client components for interactive pages ('use client')

### Styling
- Tailwind CSS utility classes
- No custom CSS files (except globals.css)
- Responsive by default (sm:, md:, lg: breakpoints)

## Performance Considerations

### Database Queries
- Indexed fields for common queries
- Aggregation pipelines for joins (attendance with employee data)
- Limit results where appropriate

### Caching
- MongoDB connection pooling (built into driver)
- Session data cached in cookie
- No Redis (hackathon scope)

### Optimization Opportunities (Production)
- Add React Query for client-side caching
- Implement Redis for session storage
- Add CDN for static assets
- Database read replicas for scaling

## Testing Strategy (Production)

### Unit Tests
- Service layer business logic
- Utility functions (auth, date calculations)

### Integration Tests
- API routes with test database
- End-to-end flows (attendance → payroll)

### E2E Tests
- Critical user flows with Playwright
- Admin and employee scenarios

## Monitoring & Observability

### Audit Logs
Every action is logged:
```typescript
await createAuditLog(
  actor,
  action,
  entityType,
  entityId,
  { before, after }
);
```

### Error Tracking
- Console logs in development
- Production: Add Sentry or similar

### Metrics
- Track payroll generation time
- Monitor failed login attempts
- Count pending leave requests

## Scalability

### Current Limits
- Designed for <50 employees
- Single MongoDB instance
- Session storage in memory (cookies)

### Scaling Plan (Beyond Hackathon)
1. **50-200 employees**: Add read replicas, Redis sessions
2. **200-500 employees**: Microservices architecture, separate payroll service
3. **500+ employees**: Multi-tenant SaaS, Kubernetes, event-driven architecture
