import React, { useState, useEffect, useRef, useCallback } from 'react';
import { computeInterestSummary } from '../../utils/interestEngine';


// Define Likert Scale labels globally for consistency
const LIKERT_SCALES = {
  agreement: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  interest: ['Not at all interested', 'Slightly interested', 'Moderately interested', 'Very interested', 'Extremely interested'],
  prestige: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
  support: ['No support', 'Little support', 'Some support', 'Good support', 'Full support']
};

// Default scale for backward compatibility
const LIKERT_SCALE = LIKERT_SCALES.agreement;

// ✅ Helper function to compute OCEAN personality scores from answers
// PERSONALITY_QUESTIONS has 40 questions: 8 each for O, C, E, A, N
const computeOCEANScores = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) return {};

  const getTraitLevel = (score, maxScore) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (percentage >= 80) return 'Very High';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    if (percentage >= 20) return 'Low';
    return 'Very Low';
  };

  // Each trait has 8 questions (40 total)
  const traitRanges = {
    Openness: { start: 0, end: 8 },
    Conscientiousness: { start: 8, end: 16 },
    Extraversion: { start: 16, end: 24 },
    Agreeableness: { start: 24, end: 32 },
    Neuroticism: { start: 32, end: 40 },
  };

  const traits = {};

  Object.entries(traitRanges).forEach(([traitName, range]) => {
    let sum = 0;
    let count = 0;

    for (let i = range.start; i < range.end && i < answers.length; i++) {
      const answer = answers[i];
      if (answer !== null && answer >= 1 && answer <= 5) {
        sum += answer;
        count++;
      }
    }

    const maxScore = count * 5;
    const percentage = maxScore > 0 ? Math.round((sum / maxScore) * 100) : 0;
    const level = getTraitLevel(sum, maxScore);

    traits[traitName] = {
      score: sum,
      level,
      percentage,
      maxScore,
    };
  });

  return traits;
};

