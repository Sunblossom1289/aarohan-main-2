// FILE: src/utils/careerRecommendations.js

/**
 * Career Recommendations Engine
 * Maps OCEAN personality traits, aptitude scores, and psychometric domains to career profiles
 */

// Psychometric Domain Weights for each career
// Domains: AP (Analytical), CR (Creative), SI (Social), PT (Practical/Technical), CS (Care/Support)

const CAREER_DATABASE = [
  {
    profile: 'Software Engineer',
    requiredTraits: {
      Openness: { min: 24, ideal: 32, weight: 0.3 },
      Conscientiousness: { min: 20, ideal: 28, weight: 0.25 },
      Extraversion: { min: 8, ideal: 20, weight: 0.1 },
      Agreeableness: { min: 12, ideal: 24, weight: 0.15 },
      Neuroticism: { max: 24, ideal: 16, weight: 0.2 }
    },
    aptitudePreferences: ['logical reasoning', 'abstract reasoning', 'numerical aptitude'],
    interestAreas: ['Technology', 'Problem Solving', 'Innovation'],
    psychometricPreferences: { AP: 0.35, PT: 0.35, CR: 0.15, SI: 0.05, CS: 0.10 },
    description: 'Design, develop, and maintain software applications',
    salaryRange: '₹6-25 LPA',
    growthPotential: 'Very High'
  },
  {
    profile: 'Data Scientist',
    requiredTraits: {
      Openness: { min: 28, ideal: 36, weight: 0.35 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.3 },
      Extraversion: { min: 8, ideal: 20, weight: 0.05 },
      Agreeableness: { min: 12, ideal: 20, weight: 0.1 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.2 }
    },
    aptitudePreferences: ['numerical aptitude', 'logical reasoning', 'abstract reasoning'],
    interestAreas: ['Analytics', 'Statistics', 'Research'],
    psychometricPreferences: { AP: 0.45, PT: 0.25, CR: 0.15, SI: 0.05, CS: 0.10 },
    description: 'Analyze complex data to drive business decisions',
    salaryRange: '₹8-30 LPA',
    growthPotential: 'Very High'
  },
  {
    profile: 'Mechanical Engineer',
    requiredTraits: {
      Openness: { min: 20, ideal: 28, weight: 0.25 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.3 },
      Extraversion: { min: 12, ideal: 24, weight: 0.15 },
      Agreeableness: { min: 16, ideal: 24, weight: 0.15 },
      Neuroticism: { max: 24, ideal: 16, weight: 0.15 }
    },
    aptitudePreferences: ['mechanical reasoning', 'spatial aptitude', 'numerical aptitude'],
    interestAreas: ['Engineering', 'Design', 'Manufacturing'],
    psychometricPreferences: { PT: 0.40, AP: 0.30, CR: 0.15, SI: 0.10, CS: 0.05 },
    description: 'Design and build mechanical systems and devices',
    salaryRange: '₹4-15 LPA',
    growthPotential: 'High'
  },
  {
    profile: 'Content Writer',
    requiredTraits: {
      Openness: { min: 28, ideal: 36, weight: 0.35 },
      Conscientiousness: { min: 20, ideal: 28, weight: 0.2 },
      Extraversion: { min: 8, ideal: 24, weight: 0.1 },
      Agreeableness: { min: 20, ideal: 28, weight: 0.2 },
      Neuroticism: { max: 28, ideal: 20, weight: 0.15 }
    },
    aptitudePreferences: ['verbal reasoning', 'language aptitude', 'abstract reasoning'],
    interestAreas: ['Writing', 'Communication', 'Creativity'],
    psychometricPreferences: { CR: 0.40, CS: 0.20, SI: 0.15, AP: 0.15, PT: 0.10 },
    description: 'Create engaging written content for various media',
    salaryRange: '₹3-12 LPA',
    growthPotential: 'Moderate'
  },
  {
    profile: 'Business Analyst',
    requiredTraits: {
      Openness: { min: 24, ideal: 32, weight: 0.25 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 20, ideal: 32, weight: 0.25 },
      Agreeableness: { min: 20, ideal: 28, weight: 0.15 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.1 }
    },
    aptitudePreferences: ['logical reasoning', 'numerical aptitude', 'verbal reasoning'],
    interestAreas: ['Business', 'Strategy', 'Communication'],
    psychometricPreferences: { AP: 0.35, SI: 0.25, CS: 0.20, CR: 0.10, PT: 0.10 },
    description: 'Bridge business needs with technical solutions',
    salaryRange: '₹5-18 LPA',
    growthPotential: 'High'
  },
  {
    profile: 'Graphic Designer',
    requiredTraits: {
      Openness: { min: 32, ideal: 38, weight: 0.4 },
      Conscientiousness: { min: 20, ideal: 28, weight: 0.2 },
      Extraversion: { min: 16, ideal: 28, weight: 0.15 },
      Agreeableness: { min: 20, ideal: 28, weight: 0.15 },
      Neuroticism: { max: 28, ideal: 20, weight: 0.1 }
    },
    aptitudePreferences: ['perceptual aptitude', 'spatial aptitude', 'abstract reasoning'],
    interestAreas: ['Design', 'Visual Arts', 'Creativity'],
    psychometricPreferences: { CR: 0.50, PT: 0.20, SI: 0.15, AP: 0.10, CS: 0.05 },
    description: 'Create visual concepts to communicate ideas',
    salaryRange: '₹3-15 LPA',
    growthPotential: 'Moderate'
  },
  {
    profile: 'Civil Engineer',
    requiredTraits: {
      Openness: { min: 20, ideal: 28, weight: 0.2 },
      Conscientiousness: { min: 28, ideal: 36, weight: 0.35 },
      Extraversion: { min: 16, ideal: 28, weight: 0.2 },
      Agreeableness: { min: 20, ideal: 28, weight: 0.15 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.1 }
    },
    aptitudePreferences: ['spatial aptitude', 'numerical aptitude', 'mechanical reasoning'],
    interestAreas: ['Infrastructure', 'Construction', 'Engineering'],
    psychometricPreferences: { PT: 0.40, AP: 0.30, SI: 0.15, CR: 0.10, CS: 0.05 },
    description: 'Design and oversee construction projects',
    salaryRange: '₹4-16 LPA',
    growthPotential: 'High'
  },
  {
    profile: 'Teacher/Educator',
    requiredTraits: {
      Openness: { min: 24, ideal: 32, weight: 0.25 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 24, ideal: 36, weight: 0.3 },
      Agreeableness: { min: 28, ideal: 36, weight: 0.3 },
      Neuroticism: { max: 24, ideal: 16, weight: 0.15 }
    },
    aptitudePreferences: ['verbal reasoning', 'language aptitude'],
    interestAreas: ['Education', 'Communication', 'Social Service'],
    psychometricPreferences: { CS: 0.40, SI: 0.30, CR: 0.15, AP: 0.10, PT: 0.05 },
    description: 'Educate and inspire students of all ages',
    salaryRange: '₹3-10 LPA',
    growthPotential: 'Moderate'
  },
  {
    profile: 'Architect',
    requiredTraits: {
      Openness: { min: 28, ideal: 36, weight: 0.35 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 16, ideal: 28, weight: 0.15 },
      Agreeableness: { min: 16, ideal: 24, weight: 0.15 },
      Neuroticism: { max: 24, ideal: 16, weight: 0.1 }
    },
    aptitudePreferences: ['spatial aptitude', 'perceptual aptitude', 'abstract reasoning'],
    interestAreas: ['Design', 'Architecture', 'Art'],
    psychometricPreferences: { CR: 0.35, PT: 0.30, AP: 0.20, SI: 0.10, CS: 0.05 },
    description: 'Design buildings and living spaces',
    salaryRange: '₹4-20 LPA',
    growthPotential: 'High'
  },
  {
    profile: 'Financial Analyst',
    requiredTraits: {
      Openness: { min: 20, ideal: 28, weight: 0.2 },
      Conscientiousness: { min: 28, ideal: 36, weight: 0.35 },
      Extraversion: { min: 16, ideal: 28, weight: 0.15 },
      Agreeableness: { min: 16, ideal: 24, weight: 0.1 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.2 }
    },
    aptitudePreferences: ['numerical aptitude', 'logical reasoning'],
    interestAreas: ['Finance', 'Business', 'Analytics'],
    psychometricPreferences: { AP: 0.45, CS: 0.20, SI: 0.15, PT: 0.10, CR: 0.10 },
    description: 'Analyze financial data and market trends',
    salaryRange: '₹5-20 LPA',
    growthPotential: 'Very High'
  },
  {
    profile: 'Marketing Manager',
    requiredTraits: {
      Openness: { min: 28, ideal: 36, weight: 0.3 },
      Conscientiousness: { min: 20, ideal: 28, weight: 0.2 },
      Extraversion: { min: 28, ideal: 36, weight: 0.35 },
      Agreeableness: { min: 24, ideal: 32, weight: 0.25 },
      Neuroticism: { max: 24, ideal: 16, weight: 0.15 }
    },
    aptitudePreferences: ['verbal reasoning', 'logical reasoning'],
    interestAreas: ['Marketing', 'Communication', 'Strategy'],
    psychometricPreferences: { CR: 0.35, SI: 0.30, CS: 0.15, AP: 0.15, PT: 0.05 },
    description: 'Develop and execute marketing strategies',
    salaryRange: '₹6-25 LPA',
    growthPotential: 'Very High'
  },
  {
    profile: 'Psychologist',
    requiredTraits: {
      Openness: { min: 28, ideal: 36, weight: 0.3 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 20, ideal: 32, weight: 0.2 },
      Agreeableness: { min: 32, ideal: 38, weight: 0.35 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.15 }
    },
    aptitudePreferences: ['verbal reasoning', 'abstract reasoning'],
    interestAreas: ['Psychology', 'Healthcare', 'Social Service'],
    psychometricPreferences: { CS: 0.45, SI: 0.30, CR: 0.10, AP: 0.10, PT: 0.05 },
    description: 'Study human behavior and provide career guidance',
    salaryRange: '₹4-15 LPA',
    growthPotential: 'Moderate'
  },
  {
    profile: 'Entrepreneur',
    requiredTraits: {
      Openness: { min: 32, ideal: 38, weight: 0.35 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 28, ideal: 36, weight: 0.3 },
      Agreeableness: { min: 16, ideal: 28, weight: 0.15 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.2 }
    },
    aptitudePreferences: ['logical reasoning', 'verbal reasoning', 'numerical aptitude'],
    interestAreas: ['Business', 'Innovation', 'Leadership'],
    psychometricPreferences: { SI: 0.30, CR: 0.25, AP: 0.20, PT: 0.15, CS: 0.10 },
    description: 'Start and manage own business ventures',
    salaryRange: 'Variable (₹0-100+ LPA)',
    growthPotential: 'Very High'
  },
  {
    profile: 'Research Scientist',
    requiredTraits: {
      Openness: { min: 32, ideal: 38, weight: 0.4 },
      Conscientiousness: { min: 28, ideal: 36, weight: 0.3 },
      Extraversion: { min: 8, ideal: 20, weight: 0.05 },
      Agreeableness: { min: 16, ideal: 24, weight: 0.1 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.15 }
    },
    aptitudePreferences: ['logical reasoning', 'numerical aptitude', 'abstract reasoning'],
    interestAreas: ['Research', 'Science', 'Innovation'],
    psychometricPreferences: { AP: 0.40, CR: 0.25, PT: 0.20, CS: 0.10, SI: 0.05 },
    description: 'Conduct experiments and advance scientific knowledge',
    salaryRange: '₹5-25 LPA',
    growthPotential: 'High'
  },
  {
    profile: 'Human Resources Manager',
    requiredTraits: {
      Openness: { min: 24, ideal: 32, weight: 0.25 },
      Conscientiousness: { min: 24, ideal: 32, weight: 0.25 },
      Extraversion: { min: 28, ideal: 36, weight: 0.3 },
      Agreeableness: { min: 28, ideal: 36, weight: 0.35 },
      Neuroticism: { max: 20, ideal: 12, weight: 0.15 }
    },
    aptitudePreferences: ['verbal reasoning', 'logical reasoning'],
    interestAreas: ['HR', 'Management', 'People Development'],
    psychometricPreferences: { SI: 0.35, CS: 0.35, CR: 0.15, AP: 0.10, PT: 0.05 },
    description: 'Manage recruitment, training, and employee relations',
    salaryRange: '₹4-18 LPA',
    growthPotential: 'High'
  }
];

