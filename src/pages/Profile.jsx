import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateUtils';
import {
  User,
  Mail,
  Lock,
  Calendar,
  Coins,
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    age: user?.age || 17,
    currency: user?.currency || 'INR',
    monthlyIncome: user?.monthly_income || user?.monthlyIncome || 0
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'monthlyIncome' ? Number(value) : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await authApi.updateProfile(profileData);
      updateUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'warning');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    try {
      setPasswordLoading(true);
      await authApi.changePassword(passwordData);
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account & Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your personal info, baseline allowance, and password security
        </p>
      </div>

      {/* User Header Profile Card */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '24px 28px',
        background: 'var(--primary-gradient)',
        color: '#ffffff'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.6rem',
          boxShadow: 'var(--shadow-md)',
          flexShrink: 0
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            {user?.name || 'TeenSpend Member'}
          </h2>
          <p style={{ fontSize: '0.88rem', opacity: 0.9 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              Age: {user?.age || 17}
            </span>
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              Currency: {user?.currency || 'INR'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Edit Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
          Personal Information
        </h3>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={profileData.name}
                onChange={handleProfileChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Age (10 - 25)
              </label>
              <input
                type="number"
                name="age"
                min="10"
                max="25"
                value={profileData.age}
                onChange={handleProfileChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Display Currency
              </label>
              <select
                name="currency"
                value={profileData.currency}
                onChange={handleProfileChange}
                style={{ width: '100%' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Monthly Pocket Money / Base Allowance
            </label>
            <input
              type="number"
              name="monthlyIncome"
              min="0"
              step="50"
              value={profileData.monthlyIncome}
              onChange={handleProfileChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              <Save size={16} />
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Current Password *
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                New Password (min 8 chars) *
              </label>
              <input
                type="password"
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
              <Lock size={16} />
              {passwordLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
