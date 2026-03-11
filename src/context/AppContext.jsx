import React, { createContext, useReducer, useEffect } from 'react';
import { API_BASE_URL } from '../utils/config';

export const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  role: null,
  counselors: [],
  students: [],
  programs: [],
  sessions: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE': // ✅ ADD THIS
      return { ...state, role: action.payload };

    case 'LOGIN':
      return { 
        ...state, 
        user: action.payload.user, 
        role: action.payload.role,
        isAuthenticated: true,
        isInitialized: true 
      };
    
    case 'LOGOUT':
      return { ...initialState, isInitialized: true };

    case 'INIT_COMPLETE':
      return { ...state, isInitialized: true };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload  // ✅ Replace entire user object
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          profileCompleted: true
        }
      };
    
    case 'UPDATE_TEST_RESULTS':
      return {
        ...state,
        user: {
          ...state.user,
          [`${action.payload.testType}Status`]: 'completed',
          [`${action.payload.testType}Results`]: action.payload.results
        }
      };
    
    case 'SET_COUNSELORS':
      return { ...state, counselors: action.payload };
    
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    
    case 'INIT_STUDENTS':
      return { ...state, students: action.payload };
      
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log('🔍 [AppContext] Checking for saved user...');
    
    const savedData = localStorage.getItem('aarohan_user');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('✅ [AppContext] Parsed data:', parsed.user?.id);
        
        // Validate structure - accept id or _id (MongoDB)
        const userId = parsed.user?.id || parsed.user?._id;
        if (userId && parsed.role) {
          dispatch({ type: 'LOGIN', payload: parsed });
          console.log('✅ [AppContext] User restored:', userId);
        } else {
          console.warn('⚠️ [AppContext] Invalid structure, removing corrupted data');
          localStorage.removeItem('aarohan_user');
          dispatch({ type: 'INIT_COMPLETE' });
        }
      } catch (error) {
        console.error('❌ [AppContext] Failed to parse:', error.message);
        localStorage.removeItem('aarohan_user');
        dispatch({ type: 'INIT_COMPLETE' });
      }
    } else {
      console.log('🔍 [AppContext] No saved user found');
      dispatch({ type: 'INIT_COMPLETE' });
    }
  }, []);


  // Save user to localStorage when it changes
  // Guard: skip until initialization is complete to avoid wiping saved data on first render
  useEffect(() => {
    if (!state.isInitialized) return;

    if (state.user) {
      localStorage.setItem('aarohan_user', JSON.stringify({ 
        user: state.user, 
        role: state.role 
      }));
    } else {
      localStorage.removeItem('aarohan_user');
    }
  }, [state.user, state.role, state.isInitialized]);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

