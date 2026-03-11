import React, { useMemo, useState } from 'react';

// ============================================================
// Static Data & Constants (Moved outside for performance)
// ============================================================
const DISTRICTS = [
  'Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Bengali', 'Malayalam'
];

const SPECIALIZATIONS = [
  'Career Mentorship', 'Academic Guidance', 'Mental Health',
  'Study Abroad', 'Competitive Exams', 'Skill Development'
];

// Generate Date Constants once
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const CURRENT_YEAR = new Date().getFullYear();
// Counselors are likely adults, so we range from 18 years ago back to 80 years ago
const YEARS = Array.from({ length: 65 }, (_, i) => String(CURRENT_YEAR - 18 - i));

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
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
};

const parseDateToParts = (value) => {
  if (!value) return { dd: '', mm: '', yyyy: '' };

  // Case 1: ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [yyyy, mm, dd] = value.split('-');
    return { dd, mm, yyyy };
  }

  // Case 2: Legacy Slash format (DD/MM/YYYY)
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return {
      dd: pad2(slash[1]),
      mm: pad2(slash[2]),
      yyyy: slash[3]
    };
  }

  return { dd: '', mm: '', yyyy: '' };
};

export function CounselorProfileSetup({ user, onComplete }) {
  // Initialize DOB parts safely
  const initialDobParts = useMemo(
    () => parseDateToParts(user?.dateOfBirth || ''),
    [user?.dateOfBirth]
  );

  const [dobParts, setDobParts] = useState(initialDobParts);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth || '', // Stored as ISO "YYYY-MM-DD"
    age: user?.age || '',
    email: user?.email || '',
    phone: user?.phone || '',
    district: user?.district || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    languages: user?.languages || [],
    specializations: user?.specializations || []
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dobISO) => {
    if (!dobISO) return '';
    const today = new Date();
    const birthDate = new Date(dobISO);
    if (Number.isNaN(birthDate.getTime())) return '';

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  };

  // Handle distinct Day/Month/Year inputs
  const handleDobChange = (part, value) => {
    // 1. Clean input
    const cleaned = digitsOnly(value);
    
    // 2. Limit length
    const limit = part === 'yyyy' ? 4 : 2;
    if (cleaned.length > limit) return;

    // 3. Update local parts state
    const nextParts = { ...dobParts, [part]: cleaned };
    setDobParts(nextParts);

    // 4. Validate and Sync with formData
    const { dd, mm, yyyy } = nextParts;
    
    // Only try to construct ISO if we have enough digits
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      const iso = `${yyyy}-${mm}-${dd}`;
      if (isValidISODate(iso)) {
        updateField('dateOfBirth', iso);
        updateField('age', calculateAge(iso));
      } else {
        updateField('dateOfBirth', ''); // Invalid date logic (e.g. 31st Feb)
      }
    } else {
      updateField('dateOfBirth', ''); // Incomplete
    }
  };

  const toggleArrayItem = (field, item) => {
    const arr = formData[field];
    if (arr.includes(item)) updateField(field, arr.filter((i) => i !== item));
    else updateField(field, [...arr, item]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.dateOfBirth) {
      alert("Please enter a valid Date of Birth (DD MM YYYY)");
      return;
    }
    onComplete({ ...formData, profileCompleted: true });
  };

  const dobValid = Boolean(formData.dateOfBirth && isValidISODate(formData.dateOfBirth));

  const isValid =
    formData.name &&
    dobValid &&
    formData.email &&
    formData.district &&
    formData.experience &&
    formData.languages.length > 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Complete Your Counselor Profile</h1>
        <p className="page-subtitle">Help students know more about you</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Basic Information</h3>
          </div>

          <div className="card-body">
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label required">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              {/* ✅ FIXED DOB: DD/MM/YYYY (Strictly Controlled) */}
              <div className="form-group">
                <label className="form-label required">Date of Birth</label>

                <div className="grid grid-3" style={{ gap: 12 }}>
                  <div>
                    <input
                      className="form-control"
                      type="text"
                      inputMode="numeric"
                      placeholder="DD"
                      value={dobParts.dd}
                      onChange={(e) => handleDobChange('dd', e.target.value)}
                      list="counselor-dob-days"
                      maxLength={2}
                      required
                    />
                    <datalist id="counselor-dob-days">
                      {DAYS.map((d) => <option key={d} value={d} />)}
                    </datalist>
                  </div>

                  <div>
                    <input
                      className="form-control"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      value={dobParts.mm}
                      onChange={(e) => handleDobChange('mm', e.target.value)}
                      list="counselor-dob-months"
                      maxLength={2}
                      required
                    />
                    <datalist id="counselor-dob-months">
                      {MONTHS.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>

                  <div>
                    <input
                      className="form-control"
                      type="text"
                      inputMode="numeric"
                      placeholder="YYYY"
                      value={dobParts.yyyy}
                      onChange={(e) => handleDobChange('yyyy', e.target.value)}
                      list="counselor-dob-years"
                      maxLength={4}
                      required
                    />
                    <datalist id="counselor-dob-years">
                      {YEARS.map((y) => <option key={y} value={y} />)}
                    </datalist>
                  </div>
                </div>

                {!dobValid && (dobParts.dd || dobParts.mm || dobParts.yyyy) && (
                   <small style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                     Invalid Date. Please use DD MM YYYY format.
                   </small>
                )}
              </div>

              {/* Age (Auto-calculated) */}
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.age}
                  readOnly
                  placeholder={dobValid ? 'Auto-calculated' : 'Enter age'}
                  style={{ backgroundColor: '#f7fafc' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="counselor@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  disabled
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">District</label>
                <select
                  className="form-control"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  required
                >
                  <option value="">Select District</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Years of Experience</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  placeholder="5"
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Bio (About You)</label>
              <textarea
                className="form-control"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell students about your background, approach, and expertise..."
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Languages & Specializations Card */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">🗣️ Languages & Specializations</h3>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label className="form-label required">Languages You Speak</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`btn ${formData.languages.includes(lang) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleArrayItem('languages', lang)}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    {formData.languages.includes(lang) && '✓ '}
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="form-label">Specializations (Optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={`btn ${formData.specializations.includes(spec) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleArrayItem('specializations', spec)}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    {formData.specializations.includes(spec) && '✓ '}
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={!isValid}>
            <i className="fas fa-check"></i> Complete Profile & Continue
          </button>
        </div>
      </form>
    </div>
  );
}