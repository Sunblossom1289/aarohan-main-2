// FILE: src/components/student/ResultsDashboard.jsx

import React, { useMemo, useRef, useEffect, useState, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext'; // Imported back for safety
import jsPDF from 'jspdf';

// We use try-catch for imports in case these files don't exist yet
import {
  calculateAptitudeResults,
  calculateOCEANScores,
  getTraitExplanation,
  calculateInterestResults,
  getInterestLevelBadge,
  calculatePsychometricDomains,
  calculatePsychometricDomainsFromAnswers,
  getPsychometricCareerSuggestions,
} from '../../utils/resultCalculations';

import { recommendCareers, getTopCareers } from '../../utils/careerRecommendations';

// Helper function to calculate OCEAN scores from raw answers array
// This is used when we only have the answers array (numbers 1-5) without questionsLog
function calculateOCEANFromAnswers(answers) {
  if (!Array.isArray(answers) || answers.length === 0) return null;
  
  // OCEAN traits: Each has 8 questions (40 total in PERSONALITY_QUESTIONS)
  const traitRanges = {
    Openness: { start: 0, end: 8 },
    Conscientiousness: { start: 8, end: 16 },
    Extraversion: { start: 16, end: 24 },
    Agreeableness: { start: 24, end: 32 },
    Neuroticism: { start: 32, end: 40 },
  };

  const getTraitLevel = (score, maxScore) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (percentage >= 80) return 'Very High';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    if (percentage >= 20) return 'Low';
    return 'Very Low';
  };

  const traits = {};

  Object.entries(traitRanges).forEach(([traitName, range]) => {
    let sum = 0;
    let count = 0;

    for (let i = range.start; i < range.end && i < answers.length; i++) {
      const answer = answers[i];
      // Handle both number and object formats
      const value = typeof answer === 'object' && answer?.selectedIndex 
        ? answer.selectedIndex 
        : (typeof answer === 'number' ? answer : null);
      
      if (value !== null && value >= 1 && value <= 5) {
        sum += value;
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
}

export function ResultsDashboard(props) {
  // ==================== 1. SAFE USER EXTRACTION (FIX FOR WHITE SCREEN) ====================
  // We check context, then props.state, then props.user to ensure we find the data.
  const contextData = useContext(AppContext);
  
  // Logic: 
  // 1. Check if 'state' prop exists (New way)
  // 2. Check if 'user' prop exists (Old way)
  // 3. Check Context (Old way fallback)
  const user = props.state?.user || props.user || contextData?.state?.user;
  const dispatch = contextData?.dispatch;

  // ==================== ALL HOOKS MUST BE DECLARED BEFORE ANY RETURN ====================
  const [displayUser, setDisplayUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const reportRef = useRef(null);
  const oceanChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const interestChartRef = useRef(null);

  // ==================== STATE FOR INTERACTIVITY ====================
  const [whatIfScores, setWhatIfScores] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [improvementAmount, setImprovementAmount] = useState(10);
  const [isDownloading, setIsDownloading] = useState(false);

  // ==================== FETCH FRESH DATA ON MOUNT ====================
  useEffect(() => {
    const fetchFreshData = async () => {
      const userId = user?.id || user?._id || user?.studentId;
      if (!userId || dataFetched) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${window.API_BASE_URL}/students/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.success && data.student) {
          setDisplayUser(data.student);
          // Update context if dispatch available
          if (dispatch) {
            dispatch({ type: 'UPDATEUSER', payload: data.student });
          }
        }
      } catch (error) {
        console.error('Error fetching fresh data:', error);
      } finally {
        setIsLoading(false);
        setDataFetched(true);
      }
    };

    fetchFreshData();
  }, [user?.id, user?._id, user?.studentId, dataFetched, dispatch]);

  // Update displayUser when user prop changes
  useEffect(() => {
    if (user && !dataFetched) {
      setDisplayUser(user);
    }
  }, [user, dataFetched]);

  // ==================== FRONTEND CALCULATIONS ====================

  // APTITUDE - Compute from raw data
  const aptitudeData = useMemo(() => {
    // Check if we have aptitude results at all
    if (!displayUser?.aptitudeResults && !displayUser?.lastAptitudeResult) return null;

    // Priority 1: Check populated TestResult (lastAptitudeResult)
    const testResult = displayUser.lastAptitudeResult;
    if (testResult && typeof testResult === 'object') {
      // If TestResult has summary with aptitude scores
      if (testResult.summary?.aptitudeScores || testResult.summary?.totalAptitudeScore) {
        const dimensionScores = testResult.summary.aptitudeScores || {};
        // Calculate total score from dimension scores if not provided
        let totalScore = testResult.summary.totalAptitudeScore || 0;
        if (!totalScore && Object.keys(dimensionScores).length > 0) {
          const scores = Object.values(dimensionScores).filter(s => typeof s === 'number');
          totalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        }
        return {
          totalScore: Math.round(totalScore * 100) / 100,
          dimensionScores: dimensionScores
        };
      }
      // If TestResult has questions array, calculate from it
      if (testResult.questions && Array.isArray(testResult.questions) && testResult.questions.length > 0) {
        if (typeof calculateAptitudeResults === 'function') {
          const answers = testResult.questions.map(q => {
            if (q.answer && typeof q.answer === 'object') {
              return q.answer.selectedIndex;
            }
            return typeof q.answer === 'number' ? q.answer : null;
          });
          return calculateAptitudeResults(testResult.questions, answers);
        }
      }
    }

    // Priority 2: Check aptitudeResults.questionsLog
    if (displayUser.aptitudeResults?.questionsLog && typeof calculateAptitudeResults === 'function') {
      return calculateAptitudeResults(
        displayUser.aptitudeResults.questionsLog,
        displayUser.aptitudeResults.answers
      );
    }
    
    // Priority 3: Use pre-calculated scores from aptitudeResults
    if (displayUser.aptitudeResults) {
      const dimensionScores = displayUser.aptitudeResults.dimensionScores || {};
      let totalScore = displayUser.aptitudeResults.score || displayUser.aptitudeResults.totalScore || 0;
      
      // If totalScore is 0 but we have dimension scores, calculate average
      if (!totalScore && Object.keys(dimensionScores).length > 0) {
        const scores = Object.values(dimensionScores).filter(s => typeof s === 'number');
        totalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      }
      
      return {
        totalScore: Math.round(totalScore * 100) / 100,
        dimensionScores: dimensionScores
      };
    }
    
    return null;
  }, [displayUser?.aptitudeResults, displayUser?.lastAptitudeResult]);

  const aptitudeScore = aptitudeData?.totalScore ?? null;
  const aptitudeDimensions = aptitudeData?.dimensionScores || {};

  // PERSONALITY (OCEAN) - Compute from raw data
  const oceanScores = useMemo(() => {
    // First check if we have personality results at all
    if (!displayUser?.personalityResults && !displayUser?.lastPersonalityResult) return null;

    // Priority 1: Check populated TestResult (lastPersonalityResult)
    const testResult = displayUser.lastPersonalityResult;
    if (testResult && typeof testResult === 'object') {
      // If TestResult has summary.oceanScores, use that
      if (testResult.summary?.oceanScores) {
        return testResult.summary.oceanScores;
      }
      // If TestResult has questions array, calculate from it
      if (testResult.questions && Array.isArray(testResult.questions) && testResult.questions.length > 0) {
        const answers = testResult.questions.map(q => {
          if (q.answer && typeof q.answer === 'object') {
            return q.answer.selectedIndex;
          }
          return typeof q.answer === 'number' ? q.answer : null;
        });
        if (typeof calculateOCEANScores === 'function') {
          return calculateOCEANScores(testResult.questions, answers);
        }
      }
    }

    // Priority 2: Check personalityResults.questionsLog
    if (displayUser.personalityResults?.questionsLog && typeof calculateOCEANScores === 'function') {
      return calculateOCEANScores(
        displayUser.personalityResults.questionsLog,
        displayUser.personalityResults.answers
      );
    }

    // Priority 3: Check if personalityResults has pre-calculated traits
    if (displayUser.personalityResults?.traits) {
      return displayUser.personalityResults.traits;
    }

    // Priority 4: Calculate from answers array if available
    if (displayUser.personalityResults?.answers && Array.isArray(displayUser.personalityResults.answers)) {
      const answers = displayUser.personalityResults.answers;
      if (answers.length > 0 && typeof calculateOCEANScores === 'function') {
        // Build a minimal questionsLog from PERSONALITY_QUESTIONS constant if needed
        return calculateOCEANFromAnswers(answers);
      }
    }

    return null;
  }, [displayUser?.personalityResults, displayUser?.lastPersonalityResult]);

  const dominantTrait = useMemo(() => {
    if (!oceanScores) return 'N/A';
    const entries = Object.entries(oceanScores);
    const sorted = entries.sort((a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0));
    return sorted[0]?.[0] ?? 'N/A';
  }, [oceanScores]);

  // INTEREST - Compute from raw data
  const interestData = useMemo(() => {
    // First check if we have interest results at all
    if (!displayUser?.interestResults && !displayUser?.lastInterestResult) return null;

    // Priority 1: Check populated TestResult (lastInterestResult)
    const testResult = displayUser.lastInterestResult;
    if (testResult && typeof testResult === 'object') {
      // If TestResult has summary with interest data
      if (testResult.summary?.interestScores || testResult.summary?.topInterests) {
        const result = {
          topInterests: testResult.summary.topInterests || [],
          categoryScores: testResult.summary.interestScores || testResult.summary.categoryScores || {},
          traitScores: testResult.summary.traitScores || {},
          careerScores: testResult.summary.careerScores || {}
        };
        // If traitScores/careerScores are empty but we have questions, compute them
        if (Object.keys(result.traitScores).length === 0 && testResult.questions?.length > 0 && typeof calculateInterestResults === 'function') {
          const answers = testResult.questions.map(q => {
            if (q.answer && typeof q.answer === 'object') return q.answer.selectedIndex;
            return typeof q.answer === 'number' ? q.answer : null;
          });
          const computed = calculateInterestResults(testResult.questions, answers);
          if (computed?.traitScores && Object.keys(computed.traitScores).length > 0) {
            result.traitScores = computed.traitScores;
          }
          if (computed?.careerScores && Object.keys(computed.careerScores).length > 0) {
            result.careerScores = computed.careerScores;
          }
          if (!result.topInterests?.length && computed?.topInterests?.length > 0) {
            result.topInterests = computed.topInterests;
          }
        }
        return result;
      }
      // If TestResult has questions array, calculate from it
      if (testResult.questions && Array.isArray(testResult.questions) && testResult.questions.length > 0) {
        const answers = testResult.questions.map(q => {
          if (q.answer && typeof q.answer === 'object') {
            return q.answer.selectedIndex;
          }
          return typeof q.answer === 'number' ? q.answer : null;
        });
        if (typeof calculateInterestResults === 'function') {
          return calculateInterestResults(testResult.questions, answers);
        }
      }
    }

    // Priority 2: Check interestResults.questionsLog
    if (displayUser.interestResults?.questionsLog && typeof calculateInterestResults === 'function') {
      return calculateInterestResults(
        displayUser.interestResults.questionsLog,
        displayUser.interestResults.answers
      );
    }

    // Priority 3: Return pre-calculated data from interestResults
    if (displayUser.interestResults) {
      return {
        topInterests: displayUser.interestResults.topInterests || [],
        categoryScores: displayUser.interestResults.categoryScores || displayUser.interestResults.categories || {},
        traitScores: displayUser.interestResults.traitScores || {},
        careerScores: displayUser.interestResults.careerScores || {}
      };
    }

    return null;
  }, [displayUser?.interestResults, displayUser?.lastInterestResult]);

  // PSYCHOMETRIC DOMAINS (AP, OP, EX, EM, ES, CR, PR) - Compute from interest test data
  const psychometricDomains = useMemo(() => {
    // First check if we have interest results at all (psychometric is part of interest test)
    if (!displayUser?.interestResults && !displayUser?.lastInterestResult) return null;

    // ── Priority 0 (most reliable): Use pre-computed traitScores from interest engine ──
    const traitScores = displayUser.interestResults?.traitScores;
    if (traitScores && typeof traitScores === 'object' && Object.keys(traitScores).length > 0) {
      const domainScores = {};
      Object.entries(traitScores).forEach(([code, trait]) => {
        const avg = trait.average ?? (trait.score ? (trait.score / 100) * 5 : 0);
        const pct = trait.score ?? Math.round((avg / 5) * 100);
        const levelLabel = pct >= 70 ? 'High' : pct >= 40 ? 'Moderate' : 'Low';
        const levelClass = pct >= 70 ? 'high' : pct >= 40 ? 'moderate' : 'low';

        domainScores[code] = {
          code,
          label: trait.label || code,
          description: trait.description || '',
          avgScore: Number(Number(avg).toFixed(2)),
          percentage: pct,
          level: levelLabel,
          levelClass,
          questionCount: 8,
          rawSum: 0,
          maxPossible: 40,
          suggestedCareers: []
        };
      });
      return domainScores;
    }

    // Priority 1: Check populated TestResult (lastInterestResult)
    const testResult = displayUser.lastInterestResult;
    if (testResult && typeof testResult === 'object') {
      // If TestResult has summary with psychometric domains
      if (testResult.summary?.psychometricDomains) {
        return testResult.summary.psychometricDomains;
      }
      // If TestResult has summary.traitScores (from interestEngine)
      if (testResult.summary?.traitScores && Object.keys(testResult.summary.traitScores).length > 0) {
        const ts = testResult.summary.traitScores;
        const domainScores = {};
        Object.entries(ts).forEach(([code, trait]) => {
          const avg = trait.average ?? (trait.score ? (trait.score / 100) * 5 : 0);
          const pct = trait.score ?? Math.round((avg / 5) * 100);
          const levelLabel = pct >= 70 ? 'High' : pct >= 40 ? 'Moderate' : 'Low';
          const levelClass = pct >= 70 ? 'high' : pct >= 40 ? 'moderate' : 'low';
          domainScores[code] = {
            code, label: trait.label || code, description: trait.description || '',
            avgScore: Number(Number(avg).toFixed(2)), percentage: pct,
            level: levelLabel, levelClass,
            questionCount: 8, rawSum: 0, maxPossible: 40, suggestedCareers: []
          };
        });
        return domainScores;
      }
      // If TestResult has questions array, calculate from it
      if (testResult.questions && Array.isArray(testResult.questions) && testResult.questions.length > 0) {
        const answers = testResult.questions.map(q => {
          if (q.answer && typeof q.answer === 'object') {
            return q.answer.selectedIndex;
          }
          return typeof q.answer === 'number' ? q.answer : null;
        });
        if (typeof calculatePsychometricDomains === 'function') {
          return calculatePsychometricDomains(testResult.questions, answers);
        }
      }
    }

    // Priority 2: Check interestResults.questionsLog
    if (displayUser.interestResults?.questionsLog && typeof calculatePsychometricDomains === 'function') {
      return calculatePsychometricDomains(
        displayUser.interestResults.questionsLog,
        displayUser.interestResults.answers
      );
    }

    // Priority 3: Calculate from answers array if available
    if (displayUser.interestResults?.answers && Array.isArray(displayUser.interestResults.answers)) {
      if (typeof calculatePsychometricDomainsFromAnswers === 'function') {
        return calculatePsychometricDomainsFromAnswers(displayUser.interestResults.answers);
      }
    }

    // Priority 4: Return pre-calculated psychometric domains
    if (displayUser.interestResults?.psychometricDomains) {
      return displayUser.interestResults.psychometricDomains;
    }

    return null;
  }, [displayUser?.interestResults, displayUser?.lastInterestResult]);

  // Get psychometric career suggestions based on domain scores
  const psychometricCareerSuggestions = useMemo(() => {
    if (!psychometricDomains || typeof getPsychometricCareerSuggestions !== 'function') return null;
    return getPsychometricCareerSuggestions(psychometricDomains);
  }, [psychometricDomains]);

  // TEST COMPLETION STATUS
  const hasAptitudeResults = displayUser?.aptitudeStatus === 'completed' || !!aptitudeData;
  const hasPersonalityResults = displayUser?.personalityStatus === 'completed' || !!oceanScores;
  const hasInterestResults = displayUser?.interestStatus === 'completed' || !!interestData;
  const noTestsCompleted = !hasAptitudeResults && !hasPersonalityResults && !hasInterestResults;

  // ==================== STRENGTH-WEAKNESS PROFILE ====================

  const strengthWeaknessProfile = useMemo(() => {
    if (!aptitudeDimensions || Object.keys(aptitudeDimensions).length === 0) return null;

    const scores = Object.entries(aptitudeDimensions).map(([key, value]) => ({
      dimension: key,
      score: Number(value) || 0,
    }));

    if (scores.length === 0) return null;

    const avg = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
    const sorted = [...scores].sort((a, b) => b.score - a.score);

    const strengths = sorted.filter((item) => item.score >= avg + 10);
    const weaknesses = sorted.filter((item) => item.score <= avg - 10);

    const variance =
      scores.reduce((sum, item) => sum + Math.pow(item.score - avg, 2), 0) / scores.length;
    const consistency = 100 - Math.min(100, Math.sqrt(variance));

    return {
      average: avg,
      highest: sorted[0],
      lowest: sorted[sorted.length - 1],
      strengths,
      weaknesses,
      consistency,
      profileType: consistency > 70 ? 'Consistent' : consistency > 40 ? 'Balanced' : 'Spiky',
    };
  }, [aptitudeDimensions]);

  // ==================== PROFILE CLUSTER ====================

  const profileCluster = useMemo(() => {
    if (!aptitudeDimensions || Object.keys(aptitudeDimensions).length === 0) return null;

    const entries = Object.entries(aptitudeDimensions);
    if (entries.length === 0) return null;

    let quantScore = 0;
    let verbalScore = 0;
    let spatialScore = 0;

    entries.forEach(([key, value]) => {
      const keyLower = key.toLowerCase();
      const score = Number(value) || 0;

      if (keyLower.includes('numerical') || keyLower.includes('quantitative') || keyLower.includes('math')) {
        quantScore = Math.max(quantScore, score);
      }
      if (keyLower.includes('verbal') || keyLower.includes('language') || keyLower.includes('linguistic')) {
        verbalScore = Math.max(verbalScore, score);
      }
      if (keyLower.includes('spatial') || keyLower.includes('perceptual') || keyLower.includes('visual')) {
        spatialScore = Math.max(spatialScore, score);
      }
    });

    if (quantScore === 0 && verbalScore === 0 && spatialScore === 0) {
      const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
      quantScore = Number(sorted[0]?.[1] || 50);
      verbalScore = Number(sorted[1]?.[1] || 50);
      spatialScore = Number(sorted[2]?.[1] || 50);
    }

    const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    const topDim = sorted[0][0].toLowerCase();

    const clusterMap = {
      numerical: { cluster: 'Quantitative Thinker', description: 'Exceptional with numbers and logic. Suited for analytical roles.', careerFamilies: ['Data Science', 'Finance', 'Engineering'] },
      verbal: { cluster: 'Linguistic Expert', description: 'Outstanding verbal and communication abilities.', careerFamilies: ['Content Creation', 'Teaching', 'Law'] },
      spatial: { cluster: 'Visual Innovator', description: 'Excellent spatial and visual reasoning.', careerFamilies: ['Design', 'Architecture', 'Engineering'] },
      logical: { cluster: 'Analytical Mindset', description: 'Strong logical reasoning and problem-solving skills.', careerFamilies: ['Software Development', 'Consulting', 'Research'] },
      default: { cluster: 'Versatile Generalist', description: 'Balanced across multiple aptitudes.', careerFamilies: ['Management', 'Entrepreneurship', 'Education'] },
    };

    const matchedKey = Object.keys(clusterMap).find((key) => topDim.includes(key));
    const cluster = matchedKey ? clusterMap[matchedKey] : clusterMap.default;

    return {
      ...cluster,
      factors: {
        quantitative: quantScore,
        verbal: verbalScore,
        spatial: spatialScore,
      },
    };
  }, [aptitudeDimensions]);

  // ==================== CAREER RECOMMENDATIONS ====================

  const careerRecommendations = useMemo(() => {
    // Safety check: if utils aren't loaded, return empty
    if (typeof recommendCareers !== 'function') return [];
    
    // We can generate recommendations if we have at least some data
    // Build default OCEAN scores if we don't have personality results
    const effectiveOceanScores = oceanScores || {
      Openness: { score: 25, level: 'Moderate', percentage: 50 },
      Conscientiousness: { score: 25, level: 'Moderate', percentage: 50 },
      Extraversion: { score: 25, level: 'Moderate', percentage: 50 },
      Agreeableness: { score: 25, level: 'Moderate', percentage: 50 },
      Neuroticism: { score: 25, level: 'Moderate', percentage: 50 }
    };
    
    // Only proceed if we have at least one test completed
    if (!hasAptitudeResults && !hasPersonalityResults && !hasInterestResults) return [];
    
    // Pass psychometricDomains (from interest test) to influence career recommendations
    return recommendCareers(
      effectiveOceanScores, 
      aptitudeScore, 
      interestData?.topInterests || [],
      aptitudeDimensions,
      psychometricDomains  // New parameter: psychometric domains
    );
  }, [oceanScores, aptitudeScore, interestData, aptitudeDimensions, psychometricDomains, hasAptitudeResults, hasPersonalityResults, hasInterestResults]);

  // ==================== WHAT-IF CAREER RECOMMENDATIONS ====================
  const whatIfCareerRecommendations = useMemo(() => {
    if (!whatIfScores || !oceanScores || typeof recommendCareers !== 'function') return null;
    
    // Recalculate aptitude score from whatIfScores
    const whatIfAptitudeScore = Object.values(whatIfScores).length > 0
      ? Object.values(whatIfScores).reduce((a, b) => Number(a) + Number(b), 0) / Object.values(whatIfScores).length
      : aptitudeScore;
    
    return recommendCareers(
      oceanScores,
      whatIfAptitudeScore,
      interestData?.topInterests || [],
      whatIfScores,
      psychometricDomains  // Include psychometric domains in what-if as well
    );
  }, [whatIfScores, oceanScores, aptitudeScore, interestData, aptitudeDimensions, psychometricDomains]);

  // Strong career matches count - consider all careers with score >= 60
  const strongCareerMatchesCount = useMemo(() => {
    if (!careerRecommendations || careerRecommendations.length === 0) return 0;
    // Count careers with 60%+ match as "strong matches"
    const strongMatches = careerRecommendations.filter(c => c.matchScore >= 60).length;
    return strongMatches;
  }, [careerRecommendations]);

  // ==================== PREDICTIVE ANALYTICS ====================

  const careerSuccessPrediction = useMemo(() => {
    if (!careerRecommendations || !careerRecommendations.length || !strengthWeaknessProfile) return null;

    const topCareer = careerRecommendations[0];
    const matchScore = topCareer.matchScore;
    const consistency = strengthWeaknessProfile.consistency;
    
    const successProbability = Math.min(95, Math.round((matchScore * 0.7) + (consistency * 0.3)));

    const risks = [];
    if (strengthWeaknessProfile.weaknesses?.length > 2) {
      risks.push('Multiple weak dimensions may require focused skill development');
    }
    if (consistency < 40) {
      risks.push('Variable aptitude profile - consider diverse career options');
    }
    if (matchScore < 70) {
      risks.push('Consider additional skill development to improve career alignment');
    }

    return {
      topCareer: topCareer.profile,
      successProbability,
      risks,
      recommendation: successProbability > 75 ? 
        'Strong fit! Focus on building relevant skills.' :
        successProbability > 50 ?
        'Good potential. Targeted skill development recommended.' :
        'Consider exploring aligned career options or improving key aptitudes.'
    };
  }, [careerRecommendations, strengthWeaknessProfile]);

  // ==================== WHAT-IF LOGIC ====================

  const handleWhatIfChange = (dimension, improvement) => {
    if (!aptitudeDimensions) return;
    
    const newScores = { ...aptitudeDimensions };
    const currentScore = Number(newScores[dimension]);
    newScores[dimension] = Math.min(100, currentScore + improvement);
    
    setWhatIfScores(newScores);
    setSelectedDimension(dimension);
    setImprovementAmount(improvement);
  };

  const resetWhatIf = () => {
    setWhatIfScores(null);
    setSelectedDimension(null);
    setImprovementAmount(10);
  };

  // ==================== REPORT GENERATION (Programmatic PDF - no screenshots) ====================

  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297, M = 14; // page width, height, margin
      const CW = W - M * 2; // content width
      let y = M;

      // ── Helpers ──────────────────────────────────────────────
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      const ensureSpace = (needed) => {
        if (y + needed > H - M) { pdf.addPage(); y = M; }
      };

      const addFooter = () => {
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text('Report generated by Myaarohan Career Mentorship Platform', W / 2, H - 6, { align: 'center' });
      };

      const drawSectionTitle = (title, color = [27, 73, 101]) => {
        ensureSpace(16);
        pdf.setFontSize(14);
        pdf.setTextColor(...color);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, M, y + 5);
        y += 7;
        pdf.setDrawColor(...color);
        pdf.setLineWidth(0.5);
        pdf.line(M, y, M + CW, y);
        y += 6;
      };

      const drawProgressBar = (x, barY, w, h, pct, barColor = '#1b4965', bgColor = '#e5e7eb') => {
        const [br, bg, bb] = hexToRgb(bgColor);
        pdf.setFillColor(br, bg, bb);
        pdf.roundedRect(x, barY, w, h, h / 2, h / 2, 'F');
        if (pct > 0) {
          const [fr, fg, fb] = hexToRgb(barColor);
          pdf.setFillColor(fr, fg, fb);
          pdf.roundedRect(x, barY, Math.max(w * (pct / 100), h), h, h / 2, h / 2, 'F');
        }
      };

      const wrapText = (text, maxW, fontSize = 9) => {
        pdf.setFontSize(fontSize);
        return pdf.splitTextToSize(text, maxW);
      };

      const drawRadarChart = (cx, cy, radius, labels, values, color = '#3b82f6') => {
        const n = labels.length;
        if (n < 3) return;
        const angleStep = (2 * Math.PI) / n;
        const startAngle = -Math.PI / 2;

        // Grid rings
        for (let ring = 1; ring <= 5; ring++) {
          const r = (radius / 5) * ring;
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.2);
          for (let i = 0; i < n; i++) {
            const a1 = startAngle + i * angleStep;
            const a2 = startAngle + ((i + 1) % n) * angleStep;
            pdf.line(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
          }
        }

        // Axes
        pdf.setDrawColor(200, 200, 200);
        for (let i = 0; i < n; i++) {
          const a = startAngle + i * angleStep;
          pdf.line(cx, cy, cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        }

        // Data polygon fill
        const [cr, cg, cb] = hexToRgb(color);
        const points = values.map((v, i) => {
          const a = startAngle + i * angleStep;
          const r = radius * Math.min(v, 1);
          return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        });

        // Draw filled polygon using lines() API
        // Use a lighter shade to simulate transparency
        const lightR = Math.min(255, cr + Math.round((255 - cr) * 0.75));
        const lightG = Math.min(255, cg + Math.round((255 - cg) * 0.75));
        const lightB = Math.min(255, cb + Math.round((255 - cb) * 0.75));
        pdf.setFillColor(lightR, lightG, lightB);
        if (points.length >= 3) {
          // Move to first point, then draw lines to remaining points
          const moves = [];
          for (let i = 1; i < points.length; i++) {
            moves.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
          }
          pdf.lines(moves, points[0][0], points[0][1], [1, 1], 'F', true);
        }

        // Data polygon outline
        pdf.setDrawColor(cr, cg, cb);
        pdf.setLineWidth(0.6);
        for (let i = 0; i < points.length; i++) {
          const next = (i + 1) % points.length;
          pdf.line(points[i][0], points[i][1], points[next][0], points[next][1]);
        }

        // Data points
        points.forEach(([px, py]) => {
          pdf.setFillColor(cr, cg, cb);
          pdf.circle(px, py, 1.2, 'F');
        });

        // Labels
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        labels.forEach((label, i) => {
          const a = startAngle + i * angleStep;
          const lx = cx + Math.cos(a) * (radius + 8);
          const ly = cy + Math.sin(a) * (radius + 8) + 1; // +1 to vertically center
          pdf.text(label, lx, ly, { align: 'center' });
        });
      };

      // ── PAGE 1: Title & Summary ──────────────────────────────
      try {
      // Title banner
      pdf.setFillColor(27, 73, 101);
      pdf.rect(0, 0, W, 45, 'F');
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Career Assessment Report', W / 2, 18, { align: 'center' });
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${displayUser?.name || 'Student'}`, W / 2, 28, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, W / 2, 36, { align: 'center' });
      y = 55;

      // Important note
      pdf.setFillColor(240, 249, 255);
      pdf.roundedRect(M, y, CW, 32, 3, 3, 'F');
      pdf.setDrawColor(14, 165, 233);
      pdf.setLineWidth(0.8);
      pdf.line(M, y, M, y + 32);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(3, 105, 161);
      pdf.text('Important Note About Your Results', M + 5, y + 7);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(12, 74, 110);
      const noteLines = wrapText(
        'This report is an AI-generated analysis based on your assessment responses. While it provides valuable insights into your strengths, interests, and potential career paths, it is not a definitive verdict on your abilities or future success. Your potential is limitless. These results are a starting point for exploration, not a limitation. Remember: This is a tool to help you discover possibilities, not to define your boundaries.',
        CW - 10, 7.5
      );
      pdf.text(noteLines, M + 5, y + 13);
      y += 38;

      // Summary stats boxes
      const stats = [
        { label: 'Overall Aptitude', value: aptitudeScore != null ? `${aptitudeScore}%` : 'N/A', color: '#1b4965' },
        { label: 'Profile Type', value: profileCluster?.cluster || 'N/A', color: '#62b6cb' },
        { label: 'Strong Career Matches', value: `${strongCareerMatchesCount}`, color: '#10b981' },
      ];
      const boxW = (CW - 8) / 3;
      stats.forEach((stat, i) => {
        const bx = M + i * (boxW + 4);
        const [sr, sg, sb] = hexToRgb(stat.color);
        pdf.setFillColor(sr, sg, sb);
        pdf.roundedRect(bx, y, boxW, 22, 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(stat.value.length > 10 ? 10 : 16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(stat.value, bx + boxW / 2, y + 10, { align: 'center' });
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(stat.label, bx + boxW / 2, y + 18, { align: 'center' });
      });
      y += 30;

      } catch (e) { console.warn('PDF section error (title):', e); }

      // ── STRENGTH-WEAKNESS PROFILE ──────────────────────────
      if (strengthWeaknessProfile) {
        try {
        drawSectionTitle('Strength-Weakness Profile');

        const swStats = [
          { label: `Strongest: ${strengthWeaknessProfile.highest.dimension}`, value: `${strengthWeaknessProfile.highest.score.toFixed(1)}%`, color: '#10b981' },
          { label: 'Average Score', value: `${strengthWeaknessProfile.average.toFixed(1)}%`, color: '#f59e0b' },
          { label: `Needs Work: ${strengthWeaknessProfile.lowest.dimension}`, value: `${strengthWeaknessProfile.lowest.score.toFixed(1)}%`, color: '#ef4444' },
        ];
        ensureSpace(20);
        swStats.forEach((stat, i) => {
          const bx = M + i * (boxW + 4);
          pdf.setFillColor(...hexToRgb(stat.color));
          pdf.roundedRect(bx, y, boxW, 16, 2, 2, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'bold');
          pdf.text(stat.value, bx + boxW / 2, y + 7, { align: 'center' });
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.text(stat.label, bx + boxW / 2, y + 13, { align: 'center' });
        });
        y += 22;

        // Strengths
        if (strengthWeaknessProfile.strengths.length > 0) {
          ensureSpace(14);
          pdf.setFillColor(240, 253, 244);
          pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(22, 101, 52);
          pdf.text('Strengths: ', M + 4, y + 5);
          pdf.setFont('helvetica', 'normal');
          pdf.text(strengthWeaknessProfile.strengths.map(s => `${s.dimension} (${s.score.toFixed(1)}%)`).join(', '), M + 24, y + 5);
          y += 14;
        }

        // Weaknesses
        if (strengthWeaknessProfile.weaknesses.length > 0) {
          ensureSpace(14);
          pdf.setFillColor(254, 243, 199);
          pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(146, 64, 14);
          pdf.text('Areas for Improvement: ', M + 4, y + 5);
          pdf.setFont('helvetica', 'normal');
          pdf.text(strengthWeaknessProfile.weaknesses.map(w => `${w.dimension} (${w.score.toFixed(1)}%)`).join(', '), M + 46, y + 5);
          y += 14;
        }
        y += 4;
        } catch (e) { console.warn('PDF section error (strength-weakness):', e); }
      }

      // ── APTITUDE RESULTS ───────────────────────────────────
      if (hasAptitudeResults && aptitudeData) {
        try {
        drawSectionTitle('Aptitude Results');

        ensureSpace(10);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50, 50, 50);
        pdf.text(`Overall Score: `, M, y + 4);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${aptitudeScore}%`, M + 30, y + 4);
        y += 10;

        if (Object.keys(aptitudeDimensions).length > 0) {
          ensureSpace(10);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text('Section Breakdown', M, y + 4);
          y += 9;

          Object.entries(aptitudeDimensions).forEach(([dimension, value]) => {
            const pct = Number(value) || 0;
            ensureSpace(14);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 30);
            pdf.text(dimension.toUpperCase(), M, y + 4);
            pdf.setTextColor(27, 73, 101);
            pdf.text(`${pct.toFixed(1)}%`, M + CW, y + 4, { align: 'right' });

            drawProgressBar(M, y + 7, CW, 4, pct, '#1b4965', '#e5e7eb');
            y += 14;
          });
        }
        y += 4;
        } catch (e) { console.warn('PDF section error (aptitude):', e); }
      }

      // ── PERSONALITY (OCEAN) ────────────────────────────────
      if (hasPersonalityResults && oceanScores) {
        try {
        drawSectionTitle('Personality Results (OCEAN)');

        // Dominant trait callout
        ensureSpace(14);
        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(M, y, CW, 10, 2, 2, 'F');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(3, 105, 161);
        pdf.text('Dominant Trait: ', M + 4, y + 6);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(dominantTrait, M + 34, y + 6);
        y += 15;

        // Radar chart
        const chartRadius = 30;
        const chartNeeded = chartRadius * 2 + 25;
        ensureSpace(chartNeeded);
        const chartCx = M + CW / 2;
        const chartCy = y + chartRadius + 2;
        const traits = Object.keys(oceanScores);
        const traitValues = traits.map(t => (oceanScores[t]?.score ?? 0) / 50);
        drawRadarChart(chartCx, chartCy, chartRadius, traits, traitValues, '#3b82f6');
        y += chartNeeded;

        // Trait bars with explanations
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 30);
        ensureSpace(10);
        pdf.text('Trait Breakdown', M, y + 4);
        y += 9;

        Object.entries(oceanScores).forEach(([trait, data]) => {
          const explanation = getTraitExplanation ? getTraitExplanation(trait, data.level) : data.level;
          const explLines = wrapText(explanation || '', CW - 4, 7.5);
          const blockH = 18 + (explLines.length * 3.2);
          ensureSpace(blockH);

          // Trait name + score
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text(trait, M, y + 4);
          pdf.setTextColor(27, 73, 101);
          pdf.text(`${data.score}/50`, M + CW - 30, y + 4, { align: 'right' });
          
          // Level badge
          const badgeColor = (data.level === 'Very High' || data.level === 'High') ? '#10b981' : (data.level === 'Moderate' ? '#f59e0b' : '#6b7280');
          pdf.setFillColor(...hexToRgb(badgeColor));
          const badgeW = pdf.getTextWidth(data.level) + 4;
          pdf.roundedRect(M + CW - badgeW, y, badgeW + 2, 6, 1.5, 1.5, 'F');
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
          pdf.text(data.level, M + CW - badgeW + (badgeW + 2) / 2, y + 4, { align: 'center' });

          // Progress bar
          drawProgressBar(M, y + 7, CW, 3.5, data.percentage, '#3b82f6', '#e5e7eb');
          
          // Percentage text on bar
          pdf.setFontSize(6.5);
          pdf.setTextColor(255, 255, 255);
          if (data.percentage >= 20) {
            pdf.text(`${data.percentage}%`, M + Math.max(CW * (data.percentage / 100) - 8, 3), y + 9.5);
          }
          y += 12;

          // Explanation
          if (explanation) {
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            pdf.text(explLines, M + 2, y + 2);
            y += explLines.length * 3.2 + 3;
          }
          y += 3;
        });
        y += 4;
        } catch (e) { console.warn('PDF section error (personality):', e); }
      }

      // ── INTEREST & CAREER EXPLORATION ──────────────────────
      if (hasInterestResults && interestData) {
        try {
        drawSectionTitle('Interest & Career Exploration Results');

        // Top interests badges
        if (interestData.topInterests?.length > 0) {
          ensureSpace(14);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text('Top Interest Areas', M, y + 4);
          y += 8;

          let bx = M;
          interestData.topInterests.forEach((label, idx) => {
            const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd'];
            const text = `#${idx + 1} ${label}`;
            const tw = pdf.getTextWidth(text) + 8;
            if (bx + tw > M + CW) { bx = M; y += 9; ensureSpace(9); }
            pdf.setFillColor(...hexToRgb(colors[idx] || colors[2]));
            pdf.roundedRect(bx, y, tw, 7, 2, 2, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(text, bx + tw / 2, y + 4.5, { align: 'center' });
            bx += tw + 4;
          });
          y += 12;
        }

        // Psychometric domains
        if (psychometricDomains && Object.keys(psychometricDomains).length > 0) {
          ensureSpace(12);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text('Psychometric Career Orientation', M, y + 4);
          y += 10;

          Object.values(psychometricDomains)
            .sort((a, b) => b.avgScore - a.avgScore)
            .forEach((domain) => {
              const levelColorMap = { high: '#22c55e', moderate: '#f59e0b', low: '#ef4444' };
              const barColor = levelColorMap[domain.levelClass] || '#f59e0b';
              const bgColorMap = { high: '#dcfce7', moderate: '#fef3c7', low: '#fee2e2' };
              const bgCol = bgColorMap[domain.levelClass] || '#fef3c7';

              const descLines = wrapText(domain.description || '', CW - 60, 7);
              const careerText = domain.suggestedCareers?.slice(0, 4).join(', ') || '';
              const blockH = 20 + descLines.length * 2.8 + (careerText ? 6 : 0);
              ensureSpace(blockH);

              // Background
              pdf.setFillColor(...hexToRgb(bgCol));
              pdf.roundedRect(M, y, CW, blockH, 2, 2, 'F');

              // Left border
              pdf.setFillColor(...hexToRgb(barColor));
              pdf.rect(M, y, 2, blockH, 'F');

              // Domain name + code badge
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(30, 30, 30);
              pdf.text(domain.label, M + 6, y + 6);
              
              const codeW = pdf.getTextWidth(domain.code) + 4;
              pdf.setFillColor(...hexToRgb(barColor));
              pdf.roundedRect(M + 6 + pdf.getTextWidth(domain.label) + 4, y + 2, codeW + 2, 5, 1.5, 1.5, 'F');
              pdf.setFontSize(6.5);
              pdf.setTextColor(255, 255, 255);
              pdf.text(domain.code, M + 6 + pdf.getTextWidth(domain.label) + 4 + (codeW + 2) / 2, y + 5.2, { align: 'center' });
              pdf.setFont('helvetica', 'normal');

              // Score + level on right
              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'bold');
              const lColorMap = { high: [21, 128, 61], moderate: [146, 64, 14], low: [185, 28, 28] };
              pdf.setTextColor(...(lColorMap[domain.levelClass] || lColorMap.moderate));
              pdf.text(`${domain.avgScore.toFixed(2)}`, M + CW - 6, y + 6, { align: 'right' });
              pdf.setFontSize(7);
              pdf.text(domain.level, M + CW - 6, y + 11, { align: 'right' });

              // Description
              pdf.setFontSize(7);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(100, 100, 100);
              pdf.text(descLines, M + 6, y + 13);

              // Progress bar
              drawProgressBar(M + 6, y + 13 + descLines.length * 2.8, CW - 12, 3, domain.percentage || 0, barColor, '#ffffff');

              // Suggested careers
              if (careerText) {
                const careersY = y + 17 + descLines.length * 2.8;
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(55, 65, 81);
                pdf.text('Suggested careers: ', M + 6, careersY);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(careerText, M + 6 + pdf.getTextWidth('Suggested careers: '), careersY);
              }

              y += blockH + 4;
            });

          // Psychometric career suggestions box
          if (psychometricCareerSuggestions?.suggestions?.length > 0) {
            ensureSpace(24);
            pdf.setFillColor(139, 92, 246);
            pdf.roundedRect(M, y, CW, 20, 3, 3, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'normal');
            const topD = psychometricCareerSuggestions.topDomains;
            pdf.text(`Based on your top domains (${topD?.[0]?.code || ''} & ${topD?.[1]?.code || ''})`, M + 5, y + 5);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Recommended Career Paths', M + 5, y + 11);
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            const sugText = psychometricCareerSuggestions.suggestions.join('  •  ');
            pdf.text(wrapText(sugText, CW - 10, 7.5), M + 5, y + 16);
            y += 24;
          }
          y += 4;
        }

        // Interest personality traits
        if (interestData.traitScores && Object.keys(interestData.traitScores).length > 0) {
          ensureSpace(12);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text('Your Interest Personality Traits', M, y + 4);
          y += 10;

          Object.values(interestData.traitScores)
            .sort((a, b) => b.score - a.score)
            .forEach((trait) => {
              const explText = trait.explanation || '';
              const explLines = wrapText(explText, CW - 12, 7);
              const blockH = 16 + explLines.length * 3;
              ensureSpace(blockH);

              pdf.setFillColor(249, 250, 251);
              pdf.roundedRect(M, y, CW, blockH, 2, 2, 'F');
              pdf.setFillColor(139, 92, 246);
              pdf.rect(M, y, 2, blockH, 'F');

              // Label + score
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(30, 30, 30);
              pdf.text(trait.label, M + 6, y + 5);
              pdf.setTextColor(139, 92, 246);
              pdf.text(`${trait.score}`, M + CW - 6, y + 5, { align: 'right' });

              // Bar
              drawProgressBar(M + 6, y + 8, CW - 12, 2.5, trait.score, '#8b5cf6', '#e5e7eb');

              // Explanation
              if (explLines.length > 0) {
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(explLines, M + 6, y + 14);
              }

              y += blockH + 3;
            });
          y += 4;
        }
        } catch (e) { console.warn('PDF section error (interest):', e); }
      }

      // ── PROFILE CLUSTER & FACTOR ANALYSIS ──────────────────
      if (profileCluster) {
        try {
        drawSectionTitle('Profile Cluster & Factor Analysis');

        // Cluster banner
        ensureSpace(28);
        pdf.setFillColor(27, 73, 101);
        pdf.roundedRect(M, y, CW, 24, 3, 3, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Your Profile Cluster', M + 6, y + 6);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(profileCluster.cluster, M + 6, y + 14);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        const descLines = wrapText(profileCluster.description, CW - 12, 7.5);
        pdf.text(descLines[0] || '', M + 6, y + 20);
        y += 28;

        // Career families
        ensureSpace(14);
        pdf.setFillColor(240, 253, 244);
        pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(22, 101, 52);
        pdf.text('Aligned Career Families: ', M + 5, y + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(profileCluster.careerFamilies.join(', '), M + 5 + pdf.getTextWidth('Aligned Career Families: '), y + 7);
        y += 16;

        // Factor radar chart
        const factorLabels = Object.keys(profileCluster.factors).map(f => f.charAt(0).toUpperCase() + f.slice(1));
        const factorValues = Object.values(profileCluster.factors).map(v => v / 100);
        if (factorLabels.length >= 3) {
          const fChartNeeded = 70;
          ensureSpace(fChartNeeded);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          pdf.text('Core Factor Scores', M + CW / 2, y + 3, { align: 'center' });
          drawRadarChart(M + CW / 2, y + 32, 24, factorLabels, factorValues, '#3b82f6');
          y += 58;
        }

        // Factor bars
        Object.entries(profileCluster.factors).forEach(([factor, score]) => {
          ensureSpace(12);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          const factorName = factor.charAt(0).toUpperCase() + factor.slice(1);
          pdf.text(factorName, M, y + 4);
          pdf.setTextColor(27, 73, 101);
          pdf.text(`${score.toFixed(0)}`, M + CW, y + 4, { align: 'right' });
          drawProgressBar(M, y + 7, CW, 3.5, score, '#1b4965', '#e5e7eb');
          y += 13;
        });
        y += 4;
        } catch (e) { console.warn('PDF section error (profile cluster):', e); }
      }

      // ── AI CAREER RECOMMENDATIONS ──────────────────────────
      if (careerRecommendations && careerRecommendations.length > 0) {
        try {
        drawSectionTitle('AI Career Recommendations', [16, 185, 129]);

        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Based on comprehensive analysis of Aptitude + Personality + Interest${psychometricDomains ? ' + Psychometric Domains' : ''}`, M, y);
        y += 6;

        careerRecommendations.slice(0, 10).forEach((career, index) => {
          const descLines = wrapText(career.description || '', CW - 20, 7);
          const blockH = 36 + descLines.length * 3; // extra space for salary line + sub-match boxes
          ensureSpace(blockH);

          // Background
          const bgCol = index < 3 ? '#f0fdf4' : '#f9fafb';
          pdf.setFillColor(...hexToRgb(bgCol));
          pdf.roundedRect(M, y, CW, blockH, 2, 2, 'F');

          if (index < 3) {
            pdf.setDrawColor(16, 185, 129);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(M, y, CW, blockH, 2, 2, 'S');
          }

          // Rank
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(180, 180, 180);
          pdf.text(`#${index + 1}`, M + 4, y + 8);

          // Career name
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 30, 30);
          const profileNameW = pdf.getTextWidth(career.profile);
          pdf.text(career.profile, M + 16, y + 8);

          // Top Match badge
          if (index < 3) {
            pdf.setFontSize(6.5);
            pdf.setFont('helvetica', 'bold');
            const badgeText = 'Top Match';
            const btw = pdf.getTextWidth(badgeText) + 4;
            const badgeX = M + 16 + profileNameW + 4;
            pdf.setFillColor(16, 185, 129);
            pdf.roundedRect(badgeX, y + 3, btw + 2, 6, 1.5, 1.5, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.text(badgeText, badgeX + (btw + 2) / 2, y + 6.8, { align: 'center' });
          }

          // Match score on right
          const scoreColor = career.matchScore >= 80 ? '#10b981' : career.matchScore >= 60 ? '#f59e0b' : '#6b7280';
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...hexToRgb(scoreColor));
          pdf.text(`${career.matchScore}%`, M + CW - 6, y + 7, { align: 'right' });
          pdf.setFontSize(6);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text('Match', M + CW - 6, y + 11, { align: 'right' });

          // Description
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(descLines, M + 6, y + 16);

          // Salary & growth
          const metaY = y + 16 + descLines.length * 3;
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          // Replace ₹ with Rs. since jsPDF helvetica cannot render Unicode symbols
          const salaryText = (career.salaryRange || 'N/A').replace(/₹/g, 'Rs.');
          pdf.text(`Salary: ${salaryText}    Growth: ${career.growthPotential || 'N/A'}`, M + 6, metaY);

          // Sub-match scores row
          const subY = metaY + 4;
          const subBoxW = psychometricDomains ? (CW - 20) / 4 : (CW - 16) / 3;
          const subMatches = [
            { label: 'Personality', value: `${career.traitMatch}%`, color: '#3b82f6' },
            { label: 'Aptitude', value: `${career.aptitudeMatch}%`, color: '#8b5cf6' },
            { label: 'Interest', value: `${career.interestMatch}%`, color: '#ec4899' },
          ];
          if (psychometricDomains) {
            subMatches.push({ label: 'Psychometric', value: `${career.psychometricMatch || 50}%`, color: '#10b981' });
          }
          subMatches.forEach((sm, si) => {
            const sx = M + 4 + si * (subBoxW + 4);
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(sx, subY, subBoxW, 8, 1.5, 1.5, 'F');
            pdf.setFontSize(5.5);
            pdf.setTextColor(100, 100, 100);
            pdf.text(sm.label, sx + subBoxW / 2, subY + 3, { align: 'center' });
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...hexToRgb(sm.color));
            pdf.text(sm.value, sx + subBoxW / 2, subY + 7, { align: 'center' });
            pdf.setFont('helvetica', 'normal');
          });

          y += blockH + 4;
        });
        y += 4;
        } catch (e) { console.warn('PDF section error (career recommendations):', e); }
      }

      // ── CAREER SUCCESS PREDICTION ──────────────────────────
      if (careerSuccessPrediction) {
        try {
        drawSectionTitle('Career Success Prediction (AI-Powered)', [124, 58, 237]);

        // Purple banner
        ensureSpace(36);
        pdf.setFillColor(124, 58, 237);
        pdf.roundedRect(M, y, CW, 34, 3, 3, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Top Recommended Career', M + 6, y + 6);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(careerSuccessPrediction.topCareer, M + 6, y + 15);

        // Also show the actual match score for top career
        const topCareerMatch = careerRecommendations?.[0]?.matchScore;
        if (topCareerMatch != null) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Career Match: ${topCareerMatch}%`, M + CW - 6, y + 6, { align: 'right' });
        }

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Success Probability', M + 6, y + 22);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${careerSuccessPrediction.successProbability}%`, M + 6, y + 31);

        // Progress bar on banner
        pdf.setFillColor(200, 200, 220);
        pdf.roundedRect(M + 50, y + 26, CW - 56, 4, 2, 2, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(M + 50, y + 26, Math.max((CW - 56) * careerSuccessPrediction.successProbability / 100, 4), 4, 2, 2, 'F');
        y += 38;

        // Recommendation
        ensureSpace(16);
        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(M, y, CW, 14, 2, 2, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(7, 89, 133);
        pdf.text('Recommendation:', M + 4, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(12, 74, 110);
        const recLines = wrapText(careerSuccessPrediction.recommendation, CW - 8, 7.5);
        pdf.text(recLines, M + 4, y + 10);
        y += 18;

        // Risks
        if (careerSuccessPrediction.risks.length > 0) {
          ensureSpace(8 + careerSuccessPrediction.risks.length * 6);
          pdf.setFillColor(254, 243, 199);
          const risksH = 8 + careerSuccessPrediction.risks.length * 5;
          pdf.roundedRect(M, y, CW, risksH, 2, 2, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(146, 64, 14);
          pdf.text('Risk Factors to Consider:', M + 4, y + 5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(120, 53, 15);
          careerSuccessPrediction.risks.forEach((risk, i) => {
            pdf.text(`• ${risk}`, M + 6, y + 10 + i * 5);
          });
          y += risksH + 4;
        }
        y += 4;
        } catch (e) { console.warn('PDF section error (career prediction):', e); }
      }

      // ── Add footer on all pages ────────────────────────────
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        addFooter();
        // Page number
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`Page ${p} of ${totalPages}`, W - M, H - 6, { align: 'right' });
      }

      // ── Save ───────────────────────────────────────────────
      pdf.save(`Career_Report_${displayUser?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('PDF generation error: ' + (error?.message || error) + '\nFalling back to text download.');
      handleTextDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTextDownload = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Career_Assessment_Report_${displayUser?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    let content = `CAREER ASSESSMENT REPORT\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `Student: ${displayUser?.name || 'N/A'}\n`;
    content += `=`.repeat(60) + `\n\n`;

    // Aptitude Section
    content += `APTITUDE RESULTS\n`;
    content += `-`.repeat(60) + `\n`;
    if (aptitudeData) {
      content += `Overall Score: ${aptitudeScore}%\n\n`;
      if (aptitudeDimensions) {
        content += `Dimension Breakdown:\n`;
        Object.entries(aptitudeDimensions).forEach(([dim, score]) => {
          content += `  - ${dim}: ${Number(score).toFixed(1)}%\n`;
        });
      }
    } else {
      content += `Not completed\n`;
    }
    content += `\n`;

    // Personality Section
    content += `PERSONALITY RESULTS (OCEAN)\n`;
    content += `-`.repeat(60) + `\n`;
    if (oceanScores) {
      Object.entries(oceanScores).forEach(([trait, data]) => {
        content += `${trait}: ${data.score}/50 (${data.level}) - ${data.percentage}%\n`;
      });
      content += `\nDominant Trait: ${dominantTrait}\n`;
    } else {
      content += `Not completed\n`;
    }
    content += `\n`;

    // Interest Section
    content += `INTEREST AREAS\n`;
    content += `-`.repeat(60) + `\n`;
    if (interestData?.topInterests?.length > 0) {
      content += `Top Areas: ${interestData.topInterests.join(', ')}\n`;
    } else {
      content += `Not completed\n`;
    }
    content += `\n`;

    // Psychometric Domain Section
    content += `PSYCHOMETRIC CAREER ORIENTATION\n`;
    content += `-`.repeat(60) + `\n`;
    if (psychometricDomains && Object.keys(psychometricDomains).length > 0) {
      Object.values(psychometricDomains)
        .sort((a, b) => b.avgScore - a.avgScore)
        .forEach(domain => {
          content += `${domain.label} (${domain.code}): ${domain.avgScore.toFixed(2)}/5 - ${domain.level}\n`;
        });
      if (psychometricCareerSuggestions?.suggestions?.length > 0) {
        content += `\nSuggested Careers: ${psychometricCareerSuggestions.suggestions.join(', ')}\n`;
      }
    } else {
      content += `Not completed\n`;
    }
    content += `\n`;

    // Career Recommendations
    content += `CAREER RECOMMENDATIONS\n`;
    content += `-`.repeat(60) + `\n`;
    if (careerRecommendations && careerRecommendations.length > 0) {
      careerRecommendations.slice(0, 10).forEach((career, index) => {
        content += `${index + 1}. ${career.profile} - ${career.matchScore}% match\n`;
        content += `   ${career.description}\n`;
        content += `   Salary Range: ${career.salaryRange}\n`;
        content += `   Growth Potential: ${career.growthPotential}\n\n`;
      });
    } else {
      content += `Complete assessments to see recommendations\n`;
    }

    // Profile Analysis
    if (profileCluster) {
      content += `\nPROFILE ANALYSIS\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Cluster: ${profileCluster.cluster}\n`;
      content += `Description: ${profileCluster.description}\n`;
      content += `Career Families: ${profileCluster.careerFamilies.join(', ')}\n`;
    }

    content += `\n` + `=`.repeat(60) + `\n`;
    content += `Report generated by Myaarohan Career Mentorship Platform\n`;

    return content;
  };

  // ==================== CANVAS CHARTS ====================

  // Draw OCEAN Radar Chart
  useEffect(() => {
    if (!oceanScores || !oceanChartRef.current) return;

    const canvas = oceanChartRef.current;
    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 140;

    const traits = Object.keys(oceanScores);
    const scores = traits.map((t) => (oceanScores[t]?.score ?? 0) / 50); // Normalize to 0-1

    ctx.clearRect(0, 0, width, height);

    // Grid
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = (radius / 5) * i;
      for (let j = 0; j <= 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#d1d5db';
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    scores.forEach((score, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * score);
      const y = centerY + Math.sin(angle) * (radius * score);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points
    scores.forEach((score, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * score);
      const y = centerY + Math.sin(angle) * (radius * score);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    traits.forEach((trait, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 30);
      const y = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillText(trait, x, y);
    });
  }, [oceanScores]);

  // Draw Factor Radar Chart
  useEffect(() => {
    if (!profileCluster || !radarChartRef.current) return;

    const canvas = radarChartRef.current;
    const ctx = canvas.getContext('2d');
    const width = 300;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    ctx.clearRect(0, 0, width, height);

    const factors = ['Quantitative', 'Verbal', 'Spatial'];
    const scores = [
      profileCluster.factors.quantitative / 100,
      profileCluster.factors.verbal / 100,
      profileCluster.factors.spatial / 100,
    ];

    // Grid
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = (radius / 5) * i;
      for (let j = 0; j <= 3; j++) {
        const angle = (Math.PI * 2 * j) / 3 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#d1d5db';
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    scores.forEach((score, i) => {
      const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * score);
      const y = centerY + Math.sin(angle) * (radius * score);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points
    scores.forEach((score, i) => {
      const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * score);
      const y = centerY + Math.sin(angle) * (radius * score);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    factors.forEach((factor, i) => {
      const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 30);
      const y = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillText(factor, x, y);
    });
  }, [profileCluster]);

  // Draw Interest Bar Chart
  useEffect(() => {
    if (!interestData?.categoryScores || !interestChartRef.current) return;

    const canvas = interestChartRef.current;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const entries = Object.entries(interestData.categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    if (entries.length === 0) return;

    const barHeight = 40;
    const gap = 12;
    const leftMargin = 300;
    const rightMargin = 80;
    const maxBarWidth = width - leftMargin - rightMargin;

    entries.forEach(([label, score], i) => {
      const y = 40 + i * (barHeight + gap);
      const barWidth = (score / 100) * maxBarWidth;

      // Label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, leftMargin - 12, y + barHeight / 2);

      // Bar background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(leftMargin, y, maxBarWidth, barHeight);

      // Bar fill
      const gradient = ctx.createLinearGradient(leftMargin, 0, leftMargin + barWidth, 0);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#a78bfa');
      ctx.fillStyle = gradient;
      ctx.fillRect(leftMargin, y, barWidth, barHeight);

      // Score text
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(score, leftMargin + barWidth + 8, y + barHeight / 2);
    });
  }, [interestData]);

  // ==================== RENDER ====================

  // Early returns for loading/error states
  if (!user) {
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
            border: '4px solid rgba(14, 165, 233, 0.15)',
            borderTopColor: '#0ea5e9',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', margin: '0 0 6px' }}>
            Loading your profile...
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Please ensure you are logged in
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
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
            border: '4px solid rgba(14, 165, 233, 0.15)',
            borderTopColor: '#0ea5e9',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', margin: '0 0 6px' }}>
            Analyzing your results...
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Crunching numbers to build your career insights
          </p>
        </motion.div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {['Aptitude', 'Personality', 'Interest'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(14, 165, 233, 0.1)', color: '#0284c7'
              }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Report Container - this is what gets captured for download */}
      <div 
        ref={reportRef} 
        data-report-container="true"
        style={{ 
          background: '#ffffff',
          padding: '20px',
          // Ensure colors are fully opaque for PDF capture
          colorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}
      >
        <div className="page-header">
          <h1 className="page-title">Your Career Assessment Results</h1>
          <p className="page-subtitle">Comprehensive AI-powered analysis with predictive insights</p>
        </div>

        {/* IMPORTANT NOTICE */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          borderLeft: '4px solid #0ea5e9'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-info-circle"></i> Important Note About Your Results
          </h4>
          <p style={{ margin: 0, color: '#0c4a6e', lineHeight: '1.7', fontSize: '0.95rem' }}>
            This report is an <strong>AI-generated analysis</strong> based on your assessment responses. While it provides valuable insights into your strengths, interests, and potential career paths, it is <strong>not a definitive verdict on your abilities or future success</strong>. 
            Your potential is limitless and cannot be measured by any single assessment. These results are meant to be a starting point for exploration, not a limitation.
            We believe that with dedication, hard work, and the right guidance, you can excel in any field you choose. During our career mentorship sessions, we will dive deeper into these results, explore your unique aspirations, and create a personalized roadmap for your success. 
            <strong>Remember: This is a tool to help you discover possibilities, not to define your boundaries.</strong>
          </p>
        </div>

        {noTestsCompleted && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)'
            }}>
              <i className="fas fa-pencil-alt" style={{ fontSize: '48px', color: '#6366f1' }}></i>
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', color: '#1e293b' }}>
              Give Your Tests First
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '1.05rem', maxWidth: '480px', lineHeight: '1.7' }}>
              You haven't completed any assessments yet. Take the tests below to unlock your personalized career insights, strength analysis, and AI-powered recommendations.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                <i className="fas fa-brain" style={{ marginRight: '6px' }}></i>Aptitude Test
              </span>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                <i className="fas fa-user" style={{ marginRight: '6px' }}></i>Personality Test
              </span>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                <i className="fas fa-compass" style={{ marginRight: '6px' }}></i>Interest Test
              </span>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => { window.history.pushState(null, '', '/student-dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              style={{
                padding: '14px 36px',
                fontSize: '1.05rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-play-circle"></i> Go to Dashboard & Start Tests
            </button>
          </div>
        )}

        {!noTestsCompleted && (<>
        {/* Summary Stats */}
        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-value">{aptitudeScore != null ? `${aptitudeScore}%` : 'N/A'}</div>
            <div className="stat-label">Overall Aptitude Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              {profileCluster?.cluster || 'N/A'}
            </div>
            <div className="stat-label">Your Profile Type</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{strongCareerMatchesCount}</div>
            <div className="stat-label">Strong Career Matches</div>
          </div>
        </div>

        {/* Strength-Weakness Profile */}
        {strengthWeaknessProfile && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Strength-Weakness Profile Analysis</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                    {strengthWeaknessProfile.highest.score.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Strongest: {strengthWeaknessProfile.highest.dimension}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                    {strengthWeaknessProfile.average.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Average Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
                    {strengthWeaknessProfile.lowest.score.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Needs Work: {strengthWeaknessProfile.lowest.dimension}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '8px' }}>Your Strengths</strong>
                {strengthWeaknessProfile.strengths.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {strengthWeaknessProfile.strengths.map((s) => (
                      <span
                        key={s.dimension}
                        className="badge"
                        style={{ background: '#10b981', color: 'white', padding: '6px 12px' }}
                      >
                        {s.dimension}: {s.score.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#666' }}>All dimensions are close to your average - balanced profile!</p>
                )}
              </div>

              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: '8px' }}>Areas for Improvement</strong>
                {strengthWeaknessProfile.weaknesses.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {strengthWeaknessProfile.weaknesses.map((w) => (
                      <span
                        key={w.dimension}
                        className="badge"
                        style={{ background: '#f59e0b', color: 'white', padding: '6px 12px' }}
                      >
                        {w.dimension}: {w.score.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#666' }}>No significant weaknesses detected - great job!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* APTITUDE SECTION - Interactive */}
        {hasAptitudeResults && aptitudeData && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Aptitude Results</h3>
            </div>
          <div className="card-body">
            <p style={{ marginTop: 0 }}>
              <strong>Overall Score:</strong> {aptitudeScore}%
            </p>

            {Object.keys(whatIfScores || aptitudeDimensions).length > 0 && (
              <>
                <strong style={{ display: 'block', marginBottom: '20px', marginTop: '20px' }}>Section Breakdown</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.entries(whatIfScores || aptitudeDimensions).map(([dimension, value]) => {
                    const percentage = Number(value) || 0;
                    const isModified = whatIfScores && dimension === selectedDimension;
                    const originalPercentage = aptitudeDimensions[dimension];

                    return (
                      <div key={dimension} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>
                            {dimension.toUpperCase()}
                            {isModified && (
                               <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#10b981' }}>
                                 (+{(percentage - originalPercentage).toFixed(1)}%)
                               </span>
                             )}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isModified ? '#10b981' : '#1b4965' }}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '32px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                            border: isModified ? '2px solid #10b981' : 'none'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              height: '100%',
                              background: isModified ? 
                                'linear-gradient(90deg, #10b981 0%, #34d399 100%)' :
                                'linear-gradient(90deg, #1b4965 0%, #62b6cb 100%)',
                              borderRadius: '8px',
                              transition: 'width 0.6s ease-out',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: '12px',
                            }}
                          >
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              {percentage >= 15 ? `${percentage.toFixed(1)}%` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PERSONALITY (OCEAN) SECTION */}
      {hasPersonalityResults && oceanScores && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Personality Results (OCEAN)</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-2" style={{ gap: '24px' }}>
              {/* Left: Spider Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <canvas ref={oceanChartRef} style={{ maxWidth: '100%', height: 'auto' }} />
                <div style={{ marginTop: '16px', textAlign: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px', width: '100%' }}>
                  <div style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px' }}>Dominant Trait</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{dominantTrait}</div>
                </div>
              </div>

              {/* Right: Horizontal Bars */}
              <div>
                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '1.1rem' }}>Trait Breakdown</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {Object.entries(oceanScores).map(([trait, data]) => {
                    const getBadgeClass = (level) => {
                      if (level === 'Very High' || level === 'High') return 'badge-success';
                      if (level === 'Moderate') return 'badge-warning';
                      return 'badge-info';
                    };

                    return (
                      <div key={trait}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{trait}</span>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#1b4965', marginRight: '8px', fontSize: '1.1rem' }}>
                              {data.score}/50
                            </strong>
                            <span className={`badge ${getBadgeClass(data.level)}`}>{data.level}</span>
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                          <div
                            style={{
                              width: `${data.percentage}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                              borderRadius: '8px',
                              transition: 'width 0.6s ease-out',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: '12px',
                            }}
                          >
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              {data.percentage >= 15 ? `${data.percentage}%` : ''}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '6px 0 0', lineHeight: '1.4', marginBottom: 0 }}>
                          {getTraitExplanation ? getTraitExplanation(trait, data.level) : data.level}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTEREST SECTION */}
      {hasInterestResults && interestData && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Interest & Career Exploration Results</h3>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
              Key themes from your interest/psychometric responses
            </p>
          </div>

          <div className="card-body">
            {/* Top 3 Interest Areas */}
            {interestData.topInterests?.length > 0 && (
              <>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Top Interest Areas</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {interestData.topInterests.map((label, idx) => (
                    <span
                      key={label}
                      className="badge"
                      style={{
                        backgroundColor: idx === 0 ? '#8b5cf6' : idx === 1 ? '#a78bfa' : '#c4b5fd',
                        color: 'white',
                        padding: '8px 16px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                      }}
                    >
                      #{idx + 1} {label}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* PSYCHOMETRIC CAREER ORIENTATION RESULTS */}
            {psychometricDomains && Object.keys(psychometricDomains).length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '1.1rem' }}>
                  Psychometric Career Orientation
                </strong>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Your strengths across key career orientation domains
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.values(psychometricDomains)
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .map((domain) => {
                      const levelColors = {
                        high: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', barGradient: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' },
                        moderate: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', barGradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' },
                        low: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', barGradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' }
                      };
                      const colors = levelColors[domain.levelClass] || levelColors.moderate;

                      return (
                        <div
                          key={domain.code}
                          style={{
                            padding: '20px',
                            background: colors.bg,
                            borderRadius: '12px',
                            borderLeft: `4px solid ${colors.border}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>
                                  {domain.label}
                                </span>
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: '600',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  backgroundColor: colors.border,
                                  color: 'white'
                                }}>
                                  {domain.code}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
                                {domain.description}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.text }}>
                                {domain.avgScore.toFixed(2)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: colors.text, fontWeight: '600' }}>
                                {domain.level}
                              </div>
                            </div>
                          </div>

                          <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div
                              style={{
                                width: `${domain.percentage}%`,
                                height: '100%',
                                background: colors.barGradient,
                                borderRadius: '6px',
                                transition: 'width 0.6s ease-out',
                              }}
                            />
                          </div>

                          {domain.suggestedCareers && domain.suggestedCareers.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '600' }}>Suggested careers: </span>
                              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {domain.suggestedCareers.slice(0, 4).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Career Suggestions based on Top Domains */}
                {psychometricCareerSuggestions && psychometricCareerSuggestions.suggestions?.length > 0 && (
                  <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px' }}>
                      Based on your top domains ({psychometricCareerSuggestions.topDomains[0]?.code} & {psychometricCareerSuggestions.topDomains[1]?.code})
                    </div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>Recommended Career Paths</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {psychometricCareerSuggestions.suggestions.map((career, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                      Profile Type: <strong>{psychometricCareerSuggestions.profileType}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Trait Breakdown */}
            {interestData.traitScores && Object.keys(interestData.traitScores).length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '1.1rem' }}>
                  Your Interest Personality Traits
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {Object.values(interestData.traitScores)
                    .sort((a, b) => b.score - a.score)
                    .map((trait) => {
                      const badge = getInterestLevelBadge ? getInterestLevelBadge(trait.score) : { label: 'N/A', class: 'badge-info' };
                      return (
                        <div
                          key={trait.code}
                          style={{
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            borderLeft: '4px solid #8b5cf6',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#111827' }}>
                              {trait.label}
                            </span>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ color: '#8b5cf6', marginRight: '8px', fontSize: '1.1rem' }}>
                                {trait.score}
                              </strong>
                              <span className={`badge ${badge.class}`}>{badge.label}</span>
                            </div>
                          </div>

                          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: `${trait.score}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
                                borderRadius: '4px',
                                transition: 'width 0.6s ease-out',
                              }}
                            />
                          </div>

                          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '6px 0 0', lineHeight: '1.5' }}>
                            <strong style={{ color: '#374151' }}>What this means:</strong> {trait.explanation}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE CLUSTER */}
      {profileCluster && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Profile Cluster & Factor Analysis</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div>
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1b4965 0%, #62b6cb 100%)', borderRadius: '16px', color: 'white', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px' }}>Your Profile Cluster</div>
                  <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem' }}>{profileCluster.cluster}</h2>
                  <p style={{ margin: 0, opacity: 0.95, lineHeight: '1.6' }}>{profileCluster.description}</p>
                </div>

                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px' }}>
                  <strong style={{ color: '#166534', display: 'block', marginBottom: '12px' }}>
                    Aligned Career Families
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profileCluster.careerFamilies.map((family) => (
                      <span
                        key={family}
                        className="badge"
                        style={{ background: '#10b981', color: 'white', padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        {family}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem' }}>Core Factor Scores</strong>
                  <canvas ref={radarChartRef} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  {Object.entries(profileCluster.factors).map(([factor, score]) => (
                    <div key={factor} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: '120px', fontWeight: 600, textTransform: 'capitalize' }}>{factor}</div>
                      <div style={{ flex: 1 }}>
                        <div className="progress-bar" style={{ height: '24px' }}>
                          <div className="progress-fill" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                      <div style={{ minWidth: '50px', fontWeight: 'bold', color: '#1b4965' }}>{score.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRATED CAREER RECOMMENDATIONS */}
      {careerRecommendations && careerRecommendations.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">AI Career Recommendations</h3>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
              Based on comprehensive analysis of Aptitude + Personality + Interest{psychometricDomains ? ' + Psychometric Domains' : ''}
            </p>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: '16px' }}>
              {careerRecommendations.slice(0, 10).map((career, index) => (
                <div 
                  key={career.profile} 
                  style={{ 
                    padding: '20px', 
                    background: index < 3 ? '#f0fdf4' : '#f9fafb',
                    borderRadius: '12px',
                    border: index < 3 ? '2px solid #10b981' : '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9ca3af' }}>#{index + 1}</span>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{career.profile}</h4>
                        {index < 3 && (
                          <span className="badge" style={{ background: '#10b981', color: 'white' }}>
                            Top Match
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9rem' }}>
                        {career.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#666' }}>
                        <span>Salary: {career.salaryRange}</span>
                        <span>Growth: {career.growthPotential}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: career.matchScore >= 80 ? '#10b981' : career.matchScore >= 60 ? '#f59e0b' : '#6b7280' }}>
                        {career.matchScore}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Overall Match</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: psychometricDomains ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                    <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Personality</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {career.traitMatch}%
                      </div>
                    </div>
                    <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Aptitude</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                        {career.aptitudeMatch}%
                      </div>
                    </div>
                    <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Interest</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ec4899' }}>
                        {career.interestMatch}%
                      </div>
                    </div>
                    {psychometricDomains && (
                      <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Psychometric</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                          {career.psychometricMatch || 50}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PREDICTIVE ANALYTICS */}
      {careerSuccessPrediction && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Career Success Prediction (AI-Powered)</h3>
          </div>
          <div className="card-body">
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', borderRadius: '16px', color: 'white', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Top Recommended Career</div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '2.5rem' }}>{careerSuccessPrediction.topCareer}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Success Probability</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {careerSuccessPrediction.successProbability}%
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar" style={{ height: '24px', background: 'rgba(255,255,255,0.2)' }}>
                    <div 
                      style={{ 
                        width: `${careerSuccessPrediction.successProbability}%`,
                        height: '100%',
                        background: 'white',
                        borderRadius: '12px',
                        transition: 'width 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
              <strong style={{ color: '#075985', display: 'block', marginBottom: '8px' }}>Recommendation:</strong>
              <p style={{ margin: 0, color: '#0c4a6e', lineHeight: 1.6 }}>
                {careerSuccessPrediction.recommendation}
              </p>
            </div>

            {careerSuccessPrediction.risks.length > 0 && (
              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: '12px' }}>Risk Factors to Consider:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f' }}>
                  {careerSuccessPrediction.risks.map((risk, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FUTURE GROWTH - Combined with AI Career Recommendation */}
      {aptitudeDimensions && Object.keys(aptitudeDimensions).length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Future Growth Explorer</h3>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
              Explore how improving specific aptitudes could change your career trajectory
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-2" style={{ gap: '24px' }}>
              {/* Left: Skill Improvement Sliders */}
              <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '16px' }}>
                  Select a skill area to improve:
                </strong>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {Object.entries(aptitudeDimensions).map(([dimension, value]) => (
                    <button
                      key={dimension}
                      className={`btn ${selectedDimension === dimension ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => {
                        setSelectedDimension(dimension);
                        handleWhatIfChange(dimension, improvementAmount);
                      }}
                      style={{ padding: '12px', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textTransform: 'capitalize' }}>{dimension}</span>
                        <strong>{Number(value).toFixed(1)}%</strong>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Improvement Amount: +{improvementAmount}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={improvementAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setImprovementAmount(val);
                      if (selectedDimension) {
                        handleWhatIfChange(selectedDimension, val);
                      }
                    }}
                    style={{ width: '100%', height: '8px', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                    <span>+5%</span>
                    <span>+15%</span>
                    <span>+30%</span>
                  </div>
                </div>

                {whatIfScores && (
                  <button className="btn btn-outline" onClick={resetWhatIf} style={{ marginTop: '12px', width: '100%' }}>
                    Reset to Current Scores
                  </button>
                )}
              </div>

              {/* Right: AI Career Recommendation based on What-If */}
              <div>
                <div style={{ 
                  padding: '20px', 
                  background: whatIfScores ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', 
                  borderRadius: '12px', 
                  color: 'white',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px' }}>
                    {whatIfScores ? 'Updated AI Career Recommendation' : 'Current Top Career Match'}
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>
                    {whatIfScores && whatIfCareerRecommendations 
                      ? whatIfCareerRecommendations[0]?.profile 
                      : careerRecommendations[0]?.profile || 'Complete tests to see'
                    }
                  </h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {whatIfScores && whatIfCareerRecommendations 
                      ? `${whatIfCareerRecommendations[0]?.matchScore}%`
                      : `${careerRecommendations[0]?.matchScore || 0}%`
                    }
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '8px' }}>match</span>
                  </div>
                </div>

                {selectedDimension && whatIfScores && whatIfCareerRecommendations && (
                  <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <strong style={{ color: '#065f46', display: 'block', marginBottom: '8px' }}>
                      Impact Analysis
                    </strong>
                    <p style={{ margin: '0 0 12px 0', color: '#047857', fontSize: '0.9rem' }}>
                      By improving <strong>{selectedDimension}</strong> by <strong>+{improvementAmount}%</strong>:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#047857', fontSize: '0.9rem' }}>
                      {whatIfCareerRecommendations[0]?.profile !== careerRecommendations[0]?.profile && (
                        <li style={{ marginBottom: '6px' }}>
                          Your top career match changes to <strong>{whatIfCareerRecommendations[0]?.profile}</strong>
                        </li>
                      )}
                      <li style={{ marginBottom: '6px' }}>
                        Match score: {careerRecommendations[0]?.matchScore}% → <strong>{whatIfCareerRecommendations[0]?.matchScore}%</strong>
                        {whatIfCareerRecommendations[0]?.matchScore > careerRecommendations[0]?.matchScore && (
                          <span style={{ color: '#10b981', marginLeft: '8px' }}>
                            (+{whatIfCareerRecommendations[0]?.matchScore - careerRecommendations[0]?.matchScore}%)
                          </span>
                        )}
                      </li>
                      <li>
                        Strong career matches: {strongCareerMatchesCount} → <strong>{whatIfCareerRecommendations.filter(c => c.matchScore >= 70).length}</strong>
                      </li>
                    </ul>
                  </div>
                )}

                {!whatIfScores && (
                  <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                      Select a skill area on the left to see how improving it would affect your career recommendations
                    </p>
                  </div>
                )}

                {/* Top 3 What-If Career Matches */}
                {whatIfScores && whatIfCareerRecommendations && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: '#374151' }}>
                      Top 3 Career Matches (After Improvement)
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {whatIfCareerRecommendations.slice(0, 3).map((career, index) => (
                        <div 
                          key={career.profile}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '12px',
                            background: index === 0 ? '#ecfdf5' : '#f9fafb',
                            borderRadius: '8px',
                            border: index === 0 ? '1px solid #10b981' : '1px solid #e5e7eb'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: '#9ca3af' }}>#{index + 1}</span>
                            <span style={{ fontWeight: '500' }}>{career.profile}</span>
                          </div>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: career.matchScore >= 70 ? '#10b981' : '#6b7280' 
                          }}>
                            {career.matchScore}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      </>)}
      </div> {/* End of reportRef container */}

      {/* Action Buttons - Outside of report container so they don't appear in download */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
        {!noTestsCompleted && (
        <button 
          className="btn btn-primary" 
          onClick={handleDownloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Generating PDF...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf"></i> Download PDF Report
            </>
          )}
        </button>
        )}
        {!noTestsCompleted && (
        <button className="btn btn-outline" onClick={() => window.print()}>
          <i className="fas fa-print"></i> Print Report
        </button>
        )}
        <button className="btn btn-outline" onClick={() => { window.history.pushState(null, '', '/student-dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );
}