const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function TestPlayer({ testType, questions, onComplete, user }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Initialize with null to indicate "Skipped" by default
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(null);
  const [violations, setViolations] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  const containerRef = useRef(null);
  const startTime = useRef(Date.now());

  // Test duration based on type (in seconds)
  const testDurations = {
    aptitude: 45 * 60,     // 45 minutes
    personality: 10 * 60,  // 10 minutes
    interest: 30 * 60      // 30 minutes
  };

  // --- Helper Functions (Defined before useEffect to avoid scope issues) ---

  const getNextTestName = () => {
    switch(testType) {
      case 'aptitude': return 'Personality Test (OCEAN)';
      case 'personality': return 'Interest Inventory';
      default: return 'Results Dashboard';
    }
  };

  const showWarningDialog = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);
  };

  const logViolation = (type) => {
    setViolations(prev => [...prev, { type, timestamp: new Date(), questionNumber: currentQuestion + 1 }]);
  };

  // --- Fullscreen Functions (MUST be defined before completeTest) ---
  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
      else if (containerRef.current.webkitRequestFullscreen) containerRef.current.webkitRequestFullscreen();
      else if (containerRef.current.msRequestFullscreen) containerRef.current.msRequestFullscreen();
    }
  };

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msFullscreenElement && document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (e) {
      console.warn('Could not exit fullscreen:', e);
    }
  }, []);

  // --- Data Formatting & Submission ---
  // --- Data Formatting & Submission ---
  // --- Data Formatting & Submission ---
  const completeTest = useCallback(() => {
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime.current) / 1000);

    const questionsLog = questions.map((q, index) => {
      const selectedIndex = answers[index];
      let answer = null;

      // Determine which label set to use based on question's trait/scaleType
      let likertLabels = LIKERT_SCALES.agreement;
      if (q.scaleType && LIKERT_SCALES[q.scaleType]) {
        likertLabels = LIKERT_SCALES[q.scaleType];
      } else if (q.trait === 'Interest') {
        likertLabels = LIKERT_SCALES.interest;
      } else if (q.trait === 'Prestige') {
        likertLabels = LIKERT_SCALES.prestige;
      } else if (q.trait === 'Support') {
        likertLabels = LIKERT_SCALES.support;
      }

      if (selectedIndex !== null && selectedIndex !== undefined) {
        if (testType === 'aptitude' && q.options) {
          answer = {
            selectedIndex,
            selectedText: q.options[selectedIndex],
          };
        } else if (testType === 'personality' || testType === 'interest') {
          const label = likertLabels[selectedIndex - 1] || null;
          answer = {
            selectedIndex,
            selectedText: label,
          };
        } else {
          answer = { selectedIndex };
        }
      }

      return {
        index,
        questionId: q.id,
        Q: index + 1,
        text: q.text,
        answer,
        dimension: q.dimension || null,
        difficulty: q.difficulty || null,
        trait: q.trait || null,
      };
    });

    const baseData = {
      answers,
      questionsLog,
      completedAt: new Date().toISOString(),
      timeTaken,
      violations: violations.length ? violations : [],
    };

    // ✅ FIX: Compute OCEAN scores for personality test
    if (testType === 'personality') {
      const oceanScores = computeOCEANScores(answers);
      baseData.oceanScores = oceanScores;
      baseData.rawAnswers = answers;
    }

    // Compute interest summary
    if (testType === 'interest') {
      const interestSummary = computeInterestSummary(questions, answers);

      baseData.interestSummary = interestSummary;
      baseData.interestScores = interestSummary.scoreMap;
      baseData.topInterests = interestSummary.topLabels;
      baseData.traitInterestScores = interestSummary.traitScores;
      baseData.careerInterestScores = interestSummary.careerScores;
      baseData.rawAnswers = answers;
    }

    exitFullscreen();
    onComplete(baseData);
  }, [answers, questions, testType, violations, exitFullscreen, onComplete]);



  const handleAutoSubmit = useCallback(() => {
    alert('Time is up! Submitting automatically.');
    completeTest();
  }, [completeTest]);

  // --- Anti-Cheat Functions ---
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

  const handleCopyPaste = (e) => { e.preventDefault(); logViolation(`${e.type} attempt`); };
  
  const handleWindowBlur = () => {
    logViolation('Window lost focus');
    showWarningDialog('⚠️ Warning: Focus lost. Stay on this window.');
  };

  // Block tab switching during test (Anti-Pause)
  const blockTabSwitch = () => {
    if (document.hidden) {
      showWarningDialog('⚠️ Tab switch detected! Complete in one sitting.');
      window.focus();
    }
  };

  // Block page leave / refresh
  const blockPageLeave = (e) => {
    e.preventDefault();
    e.returnValue = '';
    return '⚠️ Test must be completed in one sitting. Are you sure?';
  };

  const setupAntiCheat = () => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', blockTabSwitch); // Added explicit block
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', blockPageLeave);
  };

  const removeAntiCheat = () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('visibilitychange', blockTabSwitch);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('copy', handleCopyPaste);
    document.removeEventListener('paste', handleCopyPaste);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('beforeunload', blockPageLeave);
  };

  // --- Effects ---

  useEffect(() => {
    setTimeLeft(testDurations[testType] || 1800);
    enterFullscreen();
    setupAntiCheat();
    
    return () => {
      exitFullscreen();
      removeAntiCheat();
    };
  }, []); // Run once on mount

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleAutoSubmit]);

  // --- Answer Handling ---
  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    
    // 1. Check for unanswered questions
    if (unanswered > 0) {
      const confirm = window.confirm(
        `⚠️ You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}\n\n` +
        `This assessment must be completed in ONE SITTING.\n` +
        `You cannot pause, return, or retake.\n\n` +
        `Submit and continue to next section?`
      );
      if (!confirm) return;
    } else {
      // 2. Confirm submission even if all answered
      const confirm = window.confirm(
        `✅ ${testType.charAt(0).toUpperCase() + testType.slice(1)} Test completed!\n\n` +
        `Ready to submit and move to the next section?\n\n` +
        `⏭️ Next: ${getNextTestName()}`
      );
      if (!confirm) return;
    }

    // 3. Process completion
    completeTest();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div ref={containerRef} className="test-container" style={{ 
      backgroundColor: '#fff', minHeight: '100vh', padding: '20px', position: 'relative'
    }}>
      {/* STRICT MODE WARNING BANNER */}
      <div className="warning-banner" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        fontWeight: 'bold',
        zIndex: 9999,
        fontSize: '14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        🔒 STRICT MODE ACTIVE: Complete in ONE sitting. No pausing allowed.
      </div>

      {/* Warning Overlay for Violations */}
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '40px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div>
          <h2 style={{ margin: 0 }}>{testType.toUpperCase()} Test</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft < 300 ? '#dc2626' : '#333' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          {violations.length > 0 && <div style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ {violations.length} violations</div>}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: '24px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div className="progress-fill" style={{ width: `${progress}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question Card */}
      <div className="card" style={{ marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '20px', lineHeight: '1.6' }}>{question.text}</h3>

          {/* Aptitude Options */}
          {testType === 'aptitude' && question.options && (
            <ul className="options-list" style={{ listStyle: 'none', padding: 0 }}>
              {question.options.map((option, index) => (
                <li
                  key={index}
                  className={`option-item ${answers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index)}
                  style={{
                    padding: '12px 16px',
                    border: `2px solid ${answers[currentQuestion] === index ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    backgroundColor: answers[currentQuestion] === index ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                </li>
              ))}
            </ul>
          )}

          {/* Likert Scale Options */}
          {(testType === 'personality' || testType === 'interest') && (() => {
            // Determine which scale to use based on question's scaleType or trait
            let scaleToUse = LIKERT_SCALES.agreement;
            if (question.scaleType && LIKERT_SCALES[question.scaleType]) {
              scaleToUse = LIKERT_SCALES[question.scaleType];
            } else if (question.trait === 'Interest') {
              scaleToUse = LIKERT_SCALES.interest;
            } else if (question.trait === 'Prestige') {
              scaleToUse = LIKERT_SCALES.prestige;
            } else if (question.trait === 'Support') {
              scaleToUse = LIKERT_SCALES.support;
            }
            
            return (
              <div className="likert-scale" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                {scaleToUse.map((label, index) => (
                  <div
                    key={index}
                    className={`likert-option ${answers[currentQuestion] === index + 1 ? 'selected' : ''}`}
                    onClick={() => handleAnswer(index + 1)} // Stores 1-5
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18%' }}
                  >
                    <div className="likert-radio" style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: `2px solid ${answers[currentQuestion] === index + 1 ? '#3b82f6' : '#9ca3af'}`,
                      backgroundColor: answers[currentQuestion] === index + 1 ? '#3b82f6' : 'white',
                      marginBottom: '8px'
                    }}></div>
                    <div style={{ fontSize: '13px', marginTop: '4px', textAlign: 'center', fontWeight: answers[currentQuestion] === index + 1 ? 'bold' : 'normal' }}>{label}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        {testType === 'aptitude' ? (
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestion === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
        ) : (
          <div />
        )}

        <div style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>
          <span style={{ color: '#666' }}>
            {answers.filter(a => a !== null).length} of {questions.length} answered
          </span>
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Submit Test ✓
          </button>
        )}
      </div>

      {/* Navigator Panel - Only shown for aptitude tests */}
      {testType === 'aptitude' && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Question Navigator:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                style={{
                  width: '36px', height: '36px', border: '1px solid #ddd', borderRadius: '4px',
                  backgroundColor: index === currentQuestion ? '#3b82f6' : answers[index] !== null ? '#22c55e' : '#fff',
                  color: index === currentQuestion || answers[index] !== null ? '#fff' : '#333',
                  cursor: 'pointer', fontWeight: '500'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', display: 'flex', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6' }}></div> Current</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#22c55e' }}></div> Answered</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: '#fff', border: '1px solid #ddd' }}></div> Skipped</span>
          </div>
        </div>
      )}
    </div>
  );
}