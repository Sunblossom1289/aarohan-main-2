// src/utils/resultCalculations.js
// ===================================
// FRONTEND CALCULATION ENGINE
// All test result calculations happen here
// ===================================

// ==================== APTITUDE CALCULATIONS ====================

export function calculateAptitudeResults(questionsLog, answers) {
  if (!Array.isArray(questionsLog) || questionsLog.length === 0) {
    return {
      totalScore: 0,
      dimensionScores: {},
      categoryState: {},
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
    };
  }

  const dimensionStats = {};
  let totalCorrect = 0;

  // Process each question
  questionsLog.forEach((q, idx) => {
    const dimension = q.dimension || 'Unknown';
    const difficulty = q.difficulty || 'Medium';
    const userAnswer = answers?.[idx];
    const correctAnswer = q.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) totalCorrect++;

    // Initialize dimension if not exists
    if (!dimensionStats[dimension]) {
      dimensionStats[dimension] = {
        count: 0,
        correct: 0,
        difficulty: difficulty,
        locked: null,
        consecutiveSame: 0,
      };
    }

    dimensionStats[dimension].count++;
    if (isCorrect) dimensionStats[dimension].correct++;
  });

  // Calculate dimension scores (0-100 scale)
  const dimensionScores = {};
  Object.entries(dimensionStats).forEach(([dim, stats]) => {
    const accuracy = stats.count > 0 ? (stats.correct / stats.count) * 100 : 0;
    dimensionScores[dim] = Math.round(accuracy * 100) / 100;
  });

  // Overall score
  const totalQuestions = questionsLog.length;
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const totalScore = Math.round(accuracy * 100) / 100;

  return {
    totalScore,
    dimensionScores,
    categoryState: dimensionStats,
    totalQuestions,
    correctAnswers: totalCorrect,
    accuracy,
  };
}

// ==================== PERSONALITY (OCEAN) CALCULATIONS ====================

export function calculateOCEANScores(questionsLog, answers) {
  if (!Array.isArray(questionsLog) || questionsLog.length === 0) {
    return null;
  }

  // OCEAN traits: each gets 10 questions (Q1-10 = O, Q11-20 = C, etc.)
  const traitRanges = {
    Openness: { start: 0, end: 10 },
    Conscientiousness: { start: 10, end: 20 },
    Extraversion: { start: 20, end: 30 },
    Agreeableness: { start: 30, end: 40 },
    Neuroticism: { start: 40, end: 50 },
  };

  const getTraitLevel = (score) => {
    if (score >= 40) return 'Very High';
    if (score >= 32) return 'High';
    if (score >= 24) return 'Moderate';
    if (score >= 16) return 'Low';
    return 'Very Low';
  };

  const traits = {};

  Object.entries(traitRanges).forEach(([traitName, range]) => {
    let sum = 0;
    let count = 0;

    for (let i = range.start; i < range.end && i < answers.length; i++) {
      const answer = answers[i];
      if (answer >= 1 && answer <= 5) {
        sum += answer;
        count++;
      }
    }

    const score = count > 0 ? sum : 0;
    const maxScore = count * 5;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const level = getTraitLevel(score);

    traits[traitName] = {
      score,
      level,
      percentage,
      maxScore,
    };
  });

  return traits;
}

