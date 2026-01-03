'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    checkAuthAndFetch();
  }, [selectedMonth, selectedYear]);

  const checkAuthAndFetch = async () => {
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();
    
    if (!sessionData.user || sessionData.user.role !== 'admin') {
      router.push('/home');
      return;
    }
    
    setUser(sessionData.user);
    await fetchReportData();
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [usersRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/attendance'),
        fetch('/api/leave'),
        fetch('/api/payroll'),
      ]);

      const [users, attendance, leaves, payroll] = await Promise.all([
        usersRes.json(),
        attendanceRes.json(),
        leavesRes.json(),
        payrollRes.json(),
      ]);

      // Calculate statistics
      const totalEmployees = users.users?.length || 0;
      
      // Attendance stats for selected month
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);
      
      const monthAttendance = attendance.attendance?.filter((a: any) => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      }) || [];

      const presentCount = monthAttendance.filter((a: any) => a.status === 'present' || a.status === 'late').length;
      const absentCount = monthAttendance.filter((a: any) => a.status === 'absent').length;
      const halfDayCount = monthAttendance.filter((a: any) => a.status === 'half-day').length;

      // Leave stats
      const monthLeaves = leaves.leaves?.filter((l: any) => {
        const startDate = new Date(l.startDate);
        return startDate.getMonth() + 1 === selectedMonth && startDate.getFullYear() === selectedYear;
      }) || [];

      const pendingLeaves = monthLeaves.filter((l: any) => l.status === 'pending').length;
      const approvedLeaves = monthLeaves.filter((l: any) => l.status === 'approved').length;
      const rejectedLeaves = monthLeaves.filter((l: any) => l.status === 'rejected').length;

      // Payroll stats
      const monthPayroll = payroll.payrolls?.filter((p: any) => 
        p.month === selectedMonth && p.year === selectedYear
      ) || [];

      const totalPayroll = monthPayroll.reduce((sum: number, p: any) => sum + p.netPay, 0);

      setReportData({
        totalEmployees,
        attendance: {
          present: presentCount,
          absent: absentCount,
          halfDay: halfDayCount,
          total: monthAttendance.length,
        },
        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
          total: monthLeaves.length,
        },
        payroll: {
          total: totalPayroll,
          count: monthPayroll.length,
          records: monthPayroll,
        },
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-32"
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Employees
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {reportData?.totalEmployees || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Attendance Records
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {reportData?.attendance.total || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Leave Requests
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-orange-600">
                {reportData?.leaves.total || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Payroll
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600">
                ₹{(reportData?.payroll.total || 0).toLocaleString()}
              </dd>
            </div>
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Breakdown</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">
                {reportData?.attendance.present || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {reportData?.attendance.absent || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-3xl font-bold text-yellow-600">
                {reportData?.attendance.halfDay || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportData?.attendance.total > 0
                  ? Math.round((reportData.attendance.present / reportData.attendance.total) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Leave Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {reportData?.leaves.pending || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {reportData?.leaves.approved || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {reportData?.leaves.rejected || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {reportData?.leaves.total > 0
                  ? Math.round((reportData.leaves.approved / reportData.leaves.total) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Payroll Summary */}
        {reportData?.payroll.count > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payroll Summary ({selectedMonth}/{selectedYear})
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{reportData.payroll.total.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Employees Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.payroll.count}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Salary</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{Math.round(reportData.payroll.total / reportData.payroll.count).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top 5 Earners */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Top 5 Earners</h4>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Net Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Days Present
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.payroll.records
                      .sort((a: any, b: any) => b.netPay - a.netPay)
                      .slice(0, 5)
                      .map((record: any) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.employee?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                            ₹{record.netPay.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.daysPresent} / {record.workingDays}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="/attendance"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View Attendance
            </a>
            <a
              href="/leave"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Manage Leaves
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
    </Layout>
  );
}
