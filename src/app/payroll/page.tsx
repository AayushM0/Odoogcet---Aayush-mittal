'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Drawer from '@/components/Drawer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';

export default function PayrollPage() {
  const [user, setUser] = useState<any>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [drawerPayroll, setDrawerPayroll] = useState<any>(null);

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
        alert('✓ Payroll generated successfully');
      } else {
        const data = await res.json();
        alert('✕ ' + (data.error || 'Failed to generate payroll'));
      }
    } catch (error) {
      alert('✕ An error occurred');
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
        alert('✓ Payroll finalized successfully');
      } else {
        const data = await res.json();
        alert('✕ ' + (data.error || 'Failed to finalize payroll'));
      }
    } catch (error) {
      alert('✕ An error occurred');
    }
  };

  const openDrawer = (payroll: any) => {
    setDrawerPayroll(payroll);
  };

  const closeDrawer = () => {
    setDrawerPayroll(null);
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

  // Separate draft and finalized payrolls
  const draftPayrolls = payrolls.filter(p => p.status === 'draft');
  const finalizedPayrolls = payrolls.filter(p => p.status === 'finalized');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'admin' 
                ? 'Generate and manage employee payroll' 
                : 'View your finalized payslips'}
            </p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <Card title="Generate Payroll" subtitle="Create monthly payroll for all employees">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button onClick={handleGenerate} loading={generating}>
                <span className="mr-2">₹</span>
                Generate Payroll
              </Button>
              <Button variant="success" onClick={handleFinalize}>
                <span className="mr-2">✓</span>
                Finalize
              </Button>
            </div>
          </Card>
        )}

        {user?.role === 'admin' && draftPayrolls.length > 0 && (
          <Card 
            title="Draft Payroll" 
            subtitle={`${draftPayrolls.length} draft payroll(s) pending finalization`}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Draft Status:</strong> These payrolls are not visible to employees. Finalize them to make them accessible.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {draftPayrolls.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payroll.employee?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(2000, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payroll.daysPresent} / {payroll.workingDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{payroll.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="secondary" onClick={() => openDrawer(payroll)}>
                          View Breakdown
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card 
          title={user?.role === 'admin' ? 'Finalized Payroll Records' : 'My Payslips'}
          subtitle={user?.role === 'employee' ? 'Only finalized payroll records are shown' : undefined}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(user?.role === 'admin' ? finalizedPayrolls : payrolls).length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  (user?.role === 'admin' ? finalizedPayrolls : payrolls).map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50">
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payroll.employee?.name}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(2000, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payroll.daysPresent} / {payroll.workingDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payroll.grossPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{payroll.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={payroll.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="secondary" onClick={() => openDrawer(payroll)}>
                          View Breakdown
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payroll Breakdown Drawer */}
        <Drawer
          isOpen={drawerPayroll !== null}
          onClose={closeDrawer}
          title="Payroll Breakdown"
        >
          {drawerPayroll && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Information</h3>
                <div className="space-y-2">
                  {user?.role === 'admin' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{drawerPayroll.employee?.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(2000, drawerPayroll.month - 1).toLocaleString('default', { month: 'long' })} {drawerPayroll.year}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={drawerPayroll.status} />
                  </div>
                </div>
              </div>

              {/* Pay Summary */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pay Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Salary:</span>
                    <span className="font-medium text-gray-900">₹{drawerPayroll.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Working Days:</span>
                    <span className="font-medium text-gray-900">{drawerPayroll.workingDays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Present:</span>
                    <span className="font-medium text-gray-900">{drawerPayroll.daysPresent}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gross Pay:</span>
                      <span className="font-medium text-gray-900">₹{drawerPayroll.grossPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Deductions:</span>
                      <span className="font-medium">- ₹{drawerPayroll.deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-green-300 pt-2 mt-2">
                      <span className="text-gray-900">Net Pay:</span>
                      <span className="text-green-600">₹{drawerPayroll.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Attendance Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Present Days:</span>
                    <span className="font-medium text-green-600">
                      {drawerPayroll.calculationDetails?.attendanceData?.present || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Half Days:</span>
                    <span className="font-medium text-yellow-600">
                      {drawerPayroll.calculationDetails?.attendanceData?.halfDay || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Absent Days:</span>
                    <span className="font-medium text-red-600">
                      {drawerPayroll.calculationDetails?.attendanceData?.absent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Late Days:</span>
                    <span className="font-medium text-orange-600">
                      {drawerPayroll.calculationDetails?.attendanceData?.late || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave Breakdown */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Leave Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Casual Leave:</span>
                    <span className="font-medium text-gray-900">
                      {drawerPayroll.calculationDetails?.leaveData?.casual || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sick Leave:</span>
                    <span className="font-medium text-gray-900">
                      {drawerPayroll.calculationDetails?.leaveData?.sick || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid Leave:</span>
                    <span className="font-medium text-gray-900">
                      {drawerPayroll.calculationDetails?.leaveData?.paid || 0} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Formula */}
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Calculation Formula</h3>
                <p className="text-xs font-mono text-gray-700 bg-white p-3 rounded border border-gray-200">
                  {drawerPayroll.calculationDetails?.formula || 'Formula not available'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={closeDrawer} fullWidth>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </Layout>
  );
}
