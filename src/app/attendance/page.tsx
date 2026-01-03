'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getWeekDates(startDate: Date): Date[] {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setUser(sessionData.user);

      if (sessionData.user?.role === 'admin') {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setEmployees(usersData.users || []);
      }

      const attendanceRes = await fetch('/api/attendance');
      const attendanceData = await attendanceRes.json();
      setAttendance(attendanceData.attendance || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (employeeId: string, status: string) => {
    setMarking(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          date: selectedDate,
          status,
        }),
      });

      if (res.ok) {
        // Refetch attendance data immediately
        const attendanceRes = await fetch('/api/attendance');
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData.attendance || []);
        
        // Show success message
        const employeeName = employees.find(e => e._id === employeeId)?.name || 'Employee';
        alert(`${employeeName} marked as ${status}`);
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to mark attendance'));
      }
    } catch (error) {
      console.error('Mark attendance error:', error);
      alert('Error: An error occurred. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const getAttendanceForDate = (employeeId: string, date: string) => {
    return attendance.find(
      (a) =>
        a.employeeId === employeeId &&
        new Date(a.date).toISOString().split('T')[0] === date
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      'half-day': 'bg-yellow-100 text-yellow-800',
      late: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'daily'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'weekly'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Weekly
                </button>
              </div>
              {viewMode === 'daily' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          )}
        </div>

        {user?.role === 'admin' ? (
          viewMode === 'daily' ? (
            // Admin Daily View
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mark Attendance for {selectedDate}
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const todayAttendance = getAttendanceForDate(
                      employee._id,
                      selectedDate
                    );
                    return (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {todayAttendance ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                todayAttendance.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : todayAttendance.status === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : todayAttendance.status === 'half-day'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {todayAttendance.status}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not marked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() =>
                              markAttendance(employee._id, 'present')
                            }
                            disabled={marking}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Present
                          </button>
                          <button
                            onClick={() =>
                              markAttendance(employee._id, 'absent')
                            }
                            disabled={marking}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() =>
                              markAttendance(employee._id, 'half-day')
                            }
                            disabled={marking}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          >
                            Half-Day
                          </button>
                          <button
                            onClick={() => markAttendance(employee._id, 'late')}
                            disabled={marking}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          >
                            Late
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            // Admin Weekly View
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ← Previous Week
                </button>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Week of {currentWeekStart.toLocaleDateString()}
                </h3>
                <button
                  onClick={() => navigateWeek('next')}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next Week →
                </button>
              </div>
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Employee
                      </th>
                      {getWeekDates(currentWeekStart).map((date, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
                          <div className="text-xs font-normal">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </td>
                        {getWeekDates(currentWeekStart).map((date, idx) => {
                          const dateStr = date.toISOString().split('T')[0];
                          const dayAttendance = getAttendanceForDate(employee._id, dateStr);
                          return (
                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-center">
                              {dayAttendance ? (
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(dayAttendance.status)}`}
                                >
                                  {dayAttendance.status === 'half-day' ? 'Half' : dayAttendance.status.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // Employee View
          <>
            {/* Month Summary */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">This Month Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {attendance.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             (a.status === 'present' || a.status === 'late');
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-gray-600">Half-Day</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {attendance.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             a.status === 'half-day';
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {attendance.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             a.status === 'absent';
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {attendance.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Attendance History
                </h3>
                <p className="mt-1 text-sm text-gray-500">Last 30 records</p>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                          No attendance records found
                        </td>
                      </tr>
                    ) : (
                      attendance.slice(0, 30).map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : record.status === 'half-day'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkIn
                              ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                            {record.autoCheckedOut && (
                              <span className="ml-2 text-xs text-gray-400">
                                (auto)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
