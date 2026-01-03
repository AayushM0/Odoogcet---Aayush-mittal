import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow';

async function seed() {
  console.log('MONGODB_URI:', MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Extract database name from connection string
    let dbName = 'dayflow';
    const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
    
    console.log(`Using database: ${dbName}`);
    const db = client.db(dbName);

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('attendance').deleteMany({});
    await db.collection('leaves').deleteMany({});
    await db.collection('payroll').deleteMany({});
    await db.collection('notifications').deleteMany({});
    await db.collection('auditLogs').deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await db.collection('users').insertOne({
      email: 'admin@dayflow.com',
      password: adminPassword,
      role: 'admin',
      name: 'Admin User',
      isEmailVerified: true,
      verificationToken: null,
      baseSalary: 0,
      leaveBalances: {
        casual: 0,
        sick: 0,
        paid: 0,
      },
      joinDate: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const adminId = adminResult.insertedId;
    console.log('Admin created:', adminId);

    // Create employee users
    console.log('Creating employee users...');
    const employeePassword = await bcrypt.hash('password123', 10);
    
    const employees = [
      {
        email: 'john@dayflow.com',
        name: 'John Doe',
        baseSalary: 50000,
        joinDate: new Date('2024-01-15'),
      },
      {
        email: 'jane@dayflow.com',
        name: 'Jane Smith',
        baseSalary: 55000,
        joinDate: new Date('2024-02-01'),
      },
      {
        email: 'mike@dayflow.com',
        name: 'Mike Johnson',
        baseSalary: 48000,
        joinDate: new Date('2024-01-20'),
      },
      {
        email: 'sarah@dayflow.com',
        name: 'Sarah Williams',
        baseSalary: 52000,
        joinDate: new Date('2024-02-10'),
      },
      {
        email: 'david@dayflow.com',
        name: 'David Brown',
        baseSalary: 51000,
        joinDate: new Date('2024-01-25'),
      },
    ];

    const employeeIds: ObjectId[] = [];
    for (const emp of employees) {
      const result = await db.collection('users').insertOne({
        email: emp.email,
        password: employeePassword,
        role: 'employee',
        name: emp.name,
        isEmailVerified: true,
        verificationToken: null,
        baseSalary: emp.baseSalary,
        leaveBalances: {
          casual: 12,
          sick: 10,
          paid: 15,
        },
        joinDate: emp.joinDate,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      employeeIds.push(result.insertedId);
      console.log(`Employee created: ${emp.name} (${result.insertedId})`);
    }

    // Create attendance records for the past month
    console.log('Creating attendance records...');
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      currentDate.setHours(0, 0, 0, 0);

      for (const empId of employeeIds) {
        // Random attendance status (mostly present)
        const rand = Math.random();
        let status: string;
        if (rand < 0.85) status = 'present';
        else if (rand < 0.90) status = 'half-day';
        else if (rand < 0.95) status = 'late';
        else status = 'absent';

        const checkIn = status !== 'absent' ? new Date(currentDate.getTime() + 9 * 60 * 60 * 1000) : null;
        const checkOut = status !== 'absent' ? new Date(currentDate.getTime() + 18 * 60 * 60 * 1000) : null;

        await db.collection('attendance').insertOne({
          employeeId: empId,
          date: currentDate,
          status,
          checkIn,
          checkOut,
          autoCheckedOut: false,
          markedBy: adminId,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    console.log('Attendance records created');

    // Create some leave requests
    console.log('Creating leave requests...');
    
    // Approved leave for first employee
    const leave1 = await db.collection('leaves').insertOne({
      employeeId: employeeIds[0],
      leaveType: 'casual',
      startDate: new Date(today.getFullYear(), today.getMonth(), 10),
      endDate: new Date(today.getFullYear(), today.getMonth(), 12),
      reason: 'Family function',
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminComment: 'Approved',
      daysRequested: 3,
      createdAt: new Date(today.getFullYear(), today.getMonth(), 5),
      updatedAt: new Date(),
    });

    // Update leave balance for first employee
    await db.collection('users').updateOne(
      { _id: employeeIds[0] },
      { $inc: { 'leaveBalances.casual': -3 } }
    );

    // Pending leave for second employee
    await db.collection('leaves').insertOne({
      employeeId: employeeIds[1],
      leaveType: 'sick',
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 6),
      reason: 'Medical appointment',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      adminComment: null,
      daysRequested: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rejected leave for third employee
    await db.collection('leaves').insertOne({
      employeeId: employeeIds[2],
      leaveType: 'paid',
      startDate: new Date(today.getFullYear(), today.getMonth(), 20),
      endDate: new Date(today.getFullYear(), today.getMonth(), 22),
      reason: 'Personal travel',
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminComment: 'Team shortage during this period',
      daysRequested: 3,
      createdAt: new Date(today.getFullYear(), today.getMonth(), 15),
      updatedAt: new Date(),
    });

    console.log('Leave requests created');

    // Create notifications
    console.log('Creating notifications...');
    
    await db.collection('notifications').insertOne({
      userId: employeeIds[0],
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your casual leave request for 3 day(s) has been approved',
      relatedEntity: {
        entityType: 'leave',
        entityId: leave1.insertedId,
      },
      isRead: false,
      createdAt: new Date(),
    });

    await db.collection('notifications').insertOne({
      userId: adminId,
      type: 'leave',
      title: 'New Leave Request',
      message: 'Jane Smith has requested 2 day(s) of sick leave',
      relatedEntity: null,
      isRead: false,
      createdAt: new Date(),
    });

    console.log('Notifications created');

    // Create audit logs
    console.log('Creating audit logs...');
    
    await db.collection('auditLogs').insertOne({
      actor: adminId,
      action: 'user.created',
      entityType: 'user',
      entityId: employeeIds[0],
      changes: {
        before: null,
        after: { name: 'John Doe', email: 'john@dayflow.com' },
      },
      metadata: {
        ip: null,
        userAgent: null,
        reason: 'Initial seed',
      },
      timestamp: new Date(),
    });

    console.log('Audit logs created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@dayflow.com / admin123');
    console.log('Employee: john@dayflow.com / password123');
    console.log('Employee: jane@dayflow.com / password123');
    console.log('Employee: mike@dayflow.com / password123');
    console.log('Employee: sarah@dayflow.com / password123');
    console.log('Employee: david@dayflow.com / password123');

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
