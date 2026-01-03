'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function PayrollPage() {
  const [user, setUser] = useState<any>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedPayroll, setExpandedPayroll] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setUser(sessionData.user);

      const payrollRes = await fetch('/api/payroll');
      const payrollData = await payrollRes.json();
      setPayrolls(payrollData.payrolls || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm(`Generate payroll for ${selectedMonth}/${selectedYear}?`)) {
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      if (res.ok) {
        await fetchData();
        alert('Payroll generated successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to generate payroll');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm(`Finalize payroll for ${selectedMonth}/${selectedYear}? This will make it visible to employees.`)) {
      return;
    }

    try {
      const res = await fetch('/api/payroll/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      if (res.ok) {
        await fetchData();
        alert('Payroll finalized successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to finalize payroll');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const toggleExpand = (payrollId: string) => {
    setExpandedPayroll(expandedPayroll === payrollId ? null : payrollId);
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
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Generate Payroll
            </h2>
            <div className="flex items-end space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={handleFinalize}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Finalize
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {user?.role === 'admin' ? 'All Payroll Records' : 'My Payslips'}
            </h3>
            {user?.role === 'employee' && (
              <p className="mt-1 text-sm text-gray-500">
                Only finalized payroll records are shown
              </p>
            )}
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <>
                    <tr key={payroll._id}>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee?.name}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payroll.month}/{payroll.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payroll.daysPresent} / {payroll.workingDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payroll.grossPay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{payroll.netPay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payroll.status === 'finalized'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(payroll._id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {expandedPayroll === payroll._id ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                    {expandedPayroll === payroll._id && (
                      <tr>
                        <td
                          colSpan={user?.role === 'admin' ? 7 : 6}
                          className="px-6 py-4 bg-gray-50"
                        >
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Calculation Details
                              </h4>
                              <p className="text-sm text-gray-600">
                                Formula: {payroll.calculationDetails.formula}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded border">
                                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                  Attendance Breakdown
                                </h5>
                                <div className="text-xs space-y-1">
                                  <p>
                                    Present Days:{' '}
                                    {payroll.calculationDetails.attendanceData.present}
                                  </p>
                                  <p>
                                    Half Days:{' '}
                                    {payroll.calculationDetails.attendanceData.halfDay}
                                  </p>
                                  <p>
                                    Absent Days:{' '}
                                    {payroll.calculationDetails.attendanceData.absent}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded border">
                                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                  Leave Breakdown
                                </h5>
                                <div className="text-xs space-y-1">
                                  <p>
                                    Casual Leave:{' '}
                                    {payroll.calculationDetails.leaveData.casual}
                                  </p>
                                  <p>
                                    Sick Leave:{' '}
                                    {payroll.calculationDetails.leaveData.sick}
                                  </p>
                                  <p>
                                    Paid Leave:{' '}
                                    {payroll.calculationDetails.leaveData.paid}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                Pay Summary
                              </h5>
                              <div className="text-xs space-y-1">
                                <p>Base Salary: ₹{payroll.baseSalary}</p>
                                <p>Working Days: {payroll.workingDays}</p>
                                <p>Days Present: {payroll.daysPresent}</p>
                                <p>Gross Pay: ₹{payroll.grossPay.toFixed(2)}</p>
                                <p>Deductions: ₹{payroll.deductions.toFixed(2)}</p>
                                <p className="font-semibold text-green-600">
                                  Net Pay: ₹{payroll.netPay.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {payrolls.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No payroll records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
