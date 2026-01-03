'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
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
        await fetchData();
        alert('Attendance marked successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      alert('An error occurred');
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
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}
        </div>

        {user?.role === 'admin' ? (
          // Admin View
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
          // Employee View
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                My Attendance History
              </h3>
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
                  {attendance.slice(0, 30).map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
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
                          ? new Date(record.checkIn).toLocaleTimeString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString()
                          : '-'}
                        {record.autoCheckedOut && (
                          <span className="ml-2 text-xs text-gray-400">
                            (auto)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
