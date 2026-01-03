'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function OnboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    baseSalary: '',
    password: 'password123',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    
    if (!data.user || data.user.role !== 'admin') {
      router.push('/home');
      return;
    }
    
    setUser(data.user);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create employee');
        return;
      }

      alert(`Employee created successfully!\n\nVerification Token (for demo): ${data.verificationToken}\n\nIn production, this would be sent via email.`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        baseSalary: '',
        password: 'password123',
      });
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Onboard Employee</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new employee account (Admin only)
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Salary (₹/month) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="password123"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: password123 (Employee can change later)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Default Leave Balances
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Casual Leave: 12 days</li>
                <li>• Sick Leave: 10 days</li>
                <li>• Paid Leave: 15 days</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                📧 Email Verification Required
              </h3>
              <p className="text-sm text-yellow-800">
                After creating the account, the employee must verify their email
                before they can log in. In production, a verification email would
                be sent automatically. For this demo, the verification token will
                be shown after creation.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Employee'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            How Onboarding Works
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Admin fills the form above and creates the employee account</li>
            <li>
              Employee receives email with verification link (in production)
            </li>
            <li>
              Employee clicks the link to verify their email address
            </li>
            <li>
              Employee can now log in with email and default password
            </li>
            <li>
              Employee should change their password after first login (future
              feature)
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
