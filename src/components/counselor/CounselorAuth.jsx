// components/counselor/CounselorAuth.jsx

import React, { useState } from 'react';
import { counselorAPI } from '../../services/api';

export function CounselorAuth({ user, onUserUpdate }) {
  // Account details state
  const [authData, setAuthData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPasswordForDetails: ''
  });
  const [detailsMsg, setDetailsMsg] = useState({ type: '', text: '' });
  const [savingDetails, setSavingDetails] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle account details update
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsMsg({ type: '', text: '' });

    if (!authData.currentPasswordForDetails) {
      setDetailsMsg({ type: 'error', text: 'Please enter your current password to confirm changes' });
      return;
    }

    if (!authData.name.trim()) {
      setDetailsMsg({ type: 'error', text: 'Name is required' });
      return;
    }

    if (!authData.phone.trim() || authData.phone.length < 10) {
      setDetailsMsg({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setSavingDetails(true);
    try {
      const result = await counselorAPI.updateAuth(user._id, {
        name: authData.name.trim(),
        email: authData.email.trim(),
        phone: authData.phone.trim(),
        currentPassword: authData.currentPasswordForDetails
      });

      if (result.success) {
        setDetailsMsg({ type: 'success', text: 'Account details updated successfully!' });
        setAuthData(prev => ({ ...prev, currentPasswordForDetails: '' }));
        // Notify parent to refresh user data
        if (onUserUpdate && result.user) {
          onUserUpdate(result.user);
        }
      } else {
        setDetailsMsg({ type: 'error', text: result.error || 'Failed to update details' });
      }
    } catch (error) {
      setDetailsMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSavingDetails(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordMsg({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setChangingPassword(true);
    try {
      const result = await counselorAPI.changePassword(
        user._id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: result.error || 'Failed to update password' });
      }
    } catch (error) {
      setPasswordMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Alert/message component
  const AlertMessage = ({ msg }) => {
    if (!msg.text) return null;
    return (
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
          color: msg.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${msg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        {msg.text}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-shield-alt" style={{ marginRight: '10px', color: '#1FB8CD' }}></i>
          Account & Security
        </h1>
        <p className="page-subtitle">Update your login credentials and account information</p>
      </div>

      {/* Account Details Card */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-user-edit" style={{ marginRight: '8px' }}></i>
            Account Details
          </h3>
        </div>
        <div className="card-body">
          <AlertMessage msg={detailsMsg} />

          <form onSubmit={handleDetailsSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label required">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={authData.name}
                  onChange={e => setAuthData({ ...authData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={authData.email}
                  onChange={e => setAuthData({ ...authData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={authData.phone}
                  onChange={e => setAuthData({ ...authData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                />
                <small style={{ color: '#888', fontSize: '12px' }}>
                  This is used for login. Changing it will change your login phone number.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label required">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={authData.currentPasswordForDetails}
                  onChange={e => setAuthData({ ...authData, currentPasswordForDetails: e.target.value })}
                  placeholder="Confirm with your password"
                  required
                />
                <small style={{ color: '#888', fontSize: '12px' }}>
                  Required to verify your identity before making changes.
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingDetails}
              style={{ marginTop: '8px' }}
            >
              {savingDetails ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-key" style={{ marginRight: '8px' }}></i>
            Change Password
          </h3>
        </div>
        <div className="card-body">
          <AlertMessage msg={passwordMsg} />

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label required">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label required">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label required">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={changingPassword}
              style={{ marginTop: '8px' }}
            >
              {changingPassword ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card mb-24" style={{ backgroundColor: '#e8f4f8', border: '1px solid #1FB8CD' }}>
        <div className="card-body">
          <h4 style={{ marginTop: 0 }}>
            <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#1FB8CD' }}></i>
            Security Tips
          </h4>
          <ul style={{ marginBottom: 0, color: '#555', lineHeight: '1.8' }}>
            <li>Use a strong password with at least 6 characters</li>
            <li>Avoid using easily guessable passwords like your date of birth</li>
            <li>Never share your password with anyone</li>
            <li>If you suspect unauthorized access, change your password immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