// Trait explanations
export function getTraitExplanation(trait, level) {
  const explanations = {
    Openness: {
      'Very High': 'Extremely imaginative and open to new experiences. Ideal for creative and innovative roles.',
      High: 'Creative and intellectually curious. Enjoys exploring new ideas and concepts.',
      Moderate: 'Balanced approach to new experiences. Comfortable with both tradition and innovation.',
      Low: 'Prefer practical and conventional approaches. Values tried-and-tested methods.',
      'Very Low': 'Strongly prefer familiar routines and traditional approaches.',
    },
    Conscientiousness: {
      'Very High': 'Highly organized, disciplined, and goal-oriented. Excellent for structured roles.',
      High: 'Reliable and well-organized. Can be counted on to complete tasks thoroughly.',
      Moderate: 'Balanced between structure and flexibility. Can adapt as needed.',
      Low: 'More spontaneous and flexible. Prefers less rigid environments.',
      'Very Low': 'Very flexible and spontaneous. Thrives in dynamic, unstructured settings.',
    },
    Extraversion: {
      'Very High': 'Highly outgoing and energized by social interaction. Perfect for people-facing roles.',
      High: 'Sociable and enjoys group activities. Works well in team environments.',
      Moderate: 'Balanced social energy. Comfortable in both social and solo work.',
      Low: 'Prefer smaller groups and quiet environments. Works well independently.',
      'Very Low': 'Strongly prefer solitary activities. Best suited for independent work.',
    },
    Agreeableness: {
      'Very High': 'Extremely cooperative and compassionate. Ideal for helping professions.',
      High: 'Friendly and cooperative. Values harmony and collaboration.',
      Moderate: 'Balanced between cooperation and assertiveness. Can adapt to different team dynamics.',
      Low: 'More competitive and analytical. Values truth over harmony.',
      'Very Low': 'Highly competitive and direct. Excels in adversarial or analytical roles.',
    },
    Neuroticism: {
      'Very High': 'High sensitivity to stress. Consider roles with support systems and stress management.',
      High: 'May experience stress more easily. Benefits from structured environments.',
      Moderate: 'Average emotional stability. Can handle typical work stress.',
      Low: 'Emotionally stable. Handles pressure well.',
      'Very Low': 'Highly resilient and calm under pressure. Ideal for high-stress roles.',
    },
  };

  return explanations[trait]?.[level] || '';
}

// ==================== INTEREST CALCULATIONS ====================

const WEIGHTS = {
  Interest: 0.5,
  Prestige: 0.2,
  Support: 0.3,
};

const TRAIT_META = {
  AP: {
    label: 'Analytical Problem-Solving',
    description: 'Enjoys logic, puzzles, data and figuring out how things work.',
    high: 'You excel at breaking down complex problems. Ideal for STEM, data science, or research.',
    medium: 'You can handle analytical tasks when needed, balanced with other skills.',
    low: 'You may prefer creative or people-focused work over heavy analytical tasks.',
  },
  OP: {
    label: 'Organization & Planning',
    description: 'Likes structure, planning, neatness.',
    high: 'You thrive in structured environments. Great for operations, accounting, management.',
    medium: 'You appreciate some structure but can adapt to flexible environments.',
    low: 'You prefer spontaneity. Consider creative or entrepreneurial paths.',
  },
  EX: {
    label: 'Extraversion & Social Energy',
    description: 'Drawn to people, activity, group work.',
    high: 'You energize in social settings. Perfect for sales, teaching, leadership.',
    medium: 'You balance solo and group work comfortably.',
    low: 'You recharge in quiet spaces. Consider technical or research work.',
  },
  EM: {
    label: 'Empathy & Helping',
    description: 'Cares about others, enjoys supporting people.',
    high: 'Strong desire to help others. Ideal for mentoring, healthcare, education.',
    medium: 'You care about people but can focus on tasks too.',
    low: 'You prioritize efficiency. Consider analytical or technical fields.',
  },
  ES: {
    label: 'Emotional Sensitivity',
    description: 'Sensitive to stress; needs supportive environment.',
    high: 'You need supportive environments with mentorship and clear feedback.',
    medium: 'You handle typical workplace stress reasonably well.',
    low: 'Resilient under pressure. Great for law, medicine, startups.',
  },
  CR: {
    label: 'Creativity & Exploration',
    description: 'Loves new ideas, creative expression.',
    high: 'You thrive on innovation. Perfect for design, arts, marketing, R&D.',
    medium: 'You appreciate creativity but can work within frameworks.',
    low: 'You prefer proven methods. Consider structured or technical roles.',
  },
  PR: {
    label: 'Practical & Hands-on',
    description: 'Likes building, fixing, working with tools.',
    high: 'You love tangible work. Excellent for engineering, architecture, trades.',
    medium: 'You balance conceptual thinking with practical application.',
    low: 'You prefer abstract work. Consider research, strategy, theory.',
  },
};

