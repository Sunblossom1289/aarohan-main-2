import React, { useState } from 'react';
import { supportAPI } from '../../services/api';

const CATEGORIES = ['Technical', 'Academic', 'Counseling', 'Payment', 'Other'];
const PRIORITIES  = ['Low', 'Medium', 'High'];

const CATEGORY_ICONS = {
  Technical:  'fa-screwdriver-wrench',
  Academic:   'fa-book-open',
  Counseling: 'fa-compass',
  Payment:    'fa-credit-card',
  Other:      'fa-clipboard-list',
};

const PRIORITY_COLORS = {
  Low:    { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  Medium: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  High:   { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
};

const EMPTY = { category: '', priority: 'Medium', subject: '', description: '' };

export function StudentSupport({ user, onNavigate }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.category)              e.category    = 'Please select a category';
    if (!form.subject.trim())        e.subject     = 'Subject is required';
    if (form.subject.trim().length > 150) e.subject = 'Subject must be under 150 characters';
    if (!form.description.trim())    e.description = 'Please describe your issue';
    if (form.description.trim().length > 2000) e.description = 'Description must be under 2000 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await supportAPI.submit({
        studentName:  user?.name  || 'Unknown Student',
        studentEmail: user?.email || 'No email on record',
        studentPhone: user?.phone || 'Not provided',
        category:     form.category,
        priority:     form.priority,
        subject:      form.subject.trim(),
        description:  form.description.trim(),
      });

      if (res.success) {
        setSuccess(true);
        setForm(EMPTY);
      } else {
        setErrors({ submit: res.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Student Support</h1>
          <p className="page-subtitle">We're here to help you</p>
        </div>
        <div style={{
          maxWidth: 560, margin: '60px auto',
          background: 'white', borderRadius: 16,
          padding: '52px 40px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 36, color: 'white'
          }}>
            <i className="fas fa-check"></i>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
            Request Submitted!
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
            Your support request has been sent to our team. We'll reach out to you at{' '}
            <strong style={{ color: '#1b4965' }}>{user?.email || 'your registered email'}</strong> as soon as possible.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => setSuccess(false)}
            >
              <i className="fas fa-plus"></i> Submit Another Request
            </button>
            <button
              className="btn btn-outline"
              onClick={() => onNavigate('dashboard')}
            >
              <i className="fas fa-home"></i> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Student Support</h1>
        <p className="page-subtitle">Tell us what's on your mind — we're here to help</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* ── Main form card ── */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-headset" style={{ marginRight: 10, color: 'var(--color-primary)' }}></i>
              Raise a Support Request
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>

              {/* ── Category ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 14 }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => set('category', cat)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, transition: 'all 0.18s ease',
                        border: form.category === cat
                          ? '2px solid var(--color-primary)'
                          : '2px solid #e2e8f0',
                        background: form.category === cat
                          ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-600, #0d9488) 100%)'
                          : 'white',
                        color: form.category === cat ? 'white' : '#475569',
                        boxShadow: form.category === cat ? '0 2px 8px rgba(27,73,101,0.25)' : 'none',
                      }}
                    >
                      <i className={`fas ${CATEGORY_ICONS[cat]}`} style={{ fontSize: 13 }}></i>
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 4 }}></i>{errors.category}
                  </p>
                )}
              </div>

              {/* ── Priority ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 14 }}>
                  Priority
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {PRIORITIES.map(p => {
                    const c = PRIORITY_COLORS[p];
                    const selected = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        style={{
                          padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                          fontSize: 13, fontWeight: 600, transition: 'all 0.18s ease',
                          border: `2px solid ${selected ? c.border : '#e2e8f0'}`,
                          background: selected ? c.bg : 'white',
                          color: selected ? c.text : '#64748b',
                          boxShadow: selected ? `0 2px 8px ${c.border}66` : 'none',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Subject ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 14 }}>
                  Subject <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={ev => set('subject', ev.target.value)}
                  placeholder="Brief summary of your issue..."
                  maxLength={150}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${errors.subject ? '#ef4444' : '#d1d5db'}`,
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={ev => ev.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={ev => ev.target.style.borderColor = errors.subject ? '#ef4444' : '#d1d5db'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.subject
                    ? <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}><i className="fas fa-exclamation-circle" style={{ marginRight: 4 }}></i>{errors.subject}</p>
                    : <span />
                  }
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{form.subject.length}/150</span>
                </div>
              </div>

              {/* ── Description ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 14 }}>
                  Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={ev => set('description', ev.target.value)}
                  placeholder="Please describe your issue in detail — the more context you provide, the faster we can help you."
                  maxLength={2000}
                  rows={6}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
                    fontSize: 14, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.6,
                    transition: 'border-color 0.15s', fontFamily: 'inherit',
                  }}
                  onFocus={ev => ev.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={ev => ev.target.style.borderColor = errors.description ? '#ef4444' : '#d1d5db'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.description
                    ? <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}><i className="fas fa-exclamation-circle" style={{ marginRight: 4 }}></i>{errors.description}</p>
                    : <span />
                  }
                  <span style={{ fontSize: 11, color: form.description.length > 1800 ? '#f59e0b' : '#94a3b8' }}>
                    {form.description.length}/2000
                  </span>
                </div>
              </div>

              {/* ── Submit error ── */}
              {errors.submit && (
                <div style={{
                  background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8,
                  padding: '12px 16px', marginBottom: 20,
                  color: '#991b1b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <i className="fas fa-triangle-exclamation"></i>
                  {errors.submit}
                </div>
              )}

              {/* ── Submit button ── */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 24px',
                  background: loading
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-600, #0d9488) 100%)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(27,73,101,0.3)',
                }}
              >
                {loading
                  ? <><i className="fas fa-spinner fa-spin"></i> Sending…</>
                  : <><i className="fas fa-paper-plane"></i> Submit Support Request</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── Info sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Who you're contacting */}
          <div className="card">
            <div className="card-body">
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1b4965 0%, #1FB8CD 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 20, marginBottom: 14
              }}>
                <i className="fas fa-headset"></i>
              </div>
              <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Aarohan Support Team</h4>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>
                Our team reviews every request and will respond to your registered email within <strong>1–2 business days</strong>.
              </p>
            </div>
          </div>

          {/* Category guide */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 8 }}>
              <h4 className="card-title" style={{ fontSize: 13 }}>Category Guide</h4>
            </div>
            <div className="card-body" style={{ paddingTop: 4 }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <i className={`fas ${CATEGORY_ICONS[cat]}`} style={{ color: 'var(--color-primary)', marginTop: 2, fontSize: 13, flexShrink: 0 }}></i>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#374151' }}>{cat}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                      {cat === 'Technical'  && 'App bugs, login issues, loading errors'}
                      {cat === 'Academic'   && 'Test results, career guidance, content queries'}
                      {cat === 'Counseling' && 'Session bookings, counselor issues'}
                      {cat === 'Payment'    && 'Billing, upgrades, refund requests'}
                      {cat === 'Other'      && 'Anything not covered above'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submitting as */}
          <div className="card">
            <div className="card-body">
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Submitting as
              </p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{user?.name || 'Student'}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{user?.email || 'No email found'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
