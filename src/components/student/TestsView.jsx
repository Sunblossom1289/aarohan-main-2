import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, User, Heart, CheckCircle2, Lock, AlertTriangle, UserCheck } from 'lucide-react';

export function TestsView({ user, onNavigate, onStartTest }) {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Profile completion gate
  const isProfileComplete = user?.profileCompleted === true;

  // Check completion status
  const aptitudeStatus = user?.aptitudeStatus || 'not_started';
  const personalityStatus = user?.personalityStatus || 'not_started';
  const interestStatus = user?.interestStatus || 'not_started';

  const isComplete = aptitudeStatus === 'completed' && personalityStatus === 'completed' && interestStatus === 'completed';
  const inProgress = !isComplete && (aptitudeStatus === 'completed' || personalityStatus === 'completed');

  // ✅ Lock test if all tests are completed
  const isTestLocked = isComplete;

  // Determine current step for UI
  const getCurrentStep = () => {
    if (aptitudeStatus !== 'completed') return 1;
    if (personalityStatus !== 'completed') return 2;
    if (interestStatus !== 'completed') return 3;
    return 4; // Done
  };

  const currentStep = getCurrentStep();

  // Handle test start with lock check
  const handleStartTestClick = () => {
    if (isTestLocked) {
      // Test is locked, redirect to results
      onNavigate('results');
      return;
    }
    onStartTest('unified');
  };

  if (pageLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '24px'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '4px solid rgba(31, 184, 205, 0.15)',
            borderTopColor: '#1FB8CD',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
            Preparing your assessments...
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Loading career assessment modules
          </p>
        </motion.div>
      </div>
    );
  }

  // If profile is not complete, show a blocker
  if (!isProfileComplete) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Career Assessment Suite</h1>
          <p className="page-subtitle">Unlock your personalized career roadmap in 3 steps</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{
            maxWidth: '600px',
            margin: '40px auto',
            padding: '48px 32px',
            textAlign: 'center',
            border: '2px solid #fbbf24',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderRadius: '16px'
          }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#92400e', marginBottom: '12px' }}>
            Complete Your Profile First
          </h2>
          <p style={{ fontSize: '1rem', color: '#a16207', lineHeight: 1.6, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            We need some basic information about you — like your name, school, grade, and date of birth — before you can take the career assessment. This helps us personalize your results.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('profile')}
              style={{
                padding: '14px 32px', fontSize: '1rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #1b4965, #1FB8CD)',
                border: 'none', borderRadius: '10px', color: 'white',
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(31,184,205,0.3)'
              }}
            >
              <UserCheck size={20} /> Complete Profile Now
            </button>
          </div>
          <div style={{
            marginTop: '24px', padding: '16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.7)', border: '1px solid #fde68a'
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
              <strong>What you'll need:</strong> Full name, date of birth, school name, grade/class, and parent/guardian details.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Career Assessment Suite</h1>
        <p className="page-subtitle">Unlock your personalized career roadmap in 3 steps</p>
      </div>

      {/* Test Credits Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        padding: '16px 24px', marginBottom: '24px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #e68161 0%, #d97046 100%)',
        color: 'white',
        boxShadow: '0 4px 16px rgba(230, 129, 97, 0.3)'
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0
        }}>
          <i className="fas fa-clipboard-check"></i>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.9, display: 'block' }}>Test Credits</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.testCredits || 0}</span>
        </div>
        <div style={{ flex: '1 1 auto', minWidth: '120px', opacity: 0.9, fontSize: '0.9rem' }}>
          <span>1 credit = 1 full assessment (all 3 tests)</span>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('upgrade')}
          style={{
            marginLeft: 'auto', padding: '10px 20px', fontSize: '14px', fontWeight: 600,
            background: 'rgba(255,255,255,0.95)', color: '#d97046',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-plus-circle"></i> Buy Credit
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: The Journey Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1b4965 0%, #1FB8CD 100%)', padding: '40px', color: 'white', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'white' }}>
              {isComplete ? "Assessment Complete!" : "Your Future Awaits"}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
              {isComplete 
                ? "You have completed all modules. Your comprehensive report is ready."
                : "Complete all 3 modules to unlock your multi-dimensional career report."}
            </p>
          </div>

          <div style={{ padding: '32px', textAlign: 'center' }}>
            {isComplete ? (
              <button 
                className="btn btn-primary btn-lg w-full"
                onClick={() => onNavigate('results')}
                style={{ padding: '20px', fontSize: '1.2rem' }}
              >
                View Results <ArrowRight style={{ marginLeft: '10px' }} />
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-lg w-full"
                onClick={handleStartTestClick}
                disabled={isTestLocked}
                style={{ 
                  padding: '20px', 
                  fontSize: '1.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  opacity: isTestLocked ? 0.6 : 1,
                  cursor: isTestLocked ? 'not-allowed' : 'pointer'
                }}
              >
                {inProgress ? "Resume Assessment" : "Start Assessment"}
                <ArrowRight size={24} />
              </button>
            )}
            
            {!isComplete && (
              <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
                Takes approx. 45-60 minutes • One-time process
              </p>
            )}
          </div>
        </div>

        {/* Right Column: The Steps Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Step 1: Aptitude */}
          <StepCard 
            number="1"
            title="Aptitude & Logic"
            desc="Adaptive test measuring numerical, verbal, and spatial reasoning."
            icon={<Brain size={24} />}
            status={aptitudeStatus}
            isActive={currentStep === 1}
          />

          {/* Step 2: Personality */}
          <StepCard 
            number="2"
            title="Personality (OCEAN)"
            desc="Psychometric analysis of your behavioral traits and work style."
            icon={<User size={24} />}
            status={personalityStatus}
            isActive={currentStep === 2}
          />

          {/* Step 3: Interest */}
          <StepCard 
            number="3"
            title="Interest Inventory"
            desc="Mapping your passions to real-world career clusters."
            icon={<Heart size={24} />}
            status={interestStatus}
            isActive={currentStep === 3}
          />

        </div>
      </div>
    </div>
  );
}

// Helper Component for Step Cards
const StepCard = ({ number, title, desc, icon, status, isActive }) => {
  const isCompleted = status === 'completed';
  const isPending = !isActive && !isCompleted;

  return (
    <div className="card" style={{ 
      padding: '24px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px',
      opacity: isPending ? 0.6 : 1,
      border: isActive ? '2px solid #1FB8CD' : '1px solid transparent',
      boxShadow: isActive ? '0 10px 25px -5px rgba(31, 184, 205, 0.15)' : 'none',
      transform: isActive ? 'scale(1.02)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        width: '50px', height: '50px', 
        borderRadius: '16px', 
        background: isCompleted ? '#22c55e' : isActive ? '#1FB8CD' : '#f1f5f9',
        color: (isCompleted || isActive) ? 'white' : '#94a3b8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {isCompleted ? <CheckCircle2 size={28} /> : icon}
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: isActive ? '#1b4965' : '#334155' }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{desc}</p>
      </div>

      {isPending && <Lock size={20} color="#cbd5e1" />}
    </div>
  );
};