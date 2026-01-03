'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ImageUpload from '@/components/ImageUpload';
import DocumentUpload from '@/components/DocumentUpload';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  baseSalary: number;
  leaveBalances: {
    casual: number;
    sick: number;
    paid: number;
  };
  joinDate: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchProfile();
        setEditing(false);
        // You can replace this with toast notification
        alert('✓ Profile updated successfully');
      } else {
        const data = await res.json();
        alert('✕ ' + (data.error || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('✕ An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-2xl text-red-600">✕</span>
          </div>
          <p className="text-gray-700 mb-4">Failed to load profile</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    address: user.address || '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
          <ImageUpload
            currentImage={user.profilePicture}
            onUploadSuccess={(url) => {
              setUser({ ...user, profilePicture: url });
              alert('✓ Profile picture updated successfully');
            }}
            onUploadError={(error) => {
              alert('✕ ' + error);
            }}
          />
        </div>

        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-400">Cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+1 234 567 8900"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.joinDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              {editing ? (
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="mt-1 text-sm text-gray-900">{user.department || 'Not assigned'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <p className="mt-1 text-sm text-gray-900">{user.position || 'Not assigned'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Employee Role</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
            </div>

            {user.role === 'employee' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                <p className="mt-1 text-sm text-gray-900">₹{user.baseSalary.toLocaleString()}/month</p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances */}
        {user.role === 'employee' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balances</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Casual Leave</p>
                <p className="text-3xl font-bold text-blue-600">{user.leaveBalances.casual}</p>
                <p className="text-xs text-gray-500">days remaining</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Sick Leave</p>
                <p className="text-3xl font-bold text-green-600">{user.leaveBalances.sick}</p>
                <p className="text-xs text-gray-500">days remaining</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Paid Leave</p>
                <p className="text-3xl font-bold text-purple-600">{user.leaveBalances.paid}</p>
                <p className="text-xs text-gray-500">days remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          <DocumentUpload
            documents={user.documents || []}
            onUploadSuccess={() => {
              fetchProfile();
              alert('✓ Document uploaded successfully');
            }}
            onDeleteSuccess={() => {
              fetchProfile();
              alert('✓ Document deleted successfully');
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