const CAREER_BUCKETS = [
  { key: 'stem_mech_civil', label: 'STEM – Mechanical/Civil Engineering', description: 'Building infrastructure and systems.' },
  { key: 'stem_medical', label: 'STEM – Medical Doctor', description: 'Healing through medical science.' },
  { key: 'commerce_ca', label: 'Commerce – Chartered Accountant', description: 'Managing finances and compliance.' },
  { key: 'civil_services', label: 'Govt – Civil Services (IAS/IPS)', description: 'Serving through policy and administration.' },
  { key: 'creative_graphic', label: 'Creative – Graphic Designer/Artist', description: 'Visual art and creative storytelling.' },
  { key: 'legal_corporate', label: 'Legal – Corporate Lawyer', description: 'Navigating legal systems.' },
  { key: 'tech_data_ai', label: 'Tech – Data Scientist/AI Engineer', description: 'Harnessing data and AI.' },
  { key: 'humanities_psych', label: 'Humanities – Psychologist/Counselor', description: 'Supporting mental health.' },
  { key: 'business_entrepreneur', label: 'Business – Entrepreneur/Founder', description: 'Building ventures and taking risks.' },
  { key: 'vocational_chef', label: 'Vocational – Chef/Culinary Arts', description: 'Creating culinary experiences.' },
  { key: 'media_journalism', label: 'Media – Journalist/News Anchor', description: 'Informing and accountability.' },
  { key: 'defence', label: 'Defence – Armed Forces', description: 'Protecting national security.' },
  { key: 'commerce_ib', label: 'Commerce – Investment Banker', description: 'High-stakes finance.' },
  { key: 'aviation_pilot', label: 'Aviation – Commercial Pilot', description: 'Navigating the skies.' },
  { key: 'education_academia', label: 'Education – Professor/Academic', description: 'Research and teaching.' },
  { key: 'creative_fashion', label: 'Creative – Fashion Designer', description: 'Shaping trends through style.' },
  { key: 'tech_gaming', label: 'Tech – Game Developer/E-Sports', description: 'Creating digital experiences.' },
  { key: 'social_ngo', label: 'Social Impact – Social Worker/NGO', description: 'Driving grassroots change.' },
  { key: 'architecture', label: 'Architecture – Architect', description: 'Designing spaces.' },
  { key: 'science_biotech', label: 'Science – Biotechnologist/Researcher', description: 'Biology and technology innovation.' },
];

/**
 * Map question ID to trait code based on INTEREST_QUESTIONS structure.
 * Used as fallback when questions don't have a trait field (e.g. TestResult questions from DB).
 * Q1-8 = AP, Q9-16 = OP, Q17-24 = EX, Q25-32 = EM, Q33-40 = ES, Q41-48 = CR, Q49-50 = PR
 * Q51+ = career rows (Interest/Prestige/Support)
 */
function getTraitFromQuestionId(qId) {
  const id = Number(qId);
  if (isNaN(id) || id < 1) return null;
  if (id <= 8) return 'AP';
  if (id <= 16) return 'OP';
  if (id <= 24) return 'EX';
  if (id <= 32) return 'EM';
  if (id <= 40) return 'ES';
  if (id <= 48) return 'CR';
  if (id <= 50) return 'PR';
  // Q51+: career rows use Interest/Prestige/Support cycle
  const offset = (id - 51) % 3;
  if (offset === 0) return 'Interest';
  if (offset === 1) return 'Prestige';
  return 'Support';
}

function clampLikert(raw) {
  if (raw == null || Number.isNaN(raw)) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(1, Math.min(5, n));
}

