import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Smartphone, Lock, Loader2, ChevronRight, UserPlus, Check } from 'lucide-react';

// --- CSS STYLES ---
const cssContent = `
  :root {
    --frozen-water: #bee9e8;
    --pacific-blue: #62b6cb;
    --yale-blue: #1b4965;
    --pale-sky: #cae9ff;
    --fresh-sky: #5fa8d3;
    --color-text-main: #1b4965;
    --font-family-base: 'Inter', sans-serif;
  }

  .login-wrapper {
    min-height: 100vh;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Removed the gradient since we have an image now */
    background-color: #f8fbff; 
    overflow-y: auto;
    font-family: var(--font-family-base);
    padding: 20px;
  }

  /* ✅ UPDATED: Background Image Style */
  .background-image-container {
    position: fixed;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .background-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures image covers screen without stretching */
    opacity: 0.8; /* Optional: Slight transparency to blend with background color */
  }

  /* Shared Card Styles */
  .glass-card {
    background: rgba(255, 255, 255, 0.85); /* Increased opacity for readability over image */
    backdrop-filter: blur(20px); /* Blurs the image behind the card */
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 25px 50px -12px rgba(27, 73, 101, 0.25);
    border-radius: 24px;
    padding: 40px 32px;
    position: relative;
    z-index: 10;
    margin: auto; 
  }

  .login-card { width: 100%; max-width: 420px; }
  .register-card { width: 100%; max-width: 700px; }

  .login-header { text-align: center; margin-bottom: 32px; }

  .login-icon-box {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, var(--yale-blue), var(--pacific-blue));
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; color: white;
    box-shadow: 0 10px 20px -5px rgba(27, 73, 101, 0.3);
  }

  /* Form Styles */
  .input-group { position: relative; margin-bottom: 20px; }
  
  .input-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--pacific-blue);
  }

  .custom-input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    font-size: 1rem;
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 12px;
    background: rgba(255,255,255,0.6);
    color: var(--yale-blue);
    outline: none;
    transition: all 0.3s ease;
  }

  .no-icon-input { padding-left: 16px; }

  .custom-input:focus {
    background: rgba(255,255,255,0.95);
    border-color: var(--fresh-sky);
    box-shadow: 0 0 0 3px rgba(95, 168, 211, 0.2);
  }

  .form-label {
    font-size: 0.75rem; font-weight: 800; color: var(--pacific-blue);
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block;
  }

  /* Buttons */
  .btn-primary {
    width: 100%; padding: 14px; border-radius: 12px;
    background: var(--yale-blue); color: white; border: none;
    font-weight: 600; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s; box-shadow: 0 4px 12px rgba(27, 73, 101, 0.2);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--fresh-sky); transform: translateY(-1px);
    box-shadow: 0 10px 20px -5px rgba(27, 73, 101, 0.3);
  }

  .btn-secondary {
    width: 100%; padding: 14px; border-radius: 12px;
    background: white; color: var(--yale-blue);
    border: 2px solid var(--pacific-blue);
    font-weight: 600; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s; margin-top: 16px;
  }

  .btn-secondary:hover { background: var(--frozen-water); border-color: var(--yale-blue); }

  .divider {
    display: flex; align-items: center; text-align: center; margin: 24px 0;
    color: #4a7a96; font-size: 0.875rem;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; border-bottom: 1px solid rgba(98, 182, 203, 0.3);
  }
  .divider span { padding: 0 16px; font-weight: 600; }

  .link-btn {
    background: none; border: none; color: var(--pacific-blue);
    font-size: 0.9rem; cursor: pointer; margin-top: 16px; width: 100%;
    transition: color 0.2s;
  }
  .link-btn:hover { color: var(--yale-blue); text-decoration: underline; }

  .error-message {
    background: #fee; border: 1px solid #fcc; color: #c33;
    padding: 12px; border-radius: 8px; margin-bottom: 16px;
    font-size: 0.875rem; text-align: center;
  }
  .info-message {
    background: #e3f2fd; border: 1px solid #90caf9; color: #1976d2;
    padding: 12px; border-radius: 8px; margin-bottom: 16px;
    font-size: 0.875rem; text-align: center;
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-dob { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 8px; }
  
  @media (max-width: 640px) {
    .grid-2 { grid-template-columns: 1fr; }
    .register-card { padding: 24px; }
  }
`;

