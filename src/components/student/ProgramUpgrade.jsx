import React, { useState } from 'react';

export function ProgramUpgrade({ user, onNavigate }) {
  const [paymentModal, setPaymentModal] = useState({ show: false, type: null });
  
  const paymentOptions = {
    credit: {
      title: 'Mentorship Credit',
      price: 499,
      description: 'For 1 Mentorship Credit (1 session)',
      whatsappMessage: 'Hi! I have made a payment of ₹499 for 1 Mentorship Credit. Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll add 1 Mentorship Credit to your account. You'll receive a confirmation message."
    },
    testCredit: {
      title: 'Test Credit',
      price: 99,
      description: 'For 1 Test Credit (1 assessment attempt)',
      whatsappMessage: 'Hi! I have made a payment of ₹99 for 1 Test Credit. Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll add 1 Test Credit to your account. You'll receive a confirmation message."
    },
    premium: {
      title: 'Complete Career Discovery Pack',
      price: 1499,
      description: 'Assessments + 3 Career Mentorship Sessions',
      whatsappMessage: 'Hi! I have made a payment of ₹1,499 for the Complete Career Discovery Pack (1 Test Credit + 3 Mentorship Credits). Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll activate your Complete Career Discovery Pack — including 1 Test Credit and 3 Mentorship Credits. You'll receive a confirmation message."
    }
  };
  
  const currentPayment = paymentModal.type ? paymentOptions[paymentModal.type] : null;
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Get Credits</h1>
        <p className="page-subtitle">Purchase Mentorship Credits & Test Credits to unlock sessions and assessments</p>
      </div>

      {/* Credit type explanation banner */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto var(--space-24)',
        padding: 'var(--space-16) var(--space-20)',
        background: 'linear-gradient(135deg, rgba(33, 128, 141, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(33, 128, 141, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-16)',
        flexWrap: 'wrap'
      }}>
        <i className="fas fa-info-circle" style={{ color: 'var(--color-primary)', fontSize: '20px', flexShrink: 0 }}></i>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
            Mentorship Credits ≠ Test Credits
          </p>
          <p style={{ margin: 'var(--space-4) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-primary)' }}>Mentorship Credit</strong> = 1 expert career mentorship session (30 min video call) &nbsp;•&nbsp; 
            <strong style={{ color: '#e68161' }}>Test Credit</strong> = 1 full career assessment attempt (all 3 tests)
          </p>
        </div>
      </div>
      
      <div className="grid grid-3" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Credit Purchase Card */}
        <div
          className="card"
          style={{
            border: '2px solid var(--color-primary)',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(33, 128, 141, 0.05) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'var(--color-primary)',
              color: 'white',
              padding: '6px 16px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              borderBottomLeftRadius: 'var(--radius-base)'
            }}
          >
            RECOMMENDED
          </div>
          
          <div className="card-body" style={{ padding: 'var(--space-24)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-16)',
              marginTop: 'var(--space-8)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <i className="fas fa-user-tie"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Mentorship Credit</h3>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  1 Credit = 1 Session
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-20)' 
            }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)'
              }}>
                ₹499
              </span>
              <span style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-base)'
              }}>
                per credit
              </span>
            </div>
            
            <div style={{
              background: 'rgba(33, 128, 141, 0.08)',
              borderRadius: 'var(--radius-base)',
              padding: 'var(--space-16)',
              marginBottom: 'var(--space-20)'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: 'var(--color-text)' }}>How it works:</strong><br />
                Each credit allows you to book a 3--minute video session with a verified career expert who will help guide your career path.
              </p>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: 'var(--space-24)', padding: 0 }}>
              {[
                '30-minute personalized 1-on-1 video call',
                'Certified career counselor',
                'Discuss your test results in detail',
                'Get a personalized career roadmap',
                'Ask unlimited questions during session',
              ].map((feature, index) => (
                <li key={index} style={{ 
                  marginBottom: 'var(--space-10)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-10)'
                }}>
                  <i className="fas fa-check-circle" style={{ 
                    color: 'var(--color-success)', 
                    marginTop: '2px',
                    fontSize: 'var(--font-size-base)'
                  }}></i>
                  <span style={{ fontSize: 'var(--font-size-base)' }}>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className="btn btn-primary w-full"
              onClick={() => setPaymentModal({ show: true, type: 'credit' })}
              style={{
                padding: '18px 32px',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(33, 128, 141, 0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px'
              }}
            >
              <i className="fas fa-bolt" style={{ marginRight: 'var(--space-10)' }}></i>
              Get 1 Credit Now
            </button>
            
            <p style={{ 
              textAlign: 'center', 
              marginTop: 'var(--space-12)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <i className="fas fa-shield-alt" style={{ marginRight: '6px' }}></i>
              Secure payment • Instant confirmation
            </p>
          </div>
        </div>
        
        {/* Test Credit Card */}
        <div
          className="card"
          style={{
            border: '2px solid var(--color-orange-400)',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(230, 129, 97, 0.05) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'var(--color-orange-400)',
              color: 'white',
              padding: '6px 16px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              borderBottomLeftRadius: 'var(--radius-base)'
            }}
          >
            QUICK ADD-ON
          </div>
          
          <div className="card-body" style={{ padding: 'var(--space-24)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-16)',
              marginTop: 'var(--space-8)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-orange-400) 0%, var(--color-orange-500) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <i className="fas fa-clipboard-check"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Test Credit</h3>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  1 Credit = 1 Full Assessment
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-20)' 
            }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-orange-400)'
              }}>
                ₹99
              </span>
              <span style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-base)'
              }}>
                per credit
              </span>
            </div>
            
            <div style={{
              background: 'rgba(230, 129, 97, 0.08)',
              borderRadius: 'var(--radius-base)',
              padding: 'var(--space-16)',
              marginBottom: 'var(--space-20)'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: 'var(--color-text)' }}>What is a Test Credit?</strong><br />
                1 Test Credit unlocks all 3 career assessments (Aptitude + Personality + Interest). Use it to take or retake your full assessment.
              </p>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: 'var(--space-24)', padding: 0 }}>
              {[
                'All 3 career assessments included',
                'Updated career recommendations',
                'Track your growth over time',
                'Fresh personality insights',
                'New aptitude score analysis'
              ].map((feature, index) => (
                <li key={index} style={{ 
                  marginBottom: 'var(--space-10)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-10)'
                }}>
                  <i className="fas fa-check-circle" style={{ 
                    color: 'var(--color-orange-400)', 
                    marginTop: '2px',
                    fontSize: 'var(--font-size-base)'
                  }}></i>
                  <span style={{ fontSize: 'var(--font-size-base)' }}>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className="btn w-full"
              onClick={() => setPaymentModal({ show: true, type: 'testCredit' })}
              style={{
                padding: '18px 32px',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--color-orange-400) 0%, var(--color-orange-500) 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 14px rgba(230, 129, 97, 0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-clipboard-check" style={{ marginRight: 'var(--space-10)' }}></i>
              Get 1 Test Credit
            </button>
            
            <p style={{ 
              textAlign: 'center', 
              marginTop: 'var(--space-12)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
              Takes only 30-45 minutes
            </p>
          </div>
        </div>
        
        {/* Complete Career Discovery Pack — ₹1,499 */}
        <div
          className="card"
          style={{
            border: '2px solid #8b5cf6',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(139, 92, 246, 0.06) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '6px 16px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              borderBottomLeftRadius: 'var(--radius-base)'
            }}
          >
            BEST VALUE
          </div>
          
          <div className="card-body" style={{ padding: 'var(--space-24)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-16)',
              marginTop: 'var(--space-8)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <i className="fas fa-crown"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Complete Career Discovery</h3>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Everything you need in one pack
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-8)' 
            }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: 'var(--font-weight-bold)',
                color: '#8b5cf6'
              }}>
                ₹1,499
              </span>
              <span style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-base)',
                textDecoration: 'line-through'
              }}>
                ₹2,496
              </span>
            </div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(139, 92, 246, 0.12)',
              color: '#7c3aed',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--space-16)'
            }}>
              Save 40% — You save ₹997!
            </div>
            
            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              borderRadius: 'var(--radius-base)',
              padding: 'var(--space-16)',
              marginBottom: 'var(--space-20)'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: 'var(--color-text)' }}>Your complete career journey:</strong><br />
                Get all 3 scientifically-designed assessments to uncover your strengths, personality & interests — plus one-on-one sessions with leading industry experts who will craft your personalized career roadmap.
              </p>
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: 'var(--space-24)', padding: 0 }}>
              {[
                '1 Test Credit — All 3 career assessments included',
                '3 Mentorship Credits — Expert sessions (30 min each)',
                'Sessions with leading industry professionals',
                'Detailed career roadmap tailored to YOU',
                'Priority booking — skip the waitlist',
                'Personalized report reviewed by an expert'
              ].map((feature, index) => (
                <li key={index} style={{ 
                  marginBottom: 'var(--space-10)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-10)'
                }}>
                  <i className="fas fa-check-circle" style={{ 
                    color: '#8b5cf6', 
                    marginTop: '2px',
                    fontSize: 'var(--font-size-base)'
                  }}></i>
                  <span style={{ fontSize: 'var(--font-size-base)' }}>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className="btn w-full"
              onClick={() => setPaymentModal({ show: true, type: 'premium' })}
              style={{
                padding: '18px 32px',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-rocket" style={{ marginRight: 'var(--space-10)' }}></i>
              Get the Complete Pack
            </button>
            
            <p style={{ 
              textAlign: 'center', 
              marginTop: 'var(--space-12)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <i className="fas fa-fire" style={{ marginRight: '6px', color: '#ef4444' }}></i>
              Most popular choice among students
            </p>
          </div>
        </div>
      </div>
      
      {/* Current Credits Display */}
      <div style={{
        maxWidth: '1200px',
        margin: 'var(--space-32) auto 0',
        padding: 'var(--space-20)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-16)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-base)',
            background: 'linear-gradient(135deg, rgba(33, 128, 141, 0.15) 0%, rgba(33, 128, 141, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontSize: '20px'
          }}>
            <i className="fas fa-coins"></i>
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Your Current Balance
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <i className="fas fa-headset" style={{ color: 'var(--color-primary)', fontSize: '16px' }}></i>
                {user.counselingCredits || 0} Mentorship {user.counselingCredits === 1 ? 'Credit' : 'Credits'}
              </p>
              <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <i className="fas fa-clipboard-check" style={{ color: '#e68161', fontSize: '16px' }}></i>
                {user.testCredits || 0} Test {user.testCredits === 1 ? 'Credit' : 'Credits'}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          {(user.counselingCredits || 0) > 0 && (
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('counseling')}>
              <i className="fas fa-calendar-plus" style={{ marginRight: 'var(--space-8)' }}></i>
              Book a Session
            </button>
          )}
          {(user.testCredits || 0) > 0 && (
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('tests')} style={{ borderColor: '#e68161', color: '#e68161' }}>
              <i className="fas fa-clipboard-check" style={{ marginRight: 'var(--space-8)' }}></i>
              Take Assessment
            </button>
          )}
        </div>
      </div>
      
      {/* Payment Modal */}
      {paymentModal.show && currentPayment && (
        <div 
          className="modal-overlay"
          onClick={() => setPaymentModal({ show: false, type: null })}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-16)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              animation: 'fadeInScale 0.3s ease-out',
              border: '1px solid var(--color-card-border)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'var(--space-24)',
              borderBottom: '1px solid var(--color-card-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Complete Your Payment</h2>
                <p style={{ margin: 'var(--space-4) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Scan • Pay • Share Screenshot
                </p>
              </div>
              <button 
                onClick={() => setPaymentModal({ show: false, type: null })}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: 'var(--space-8)',
                  lineHeight: 1
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: 'var(--space-24)' }}>
              {/* Price Summary */}
              <div style={{
                background: paymentModal.type === 'credit' 
                  ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-600) 100%)'
                  : paymentModal.type === 'premium'
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, var(--color-orange-400) 0%, var(--color-orange-500) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-20)',
                color: 'white',
                textAlign: 'center',
                marginBottom: 'var(--space-24)'
              }}>
                <p style={{ margin: '0 0 var(--space-4)', opacity: 0.9, fontSize: 'var(--font-size-sm)' }}>
                  Amount to Pay
                </p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'var(--font-weight-bold)' }}>
                  ₹{currentPayment.price}
                </p>
                <p style={{ margin: 'var(--space-4) 0 0', opacity: 0.9, fontSize: 'var(--font-size-sm)' }}>
                  {currentPayment.description}
                </p>
              </div>
              
              {/* QR Code Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-24)'
              }}>
                <p style={{ 
                  marginBottom: 'var(--space-16)',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-8)'
                }}>
                  <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)'
                  }}>1</span>
                  Scan this QR code to pay
                </p>
                <div style={{
                  background: 'white',
                  padding: 'var(--space-16)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <img 
                    src="/pay/pay.jpeg" 
                    alt="Payment QR Code"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-base)'
                    }}
                  />
                </div>
                <p style={{ 
                  marginTop: 'var(--space-12)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  <i className="fas fa-mobile-alt" style={{ marginRight: '6px' }}></i>
                  Use any UPI app to scan & pay
                </p>
              </div>
              
              {/* Instructions */}
              <div style={{
                background: 'rgba(33, 128, 141, 0.06)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-20)',
                marginBottom: 'var(--space-20)'
              }}>
                <p style={{ 
                  marginBottom: 'var(--space-16)',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)'
                }}>
                  <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)'
                  }}>2</span>
                  After payment, share screenshot
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-16)',
                  background: 'var(--color-surface)',
                  padding: 'var(--space-16)',
                  borderRadius: 'var(--radius-base)',
                  border: '1px solid var(--color-card-border)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                      Send screenshot to WhatsApp
                    </p>
                    <p style={{ 
                      margin: 'var(--space-4) 0 0', 
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-primary)',
                      fontWeight: 'var(--font-weight-bold)',
                      letterSpacing: '0.5px'
                    }}>
                      8076919360
                    </p>
                  </div>
                  <a 
                    href={`https://wa.me/918076919360?text=${encodeURIComponent(currentPayment.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ 
                      padding: 'var(--space-10) var(--space-16)',
                      fontSize: 'var(--font-size-sm)',
                      textDecoration: 'none'
                    }}
                  >
                    <i className="fab fa-whatsapp" style={{ marginRight: '6px' }}></i>
                    Open
                  </a>
                </div>
              </div>
              
              {/* Final Step */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-12)',
                padding: 'var(--space-16)',
                background: 'rgba(33, 128, 141, 0.06)',
                borderRadius: 'var(--radius-base)'
              }}>
                <span style={{
                  background: paymentModal.type === 'credit' ? 'var(--color-primary)' : paymentModal.type === 'premium' ? '#8b5cf6' : 'var(--color-orange-400)',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)',
                  flexShrink: 0
                }}>3</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                    {paymentModal.type === 'credit' ? 'Get your Mentorship Credit within 24 hours' : paymentModal.type === 'premium' ? 'Pack activated within 24 hours' : 'Get your Test Credit within 24 hours'}
                  </p>
                  <p style={{ 
                    margin: 'var(--space-4) 0 0', 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {currentPayment.confirmText}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: 'var(--space-20) var(--space-24)',
              borderTop: '1px solid var(--color-card-border)',
              background: 'rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-8)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <i className="fas fa-lock"></i>
                <span>Your payment information is secure</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
