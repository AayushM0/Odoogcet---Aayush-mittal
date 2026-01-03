'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';

export default function LeavePage() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; leave: any; action: string }>({
    isOpen: false,
    leave: null,
    action: '',
  });
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setUser(sessionData.user);

      const leavesRes = await fetch('/api/leave');
      const leavesData = await leavesRes.json();
      setLeaves(leavesData.leaves || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchData();
        setShowForm(false);
        setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        alert('✓ Leave request submitted successfully');
      } else {
        const data = await res.json();
        alert('✕ ' + (data.error || 'Failed to submit leave request'));
      }
    } catch (error) {
      alert('✕ An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (leave: any, action: string) => {
    setReviewModal({ isOpen: true, leave, action });
    setAdminComment('');
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, leave: null, action: '' });
    setAdminComment('');
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leave/${reviewModal.leave._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: reviewModal.action, 
          adminComment: adminComment.trim() || undefined 
        }),
      });

      if (res.ok) {
        await fetchData();
        closeReviewModal();
        alert(`✓ Leave ${reviewModal.action}d successfully`);
      } else {
        const data = await res.json();
        alert('✕ ' + (data.error || `Failed to ${reviewModal.action} leave`));
      }
    } catch (error) {
      alert('✕ An error occurred');
    } finally {
      setSubmitting(false);
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

  // Separate pending and processed leaves for admin
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const processedLeaves = leaves.filter(l => l.status !== 'pending');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'admin' 
                ? 'Review and approve employee leave requests' 
                : 'Apply for leave and track your requests'}
            </p>
          </div>
          {user?.role === 'employee' && (
            <Button onClick={() => setShowForm(true)}>
              <span className="mr-2">⊡</span>
              Apply for Leave
            </Button>
          )}
        </div>

        {user?.role === 'employee' && (
          <Card title="Leave Balances">
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
          </Card>
        )}

        {/* Admin: Pending Requests Section */}
        {user?.role === 'admin' && pendingLeaves.length > 0 && (
          <Card 
            title="Pending Leave Requests" 
            subtitle={`${pendingLeaves.length} request(s) awaiting approval`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employee?.name}</div>
                        <div className="text-xs text-gray-500">{leave.reason.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leave.daysRequested}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button size="sm" variant="success" onClick={() => openReviewModal(leave, 'approve')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => openReviewModal(leave, 'reject')}>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* All Leave Requests Table */}
        <Card 
          title={user?.role === 'admin' ? 'All Leave Requests' : 'My Leave Requests'}
          subtitle={user?.role === 'admin' && processedLeaves.length > 0 ? 'Approved and rejected leaves' : undefined}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(user?.role === 'admin' ? processedLeaves : leaves).length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  (user?.role === 'admin' ? processedLeaves : leaves).map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{leave.employee?.name}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leave.daysRequested}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{leave.reason}</div>
                        {leave.adminComment && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            Admin: {leave.adminComment}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Apply Leave Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Apply for Leave"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                Submit Request
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="casual">Casual Leave ({user?.leaveBalances?.casual} remaining)</option>
                <option value="sick">Sick Leave ({user?.leaveBalances?.sick} remaining)</option>
                <option value="paid">Paid Leave ({user?.leaveBalances?.paid} remaining)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                required
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
        </Modal>

        {/* Review Leave Modal */}
        <Modal
          isOpen={reviewModal.isOpen}
          onClose={closeReviewModal}
          title={`${reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
          footer={
            <>
              <Button variant="secondary" onClick={closeReviewModal}>
                Cancel
              </Button>
              <Button 
                variant={reviewModal.action === 'approve' ? 'success' : 'danger'}
                onClick={handleReview}
                loading={submitting}
              >
                {reviewModal.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </>
          }
        >
          {reviewModal.leave && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Employee:</span>
                  <span className="text-sm text-gray-900">{reviewModal.leave.employee?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Leave Type:</span>
                  <span className="text-sm text-gray-900 capitalize">{reviewModal.leave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Duration:</span>
                  <span className="text-sm text-gray-900">{reviewModal.leave.daysRequested} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Dates:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(reviewModal.leave.startDate).toLocaleDateString()} - {new Date(reviewModal.leave.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reason:</p>
                  <p className="text-sm text-gray-900">{reviewModal.leave.reason}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Comment (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Add a comment about this decision..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {reviewModal.action === 'reject' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Note:</strong> This action is final and cannot be undone. The employee will be notified.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