// ==========================================
// 1. REGISTRATION VIEW COMPONENT
// ==========================================
const RegistrationView = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '',
    school: '', standard: '', phone: '', email: '',
    dateOfBirth: '', age: ''
  });
  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const STANDARDS = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  const calculateAge = (dobStr) => {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
    return String(Math.max(0, years));
  };

  const handleDobChange = (part, value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (part === 'day' && (cleanValue.length > 2 || parseInt(cleanValue) > 31)) return;
    if (part === 'month' && (cleanValue.length > 2 || parseInt(cleanValue) > 12)) return;
    if (part === 'year' && cleanValue.length > 4) return;

    const newParts = { ...dobParts, [part]: cleanValue };
    setDobParts(newParts);

    if (newParts.day && newParts.month && newParts.year.length === 4) {
      const day = newParts.day.padStart(2, '0');
      const month = newParts.month.padStart(2, '0');
      const year = newParts.year;
      const isoDate = `${year}-${month}-${day}`;
      const dateObj = new Date(isoDate);
      
      const isValidDate = !Number.isNaN(dateObj.getTime()) && 
                          dateObj.getDate() === parseInt(day) &&
                          dateObj.getMonth() + 1 === parseInt(month);

      if (isValidDate) {
        setFormData(prev => ({ ...prev, dateOfBirth: isoDate, age: calculateAge(isoDate) }));
        if (error) setError('');
      } else {
        setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
      }
    } else {
        setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const rawDigits = value.replace(/\D/g, '');
      if (rawDigits.length > 0 && !['6','7','8','9'].includes(rawDigits[0])) return;
      setFormData(prev => ({ ...prev, [name]: rawDigits.slice(0, 10) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.dateOfBirth) {
      setError('Please enter a valid complete Date of Birth');
      setLoading(false);
      return;
    }
    
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const apiBase = window.APIBASEURL || "http://localhost:5000/";

      // This line removes the trailing slash if it exists
      const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

      // FIX: Added a '/' before students
      const response = await fetch(`${base}/students/register-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      const data = await response.json().catch(() => ({ success: false, error: 'Invalid server response' }));

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      alert('Registration completed! Please login to continue.');

      setFormData({
        firstName: '', lastName: '', middleName: '',
        school: '', standard: '', phone: '', email: '',
        dateOfBirth: '', age: ''
      });
      setDobParts({ day: '', month: '', year: '' });

      // Call onSuccess to switch to login view or trigger external handler
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="glass-card register-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
        <div className="login-header">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--yale-blue)', marginBottom: '8px' }}>
                Create Account
            </h1>
            <p style={{ color: '#4a7a96', fontSize: '0.95rem' }}>
                Join Aarohan to unlock your potential
            </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid-2">
                <div>
                    <label className="form-label">First Name</label>
                    <input className="custom-input no-icon-input" name="firstName" placeholder="John" required value={formData.firstName} onChange={handleChange} />
                </div>
                <div>
                    <label className="form-label">Last Name</label>
                    <input className="custom-input no-icon-input" name="lastName" placeholder="Doe" required value={formData.lastName} onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className="form-label">Middle Name</label>
                <input className="custom-input no-icon-input" name="middleName" placeholder="Optional" value={formData.middleName} onChange={handleChange} />
            </div>

            <div>
                <label className="form-label">Date of Birth (This will be your Password)</label>
                <div className="grid-dob">
                    <input className="custom-input no-icon-input" placeholder="DD" value={dobParts.day} onChange={e => handleDobChange('day', e.target.value)} maxLength={2} style={{textAlign:'center'}} required />
                    <input className="custom-input no-icon-input" placeholder="MM" value={dobParts.month} onChange={e => handleDobChange('month', e.target.value)} maxLength={2} style={{textAlign:'center'}} required />
                    <input className="custom-input no-icon-input" placeholder="YYYY" value={dobParts.year} onChange={e => handleDobChange('year', e.target.value)} maxLength={4} style={{textAlign:'center'}} required />
                </div>
            </div>

            <div className="grid-2">
                <div>
                    <label className="form-label">School</label>
                    <input className="custom-input no-icon-input" name="school" placeholder="School Name" required value={formData.school} onChange={handleChange} />
                </div>
                <div>
                    <label className="form-label">Standard</label>
                    <select className="custom-input no-icon-input" name="standard" value={formData.standard} onChange={handleChange} required>
                        <option value="" disabled>Select Class</option>
                        {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid-2">
                <div>
                    <label className="form-label">Phone (Login ID)</label>
                    <input className="custom-input no-icon-input" name="phone" placeholder="9876543210" maxLength={10} required value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                    <label className="form-label">Email</label>
                    <input className="custom-input no-icon-input" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} />
                </div>
            </div>

            <div onClick={() => setIsSubscribed(!isSubscribed)} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '4px 0' }}>
                <div style={{ minWidth: '20px', height: '20px', borderRadius: '4px', background: isSubscribed ? 'var(--yale-blue)' : 'transparent', border: isSubscribed ? 'none' : '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {isSubscribed && <Check size={14} strokeWidth={3} />}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4a7a96' }}>Join the climbers getting weekly cheat codes.</p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
            </button>
            
            <button type="button" className="link-btn" onClick={onCancel} disabled={loading}>
                Already have an account? Login here
            </button>
        </form>
    </motion.div>
  );
};

// ==========================================
// 2. MAIN LOGIN PAGE
// ==========================================
export function LoginPage({ role, onLogin, onBack, initialView, onRegister }) {
  const [view, setView] = useState(initialView || 'login');
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleTitle = () => {
    if (role === 'admin') return 'Admin Portal';
    if (role === 'counselor') return 'Counselor Portal';
    return 'Student Login';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setLoading(true);

    try {
      const result = await onLogin(phone, showPassword ? password : null);
      
      if (!result.success && result.needsPassword && !showPassword) {
        setShowPassword(true); setError(''); setLoading(false); return;
      }
      if (!result.success) {
        setError(result.error || 'Login failed'); setLoading(false); return;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper" role="main">
      <style>{cssContent}</style>

      {/* ✅ BACKGROUND IMAGE REPLACEMENT */}
      <div className="background-image-container">
        {/* Replace '/images/background.jpg' with your actual file path in public folder */}
        <img src="/wall/wal.webp" alt="Login Background" />
      </div>

      <AnimatePresence mode="wait">
        
        {view === 'login' && (
          <motion.div
            key="login"
            className="glass-card login-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onBack}
              style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pacific-blue)', zIndex: 20 }}
              type="button"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="login-header">
              <div className="login-icon-box">
                <Lock size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--yale-blue)', marginBottom: '8px' }}>
                {getRoleTitle()}
              </h1>
              <p style={{ color: '#4a7a96', fontSize: '0.95rem' }}>
                {showPassword 
                  ? (role === 'student' ? 'Enter your password (Date of Birth)' : 'Enter your password')
                  : 'Enter your phone number to continue'}
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showPassword && !error && role === 'student' && (
              <div className="info-message">
                💡 Password is your DOB (DDMMYYYY)<br /><small>Ex: 15th Jan 2000 = 15012000</small>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <Smartphone className="input-icon" size={20} />
                <input
                  type="tel"
                  className="custom-input"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setPhone(val); }}
                  maxLength="10"
                  required
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              <AnimatePresence>
                {showPassword && (
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  >
                    <Lock className="input-icon" size={20} />
                    <input
                      type="password"
                      className="custom-input"
                      placeholder={role === 'student' ? 'Enter password (DDMMYYYY)' : 'Enter password (min 6 characters)'}
                      value={password}
                      onChange={(e) => {
                        if (role === 'student') {
                          setPassword(e.target.value.replace(/\D/g, '').slice(0, 8));
                        } else {
                          setPassword(e.target.value);
                        }
                      }}
                      maxLength={role === 'student' ? 8 : undefined}
                      required
                      disabled={loading}
                      autoFocus
                      autoComplete="current-password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="btn-primary"
                disabled={phone.length !== 10 || loading || (showPassword && (role === 'student' ? password.length !== 8 : password.length < 6))}
              >
                {loading ? (
                  <> <Loader2 className="animate-spin" size={20} /> Checking... </>
                ) : showPassword ? (
                  <> Login <ChevronRight size={20} /> </>
                ) : (
                  <> Continue <ChevronRight size={20} /> </>
                )}
              </button>

              {showPassword && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setShowPassword(false); setPassword(''); setError(''); }}
                >
                  ← Use a different phone number
                </button>
              )}
            </form>

            {role === 'student' && !showPassword && (
              <>
                <div className="divider"><span>OR</span></div>
                <motion.button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setError(''); setView('register'); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus size={20} /> New User? Register Here
                </motion.button>
              </>
            )}
          </motion.div>
        )}

        {view === 'register' && (
          <RegistrationView 
            key="register"
            onCancel={() => setView('login')}
            onSuccess={() => {
              // If external onRegister handler exists (e.g. from enroll flow), use it
              if (typeof onRegister === 'function') {
                onRegister();
              } else {
                setView('login');
              }
            }}
          />
        )}

      </AnimatePresence>
    </main>
  );
}