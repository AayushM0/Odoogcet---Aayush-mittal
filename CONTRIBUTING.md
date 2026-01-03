# Contributing to Dayflow

## Development Setup

1. **Fork and clone**
```bash
git clone <your-fork>
cd dayflow-hrms
```

2. **Install dependencies**
```bash
npm install
```

3. **Start MongoDB**
```bash
mongod --dbpath ./data
```

4. **Seed database**
```bash
npm run seed
```

5. **Start dev server**
```bash
npm run dev
```

## Code Style

- TypeScript everywhere
- Tailwind for styling
- ESLint for linting
- Prettier for formatting

## Commit Convention

```
feat: Add email notification service
fix: Correct payroll calculation for half-days
docs: Update README with deployment steps
refactor: Extract attendance logic to service
test: Add unit tests for leave service
```

## Pull Request Process

1. Create feature branch from `main`
2. Make changes following code style
3. Test locally with demo accounts
4. Update documentation if needed
5. Submit PR with clear description

## Testing Checklist

- [ ] Login as admin and employee
- [ ] Test attendance marking
- [ ] Test leave request and approval
- [ ] Test payroll generation and finalization
- [ ] Verify notifications are created
- [ ] Check audit logs are recorded
- [ ] Test all business rules (finality, visibility, etc.)

## Business Rules (DO NOT CHANGE)

These are core requirements from the BMM specification:

1. Admin-only onboarding
2. Email verification
3. Attendance auto-checkout
4. Leave finality
5. Payroll visibility only

Any changes to these rules require discussion and approval.

## Adding New Features

1. Follow BMM phases:
   - Analysis: Define problem and requirements
   - Planning: Design UX and flows
   - Solutioning: Design data models and logic
   - Implementation: Write code

2. Ensure traceability:
   - Add audit logging
   - Create notifications
   - Update documentation

3. Maintain clarity:
   - Explainable calculations
   - Human-readable error messages
   - Transparent workflows

## Questions?

Open an issue with:
- Clear description
- Steps to reproduce (if bug)
- Expected vs actual behavior
- Screenshots if applicable
