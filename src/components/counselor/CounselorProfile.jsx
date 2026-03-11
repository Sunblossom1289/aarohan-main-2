// components/counselor/CounselorProfile.jsx

import React, { useState } from 'react';
import { DISTRICTS } from '../../utils/constants';

export function CounselorProfile({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    age: user?.age || '',
    experience: user?.experience || '',
    languages: user?.languages?.join(', ') || '',
    specializations: user?.specializations?.join(', ') || '',
    district: user?.district || '',
    bio: user?.bio || '',
    qualification: user?.qualification || '',
    university: user?.university || '',
    yearOfGraduation: user?.yearOfGraduation || ''
  });

  // Check if profile is locked (already submitted)
  const isLocked = user?.profileCompleted && user?.verificationStatus === 'pending';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLocked) {
      // Convert comma-separated strings to arrays
      const submitData = {
        ...formData,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        age: Number(formData.age),
        experience: Number(formData.experience),
        yearOfGraduation: Number(formData.yearOfGraduation)
      };
      onUpdate(submitData);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Counselor Profile</h1>
        <p className="page-subtitle">
          {isLocked ? 'Your profile is locked' : 'Complete your profile for verification'}
        </p>
      </div>

      {/* Show locked message */}
      {isLocked && (
        <div className="card mb-24" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-lock" style={{ fontSize: '24px', color: '#856404' }}></i>
              <div>
                <h3 style={{ margin: 0, color: '#856404' }}>Profile Locked</h3>
                <p style={{ margin: '4px 0 0', color: '#856404' }}>
                  Your profile has been submitted for verification. Contact admin if you need to make changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information Card */}
        <div className="card mb-24">
          <div className="card-header">
            <h3 className="card-title">Basic Information</h3>
          </div>
          <div className="card-body">
            {isLocked ? (
              // READ-ONLY VIEW
              <div className="grid grid-2">
                <div className="mb-16">
                  <strong>Full Name:</strong>
                  <div>{user.name}</div>
                </div>

                <div className="mb-16">
                  <strong>Date of Birth:</strong>
                  <div>{formatDate(user.dateOfBirth)}</div>
                </div>

                <div className="mb-16">
                  <strong>Age:</strong>
                  <div>{user.age} years</div>
                </div>

                <div className="mb-16">
                  <strong>Email:</strong>
                  <div>{user.email}</div>
                </div>

                <div className="mb-16">
                  <strong>Phone:</strong>
                  <div>{user.phone}</div>
                </div>

                <div className="mb-16">
                  <strong>District:</strong>
                  <div>{user.district}</div>
                </div>

                <div className="mb-16">
                  <strong>Experience:</strong>
                  <div>{user.experience} years</div>
                </div>

                <div className="mb-16">
                  <strong>Languages:</strong>
                  <div>{Array.isArray(user.languages) ? user.languages.join(', ') : user.languages}</div>
                </div>

                {user.specializations && user.specializations.length > 0 && (
                  <div className="mb-16" style={{ gridColumn: '1 / -1' }}>
                    <strong>Specializations:</strong>
                    <div>{Array.isArray(user.specializations) ? user.specializations.join(', ') : user.specializations}</div>
                  </div>
                )}

                {user.bio && (
                  <div className="mb-16" style={{ gridColumn: '1 / -1' }}>
                    <strong>Bio:</strong>
                    <div>{user.bio}</div>
                  </div>
                )}
              </div>
            ) : (
              // EDITABLE FORM
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                  <small style={{ color: '#666' }}>This will be used as your login password (DDMMYYYY format)</small>
                </div>

                <div className="form-group">
                  <label className="form-label required">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    required
                    min="18"
                    max="80"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    disabled
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">District</label>
                  <select
                    className="form-control"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    required
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Years of Experience</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Languages (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.languages}
                    onChange={e => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g., Hindi, English, Marathi"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Qualifications Card */}
        <div className="card mb-24">
          <div className="card-header">
            <h3 className="card-title">Professional Qualifications</h3>
          </div>
          <div className="card-body">
            {isLocked ? (
              <div className="grid grid-2">
                <div className="mb-16">
                  <strong>Qualification:</strong>
                  <div>{user.qualification || 'N/A'}</div>
                </div>

                <div className="mb-16">
                  <strong>University:</strong>
                  <div>{user.university || 'N/A'}</div>
                </div>

                <div className="mb-16">
                  <strong>Year of Graduation:</strong>
                  <div>{user.yearOfGraduation || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label required">Qualification</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., M.A. Psychology"
                    required
                  />
                  <small style={{ color: '#666' }}>Masters degree in Psychology required</small>
                </div>

                <div className="form-group">
                  <label className="form-label required">University</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.university}
                    onChange={e => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g., Delhi University"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Year of Graduation</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.yearOfGraduation}
                    onChange={e => setFormData({ ...formData, yearOfGraduation: e.target.value })}
                    required
                    min="1980"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Specializations (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.specializations}
                    onChange={e => setFormData({ ...formData, specializations: e.target.value })}
                    placeholder="e.g., Career Mentorship, Academic Guidance, Mental Health"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell students about your experience and approach to career mentorship..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Agreement Notice */}
        {!isLocked && (
          <div className="card mb-24" style={{ backgroundColor: '#e8f4f8', border: '1px solid #1FB8CD' }}>
            <div className="card-body">
              <h4 style={{ marginTop: 0 }}>📋 Professional Services Agreement</h4>
              <p>By submitting this profile, you confirm that you:</p>
              <ul style={{ marginBottom: 0 }}>
                <li>Hold at least a Masters Degree in Psychology from a recognized institution</li>
                <li>Will provide evidence-based career guidance aligned with psychometric results</li>
                <li>Agree to maintain confidentiality of student data per DPDP Act 2023</li>
                <li>Will not distribute or export Myaarohan's proprietary assessment content</li>
              </ul>
            </div>
          </div>
        )}

        {/* Submit button */}
        {!isLocked && (
          <button type="submit" className="btn btn-primary btn-lg">
            Submit for Verification
          </button>
        )}
      </form>
    </div>
  );
}
