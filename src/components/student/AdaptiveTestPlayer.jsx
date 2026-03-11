import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { pickAdaptiveQuestions, getAvailableDimensions, getMandatoryQuestions } from '../../utils/aptitudeQuestionPicker';
import { Clock, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ============================================================
// INTERNAL COMPONENT: INSTRUCTION SCREEN
// ============================================================
const InstructionScreen = ({ onStart }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: '40px 20px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden' 
      }}>
        {/* Header */}
        <div style={{ background: '#b0ccf8', padding: '32px', color: '#fff', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Instruction Manual</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '1.1rem' }}>Your Journey of Ascent</p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '40px', color: '#334155', lineHeight: '1.6' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
            Welcome to your <strong>Myaarohan Assessment</strong>. This is a single-session, comprehensive evaluation designed to map your "Aptitude DNA" and identify your unique career "Sweet Spot". Unlike standard school exams, this is a lifelong guidance tool that helps you move from a "career by chance" to a "career by choice".
          </p>

          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Section I */}
            <section>
              <h3 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
                I. General Instructions
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
                {[
                  { title: "Total Duration", text: "This assessment is designed to be completed in one sitting. It consists of three sequential sections: Aptitude (45 mins), Personality (10 mins), and Psychometric Interests (30 mins)." },
                  { title: "Fixed Order", text: "You must complete the sections in the specified order. You cannot skip ahead or revisit a previous section once it is submitted." },
                  { title: "Compulsory Participation", text: "All questions are mandatory. The system will not allow you to finalize your results until every item is answered." },
                  { title: "Auto-Save", text: "The assessment engine auto-saves your responses every 10 seconds. If your connection drops, you can log back in via OTP and resume exactly where you left off. If you leave the assessment for a longer time, the assessment will need to be restarted, and the questions will change." },
                  { title: "No 'Pass' or 'Fail'", text: "There are no 'right' or 'wrong' answers in the Personality or Psychometric sections. The goal is to provide an objective mirror of your potential." }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '12px' }}>
                    <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '4px' }} />
                    <div>
                      <strong style={{ color: '#1e293b' }}>{item.title}:</strong> {item.text}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section II */}
            <section>
              <h3 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
                II. Section-Specific Instructions
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#1e40af' }}>Section 1: Aptitude (The "Can Do")</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Structure:</strong> 99 Questions | 45 Minutes.</li>
                    <li><strong>Dimensions:</strong> Evaluated across seven dimensions including Numerical, Verbal, and Spatial.</li>
                    <li><strong>Adaptive Nature:</strong> Complexity increases/decreases based on your performance to measure raw potential.</li>
                    <li><strong>Marking:</strong> No negative marking. Accuracy determines your Sten Score (1-10).</li>
                    <li><strong>Restriction:</strong> You cannot skip questions. Must attempt in order.</li>
                  </ul>
                </div>

                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#166534' }}>Section 2: Personality (The "Who You Are")</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Structure:</strong> 40 Statements (Likert Scale) | 10 Minutes.</li>
                    <li><strong>Goal:</strong> Understanding your nature using the OCEAN Model.</li>
                    <li><strong>Marking:</strong> Not evaluated for accuracy. Looking for honest self-reflection.</li>
                  </ul>
                </div>

                <div style={{ background: '#faf5ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#6b21a8' }}>Section 3: Psychometric Interests (The "Want to Do")</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Structure:</strong> 110 Questions | 30 Minutes.</li>
                    <li><strong>Goal:</strong> Identifies curiosity and passion patterns (MPII).</li>
                    <li><strong>Marking:</strong> Not graded. Vital for identifying career clusters where you thrive.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ background: '#f1f5f9', padding: '32px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer', fontSize: '1.1rem' }}>
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span>I have read and understood the instructions above.</span>
          </label>

          <button
            onClick={onStart}
            disabled={!agreed}
            style={{
              padding: '16px 48px',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#fff',
              background: agreed ? '#2563eb' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              cursor: agreed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: agreed ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            {agreed ? "Begin Assessment" : "Read & Accept to Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper: Time Formatter ---
const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function AdaptiveTestPlayer({ onComplete, user }) {
  // ============================================================
  // CONFIGURATION
  // ============================================================
  const CATEGORIES = useMemo(() => getAvailableDimensions(), []);
  const QUESTIONS_PER_CATEGORY = 14;
  const TOTALQUESTIONS = 100;
  const BLOCK_SIZE = 1;
  const TEST_DURATION = 45 * 60; 

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [hasStarted, setHasStarted] = useState(false); // ✅ NEW STATE FOR INSTRUCTIONS

  const [categoryState, setCategoryState] = useState(() => {
    const initialState = {};
    CATEGORIES.forEach(cat => {
      initialState[cat] = { count: 0, difficulty: 'Medium', locked: null, consecutiveSame: 0, correct: 0 };
    });
    return initialState;
  });

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);
  const [blockHistory, setBlockHistory] = useState([]);
  
  // ✅ Track mandatory questions (questions with images that must appear)
  const [mandatoryQueue, setMandatoryQueue] = useState([]);
  const mandatoryQuestionsRef = useRef(null);
  
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [violations, setViolations] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const containerRef = useRef(null);
  const startTime = useRef(Date.now());
  const finishCalled = useRef(false);

  // ============================================================
  // ANTI-CHEAT
  // ============================================================
  const logViolation = (type) => {
    const violationTime = new Date();
    console.warn(`Violation detected: ${type}`);
    setViolations(prev => [...prev, { type, timestamp: violationTime, questionId: activeQuestion?.id || 'N/A' }]);
  };

  const showWarningDialog = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen().catch(err => console.log(err));
      else if (containerRef.current.webkitRequestFullscreen) containerRef.current.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(err => console.log(err));
    else if (document.webkitExitFullscreen && document.webkitFullscreenElement) document.webkitExitFullscreen();
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      logViolation('Exited fullscreen mode');
      showWarningDialog('⚠️ Warning: Return to fullscreen immediately.');
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      logViolation('Switched tab/window');
      showWarningDialog('⚠️ Warning: Tab switching detected.');
    }
  };

  const handleContextMenu = (e) => { e.preventDefault(); logViolation('Right-click attempt'); };
  
  const handleKeyDown = (e) => {
    const forbidden = ['F12', 'I', 'J', 'U', 'C', 'V', 'A'];
    if ((e.ctrlKey || e.metaKey) && forbidden.includes(e.key.toUpperCase())) {
      e.preventDefault();
      logViolation(`Blocked shortcut: Ctrl+${e.key.toUpperCase()}`);
    }
    if (e.key === 'F12') { e.preventDefault(); logViolation('DevTools attempt'); }
  };

  const setupAntiCheat = () => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
  };

  const removeAntiCheat = () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  };

  // ============================================================
  // INIT & TIMER
  // ============================================================
  useEffect(() => {
    if (user && (user.id || user._id || user.studentId)) {
      const backupData = { user: { id: user.id || user._id || user.studentId, studentId: user.studentId, ...user } };
      localStorage.setItem('aarohan_user', JSON.stringify(backupData));
    }
  }, [user]);

  // ✅ UPDATED: Initialize ONLY after instructions are accepted (hasStarted is true)
  useEffect(() => {
    if (!hasStarted) return; // Wait for instructions

    const initializeTest = async () => {
        if (activeQuestion || allAnswers.length > 0 || finishCalled.current) return;
        setLoading(true);
        enterFullscreen(); 
        setupAntiCheat();  
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // ✅ Load mandatory questions (questions with images) - they will be shown at specific intervals
        const mandatory = getMandatoryQuestions();
        if (mandatory.length > 0) {
            // Shuffle mandatory questions to randomize their order
            const shuffledMandatory = [...mandatory].sort(() => Math.random() - 0.5);
            mandatoryQuestionsRef.current = shuffledMandatory;
            setMandatoryQueue(shuffledMandatory);
            console.log(`📌 Loaded ${shuffledMandatory.length} mandatory questions with images:`, shuffledMandatory.map(q => q.id));
        }
        
        // ✅ FIX: Try multiple difficulties to find first question (some categories may not have "Easy" questions)
        const difficultiesToTry = ['Easy', 'Medium', 'Hard'];
        for (const category of CATEGORIES) {
            for (const difficulty of difficultiesToTry) {
                try {
                    const questions = pickAdaptiveQuestions(difficulty, category, 1, []);
                    const firstQ = Array.isArray(questions) ? questions[0] : questions;
                    if (firstQ && firstQ.id) {
                        setActiveQuestion(firstQ);
                        setLoading(false);
                        return; 
                    }
                } catch (err) { continue; }
            }
        }
        setLoading(false);
        alert('Error: No questions available.');
    };
    initializeTest();
    return () => { exitFullscreen(); removeAntiCheat(); };
  }, [hasStarted]); // Added dependency

  useEffect(() => {
    if (completed || !hasStarted) return; // Wait for instructions
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Time is up! Submitting automatically.');
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [completed, hasStarted]);

  const handleAutoSubmit = () => { handleFinish(allAnswers, blockHistory, categoryState); };
  const getSafeUserFromStorage = () => { try { return JSON.parse(localStorage.getItem('aarohan_user')); } catch (e) { return null; } };

  // ============================================================
  // CORE LOGIC: FINISH
  // ============================================================
  const handleFinish = useCallback((finalAnswers, finalBlockHistory, finalCategoryState) => {
    if (finishCalled.current) return;
    finishCalled.current = true;
    
    setLoading(false);
    setCompleted(true);
    exitFullscreen();
    removeAntiCheat();

    let userId = user?.id || user?._id || user?.studentId;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    const simpleAnswers = finalAnswers.map(a => 
       (a.selectedAnswer !== undefined && a.selectedAnswer !== null) ? a.selectedAnswer : -1
    );

    const questionsLog = finalAnswers.map((a, index) => ({
      index: index,
      questionId: a.questionId,
      text: a.questionText || "Question text missing",
      answer: {
        selectedIndex: a.selectedAnswer,
        selectedText: a.selectedAnswerText || "" 
      },
      isCorrect: a.isCorrect,
      dimension: a.dimension,
      difficulty: a.difficulty,
      timestamp: a.timestamp
    }));

    const categoryAnalysisArray = Object.entries(finalCategoryState).map(([category, data]) => ({
      category: category,
      count: data.count,
      difficulty: data.difficulty,
      accuracy: data.count > 0 ? ((data.correct || 0) / data.count) * 100 : 0
    }));

    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = finalAnswers.length;
    const overallAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const summary = {
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      overallAccuracy,
      totalAptitudeScore: overallAccuracy,
      categoriesCompleted: Object.keys(finalCategoryState).length,
      questionsPerCategory: QUESTIONS_PER_CATEGORY,
      averageTimePerQuestion: totalQuestions > 0 ? timeTaken / totalQuestions : 0,
      finalDifficultyReached: finalBlockHistory[finalBlockHistory.length - 1]?.difficulty || 'Medium',
      difficultyDistribution: {
        Easy: finalAnswers.filter(a => a.difficulty === 'Easy').length,
        Medium: finalAnswers.filter(a => a.difficulty === 'Medium').length,
        Hard: finalAnswers.filter(a => a.difficulty === 'Hard').length
      }
    };

    const finalPayload = {
      answers: simpleAnswers,
      questionsLog: questionsLog, 
      blockHistory: finalBlockHistory,
      categoryAnalysis: categoryAnalysisArray,
      summary: summary,
      completedAt: new Date().toISOString(),
      timeTaken,
      violations: violations.length ? violations : []
    };

    if (!userId) {
      setSubmitError(finalPayload);
      return;
    }

    console.log("✅ Sending aptitude data:", finalPayload);
    onComplete(finalPayload, user);
  }, [user, onComplete, violations, QUESTIONS_PER_CATEGORY]);


  // ============================================================
  // CORE LOGIC: NEXT QUESTION
  // ============================================================
  const fetchNextQuestion = useCallback((currentAnswers, currentCatState, currentMandatoryQueue) => {
      try {
          if (currentAnswers.length >= TOTALQUESTIONS) {
            handleFinish(currentAnswers, blockHistory, currentCatState);
            return;
          }

          const usedIds = currentAnswers.map(a => a.questionId);
          
          // ✅ Check if we should show a mandatory question (every ~10 questions, and if queue not empty)
          // Calculate intervals to spread mandatory questions evenly throughout the test
          const mandatoryCount = mandatoryQuestionsRef.current?.length || 0;
          const regularQuestions = TOTALQUESTIONS - mandatoryCount;
          const interval = mandatoryCount > 0 ? Math.floor(regularQuestions / (mandatoryCount + 1)) : TOTALQUESTIONS;
          
          // Check how many mandatory questions have been shown so far
          const mandatoryShownCount = currentAnswers.filter(a => 
            mandatoryQuestionsRef.current?.some(mq => mq.id === a.questionId)
          ).length;
          
          // Determine if it's time for a mandatory question
          const nextMandatoryDue = (mandatoryShownCount + 1) * interval;
          const shouldShowMandatory = currentMandatoryQueue && 
                                      currentMandatoryQueue.length > 0 && 
                                      currentAnswers.length >= nextMandatoryDue - 1;
          
          if (shouldShowMandatory) {
            // Get the next mandatory question from queue
            const nextMandatory = currentMandatoryQueue.find(q => !usedIds.includes(q.id));
            if (nextMandatory) {
              console.log(`📌 Showing mandatory question #${nextMandatory.id} with image at position ${currentAnswers.length + 1}`);
              setActiveQuestion(nextMandatory);
              // Remove from queue
              setMandatoryQueue(prev => prev.filter(q => q.id !== nextMandatory.id));
              setLoading(false);
              window.scrollTo(0, 0);
              return;
            }
          }

          // ✅ FIX: Use round-robin to ensure equal distribution across categories
          // Find the category with the LEAST questions answered (that hasn't reached max)
          let availableCategories = CATEGORIES.filter(cat => currentCatState[cat].count < QUESTIONS_PER_CATEGORY);
          if (availableCategories.length === 0) {
            // Before finishing, ensure all mandatory questions are shown
            const remainingMandatory = currentMandatoryQueue?.find(q => !usedIds.includes(q.id));
            if (remainingMandatory) {
              console.log(`📌 Showing remaining mandatory question #${remainingMandatory.id} before completion`);
              setActiveQuestion(remainingMandatory);
              setMandatoryQueue(prev => prev.filter(q => q.id !== remainingMandatory.id));
              setLoading(false);
              window.scrollTo(0, 0);
              return;
            }
            handleFinish(currentAnswers, blockHistory, currentCatState);
            return;
          }

          // ✅ FIX: Sort categories by count (ascending) to prioritize categories with fewer questions
          // This ensures more balanced distribution
          availableCategories.sort((a, b) => currentCatState[a].count - currentCatState[b].count);
          
          // Get the minimum count among available categories
          const minCount = currentCatState[availableCategories[0]].count;
          
          // Filter to only categories with the minimum count (or close to it)
          const priorityCategories = availableCategories.filter(
            cat => currentCatState[cat].count <= minCount + 1
          );

          let foundQuestion = null;
          let categoriesToTry = [...priorityCategories];

          // ✅ First try priority categories, then fallback to all available
          while (categoriesToTry.length > 0 && !foundQuestion) {
            const randomIndex = Math.floor(Math.random() * categoriesToTry.length);
            const randomCategory = categoriesToTry[randomIndex];
            const stats = currentCatState[randomCategory];
            
            try {
              // Exclude mandatory question IDs from regular selection
              const mandatoryIds = mandatoryQuestionsRef.current?.map(q => q.id) || [];
              const excludeIds = [...usedIds, ...mandatoryIds];
              
              // ✅ FIX: Try all difficulty levels if the current one has no questions
              const difficultiesToTry = stats.locked 
                ? [stats.difficulty] 
                : ['Easy', 'Medium', 'Hard'];
              
              for (const diff of difficultiesToTry) {
                const nextQ = pickAdaptiveQuestions(diff, randomCategory, BLOCK_SIZE, excludeIds);
                if (Array.isArray(nextQ) && nextQ.length > 0) {
                  foundQuestion = nextQ[0];
                  break;
                } else if (nextQ && nextQ.id) {
                  foundQuestion = nextQ;
                  break;
                }
              }
              
              if (!foundQuestion) {
                categoriesToTry.splice(randomIndex, 1);
              }
            } catch (err) { 
              console.warn(`Error picking question for ${randomCategory}:`, err);
              categoriesToTry.splice(randomIndex, 1); 
            }
          }

          // ✅ If priority categories exhausted, try remaining available categories
          if (!foundQuestion && availableCategories.length > priorityCategories.length) {
            categoriesToTry = availableCategories.filter(cat => !priorityCategories.includes(cat));
            
            while (categoriesToTry.length > 0 && !foundQuestion) {
              const randomIndex = Math.floor(Math.random() * categoriesToTry.length);
              const randomCategory = categoriesToTry[randomIndex];
              const stats = currentCatState[randomCategory];
              
              try {
                const mandatoryIds = mandatoryQuestionsRef.current?.map(q => q.id) || [];
                const excludeIds = [...usedIds, ...mandatoryIds];
                
                const difficultiesToTry = ['Easy', 'Medium', 'Hard'];
                
                for (const diff of difficultiesToTry) {
                  const nextQ = pickAdaptiveQuestions(diff, randomCategory, BLOCK_SIZE, excludeIds);
                  if (Array.isArray(nextQ) && nextQ.length > 0) {
                    foundQuestion = nextQ[0];
                    break;
                  } else if (nextQ && nextQ.id) {
                    foundQuestion = nextQ;
                    break;
                  }
                }
                
                if (!foundQuestion) {
                  categoriesToTry.splice(randomIndex, 1);
                }
              } catch (err) { 
                categoriesToTry.splice(randomIndex, 1); 
              }
            }
          }

          if (foundQuestion) {
            setActiveQuestion(foundQuestion);
            setLoading(false);
            window.scrollTo(0, 0);
          } else {
            // Try to show a mandatory question if no regular questions found
            const remainingMandatory = currentMandatoryQueue?.find(q => !usedIds.includes(q.id));
            if (remainingMandatory) {
              console.log(`📌 No regular questions, showing mandatory #${remainingMandatory.id}`);
              setActiveQuestion(remainingMandatory);
              setMandatoryQueue(prev => prev.filter(q => q.id !== remainingMandatory.id));
              setLoading(false);
              window.scrollTo(0, 0);
              return;
            }
            console.warn('No more questions available, finishing test early');
            handleFinish(currentAnswers, blockHistory, currentCatState);
          }
      } catch (error) { 
        console.error('fetchNextQuestion error:', error);
        handleFinish(currentAnswers, blockHistory, currentCatState); 
      }
  }, [CATEGORIES, TOTALQUESTIONS, BLOCK_SIZE, handleFinish, blockHistory, mandatoryQueue, QUESTIONS_PER_CATEGORY]);


  // ============================================================
  // CORE LOGIC: SUBMIT ANSWER
  // ============================================================
  const handleSubmitAnswer = async () => {
    if (!activeQuestion || selectedOption === null || isSubmitting) return;
    setIsSubmitting(true);

    const isCorrect = selectedOption === activeQuestion.correct;
    const cat = activeQuestion.dimension;
    const currentStats = categoryState[cat];
    
    let nextDiff = currentStats.difficulty;
    let nextConsecutive = currentStats.consecutiveSame;
    let lockStatus = currentStats.locked;

    if (!lockStatus) {
      if (isCorrect) {
        if (currentStats.difficulty === 'Easy') nextDiff = 'Medium';
        else if (currentStats.difficulty === 'Medium') nextDiff = 'Hard';
      } else {
        if (currentStats.difficulty === 'Hard') nextDiff = 'Medium';
        else if (currentStats.difficulty === 'Medium') nextDiff = 'Easy';
      }
      if (nextDiff === currentStats.difficulty) {
        nextConsecutive += 1;
        if (nextConsecutive >= 2) lockStatus = nextDiff;
      } else {
        nextConsecutive = 0;
      }
    }

    const newCategoryState = {
        ...categoryState,
        [cat]: {
            ...categoryState[cat],
            count: categoryState[cat].count + 1,
            correct: isCorrect ? (categoryState[cat].correct || 0) + 1 : (categoryState[cat].correct || 0),
            difficulty: nextDiff,
            consecutiveSame: nextConsecutive,
            locked: lockStatus
        }
    };

    const selectedText = activeQuestion.options[selectedOption];

    const newRecord = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.text,
      dimension: activeQuestion.dimension,
      difficulty: activeQuestion.difficulty,
      selectedAnswer: selectedOption,
      selectedAnswerText: selectedText, 
      correctAnswer: activeQuestion.correct,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    const newAllAnswers = [...allAnswers, newRecord];
    
    const newBlockHistory = [...blockHistory, {
      blockNumber: blockHistory.length + 1,
      category: cat,
      difficulty: currentStats.difficulty,
      wasLocked: !!currentStats.locked,
      questionsInBlock: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      timestamp: new Date().toISOString()
    }];

    try {
        const userId = user?.id || user?._id || user?.studentId;
        
        setCategoryState(newCategoryState);
        setAllAnswers(newAllAnswers);
        setBlockHistory(newBlockHistory);
        setSelectedOption(null);
        
        fetch(`${window.APIBASEURL}/students/save-progress`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                userId: userId,
                answers: newAllAnswers, 
                blockHistory: newBlockHistory,
                categoryState: newCategoryState,
                completed: false
            })
        }).catch(err => console.warn("Background save failed", err));

        fetchNextQuestion(newAllAnswers, newCategoryState, mandatoryQueue);

    } catch (error) {
        console.error("Logic Error:", error);
        alert("⚠️ Error processing answer.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER: INSTRUCTIONS OR TEST
  // ============================================================
  
  // ✅ GATEKEEPER: Show instructions first
  if (!hasStarted) {
    return <InstructionScreen onStart={() => setHasStarted(true)} />;
  }

  // ✅ ERROR STATE
  if (completed && submitError) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Session Error</h2>
        <p>We saved your test data, but your User ID was missing.</p>
        <button 
          className="btn btn-primary"
          onClick={() => {
              const parsed = getSafeUserFromStorage();
              const id = parsed?.user?.id || parsed?.user?._id || parsed?.studentId;
              if(id) { onComplete({ ...submitError, studentId: id }); } 
              else { alert("Please log in again in a new tab to restore your session."); }
          }}
        >
          Retry Submission
        </button>
      </div>
    );
  }

  // ✅ COMPLETED STATE
  if (completed) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Assessment Completed</h2>
        <p>Submitting your results...</p>
      </div>
    );
  }

  // ✅ ACTIVE TEST STATE
  const progressPercent = Math.min((allAnswers.length / TOTALQUESTIONS) * 100, 100);

  return (
      <div ref={containerRef} className="test-container" style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '20px', position: 'relative', overflowY: 'auto' }}>
      
      <div className="warning-banner" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
        color: 'white', padding: '12px 20px', textAlign: 'center',
        fontWeight: 'bold', zIndex: 9999, fontSize: '14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        🔒 STRICT MODE ACTIVE: Complete in ONE sitting.
      </div>

      {showWarning && (
        <div style={{
          position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#fee', border: '2px solid #f00', padding: '16px 24px',
          borderRadius: '8px', zIndex: 9999, fontWeight: 'bold', color: '#c00',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {warningMessage}
        </div>
      )}
      
      <div className="card" style={{ marginTop: '40px', marginBottom: '24px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Aptitude Test</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {violations.length > 0 && (
                   <div style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <AlertTriangle size={18} /> {violations.length} Violations
                   </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 300 ? '#dc2626' : '#333' }}>
                    <Clock size={18} />
                    <span style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '1.4rem' }}>
                      {formatTime(timeLeft)}
                    </span>
                </div>
            </div>
        </div>

        <div className="progress-bar" style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="progress-fill" style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#3b82f6', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#999', marginTop: '6px' }}>
            {allAnswers.length} / {TOTALQUESTIONS} Questions
        </div>
      </div>

      {loading || !activeQuestion ? (
        <div className="card" style={{ background: '#fff', borderRadius: '8px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
             <div className="animate-spin" style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
             <h3>Loading...</h3>
        </div>
      ) : (
        <div className="card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'visible' }}>
          
          <div className="card-body" style={{ padding: '24px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', lineHeight: '1.5', color: '#1e293b' }}>
                  <span style={{ color: '#3b82f6', marginRight: '12px' }}>Q.</span>
                  {activeQuestion.text}
              </h3>

              {activeQuestion.image && (
                  <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                      <img src={`/images/${activeQuestion.image}`} alt="Question Visual" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #eee', objectFit: 'contain' }} />
                  </div>
              )}

              <div style={{ display: 'grid', gap: '12px' }}>
                  {activeQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                      <button
                          key={idx}
                          onClick={() => !isSubmitting && setSelectedOption(idx)}
                          disabled={isSubmitting}
                          style={{
                            textAlign: 'left',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white',
                            color: isSelected ? '#1e293b' : '#475569',
                            fontSize: '1rem',
                            fontWeight: isSelected ? '600' : '400',
                            cursor: isSubmitting ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            opacity: isSubmitting && !isSelected ? 0.5 : 1
                          }}
                      >
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? '6px solid #3b82f6' : '2px solid #cbd5e1', marginRight: '16px', flexShrink: 0 }} />
                          {option}
                      </button>
                      )
                  })}
              </div>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
             <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || isSubmitting}
                style={{ 
                  opacity: (selectedOption === null || isSubmitting) ? 0.6 : 1, 
                  padding: '12px 32px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: (selectedOption === null || isSubmitting) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
             >
                {isSubmitting ? 'Saving...' : 'Confirm & Next'} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}