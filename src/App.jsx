import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppContext } from './context/AppContext';
import { Toast } from './components/shared/Toast';
import { Navbar } from './components/shared/Navbar';
import { Sidebar } from './components/shared/Sidebar';
import { BannerPage } from './components/pages/BannerPage';
import { LoginPage } from './components/pages/LoginPage';
import { ArticlesPage } from './components/pages/ArticlesPage'; 
import { StudentProfile } from './components/student/ProfileWizard'; 
import { StudentDashboard } from './components/student/StudentDashboard';
import { TestsView } from './components/student/TestsView';
import { TestPlayer } from './components/student/TestPlayer';
import { AdaptiveTestPlayer } from './components/student/AdaptiveTestPlayer'; // Imported Adaptive Player
import { ResultsDashboard } from './components/student/ResultsDashboard';
import { CounselingBooking } from './components/student/CounselingBooking';
import { ProgramUpgrade } from './components/student/ProgramUpgrade';
import { StudentSupport } from './components/student/StudentSupport';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CounselorProfile } from './components/counselor/CounselorProfile';
import { CounselorStudentsList } from './components/counselor/CounselorStudentsList';
import { StudentReportView } from './components/counselor/StudentReportView';
import { CounselorSessions } from './components/counselor/CounselorSessions';
import { CounselorProfileSetup } from './components/counselor/CounselorProfileSetup';
import { CounselorAuth } from './components/counselor/CounselorAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudentsManagement } from './components/admin/AdminStudentsManagement';
import { AdminCounselorsManagement } from './components/admin/AdminCounselorsManagement';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminProgramsManagement } from './components/admin/AdminProgramsManagement';
import { AdminAssessmentsManagement } from './components/admin/AdminAssessmentsManagement';
import { AdminStudentSheet } from './components/admin/AdminStudentSheet';
import { AdminSessionsSheet } from './components/admin/AdminSessionsSheet';
import { generateMockStudents } from './utils/mockData';
import { APTITUDE_QUESTIONS, PERSONALITY_QUESTIONS, INTEREST_QUESTIONS } from './utils/constants';
import { pickAptitudeQuestions } from './utils/aptitudeQuestionPicker';
import { UnifiedTestPlayer } from './components/student/UnifiedTestPlayer';
import CareerExplorer from './components/career/CareerExplorer';






