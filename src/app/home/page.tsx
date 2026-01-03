'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';

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
        const [usersRes, leavesRes, payrollRes, attendanceRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/leave'),
          fetch('/api/payroll'),
          fetch('/api/attendance'),
        ]);

        const usersData = await usersRes.json();
        const leavesData = await leavesRes.json();
        const payrollData = await payrollRes.json();
        const attendanceData = await attendanceRes.json();

        const pendingLeaves = leavesData.leaves?.filter((l: any) => l.status === 'pending').length || 0;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentMonthPayroll = payrollData.payrolls?.find(
          (p: any) => p.month === currentMonth && p.year === currentYear
        );

        // Count today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceData.attendance?.filter((a: any) => {
          return new Date(a.date).toISOString().split('T')[0] === today && 
                 (a.status === 'present' || a.status === 'late');
        }).length || 0;

        setStats({
          totalEmployees: usersData.users?.length || 0,
          pendingLeaves,
          payrollStatus: currentMonthPayroll?.status || 'not generated',
          attendanceToday: todayAttendance,
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
        {user?.role === 'admin' ? (
          // Admin Dashboard
          <div>
            {/* KPI Strip */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-primary-500 p-3">
                        <span className="text-2xl">⚑</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Employees
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats?.totalEmployees || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-orange-500 p-3">
                        <span className="text-2xl">⊡</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Leaves
                        </dt>
                        <dd className="text-3xl font-semibold text-orange-600">
                          {stats?.pendingLeaves || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-yellow-500 p-3">
                        <span className="text-2xl">₹</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Payroll Status
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900 capitalize">
                          {stats?.payrollStatus || 'Not Generated'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-green-500 p-3">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Attendance Today
                        </dt>
                        <dd className="text-3xl font-semibold text-green-600">
                          {stats?.attendanceToday || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href="/onboard"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <span className="mr-2">+</span>
                  Onboard Employee
                </a>
                <a
                  href="/attendance"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <span className="mr-2">✓</span>
                  Mark Attendance
                </a>
                <a
                  href="/payroll"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <span className="mr-2">₹</span>
                  Generate Payroll
                </a>
              </div>
            </div>

            {/* Pending Work Table */}
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pending Work</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.pendingLeaves > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="pending" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stats.pendingLeaves} Leave Request(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Pending approval
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a href="/leave" className="text-primary-600 hover:text-primary-900 font-medium">
                            Review →
                          </a>
                        </td>
                      </tr>
                    )}
                    {stats?.payrollStatus === 'draft' && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="draft" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Payroll Draft
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a href="/payroll" className="text-primary-600 hover:text-primary-900 font-medium">
                            Open →
                          </a>
                        </td>
                      </tr>
                    )}
                    {stats?.pendingLeaves === 0 && stats?.payrollStatus !== 'draft' && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                          All caught up! No pending work.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Employee Dashboard
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-green-500 p-3">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Attendance This Month
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats?.attendanceThisMonth || 0}
                        </dd>
                        <dd className="text-xs text-gray-500 mt-1">days present</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-green-600 p-3">
                        <span className="text-2xl">₹</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Last Payroll
                        </dt>
                        <dd className="text-2xl font-semibold text-green-600">
                          ₹{stats?.lastPayrollAmount?.toFixed(2) || '0.00'}
                        </dd>
                        <dd className="text-xs text-gray-500 mt-1">net pay</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="rounded-md bg-orange-500 p-3">
                        <span className="text-2xl">⊡</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Leave Balance
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {(user?.leaveBalances?.casual || 0) + (user?.leaveBalances?.sick || 0) + (user?.leaveBalances?.paid || 0)}
                        </dd>
                        <dd className="text-xs text-gray-500 mt-1">days available</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balances Breakdown */}
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-600">Casual Leave</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {user?.leaveBalances?.casual || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days remaining</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-600">Sick Leave</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {user?.leaveBalances?.sick || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days remaining</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-gray-600">Paid Leave</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {user?.leaveBalances?.paid || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days remaining</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="/leave"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <span className="mr-2">⊡</span>
                  Apply for Leave
                </a>
                <a
                  href="/attendance"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <span className="mr-2">✓</span>
                  View My Attendance
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