export function calculateInterestResults(questionsLog, answers) {
  if (!Array.isArray(questionsLog) || !Array.isArray(answers)) {
    return {
      topInterests: [],
      categoryScores: {},
      traitScores: {},
      careerScores: {},
    };
  }

  const traitTotals = {};
  const traitCounts = {};
  const rawCareer = {};

  questionsLog.forEach((q, idx) => {
    const rawAns = clampLikert(answers[idx]);
    if (!rawAns) return;

    const id = q.questionId || q.id;
    const traitCode = q.trait || getTraitFromQuestionId(id);

    // Core traits (Q1-50)
    if (id >= 1 && id <= 50 && traitCode && TRAIT_META[traitCode]) {
      if (!traitTotals[traitCode]) {
        traitTotals[traitCode] = 0;
        traitCounts[traitCode] = 0;
      }
      traitTotals[traitCode] += rawAns;
      traitCounts[traitCode] += 1;
      return;
    }

    // Career rows (Q51+)
    if (id >= 51) {
      const bucketIndex = Math.floor((id - 51) / 3);
      const bucket = CAREER_BUCKETS[bucketIndex];
      if (!bucket) return;

      if (!rawCareer[bucket.key]) {
        rawCareer[bucket.key] = {
          label: bucket.label,
          description: bucket.description,
          interestSum: 0,
          interestCount: 0,
          prestigeSum: 0,
          prestigeCount: 0,
          supportSum: 0,
          supportCount: 0,
        };
      }

      const entry = rawCareer[bucket.key];

      if (traitCode === 'Interest') {
        entry.interestSum += rawAns;
        entry.interestCount += 1;
      } else if (traitCode === 'Prestige') {
        entry.prestigeSum += rawAns;
        entry.prestigeCount += 1;
      } else if (traitCode === 'Support') {
        entry.supportSum += rawAns;
        entry.supportCount += 1;
      }
    }
  });

  // Trait scores
  const traitScores = {};
  Object.keys(traitTotals).forEach((code) => {
    const avg = traitTotals[code] / (traitCounts[code] || 1);
    const score100 = Math.round((avg / 5) * 100);
    const level = score100 >= 70 ? 'high' : score100 >= 40 ? 'medium' : 'low';

    traitScores[code] = {
      code,
      label: TRAIT_META[code]?.label || code,
      description: TRAIT_META[code]?.description || '',
      average: Number(avg.toFixed(2)),
      score: score100,
      level,
      explanation: TRAIT_META[code]?.[level] || '',
    };
  });

  // Career scores
  const careerScores = {};
  const categoryScores = {};

  Object.entries(rawCareer).forEach(([key, entry]) => {
    const avgInterest = entry.interestCount > 0 ? entry.interestSum / entry.interestCount : 0;
    const avgPrestige = entry.prestigeCount > 0 ? entry.prestigeSum / entry.prestigeCount : 0;
    const avgSupport = entry.supportCount > 0 ? entry.supportSum / entry.supportCount : 0;

    const composite =
      avgInterest * WEIGHTS.Interest +
      avgPrestige * WEIGHTS.Prestige +
      avgSupport * WEIGHTS.Support;

    const totalScore = Math.round((composite / 5) * 100);

    const record = {
      key,
      label: entry.label,
      description: entry.description,
      interestScore: Math.round((avgInterest / 5) * 100),
      prestigeScore: Math.round((avgPrestige / 5) * 100),
      supportScore: Math.round((avgSupport / 5) * 100),
      totalScore,
    };

    careerScores[key] = record;
    categoryScores[entry.label] = totalScore;
  });

  // Top 3
  const sortedCareers = Object.values(careerScores).sort((a, b) => b.totalScore - a.totalScore);
  const topInterests = sortedCareers.slice(0, 3).map((c) => c.label);

  return {
    topInterests,
    categoryScores,
    interestScores: categoryScores,
    traitScores,
    careerScores,
  };
}

export function getInterestLevelBadge(score) {
  if (score >= 70) return { class: 'badge-success', label: 'High' };
  if (score >= 40) return { class: 'badge-warning', label: 'Medium' };
  return { class: 'badge-info', label: 'Low' };
}

// ==================== PSYCHOMETRIC DOMAIN CALCULATIONS ====================
// Domains match the interest-test trait codes (7 traits from psychometric_questions / INTEREST_QUESTIONS):
//   AP (Analytical Problem-Solving) – Q1-8
//   OP (Organisation & Planning)    – Q9-16
//   EX (Extraversion & Social)      – Q17-24
//   EM (Empathy & Helping)          – Q25-32
//   ES (Emotional Sensitivity)      – Q33-40
//   CR (Creativity & Exploration)   – Q41-48
//   PR (Practical & Hands-on)       – Q49-50