function App() {
  // ============================================================
  // CONTEXT & STATE
  // ============================================================
  const { state, dispatch, login, updateProfile, updateTestResults } = useContext(AppContext);
  const [currentView, setCurrentView] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [viewStudentId, setViewStudentId] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Track whether user came through "Enroll Now" or pricing flow
  const [enrollMode, setEnrollMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('enroll') === '1';
  });
  

  // Ref for clearing timeouts to prevent memory leaks
  const toastTimeoutRef = useRef(null);
  
  // Check if current counselor has admin access from database
  const isAdminCounselor = state.role === 'counselor' && state.user?.hasAdminAccess === true;

  // ============================================================
  // ROUTING LOGIC (History API - Clean URLs)
  // ============================================================
  const normalizePath = useCallback((to) => {
    const raw = String(to ?? '');
    // Strip leading '#' if accidentally passed
    const cleaned = raw.startsWith('#') ? raw.slice(1) : raw;
    if (!cleaned || cleaned === '/') return '/';
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }, []);

  const getRouteFromPath = useCallback(() => {
    return normalizePath(window.location.pathname);
  }, [normalizePath]);

  const [route, setRoute] = useState(() => getRouteFromPath());

  const navigate = useCallback((to) => {
    const raw = String(to ?? '');
    // Split off query string if present (e.g. "student-register?enroll=1")
    const qIdx = raw.indexOf('?');
    const pathPart = qIdx >= 0 ? raw.substring(0, qIdx) : raw;
    const search = qIdx >= 0 ? raw.substring(qIdx) : '';
    const path = normalizePath(pathPart);
    window.history.pushState(null, '', `${path}${search}`);
    setRoute(path);
  }, [normalizePath]);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getRouteFromPath]);

  // ============================================================
  // EFFECTS & SECURITY
  // ============================================================

  // Initialize mock students if empty
  useEffect(() => {
    if (!state.students || state.students.length === 0) {
      const mockStudents = generateMockStudents();
      dispatch({ type: 'INIT_STUDENTS', payload: mockStudents });
    }
  }, [state.students, dispatch]);

  // ROUTE PROTECTION
  // 
  useEffect(() => {
    // Don't enforce route protection until user state is initialized from localStorage
    if (!state.isInitialized) return;

    const protectedRoutes = ['/student-dashboard', '/counselor-dashboard', '/admin-dashboard'];
    
    // 1. Check if user is logged in for protected routes
    if (protectedRoutes.includes(route) && !state.user) {
      console.warn('Unauthorized access attempt. Redirecting to home.');
      navigate('/');
      return;
    }

    // 2. Role Security Mismatch (e.g. Student trying to access Counselor Dashboard)
    if (state.user) {
      if (route === '/student-dashboard' && state.role !== 'student') {
        navigate(state.role === 'counselor' ? '/counselor-dashboard' : '/admin-dashboard');
      } else if (route === '/counselor-dashboard' && state.role !== 'counselor') {
        navigate(state.role === 'student' ? '/student-dashboard' : '/admin-dashboard');
      } else if (route === '/admin-dashboard' && state.role !== 'admin') {
        navigate('/'); 
      }
    }
  }, [route, state.user, state.role, state.isInitialized, navigate]);

  // Auto-set role based on Login Page URL (only if not already set)
  useEffect(() => {
    if ((route === '/student-login' || route === '/student-register') && state.role !== 'student') {
      dispatch({ type: 'SET_ROLE', payload: 'student' });
    } else if (route === '/counselor-login' && state.role !== 'counselor') {
      dispatch({ type: 'SET_ROLE', payload: 'counselor' });
    } else if (route === '/admin-login' && state.role !== 'admin') {
      dispatch({ type: 'SET_ROLE', payload: 'admin' });
    }
  }, [route, state.role, dispatch]);

  // Detect enrollMode from query params when route changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('enroll') === '1') {
      setEnrollMode(true);
    }
  }, [route]);

  // Clean up Toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  const handleNavigate = (view) => {
    // Block results if no tests completed
    if (view === 'results' && state.role === 'student') {
      const u = state.user;
      if (u && u.aptitudeStatus !== 'completed' && u.personalityStatus !== 'completed' && u.interestStatus !== 'completed') {
        showToast('Complete at least one test to view your results.', 'warning');
        return;
      }
    }
    setCurrentView(view);
    setActiveTest(null);
    // Reset specific view states when navigating main menu
    if (view === 'students' || view === 'dashboard') {
      setViewStudentId(null);
    }
  };

  const getQuestionsForTest = (testType) => {
    // Note: 'aptitude' is now handled by AdaptiveTestPlayer directly, 
    // but we keep this as fallback logic or for other test types.
    if (testType === 'aptitude') {
      const grade = state.user?.grade; 
      return pickAptitudeQuestions({ grade, count: 50 });
    }

    const questionMap = {
      personality: PERSONALITY_QUESTIONS,
      interest: INTEREST_QUESTIONS
    };

    return questionMap[testType] || [];
  };

  // ============================================================
  // ACTION HANDLERS
  // ============================================================
  
  const handleLogin = async (phone, password = null) => {
    showToast('Checking credentials...', 'info');
    try {
      const result = await login(phone, password, state.role);
      
      if (result.success) {
        // Determine destination based on role
        const dest = state.role === 'admin' ? '/admin-dashboard' 
                   : state.role === 'counselor' ? '/counselor-dashboard' 
                   : '/student-dashboard';

        // If user came through enroll flow, go to upgrade tab instead of dashboard
        if (enrollMode && state.role === 'student') {
          setCurrentView('upgrade');
          setEnrollMode(false); // Clear the flag
        } else {
          setCurrentView('dashboard');
        }
        navigate(dest);
        
        if (result.needsProfileCompletion) {
          showToast('Welcome! Please complete your profile.', 'info');
        } else {
          showToast('Login successful!', 'success');
        }
      } else {
        showToast(result.error || 'Login failed', 'error');
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      showToast('Connection failed. Please try again.', 'error');
      return { success: false, error: 'Connection failed' };
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    showToast('Logged out successfully', 'info');
  };

  const handleProfileComplete = async (data) => {
    try {
      let success = false;

      if (updateProfile) {
        const result = await updateProfile(data);
        success = result.success;
      } else {
        // Fallback if updateProfile isn't available in context
        dispatch({ type: 'UPDATE_PROFILE', payload: { ...data, profileCompleted: true } });
        success = true;
      }

      if (success) {
        showToast('Profile completed successfully!', 'success');
        setCurrentView('dashboard');
        
        // Dynamic navigation based on role
        const dest = state.role === 'admin' ? '/admin-dashboard' 
                   : state.role === 'counselor' ? '/counselor-dashboard' 
                   : '/student-dashboard';
        navigate(dest);
      } else {
        showToast('Failed to save profile', 'error');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      showToast('Error saving profile', 'error');
    }
  };


  // UPDATED: Add this BEFORE handleStartTest
  const handleSaveIndividualTest = async (testType, testData) => {
    try {
      const userId = state.user?.id;
      const endpoint = `${window.APIBASEURL}students/${userId}/test/${testType}/complete`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) throw new Error('Failed to save');
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'UPDATEUSER', payload: data.student });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Save test error:', error);
      return false;
    }
  };

  const handleStartTest = (testType) => {
    // Block tests if profile is not complete
    if (state.role === 'student' && !state.user?.profileCompleted) {
      showToast('Please complete your profile before taking tests.', 'warning');
      setCurrentView('profile');
      return;
    }

    // New logic for complete assessment
    if (testType === 'complete-assessment') {
      if (state.user?.aptitudeStatus !== 'completed') {
        setActiveTest('unified');
        return;
      }
      if (state.user?.personalityStatus !== 'completed') {
        setActiveTest('personality');
        return;
      }
      if (state.user?.interestStatus !== 'completed') {
        setActiveTest('interest');
        return;
      }
      showToast('All tests already completed!', 'warning');
      return;
    }

    // Original logic
    const status = state.user?.[`${testType}Status`];
    if (status === 'completed') {
      showToast(`You have already completed this test`, 'warning');
      return;
    }
    setActiveTest(testType);
  };

  const handleTestComplete = async (testData, explicitType = null) => {
    const typeToSave = explicitType || activeTest;
    
    console.log('=== TEST COMPLETE HANDLER ===');
    console.log('📊 Current state.user:', state.user);
    // EDVIRON Change#12 - Log various possible user ID fields as used in UnifiedTestPlayer.jsx
    // console.log('📊 User ID:', state.user?.id);
    console.log('📊 User ID:', state.user?.id || state.user?._id || state.user?.studentId);

    
    // ✅ STEP 1: Check if user exists in state
    // EDVIRON Change#13 - Log various possible user ID fields as used in UnifiedTestPlayer.jsx
    // let userId = state.user?.id 
    let userId = state.user?.id || state.user?._id || state.user?.studentId;
    
    if (!userId) {
      console.warn('⚠️ User ID missing from state, attempting recovery...');
      // ✅ STEP 2: Try to recover from localStorage
      const saved = localStorage.getItem('aarohan_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        userId = parsed.user?.id;
        dispatch({ type: 'LOGIN', payload: parsed });
      }
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          userId = parsed.user?.id;
          
          if (userId) {
            console.log('✅ Recovered user ID from localStorage:', userId);
            
            // ✅ STEP 3: Restore to state
            dispatch({ type: 'LOGIN', payload: parsed });
            console.log('✅ Restored user to state');
          } else {
            console.error('❌ No user ID in localStorage');
            throw new Error('Invalid saved data');
          }
        } catch (err) {
          console.error('❌ Recovery failed:', err.message);
          showToast('Session expired. Please log in again', 'error');
          navigate('student-login');
          return false;
        }
      } else {
        console.error('❌ No saved data in localStorage');
        showToast('Session expired. Please log in again', 'error');
        navigate('student-login');
        return false;
      }
    }
    
    // ✅ STEP 4: Final validation before proceeding
    if (!userId) {
      console.error('❌ CRITICAL: User ID still missing after recovery!');
      showToast('Session expired. Please log in again', 'error');
      navigate('student-login');
      return false;
    }

    // Build endpoint with userId
    const endpoint = `${window.API_BASE_URL}/students/${userId}/test/aptitude/complete`;


    
    try {
      showToast(`Saving ${typeToSave} results...`, 'info');
      
      // ✅ STEP 5: Build endpoint with guaranteed userId
      const endpoint = typeToSave === 'aptitude'
        ? `${window.API_BASE_URL}/students/${userId}/test/aptitude/complete`
        : `${window.API_BASE_URL}/students/${userId}/test/${typeToSave}/complete`;
      
      console.log('📤 Endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Test saved successfully');
        dispatch({ type: 'UPDATEUSER', payload: data.student });
        
        if (!explicitType) {
          finishTestProcess();
        }
        
        return true;
      } else {
        console.error('❌ Backend error:', data.error);
        showToast(`Failed to save: ${data.error}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('❌ Test completion error:', error);
      showToast('Error submitting test. Please try again.', 'error');
      return false;
    }
  };




  // ✅ NEW: Handle completion of ALL tests in unified mode
  const handleUnifiedTestComplete = () => {
    console.log('🎉 All tests complete, closing player');
    setActiveTest(null);
    setCurrentView('results');
    showToast('Assessment Complete! Generating Report...', 'success');
    
    // Open feedback form in a new tab after assessment completion
    window.open('https://forms.gle/KXeH4CH7pX9bGNHRA', '_blank');
  };



  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderProfileCompletion = () => (
    <div className="app-container">
      <Navbar user={state.user} role={state.role} onLogout={handleLogout} />
      <main className="main-content" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <h3 style={{ margin: 0, color: '#856404' }}>👋 Welcome! Please complete your profile.</h3>
          <p style={{ margin: '8px 0 0', color: '#856404' }}>This information helps us provide you with a better experience.</p>
        </div>
        
        {state.role === 'student' && <StudentProfile user={state.user} onComplete={handleProfileComplete} />}
        {state.role === 'counselor' && <CounselorProfileSetup user={state.user} onComplete={handleProfileComplete} />}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );

  const onSaveIndividualTest = async (testType, testData) => {
    try {
      const userId = state.user?.id;
      const response = await fetch(
        `${window.APIBASEURL}students/${userId}/test/${testType}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(testData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        dispatch({ type: 'UPDATEUSER', payload: data.student });
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleTestCompletion = () => {
    console.log('🎉 All tests done!');
    navigate('/results'); // Redirect to results page
  };


  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  // Show loading screen while restoring session
  if (!state.isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // 1. Home / Banner
  if (route === '/' || route === '') {
    return <BannerPage onNavigate={navigate} />;
  }

  // 2. Articles Page
  if (route === '/articles') {
    return (
      <>
        <Helmet>
          <title>Knowledge Hub - Career Articles & Insights | Aarohan</title>
          <meta name="description" content="Explore curated career guidance articles, industry insights, and expert advice to help students make informed career decisions." />
          <link rel="canonical" href="https://myaarohan.com/articles" />
        </Helmet>
        <ArticlesPage onNavigate={navigate} />
      </>
    );
  }

  // 2.5. Career Explorer
  if (route === '/career-explorer') {
    return (
      <>
        <Helmet>
          <title>Career Encyclopedia - Discover Career Paths | Aarohan</title>
          <meta name="description" content="Explore diverse career paths, salary insights, and growth opportunities across industries. Find the right career for your skills and interests." />
          <link rel="canonical" href="https://myaarohan.com/career-explorer" />
        </Helmet>
        <CareerExplorer onNavigate={navigate} />
      </>
    );
  }

  // 2.6. Student Registration Page (direct route from Enroll Now / Pricing)
  if (route === '/student-register') {
    return (
      <>
        <Helmet>
          <title>Student Registration - Aarohan Career Mentorship</title>
          <meta name="description" content="Register as a student to access career aptitude tests, expert career mentorship, and personalized career guidance." />
          <link rel="canonical" href="https://myaarohan.com/student-register" />
        </Helmet>
        <LoginPage
          role="student"
          initialView="register"
          onLogin={(phone, password) => handleLogin(phone, password)}
          onBack={() => navigate('/')}
          onRegister={() => {
            // After registration, go to student-login (preserving enroll flag)
            if (enrollMode) {
              navigate('/student-login?enroll=1');
            } else {
              navigate('/student-login');
            }
          }}
        />
      </>
    );
  }

  // 2.7. Pricing Page (standalone route)
  if (route === '/pricing') {
    return (
      <>
        <Helmet>
          <title>Our Offering - Pricing & Plans | Aarohan</title>
          <meta name="description" content="Explore Aarohan's career mentorship plans - Mentorship Credits, Test Credits, and Complete Career Discovery packages." />
          <link rel="canonical" href="https://myaarohan.com/pricing" />
        </Helmet>
        <BannerPage onNavigate={navigate} initialView="pricing" />
      </>
    );
  }

  // 3. Login Pages
  if (['/student-login', '/counselor-login', '/admin-login'].includes(route)) {
      const loginRole = route.includes('student') ? 'student' : route.includes('counselor') ? 'counselor' : 'admin';
      const loginTitle = loginRole === 'student' ? 'Student Login' : loginRole === 'counselor' ? 'Counselor Login' : 'Admin Login';
      return (
        <>
          <Helmet>
            <title>{loginTitle} - Aarohan Career Mentorship</title>
            <meta name="description" content={`${loginTitle} to access your Aarohan dashboard for career aptitude tests, results, and expert career mentorship sessions.`} />
            <link rel="canonical" href={`https://myaarohan.com${route}`} />
          </Helmet>
          <LoginPage
            role={loginRole}
            onLogin={(phone, password) => handleLogin(phone, password)}
            onBack={() => navigate('/')}
            onRegister={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      );
    }

  // 5. Dashboards (Protected)
  if (state.user && route.includes('dashboard')) {
    return (
      <div className="app-container">
        <Navbar user={state.user} role={state.role} onLogout={handleLogout} />
        <div className="main-layout">
          {/* Sidebar - hidden if taking a test */}
          {!activeTest && (
            <Sidebar 
              role={state.role}
              currentView={currentView}
              onNavigate={(view) => {
                handleNavigate(view);
                setSidebarOpen(false);
              }}
              user={state.user}
              isAdminCounselor={isAdminCounselor}
              className={sidebarOpen ? 'open' : ''}
            />
          )}

          <main className="main-content">
            {/* ========== STUDENT ROLE ========== */}
            {state.role === 'student' && (
              activeTest ? (
                // ✅ UNIFIED TEST PLAYER (New Logic)
                activeTest === 'unified' ? (
                  <UnifiedTestPlayer
                    user={state.user}
                    onSaveIndividualTest={(type, data) => handleTestComplete(data, type)}
                    onComplete={handleUnifiedTestComplete}  // ✅ Use the new handler
                  />

                ) : 
                // ... Keep legacy logic for backward compatibility if needed ...
                activeTest === 'aptitude' ? (
                  // 
                  <AdaptiveTestPlayer
                    onComplete={handleTestComplete}
                    user={state.user}
                  />
                ) : (
                  <TestPlayer
                    testType={activeTest}
                    questions={getQuestionsForTest(activeTest)}
                    onComplete={handleTestComplete}
                    user={state.user}
                  />
                )
              ) : (
                <>
                  {currentView === 'dashboard' && <StudentDashboard state={state} dispatch={dispatch} onNavigate={handleNavigate} />}
                  {currentView === 'profile' && (
                    <StudentProfile
                      user={state.user}
                      onComplete={handleProfileComplete} 
                    />
                  )}
                  {currentView === 'tests' && <TestsView user={state.user} onNavigate={handleNavigate} onStartTest={setActiveTest} />}
                  {currentView === 'results' && <ResultsDashboard user={state.user} />}
                  {currentView === 'counseling' && <CounselingBooking user={state.user} onNavigate={handleNavigate} />}
                  {currentView === 'support' && <StudentSupport user={state.user} onNavigate={handleNavigate} />}
                  {currentView === 'upgrade' && <ProgramUpgrade user={state.user} onNavigate={handleNavigate} />}
                </>
              )
            )}

            {/* ========== COUNSELOR ROLE ========== */}
            {state.role === 'counselor' && (
              <>
                {currentView === 'dashboard' && (
                  <>
                    <CounselorDashboard state={state} onNavigate={handleNavigate} />
                    {isAdminCounselor && (
                      <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '2px solid #e0e0e0' }}>
                        <h2 style={{ marginBottom: '16px', color: '#333' }}>🔒 Admin Dashboard</h2>
                        <AdminDashboard state={state} />
                      </div>
                    )}
                  </>
                )}
                {currentView === 'profile' && <CounselorProfile user={state.user} onUpdate={() => {}} />}
                {currentView === 'auth' && <CounselorAuth user={state.user} onUserUpdate={(updatedUser) => dispatch({ type: 'UPDATE_USER', payload: updatedUser })} />}
                {currentView === 'sessions' && <CounselorSessions state={state} />}
                
                {currentView === 'students' && !viewStudentId && (
                  <CounselorStudentsList
                    state={state}
                    onViewStudent={(id) => { setViewStudentId(id); setCurrentView('student-report'); }}
                  />
                )}
                {currentView === 'student-report' && viewStudentId && (
                  <StudentReportView
                    studentId={viewStudentId}
                    state={state}
                    onBack={() => { setCurrentView('students'); setViewStudentId(null); }}
                    onAddNote={() => {}}
                  />
                )}
                
                {/* Admin-Access Views for Counselors */}
                {isAdminCounselor && (
                  <>
                    {currentView === 'admin-dashboard' && <AdminDashboard state={state} />}
                    {currentView === 'admin-students' && <AdminStudentSheet />}
                    {currentView === 'admin-counselors' && <AdminCounselorsManagement state={state} dispatch={dispatch} />}
                    {currentView === 'admin-sessions' && <AdminSessionsSheet />}
                    {currentView === 'admin-programs' && <AdminProgramsManagement state={state} />}
                    {currentView === 'admin-assessments' && <AdminAssessmentsManagement state={state} />}
                    {currentView === 'admin-analytics' && <AdminAnalytics state={state} />}
                  </>
                )}
              </>
            )}

            {/* ========== ADMIN ROLE ========== */}
            {state.role === 'admin' && (
              <>
                {currentView === 'dashboard' && <AdminDashboard state={state} />}
                {currentView === 'students' && <AdminStudentSheet />}
                {currentView === 'counselors' && <AdminCounselorsManagement state={state} dispatch={dispatch} />}
                {currentView === 'sessions' && <AdminSessionsSheet />}
                {currentView === 'analytics' && <AdminAnalytics state={state} />}
                {currentView === 'programs' && <AdminProgramsManagement state={state} />}
                {currentView === 'assessments' && <AdminAssessmentsManagement state={state} />}
              </>
            )}
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Fallback
  return <BannerPage onNavigate={navigate} />;
}

export default App;