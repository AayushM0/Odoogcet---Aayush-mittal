'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface User {
  id: string;
  name: string;
  role: string;
  leaveBalances?: {
    casual: number;
    sick: number;
    paid: number;
  };
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setUser(sessionData.user);

      if (sessionData.user?.role === 'admin') {
        // Fetch admin stats
        const [usersRes, leavesRes, payrollRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/leave'),
          fetch('/api/payroll'),
        ]);

        const usersData = await usersRes.json();
        const leavesData = await leavesRes.json();
        const payrollData = await payrollRes.json();

        const pendingLeaves = leavesData.leaves?.filter((l: any) => l.status === 'pending').length || 0;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentMonthPayroll = payrollData.payrolls?.find(
          (p: any) => p.month === currentMonth && p.year === currentYear
        );

        setStats({
          totalEmployees: usersData.users?.length || 0,
          pendingLeaves,
          payrollStatus: currentMonthPayroll?.status || 'not generated',
        });
      } else {
        // Fetch employee stats
        const [attendanceRes, payrollRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/payroll'),
        ]);

        const attendanceData = await attendanceRes.json();
        const payrollData = await payrollRes.json();

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthAttendance = attendanceData.attendance?.filter((a: any) => {
          const date = new Date(a.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const presentDays = thisMonthAttendance?.filter(
          (a: any) => a.status === 'present' || a.status === 'late'
        ).length || 0;

        const lastPayroll = payrollData.payrolls?.[0];

        setStats({
          attendanceThisMonth: presentDays,
          lastPayrollAmount: lastPayroll?.netPay || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Your Overview'}
          </p>
        </div>

        {user?.role === 'admin' ? (
          // Admin View
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Employees
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats?.totalEmployees}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Leave Requests
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-orange-600">
                    {stats?.pendingLeaves}
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Payroll Status
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                    {stats?.payrollStatus}
                  </dd>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <a
                  href="/attendance"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Mark Attendance
                </a>
                <a
                  href="/leave"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  View Leave Requests
                </a>
                <a
                  href="/payroll"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Manage Payroll
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Employee View
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Attendance This Month
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats?.attendanceThisMonth} days
                  </dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Payroll
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    ₹{stats?.lastPayrollAmount?.toFixed(2)}
                  </dd>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Balances</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Casual Leave</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {user?.leaveBalances?.casual}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sick Leave</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user?.leaveBalances?.sick}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Paid Leave</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {user?.leaveBalances?.paid}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href="/leave"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Apply for Leave
                </a>
                <a
                  href="/attendance"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  View Attendance
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