const login = async (phone, password = null, role) => {
  try {
    if (API_BASE_URL) {
      let path;
      if (role === 'student') {
        path = 'auth/studentlogin';
      } else if (role === 'counselor') {
        path = 'auth/counselorlogin';
      } else if (role === 'admin') {
        path = 'auth/adminlogin';
      }
      
      const res = await fetch(`${API_BASE_URL}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }) // ✅ ADDED password
      });

      const data = await res.json(); // Parse response first

      if (!res.ok || !data.success) {
        // Return the full response so LoginPage can handle needsPassword
        return {
          success: false,
          error: data.error || 'Login failed',
          needsPassword: data.needsPassword || false // ✅ ADDED
        };
      }

      // Success - Login user
      const userWithRole = { ...data.user, role };

      // Store JWT token for authenticated API calls
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      dispatch({ type: 'LOGIN', payload: { user: userWithRole, role } });

      return {
        success: true,
        needsProfileCompletion: data.needsProfileCompletion ?? false,
        user: userWithRole
      };
    }

    // Fallback mock login when no backend
    const mockUser = {
      id: 'u1',
      _id: 'u1',
      phone,
      name: 'Test User',
      role,
      profileCompleted: true,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'LOGIN', payload: { user: mockUser, role } });

    return {
      success: true,
      needsProfileCompletion: !mockUser.profileCompleted,
      user: mockUser
    };
  } catch (error) {
    console.error('Login error:', error);
    const msg = error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')
      ? 'Cannot reach server. Please check your internet connection and try again.'
      : error?.message || 'Network error';
    return { success: false, error: msg };
  }
};



  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('aarohan_user');
    dispatch({ type: 'LOGOUT' });
  };

const updateProfile = async (data) => {
  try {
    const user = state.user;
    const userId = user?._id || user?.id;
    const role = state.role || user?.role;
    
    if (window.API_BASE_URL && userId && role) {
      // Choose base path by role
      const basePath = role === 'student' ? 'students' : 
                       role === 'counselor' ? 'counselors' : null;
      
      if (!basePath) {
        return { success: false, error: 'Unknown role for profile update' };
      }
      
      const res = await fetch(`${window.API_BASE_URL}/${basePath}/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, profileCompleted: true })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update profile');
      }
      
      const result = await res.json();
      
      // ✅ Update state with complete user object from backend
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: result.user  // Backend returns complete user with phone, name, etc.
      });
      
      return { success: true };
    }
    
    // Local-only fallback
    dispatch({ 
      type: 'UPDATE_PROFILE', 
      payload: { ...data, profileCompleted: true } 
    });
    
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
  }
};



  const updateTestResults = async (testType, testData) => {
    try {
      const userId = state.user?._id || state.user?.id;
      
      // Backend update
      if (window.API_BASE_URL && userId) {
        const response = await fetch(`${window.API_BASE_URL}/students/${userId}/test/${testType}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(testData)
        });

        if (!response.ok) {
          throw new Error('Failed to save test results');
        }

        const data = await response.json();
        dispatch({ type: 'UPDATE_USER', payload: data.student });
        return { success: true, student: data.student };
      } 
      
      // Fallback: Local update
      const results = {
        answers: testData.answers,
        completedAt: testData.completedAt || new Date().toISOString(),
        timeTaken: testData.timeTaken,
        violations: testData.violations || []
      };

      // Calculate OCEAN locally if needed
      if (testType === 'personality') {
        results.oceanScores = calculateOCEANScoresLocal(testData.answers);
      }

      dispatch({
        type: 'UPDATE_TEST_RESULTS',
        payload: { testType, results }
      });

      return { success: true };

    } catch (error) {
      console.error('Error updating test results:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      login,
      logout,
      updateProfile,
      updateTestResults
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// LOCAL HELPERS
// ============================================================

function calculateOCEANScoresLocal(answers) {
  const getTraitLevel = (score) => {
    if (score >= 32) return 'Very High';
    if (score >= 24) return 'High';
    if (score >= 16) return 'Moderate';
    if (score >= 8) return 'Low';
    return 'Very Low';
  };

  const O = answers.slice(0, 8).reduce((sum, val) => sum + (val || 0), 0);
  const C = answers.slice(8, 16).reduce((sum, val) => sum + (val || 0), 0);
  const E = answers.slice(16, 24).reduce((sum, val) => sum + (val || 0), 0);
  const A = answers.slice(24, 32).reduce((sum, val) => sum + (val || 0), 0);
  const N = answers.slice(32, 40).reduce((sum, val) => sum + (val || 0), 0);

  return {
    Openness: { score: O, level: getTraitLevel(O), percentage: Math.round((O / 40) * 100) },
    Conscientiousness: { score: C, level: getTraitLevel(C), percentage: Math.round((C / 40) * 100) },
    Extraversion: { score: E, level: getTraitLevel(E), percentage: Math.round((E / 40) * 100) },
    Agreeableness: { score: A, level: getTraitLevel(A), percentage: Math.round((A / 40) * 100) },
    Neuroticism: { score: N, level: getTraitLevel(N), percentage: Math.round((N / 40) * 100) }
  };
}