const PSYCHOMETRIC_DOMAINS = {
  AP: {
    label: 'Analytical Problem-Solving',
    description: 'Enjoys logic, puzzles, data and figuring out how things work.',
    range: { start: 0, end: 8 },
    careers: {
      high: ['Data Analyst', 'Business Analyst', 'Economist', 'Financial Planner', 'Actuary', 'Operations Analyst'],
      medium: ['Project Manager', 'Quality Analyst', 'Researcher'],
      low: ['Creative roles', 'People-focused roles']
    }
  },
  OP: {
    label: 'Organisation & Planning',
    description: 'Likes structure, planning, neatness and doing things in an orderly way.',
    range: { start: 8, end: 16 },
    careers: {
      high: ['Operations Manager', 'Project Manager', 'Accountant', 'Supply-Chain Manager', 'Administrative Head'],
      medium: ['Quality Analyst', 'MIS/Reporting Analyst', 'Compliance Officer'],
      low: ['Spontaneous creative roles', 'Entrepreneurial roles']
    }
  },
  EX: {
    label: 'Extraversion & Social Energy',
    description: 'Drawn to people, activity, group work and leading from the front.',
    range: { start: 16, end: 24 },
    careers: {
      high: ['Sales & Business Development', 'HR & L&D', 'PR & Communications', 'Event Manager', 'Team Lead'],
      medium: ['Counsellor', 'Customer Success', 'Social Media Manager'],
      low: ['Independent technical work', 'Research roles']
    }
  },
  EM: {
    label: 'Empathy & Helping Orientation',
    description: 'Cares deeply about others, enjoys supporting and encouraging people.',
    range: { start: 24, end: 32 },
    careers: {
      high: ['Teacher/Trainer', 'Counsellor', 'Psychologist', 'Social Worker', 'HRBP', 'Healthcare'],
      medium: ['Customer Success', 'L&D Specialist', 'NGO Management'],
      low: ['Highly competitive environments', 'Cut-throat sales']
    }
  },
  ES: {
    label: 'Emotional Sensitivity',
    description: 'Sensitive to stress and criticism; needs the right environment to thrive.',
    range: { start: 32, end: 40 },
    careers: {
      high: ['Supportive environments', 'Mentorship roles', 'Creative arts', 'Career Mentorship (with support)'],
      medium: ['Balanced corporate roles', 'Education', 'Content writing'],
      low: ['High-pressure law', 'Medicine', 'Startups', 'Defence']
    }
  },
  CR: {
    label: 'Creativity & Exploration',
    description: 'Loves new ideas, creative expression and experimenting with possibilities.',
    range: { start: 40, end: 48 },
    careers: {
      high: ['UX/UI Designer', 'Marketing Strategist', 'Content Creator', 'Brand Manager', 'Advertising'],
      medium: ['Product Manager', 'Innovation Consultant', 'Architect'],
      low: ['Structured analytical roles', 'Routine operational roles']
    }
  },
  PR: {
    label: 'Practical & Hands-on',
    description: 'Likes building, fixing, working with tools and real-world tasks.',
    range: { start: 48, end: 50 },
    careers: {
      high: ['Software Developer', 'Mechanical Engineer', 'Civil Engineer', 'Architect', 'Lab Technician'],
      medium: ['Technical Project Manager', 'Operations Manager'],
      low: ['Abstract theoretical roles', 'Pure research']
    }
  }
};

/**
 * Get level label based on average score (1-5 scale)
 */
function getPsychometricLevel(avgScore) {
  if (avgScore >= 3.5) return { label: 'High', class: 'high' };
  if (avgScore >= 2.5) return { label: 'Moderate', class: 'moderate' };
  return { label: 'Low', class: 'low' };
}

/**
 * Calculate psychometric domain scores from questionsLog and answers
 */
export function calculatePsychometricDomains(questionsLog, answers) {
  if (!Array.isArray(questionsLog) || !Array.isArray(answers) || questionsLog.length === 0) {
    return null;
  }

  const domainScores = {};

  // Process each domain
  Object.entries(PSYCHOMETRIC_DOMAINS).forEach(([code, domain]) => {
    let sum = 0;
    let count = 0;

    // Find questions for this domain (by trait code, with questionId fallback)
    questionsLog.forEach((q, idx) => {
      const trait = q.trait || q.traitCode || getTraitFromQuestionId(q.questionId || q.id);
      if (trait === code && answers[idx] != null) {
        const score = typeof answers[idx] === 'object' ? answers[idx].selectedIndex : Number(answers[idx]);
        if (score >= 1 && score <= 5) {
          sum += score;
          count++;
        }
      }
    });

    // Calculate average (1-5 scale)
    const avgScore = count > 0 ? sum / count : 0;
    const percentage = count > 0 ? Math.round((sum / (count * 5)) * 100) : 0;
    const level = getPsychometricLevel(avgScore);

    domainScores[code] = {
      code,
      label: domain.label,
      description: domain.description,
      avgScore: Number(avgScore.toFixed(2)),
      percentage,
      level: level.label,
      levelClass: level.class,
      questionCount: count,
      rawSum: sum,
      maxPossible: count * 5,
      suggestedCareers: domain.careers[level.label.toLowerCase()] || []
    };
  });

  return domainScores;
}

/**
 * Calculate psychometric domain scores from just answers array (when questionsLog unavailable)
 * Assumes questions 1-10 = AP, 11-20 = CR, 21-30 = SI, 31-40 = PT, 41-50 = CS
 */