/**
 * Calculate trait match score based on OCEAN scores
 */
function calculateTraitMatch(oceanScores, careerTraits) {
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(careerTraits).forEach(([trait, requirements]) => {
    const userScore = oceanScores[trait]?.score || 0;
    const weight = requirements.weight || 0.2;
    totalWeight += weight;

    let traitScore = 0;

    if (requirements.max) {
      // For traits where lower is better (e.g., Neuroticism)
      if (userScore <= requirements.ideal) {
        traitScore = 100;
      } else if (userScore <= requirements.max) {
        traitScore = 100 - ((userScore - requirements.ideal) / (requirements.max - requirements.ideal)) * 50;
      } else {
        traitScore = 50 - Math.min(50, ((userScore - requirements.max) / 10) * 10);
      }
    } else {
      // For traits where higher is better
      if (userScore >= requirements.ideal) {
        traitScore = 100;
      } else if (userScore >= requirements.min) {
        traitScore = 50 + ((userScore - requirements.min) / (requirements.ideal - requirements.min)) * 50;
      } else {
        traitScore = Math.max(0, 50 - ((requirements.min - userScore) / 10) * 10);
      }
    }

    totalScore += traitScore * weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate aptitude match score
 */
function calculateAptitudeMatch(aptitudeScore, careerAptitudes, userDimensions) {
  if (!userDimensions || !careerAptitudes?.length) return 50;

  let matchCount = 0;
  let totalScore = 0;

  careerAptitudes.forEach(preferredApt => {
    const matchingDim = Object.entries(userDimensions).find(([key]) => 
      key.toLowerCase().includes(preferredApt.toLowerCase()) || 
      preferredApt.toLowerCase().includes(key.toLowerCase())
    );

    if (matchingDim) {
      matchCount++;
      totalScore += Number(matchingDim[1]) || 0;
    }
  });

  if (matchCount === 0) return aptitudeScore || 50;

  const avgScore = totalScore / matchCount;
  return avgScore;
}

/**
 * Calculate interest area match
 */
function calculateInterestMatch(userInterests, careerInterests) {
  if (!userInterests?.length || !careerInterests?.length) return 50;

  let matchCount = 0;
  userInterests.forEach(interest => {
    if (careerInterests.some(ci => 
      ci.toLowerCase().includes(interest.toLowerCase()) || 
      interest.toLowerCase().includes(ci.toLowerCase())
    )) {
      matchCount++;
    }
  });

  return 50 + (matchCount / careerInterests.length) * 50;
}

/**
 * Calculate psychometric domain match
 * psychometricDomains: { AP: { avgScore, percentage, ... }, CR: {...}, SI: {...}, PT: {...}, CS: {...} }
 * careerPsychometricPreferences: { AP: 0.35, CR: 0.20, ... } (weights for each domain)
 */
function calculatePsychometricMatch(psychometricDomains, careerPsychometricPreferences) {
  if (!psychometricDomains || !careerPsychometricPreferences) return 50;

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(careerPsychometricPreferences).forEach(([domain, weight]) => {
    const userDomainData = psychometricDomains[domain];
    if (userDomainData) {
      // Use percentage (0-100 scale)
      const domainScore = userDomainData.percentage || (userDomainData.avgScore / 5 * 100) || 0;
      weightedScore += domainScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? weightedScore / totalWeight : 50;
}

/**
 * Main recommendation function
 * Now includes psychometric domains for better career matching
 */
export function recommendCareers(oceanScores, aptitudeScore = null, interestAreas = [], userDimensions = null, psychometricDomains = null) {
  if (!oceanScores) return [];

  const recommendations = CAREER_DATABASE.map(career => {
    const traitMatch = calculateTraitMatch(oceanScores, career.requiredTraits);
    const aptitudeMatch = calculateAptitudeMatch(aptitudeScore, career.aptitudePreferences, userDimensions);
    const interestMatch = calculateInterestMatch(interestAreas, career.interestAreas);
    const psychometricMatch = calculatePsychometricMatch(psychometricDomains, career.psychometricPreferences);

    // Weighted average: Personality 35%, Aptitude 25%, Interest 15%, Psychometric 25%
    // If psychometric domains are not available, fall back to original weights
    let matchScore;
    if (psychometricDomains && Object.keys(psychometricDomains).length > 0) {
      matchScore = Math.round(
        (traitMatch * 0.35) + (aptitudeMatch * 0.25) + (interestMatch * 0.15) + (psychometricMatch * 0.25)
      );
    } else {
      // Fallback to original weights when psychometric is unavailable
      matchScore = Math.round(
        (traitMatch * 0.5) + (aptitudeMatch * 0.3) + (interestMatch * 0.2)
      );
    }

    return {
      ...career,
      matchScore,
      traitMatch: Math.round(traitMatch),
      aptitudeMatch: Math.round(aptitudeMatch),
      interestMatch: Math.round(interestMatch),
      psychometricMatch: Math.round(psychometricMatch)
    };
  });

  // Sort by match score descending
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get top career suggestions
 */
export function getTopCareers(recommendations, count = 5) {
  return recommendations
    .slice(0, count)
    .map(r => r.profile);
}

/**
 * Get career details by profile name
 */
export function getCareerDetails(profileName) {
  return CAREER_DATABASE.find(c => c.profile === profileName);
}

/**
 * Filter careers by minimum match score
 */
export function filterCareersByScore(recommendations, minScore = 60) {
  return recommendations.filter(r => r.matchScore >= minScore);
}

/**
 * Group careers by match tier
 */
export function groupCareersByTier(recommendations) {
  return {
    excellent: recommendations.filter(r => r.matchScore >= 80),
    good: recommendations.filter(r => r.matchScore >= 60 && r.matchScore < 80),
    moderate: recommendations.filter(r => r.matchScore >= 40 && r.matchScore < 60),
    low: recommendations.filter(r => r.matchScore < 40)
  };
}
