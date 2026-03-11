import React, { useState } from 'react';
import { motion, AnimatePresence, time } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AdaptiveTestPlayer } from './AdaptiveTestPlayer';
import { TestPlayer } from './TestPlayer';
import { PERSONALITY_QUESTIONS, INTEREST_QUESTIONS } from '../../utils/constants';

// --- Intermission Component (Unchanged) ---
const Intermission = ({ title, message, nextTest, onContinue }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="card"
    style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
  >
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        color: '#166534'
      }}>
        <CheckCircle size={40} />
      </div>
    </div>
    <h2 style={{ color: '#1b4965', fontSize: '2rem', marginBottom: '16px' }}>{title}</h2>
    <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>{message}</p>
    
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>UP NEXT</p>
      <h3 style={{ color: '#1b4965', fontSize: '1.4rem' }}>{nextTest}</h3>
    </div>

    <button className="btn btn-primary btn-lg w-full" onClick={onContinue} style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
      Continue Journey <ArrowRight size={20} />
    </button>
  </motion.div>
);

export function UnifiedTestPlayer({ user, onComplete, onSaveIndividualTest }) {
  const getInitialStage = () => {
    if (user?.aptitudeStatus !== 'completed' && !user?.aptitudeScore) return 'aptitude';
    if (user?.personalityStatus !== 'completed') return 'personality';
    if (user?.interestStatus !== 'completed') return 'interest';
    return 'finished';
  };

  const [stage, setStage] = useState(getInitialStage());

  // 1. APTITUDE HANDLER
  const handleAptitudeDone = async (data) => {
      console.log('✅ Raw Aptitude Data received:', data);
      
      // ✅ Use same formatting as TestPlayer
      const formattedData = {
          student: user.id || user._id || user.studentId,
          testType: 'aptitude',
          timeTaken: data.timeTaken,
          completedAt: data.completedAt,
          // EDVIRON Change#02
          // Added fields as per backend requirement
          blockHistory: data.extra?.blockHistory || [],
          difficultyProgression: data.extra?.difficultyProgression || [],
          categoryAnalysis: data.extra?.categoryAnalysis || {},

          
          // ✅ Map questionsLog exactly like personality/interest

          // EDVIRON Change#03
          // Changed from questions to answers to match backend expectation
          // questions: data.questionsLog.map((q) => ({
          answers: data.questionsLog.map((q) => ({
              index: q.index,
              questionId: q.questionId,
              text: q.text,

              // EDVIRON Change#06- Added fields as per backend requirement
              // answer: q.answer
              answer: q.answer.selectedIndex,  // Already has { selectedIndex, isCorrect }
              correctAnswer: q.answer.correctIndex, 
              isCorrect: q.answer.isCorrect,
              timestamp: q.timestamp

          })),
          

          // ✅ Store extra analytics in summary
          summary: {
              aptitudeScores: data.extra?.categoryAnalysis || {},
              totalAptitudeScore: calculateTotalScore(data.questionsLog),
              // EDVIRON Change#10- Added fields as per backend requirement
              totalQuestions: data.questionsLog.length,
              correctAnswers: data.questionsLog.filter(q => q.answer?.isCorrect).length,
              incorrectAnswers: data.questionsLog.filter(q => q.answer && !q.answer.isCorrect).length,
              overallAccuracy: parseFloat(((data.questionsLog.filter(q => q.answer?.isCorrect).length) / data.questionsLog.length * 100).toFixed(2)),
              extra: {
                  blockHistory: data.extra?.blockHistory || [],
                  difficultyProgression: data.extra?.difficultyProgression || []
              }
          },

          violations: data.violations || []

      };

      console.log('🔄 Formatted Payload for Backend:', formattedData);

      const success = await onSaveIndividualTest('aptitude', formattedData);
      
      if (success === true) {
        console.log('✅ [Aptitude] Saved successfully');
        setStage('break-1');
      } else {
        console.error('❌ [Aptitude] Failed to save');
        alert("There was an issue saving your Aptitude results.");
      }
  };

  // Helper function
  const calculateTotalScore = (questionsLog) => {
      const correct = questionsLog.filter(q => q.answer?.isCorrect).length;
      return Math.round((correct / questionsLog.length) * 100);
  };
  // 2. PERSONALITY HANDLER
  const handlePersonalityDone = async (data) => {
      console.log('✅ Personality Data:', data);
      
      const formattedData = {
          student: user.id || user._id || user.studentId,
          testType: 'personality',
          timeTaken: data.timeTaken,
          completedAt: new Date().toISOString(),

          // EDVIRON Change#13 - Changed from answers to correct questionsLog 
          questions: data.questionsLog.map((a, idx) => ({
          // questions: data.answers.map((a, idx) => ({
              index: idx,
              questionId: a.questionId || `P${idx + 1}`,
              text: a.text,
              answer: a.answer
          })),
          summary: {
              oceanScores: data.oceanScores || {},
              extra: data.rawAnswers || {}
          }
      };
      
      console.log('🔄 Formatted Personality Payload for Backend:', formattedData);
      const success = await onSaveIndividualTest('personality', formattedData);
      
      if (success === true) {
        setStage('break-2');
      } else {
        console.error('❌ [Personality] Failed to save');
        alert("There was an issue saving your Personality results.");
      }
  };

  // 3. INTEREST HANDLER
// 3. INTEREST HANDLER
const handleInterestDone = async (data) => {
  console.log('Interest Data', data);

  const topInterests = Array.isArray(data.topInterests)
    ? data.topInterests
    : data.interestSummary?.topLabels || [];

  const categoryScores = data.interestScores || data.interestSummary?.scoreMap || {};
  const traitScores = data.traitInterestScores || data.interestSummary?.traitScores || {};
  const careerScores = data.careerInterestScores || data.interestSummary?.careerScores || {};

  // ✅ FIX: Use 'questions' instead of 'questionsLog' to match backend expectation
  const formattedData = {
    student: user.id || user._id || user.studentId,
    testType: 'interest',
    status: 'completed',
    timeTaken: data.timeTaken,
    completedAt: new Date().toISOString(),

    // ✅ FIX: Backend expects 'questions' not 'questionsLog'
    questions: data.questionsLog?.map((q, idx) => ({
      index: idx,
      questionId: q.questionId,
      text: q.text,
      answer: q.answer,
      trait: q.trait || null,
    })),

    summary: {
      topInterests,
      categoryScores,
      interestScores: categoryScores,
      traitScores,
      careerScores,
    },

    violations: data.violations || [],
  };

  console.log('Formatted Interest Payload for Backend', formattedData);

  const success = await onSaveIndividualTest('interest', formattedData);

  if (success === true) {
    setStage('finished');
    onComplete();
  } else {
    console.error('Interest Failed to save');
    alert('There was an issue saving your Interest results.');
  }
};


  return (
    <div style={{ minHeight: '100vh', background: '#f8fbff', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: APTITUDE (Adaptive) */}
          {stage === 'aptitude' && (
            <motion.div key="aptitude" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <AdaptiveTestPlayer user={user} onComplete={handleAptitudeDone} />
            </motion.div>
          )}

          {/* BREAK 1 */}
          {stage === 'break-1' && (
            <Intermission 
              key="break-1"
              title="Aptitude Test Complete!"
              message="Your logical and analytical profile has been captured. Take a deep breath. Next, we want to understand who you are as a person."
              nextTest="Personality Assessment (OCEAN)"
              onContinue={() => setStage('personality')}
            />
          )}

          {/* STAGE 2: PERSONALITY (Standard) */}
          {stage === 'personality' && (
            <motion.div key="personality" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <TestPlayer 
                testType="personality" 
                questions={PERSONALITY_QUESTIONS} 
                onComplete={handlePersonalityDone} 
                user={user} 
              />
            </motion.div>
          )}

          {/* BREAK 2 */}
          {stage === 'break-2' && (
            <Intermission 
              key="break-2"
              title="Personality Profile Saved!"
              message="You're doing great! We're almost at the finish line. The final step is to map your passions and what you actually love doing."
              nextTest="Interest Inventory"
              onContinue={() => setStage('interest')}
            />
          )}

          {/* STAGE 3: INTEREST (Standard) */}
          {stage === 'interest' && (
            <motion.div key="interest" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <TestPlayer 
                testType="interest" 
                questions={INTEREST_QUESTIONS} 
                onComplete={handleInterestDone} 
                user={user} 
              />
            </motion.div>
          )}

          {/* FINISHED */}
          {stage === 'finished' && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="card"
              style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}
            >
              <Sparkles size={60} color="#1FB8CD" style={{ margin: '0 auto 24px' }} />
              <h1 style={{ color: '#1b4965', fontSize: '2.5rem', marginBottom: '16px' }}>All Systems Go! 🚀</h1>
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
                We are compiling your multi-dimensional report. Redirecting you to your dashboard...
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
