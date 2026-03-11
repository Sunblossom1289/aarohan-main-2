import React, { useMemo, useState } from 'react';
import { SCHOOLS, DISTRICTS } from '../../utils/constants';
import { API_BASE_URL } from '../../utils/config';

// ============================================================
// Helpers
// ============================================================
const pad2 = (n) => String(n).padStart(2, '0');
const digitsOnly = (val) => String(val ?? '').replace(/\D/g, '');

const isValidISODate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
};

const formatToDDMMYYYY = (isoDate) => {
  if (!isoDate) return 'N/A';
  const cleanIso = isoDate.split('T')[0];
  if (!isValidISODate(cleanIso)) return 'N/A';
  const [yyyy, mm, dd] = cleanIso.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

const parseDateToParts = (value) => {
  if (!value) return { dd: '', mm: '', yyyy: '' };
  const cleanValue = value.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    const [yyyy, mm, dd] = cleanValue.split('-');
    return { dd, mm, yyyy };
  }
  const slash = cleanValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return { dd: pad2(slash[1]), mm: pad2(slash[2]), yyyy: slash[3] };
  }
  return { dd: '', mm: '', yyyy: '' };
};

// ============================================================
// Sub-component: Form (Edit Mode) - Single Long Form
// ============================================================
function ProfileWizard({ user, onComplete }) {
  const initialDobParts = useMemo(
    () => parseDateToParts(user?.dateOfBirth || ''),
    [user?.dateOfBirth]
  );

  const [dobParts, setDobParts] = useState(initialDobParts);

  // State for the temporary subject input
  const [newSubject, setNewSubject] = useState({ name: '', score: '' });

  // State for the temporary parent/guardian input
  const [newParent, setNewParent] = useState({ name: '', relation: 'Father', phone: '', email: '' });

  const [formData, setFormData] = useState({
    name: user?.name || (user?.firstName ? `${user.firstName} ${user.lastName}` : '') || '',
    dreamCareer: user?.dreamCareer || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', 
    age: user?.age || '',
    gender: user?.gender || '',
    school: user?.school || '',
    grade: user?.grade || user?.standard || '', 
    district: user?.district || '',
    email: user?.email || '',
    
    // Parents/Guardians Array
    parents: user?.parents || (user?.parentName ? [{
      name: user.parentName,
      relation: user.parentRelation || 'Father',
      phone: user.parentPhone || '',
      email: ''
    }] : []),
    
    // Legacy fields for backward compatibility
    parentName: user?.parentName || '',
    parentRelation: user?.parentRelation || 'Father',
    parentPhone: user?.parentPhone || '',
    
    // Academic Data (Legacy & New)
    lastExamScore: user?.lastExamScore || '', 
    mathScore: user?.mathScore || '',
    scienceScore: user?.scienceScore || '',
    englishScore: user?.englishScore || '',
    
    subjects: user?.subjects || []
  });

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified === true && !!user?.email);
  const [verifiedEmail, setVerifiedEmail] = useState(user?.emailVerified ? (user?.email || '') : '');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  // When email changes, reset verification if it's different from the verified email
  const handleEmailChange = (newEmail) => {
    updateField('email', newEmail);
    if (newEmail !== verifiedEmail) {
      setEmailVerified(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError('Please enter a valid email address first.');
      return;
    }

    const userId = user?.id || user?._id;
    if (!userId) {
      setOtpError('User session not found. Please re-login.');
      return;
    }

    setOtpSending(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/students/${userId}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        if (data.alreadyVerified) {
          setEmailVerified(true);
          setVerifiedEmail(email);
          setOtpSuccess('This email is already verified!');
        } else {
          setShowOtpModal(true);
          setOtpValue('');
          setOtpSuccess('OTP sent! Check your inbox.');
          // Start cooldown timer (60 seconds)
          setOtpCooldown(60);
          const interval = setInterval(() => {
            setOtpCooldown(prev => {
              if (prev <= 1) { clearInterval(interval); return 0; }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        setOtpError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    const userId = user?.id || user?._id;
    setOtpVerifying(true);
    setOtpError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/students/${userId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ otp: otpValue })
      });
      const data = await res.json();

      if (data.success) {
        setEmailVerified(true);
        setVerifiedEmail(formData.email);
        setShowOtpModal(false);
        setOtpSuccess('Email verified successfully!');
        setOtpValue('');
      } else {
        setOtpError(data.error || 'Verification failed');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dobISO) => {
    if (!dobISO) return '';
    const today = new Date();
    const birthDate = new Date(dobISO);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const handleDobChange = (part, value) => {
    const cleaned = digitsOnly(value);
    const limit = part === 'yyyy' ? 4 : 2;
    if (cleaned.length > limit) return;

    const nextParts = { ...dobParts, [part]: cleaned };
    setDobParts(nextParts);

    const { dd, mm, yyyy } = nextParts;
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      const iso = `${yyyy}-${mm}-${dd}`;
      if (isValidISODate(iso)) {
        updateField('dateOfBirth', iso);
        updateField('age', calculateAge(iso));
      } else {
        updateField('dateOfBirth', '');
      }
    } else {
      updateField('dateOfBirth', '');
    }
  };

  // --- Parent/Guardian List Handlers ---
  const handleAddParent = () => {
    if (!newParent.name.trim()) {
      alert("Please enter parent/guardian name.");
      return;
    }
    if (!newParent.phone || newParent.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    const updatedParents = [...formData.parents, { ...newParent }];
    updateField('parents', updatedParents);
    setNewParent({ name: '', relation: 'Father', phone: '', email: '' });
  };

  const handleRemoveParent = (index) => {
    const updatedParents = formData.parents.filter((_, i) => i !== index);
    updateField('parents', updatedParents);
  };

  // --- Subject List Handlers ---
  const handleAddSubject = () => {
    if (!newSubject.name.trim() || !newSubject.score) {
      alert("Please enter both subject name and marks.");
      return;
    }
    const updatedSubjects = [...formData.subjects, { ...newSubject }];
    updateField('subjects', updatedSubjects);
    setNewSubject({ name: '', score: '' });
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
    updateField('subjects', updatedSubjects);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name) return alert("Name is required");
    if (!formData.dateOfBirth) return alert("Date of Birth is required");
    if (!formData.gender) return alert("Gender is required");
    if (!formData.school) return alert("School is required");
    if (!formData.grade) return alert("Grade is required");
    if (!formData.district) return alert("State is required");
    if (!formData.email) return alert("Email is required");
    
    // Block if email is not verified
    if (!emailVerified || formData.email !== verifiedEmail) {
      return alert("Please verify your email address before submitting. Click the 'Verify' button next to your email.");
    }
    
    // --- BACKEND COMPATIBILITY LAYER ---
    let legacyScores = {
        mathScore: formData.mathScore,
        scienceScore: formData.scienceScore,
        englishScore: formData.englishScore
    };

    formData.subjects.forEach(sub => {
        const name = sub.name.toLowerCase();
        if (name.includes('math')) legacyScores.mathScore = sub.score;
        else if (name.includes('science') && !name.includes('social')) legacyScores.scienceScore = sub.score;
        else if (name.includes('english')) legacyScores.englishScore = sub.score;
    });

    // Map first parent to legacy fields for backward compatibility
    const legacyParent = formData.parents.length > 0 ? {
      parentName: formData.parents[0].name,
      parentRelation: formData.parents[0].relation,
      parentPhone: formData.parents[0].phone
    } : {};

    onComplete({ 
      ...formData, 
      ...legacyScores,
      ...legacyParent,
      profileCompleted: true 
    });
  };

  const dobIsValid = Boolean(formData.dateOfBirth && isValidISODate(formData.dateOfBirth));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Complete Your Profile</h1>
        <p className="page-subtitle">Please fill in all required fields</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📋 Basic Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input className="form-control" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Dream Career</label>
              <input 
                className="form-control" 
                value={formData.dreamCareer} 
                onChange={(e) => updateField('dreamCareer', e.target.value)} 
                placeholder="e.g. Software Engineer, Doctor, Pilot..."
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Date of Birth</label>
              <div className="grid grid-3" style={{ gap: '10px' }}>
                <input className="form-control" placeholder="DD" value={dobParts.dd} onChange={(e) => handleDobChange('dd', e.target.value)} maxLength={2} />
                <input className="form-control" placeholder="MM" value={dobParts.mm} onChange={(e) => handleDobChange('mm', e.target.value)} maxLength={2} />
                <input className="form-control" placeholder="YYYY" value={dobParts.yyyy} onChange={(e) => handleDobChange('yyyy', e.target.value)} maxLength={4} />
              </div>
              {!dobIsValid && (dobParts.dd || dobParts.mm || dobParts.yyyy) && (
                <small style={{ color: '#e53e3e', fontSize: '0.8rem' }}>Invalid Date</small>
              )}
            </div>

            <div className="form-group">
                <label className="form-label required">Age</label>
                <input className="form-control" value={formData.age} readOnly style={{ backgroundColor: '#f7fafc', cursor: 'default' }} />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select className="form-control" value={formData.gender} onChange={(e) => updateField('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">School</label>
              <input list="schools-list" className="form-control" value={formData.school} onChange={(e) => updateField('school', e.target.value)} />
              <datalist id="schools-list">{SCHOOLS.map((s) => <option key={s} value={s} />)}</datalist>
            </div>

            <div className="form-group">
              <label className="form-label required">Grade</label>
              <input 
                  type="text"
                  className="form-control" 
                  value={formData.grade} 
                  readOnly
                  style={{ backgroundColor: '#f7fafc', cursor: 'default', color: '#4a5568' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">State</label>
              <input list="districts-list" className="form-control" value={formData.district} onChange={(e) => updateField('district', e.target.value)} />
              <datalist id="districts-list">{DISTRICTS.map((d) => <option key={d} value={d} />)}</datalist>
            </div>

            <div className="form-group">
              <label className="form-label required">Email</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={(e) => handleEmailChange(e.target.value)}
                  style={{
                    flex: 1,
                    borderColor: emailVerified && formData.email === verifiedEmail ? '#22c55e' : undefined
                  }}
                />
                {emailVerified && formData.email === verifiedEmail ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '8px',
                    background: '#dcfce7', color: '#15803d',
                    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
                    border: '1px solid #86efac'
                  }}>
                    <i className="fas fa-check-circle"></i> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !formData.email}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: otpSending ? '#94a3b8' : 'linear-gradient(135deg, #1b4965, #1FB8CD)',
                      color: 'white', fontWeight: 600, fontSize: '0.85rem',
                      cursor: otpSending || !formData.email ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                      opacity: !formData.email ? 0.5 : 1
                    }}
                  >
                    {otpSending ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
              {!emailVerified && formData.email && (
                <small style={{ color: '#d97706', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '4px' }}></i>
                  Email must be verified before you can save your profile.
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === PARENTS/GUARDIANS SECTION === */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>👨‍👩‍👧 Parents / Guardians</h3>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>Add your parents or guardians one by one.</p>
          
          {/* Input Row for Adding Parent */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr auto', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newParent.name}
                onChange={(e) => setNewParent({...newParent, name: e.target.value})}
                placeholder="Parent Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddParent()}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Relation</label>
              <select 
                className="form-control" 
                value={newParent.relation}
                onChange={(e) => setNewParent({...newParent, relation: e.target.value})}
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone</label>
              <input 
                type="tel" 
                className="form-control" 
                value={newParent.phone}
                onChange={(e) => setNewParent({...newParent, phone: digitsOnly(e.target.value).slice(0, 10)})}
                placeholder="10 digits"
                maxLength="10"
                onKeyDown={(e) => e.key === 'Enter' && handleAddParent()}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (Optional)</label>
              <input 
                type="email" 
                className="form-control" 
                value={newParent.email}
                onChange={(e) => setNewParent({...newParent, email: e.target.value})}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleAddParent()}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleAddParent}
              style={{ height: '42px', padding: '0 24px' }}
            >
              Add
            </button>
          </div>

          {/* List of Added Parents */}
          {formData.parents.length > 0 ? (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Relation</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem', color: '#475569' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.parents.map((parent, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{parent.name}</td>
                      <td style={{ padding: '12px' }}>{parent.relation}</td>
                      <td style={{ padding: '12px' }}>{parent.phone}</td>
                      <td style={{ padding: '12px' }}>{parent.email || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRemoveParent(index)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#94a3b8', fontStyle: 'italic', border: '1px dashed #cbd5e1' }}>
              No parents/guardians added yet.
            </div>
          )}
        </div>
      </div>

      {/* === ACADEMIC HISTORY SECTION === */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📚 Academic History</h3>
        </div>
        <div className="card-body">
          {/* Overall Score */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <div className="form-group" style={{ maxWidth: '300px', marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Overall Percentage / Total Score (%)</label>
              <input 
                type="number" 
                className="form-control" 
                value={formData.lastExamScore} 
                onChange={(e) => updateField('lastExamScore', e.target.value)} 
                min="0" max="100" 
                placeholder="e.g. 85"
              />
              <small style={{ color: '#64748b' }}>Enter your overall aggregate score here.</small>
            </div>
          </div>

          {/* Subject Wise Marks */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>Subject Wise Marks</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>Add your subjects one by one (e.g. Math, Science, English).</p>
            
            {/* Input Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder="e.g. Mathematics"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Marks</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newSubject.score}
                  onChange={(e) => setNewSubject({...newSubject, score: e.target.value})}
                  placeholder="0-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleAddSubject}
                style={{ height: '42px', padding: '0 24px' }}
              >
                Add
              </button>
            </div>

            {/* List of Added Subjects */}
            {formData.subjects.length > 0 ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Subject</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#475569' }}>Score</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem', color: '#475569' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.subjects.map((sub, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>{sub.name}</td>
                        <td style={{ padding: '12px' }}>{sub.score}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleRemoveSubject(index)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#94a3b8', fontStyle: 'italic', border: '1px dashed #cbd5e1' }}>
                No subjects added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
        {!emailVerified && (
          <span style={{ color: '#d97706', fontSize: '0.85rem' }}>
            <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>
            Verify your email to submit
          </span>
        )}
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit} 
          disabled={!emailVerified || formData.email !== verifiedEmail}
          style={{ 
            padding: '12px 32px', fontSize: '1rem',
            opacity: (!emailVerified || formData.email !== verifiedEmail) ? 0.5 : 1,
            cursor: (!emailVerified || formData.email !== verifiedEmail) ? 'not-allowed' : 'pointer'
          }}
        >
          Submit & Lock Profile
        </button>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => { setShowOtpModal(false); setOtpError(''); }}>
          <div 
            style={{
              background: 'white', borderRadius: '16px', padding: '32px',
              width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setShowOtpModal(false); setOtpError(''); }}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none', fontSize: '20px',
                color: '#94a3b8', cursor: 'pointer'
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1b4965, #1FB8CD)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '24px', color: 'white'
              }}>
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#1e293b' }}>Verify Your Email</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                We sent a 6-digit OTP to <strong style={{ color: '#1b4965' }}>{formData.email}</strong>
              </p>
            </div>

            {/* OTP Input */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                placeholder="Enter 6-digit OTP"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                style={{
                  width: '100%', padding: '14px', fontSize: '1.3rem',
                  textAlign: 'center', letterSpacing: '8px', fontWeight: 700,
                  border: otpError ? '2px solid #ef4444' : '2px solid #e2e8f0',
                  borderRadius: '10px', outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { if (!otpError) e.target.style.borderColor = '#1FB8CD'; }}
                onBlur={(e) => { if (!otpError) e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>

            {/* Error/Success Messages */}
            {otpError && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
                background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem',
                border: '1px solid #fecaca'
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>{otpError}
              </div>
            )}
            {otpSuccess && !otpError && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
                background: '#f0fdf4', color: '#16a34a', fontSize: '0.85rem',
                border: '1px solid #bbf7d0'
              }}>
                <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>{otpSuccess}
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpValue.length !== 6}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                border: 'none', fontSize: '1rem', fontWeight: 600,
                background: (otpVerifying || otpValue.length !== 6) ? '#94a3b8' : 'linear-gradient(135deg, #1b4965, #1FB8CD)',
                color: 'white',
                cursor: (otpVerifying || otpValue.length !== 6) ? 'not-allowed' : 'pointer',
                marginBottom: '12px', transition: 'all 0.2s ease'
              }}
            >
              {otpVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSendOtp}
                disabled={otpCooldown > 0 || otpSending}
                style={{
                  background: 'none', border: 'none', color: otpCooldown > 0 ? '#94a3b8' : '#1FB8CD',
                  fontSize: '0.85rem', fontWeight: 600, cursor: otpCooldown > 0 ? 'default' : 'pointer',
                  textDecoration: otpCooldown > 0 ? 'none' : 'underline'
                }}
              >
                {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-component: Read-Only View (View Mode) - Single Long Form
// ============================================================
function ProfileTabs({ user }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <div className="badge badge-success mt-16"><i className="fas fa-lock"></i> Profile Locked</div>
      </div>

      {/* Basic Information */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📋 Basic Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            <div className="mb-16"><strong>Full Name:</strong><div>{user.name}</div></div>
            <div className="mb-16"><strong>Dream Career:</strong><div style={{ color: user.dreamCareer ? 'var(--color-primary)' : '#999', fontWeight: user.dreamCareer ? '600' : '400' }}>{user.dreamCareer || 'Not specified'}</div></div>
            <div className="mb-16"><strong>Date of Birth:</strong><div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>{formatToDDMMYYYY(user.dateOfBirth)}</div></div>
            <div className="mb-16"><strong>Age:</strong><div>{user.age} years</div></div>
            <div className="mb-16"><strong>Gender:</strong><div>{user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other'}</div></div>
            <div className="mb-16"><strong>School:</strong><div>{user.school}</div></div>
            <div className="mb-16"><strong>Grade:</strong><div>{user.grade}</div></div>
            <div className="mb-16"><strong>State:</strong><div>{user.district}</div></div>
            {user.email && <div className="mb-16"><strong>Email:</strong><div>{user.email}</div></div>}
          </div>
        </div>
      </div>

      {/* Parents/Guardians Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>👨‍👩‍👧 Parents / Guardians</h3>
        </div>
        <div className="card-body">
          {user.parents && user.parents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {user.parents.map((parent, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{parent.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                    <strong>Relation:</strong> {parent.relation}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                    <strong>Phone:</strong> {parent.phone}
                  </div>
                  {parent.email && (
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      <strong>Email:</strong> {parent.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Fallback to legacy fields if parents array is empty (for old students)
            <div className="grid grid-2">
              <div className="mb-16"><strong>Parent Name:</strong><div>{user.parentName || 'N/A'}</div></div>
              <div className="mb-16"><strong>Relationship:</strong><div>{user.parentRelation || 'N/A'}</div></div>
              <div className="mb-16"><strong>Phone:</strong><div>{user.parentPhone || 'N/A'}</div></div>
            </div>
          )}
        </div>
      </div>

      {/* Academic History Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📚 Academic History</h3>
        </div>
        <div className="card-body">
          {/* Fixed Total Score Section */}
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Overall Result</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {user.lastExamScore ? `${user.lastExamScore}%` : 'N/A'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Score / Percentage</div>
          </div>

          {/* Subject List Section with Backward Compatibility Fallback */}
          <div>
            <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#1e293b' }}>Subject Wise Performance</h4>
            {user.subjects && user.subjects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {user.subjects.map((sub, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>{sub.name}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>{sub.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              // Fallback to legacy fields if subjects array is empty (for old students)
              <div className="grid grid-2">
                <div className="mb-16"><strong>Mathematics:</strong><div>{user.mathScore ? user.mathScore + '%' : 'N/A'}</div></div>
                <div className="mb-16"><strong>Science:</strong><div>{user.scienceScore ? user.scienceScore + '%' : 'N/A'}</div></div>
                <div className="mb-16"><strong>English:</strong><div>{user.englishScore ? user.englishScore + '%' : 'N/A'}</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Export
// ============================================================
export function StudentProfile({ user, onComplete }) {
  if (user && user.profileCompleted) {
    return <ProfileTabs user={user} />;
  }
  return <ProfileWizard user={user} onComplete={onComplete} />;
}