export function calculatePsychometricDomainsFromAnswers(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return null;
  }

  const domainScores = {};

  Object.entries(PSYCHOMETRIC_DOMAINS).forEach(([code, domain]) => {
    let sum = 0;
    let count = 0;

    for (let i = domain.range.start; i < domain.range.end && i < answers.length; i++) {
      const answer = answers[i];
      const score = typeof answer === 'object' && answer?.selectedIndex
        ? answer.selectedIndex
        : (typeof answer === 'number' ? answer : null);

      if (score !== null && score >= 1 && score <= 5) {
        sum += score;
        count++;
      }
    }

    const avgScore = count > 0 ? sum / count : 0;
    const percentage = count > 0 ? Math.round((sum / (count * 5)) * 100) : 0;
    const level = getPsychometricLevel(avgScore);

    domainScores[code] = {
      code,
      label: domain.label,
      description: domain.description,
      avgScore: Number(avgScore.toFixed(2)),
      percentage,
      level: level.label,
      levelClass: level.class,
      questionCount: count,
      rawSum: sum,
      maxPossible: count * 5,
      suggestedCareers: domain.careers[level.label.toLowerCase()] || []
    };
  });

  return domainScores;
}

/**
 * Get career suggestions based on top psychometric domains
 */
export function getPsychometricCareerSuggestions(domainScores) {
  if (!domainScores) return [];

  // Sort domains by avgScore descending
  const sorted = Object.values(domainScores).sort((a, b) => b.avgScore - a.avgScore);
  const top1 = sorted[0];
  const top2 = sorted[1];

  // Career combinations based on top 2 domains (updated trait codes)
  const careerCombos = {
    'AP+OP': ['Data Analyst', 'Business Analyst', 'Chartered Accountant', 'Financial Planner', 'Actuary'],
    'AP+CR': ['Architect', 'Product Designer', 'UX Researcher', 'Innovation Consultant', 'R&D Engineer'],
    'AP+PR': ['Software Developer', 'Mechanical Engineer', 'Civil Engineer', 'Robotics Engineer', 'IT Consultant'],
    'AP+EM': ['Data Analyst', 'Business Analyst', 'Economist', 'Financial Planner', 'Operations Analyst'],
    'OP+EM': ['Project Coordinator', 'HR Business Partner', 'Operations Manager', 'Supply Chain Manager'],
    'OP+EX': ['Management Consultant', 'Event Manager', 'Sales Operations', 'Team Lead'],
    'EX+EM': ['Teacher/Trainer', 'Counsellor', 'HR & L&D', 'Social Worker', 'Customer Success'],
    'EX+CR': ['PR & Communications', 'Social Media Manager', 'Brand Manager', 'Event Director'],
    'EX+AP': ['Sales & Business Development', 'Management Consultant', 'Team Lead', 'Account Manager'],
    'EM+CR': ['Content Creator', 'Psychologist', 'UX Designer', 'Art Therapist', 'NGO Management'],
    'CR+PR': ['Architect', 'Fashion Designer', 'Product Designer', 'Game Developer', 'Chef/Culinary Arts'],
    'PR+AP': ['Software Developer', 'Data Engineer', 'System Administrator', 'Technical Consultant'],
    'BALANCED': ['Product Manager', 'Management Consultant', 'Entrepreneur/Founder', 'General Management']
  };

  const isHigh = (domain) => domain.avgScore >= 3.5;

  // Find matching career combo
  let suggestions = [];
  if (isHigh(top1) && isHigh(top2)) {
    const pair1 = `${top1.code}+${top2.code}`;
    const pair2 = `${top2.code}+${top1.code}`;
    suggestions = careerCombos[pair1] || careerCombos[pair2] || [];
  }

  if (suggestions.length === 0) {
    // Check if balanced profile (all >= 3.0)
    const allScores = Object.values(domainScores).map(d => d.avgScore);
    if (allScores.every(s => s >= 3.0)) {
      suggestions = careerCombos['BALANCED'];
    } else {
      // Fallback: use top domain's careers
      suggestions = top1.suggestedCareers || [];
    }
  }

  return {
    topDomains: [top1, top2],
    suggestions,
    profileType: Object.values(domainScores).every(d => d.avgScore >= 3.0) ? 'Balanced' : 'Specialized'
  };
}

/**
 * Export domain metadata for UI
 */
export const PSYCHOMETRIC_DOMAIN_META = PSYCHOMETRIC_DOMAINS;
