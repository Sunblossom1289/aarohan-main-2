// OCEAN Scoring and Career Recommendation Engine

// Trait Level Classification
function getTraitLevel(score) {
  if (score >= 32) return 'Very High';
  if (score >= 24) return 'High';
  if (score >= 16) return 'Moderate';
  if (score >= 8) return 'Low';
  return 'Very Low';
}

// Calculate OCEAN scores from answers array
export function calculateOCEANScores(answers) {
  // answers is array of 40 numbers (1-5)
  // Questions 1-8: Openness, 9-16: Conscientiousness, 17-24: Extraversion, 
  // 25-32: Agreeableness, 33-40: Neuroticism
  
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

// Career Database
const CAREER_DATABASE = {
  // Single Trait - High Levels
  'High O': [
    'Designer', 'Writer', 'Filmmaker', 'UX Designer', 'Game Designer', 'Animator', 
    'Historian', 'Psychologist', 'Research Scientist', 'AI Engineer', 'Product Designer', 
    'Actor', 'Musician', 'Journalist', 'Photographer', 'Fashion Designer'
  ],
  'High C': [
    'CA', 'CS', 'CFA', 'IAS', 'IPS', 'Bank PO', 'Doctor', 'Engineer', 'Pharmacist', 
    'Auditor', 'Operations Manager', 'Data Analyst', 'Quality Control', 'Civil Servant', 
    'Compliance Officer'
  ],
  'High E': [
    'Sales Manager', 'HRBP', 'Event Manager', 'Hotel Manager', 'Travel Consultant', 
    'Startup Founder', 'Real Estate Agent', 'Politician', 'PR Manager', 'Anchor/RJ', 
    'Business Development Manager'
  ],
  'High A': [
    'Teacher', 'Special Educator', 'Social Worker', 'Psychologist', 'Nurse', 'Dietician', 
    'HR Manager', 'NGO Professional', 'Mediator', 'Counsellor'
  ],
  'Low N': [
    'Surgeon', 'Pilot', 'Defence Officer', 'Firefighter', 'Investment Banker', 
    'Management Consultant', 'ATC Officer'
  ],
  
  // Trait Combinations
  'High O + High C': ['Data Scientist', 'Architect', 'Strategist', 'Aerospace Engineer', 'Product Manager'],
  'High O + High E': ['Creative Director', 'PR Lead', 'Marketing Manager', 'Brand Strategist'],
  'High C + High E': ['Sales Director', 'Project Manager', 'Operations Head', 'Consultant'],
  'High C + Low E': ['Software Developer', 'Lab Technician', 'Accountant', 'Researcher'],
  'High O + Low C': ['Artist', 'Scriptwriter', 'Music Composer', 'Illustrator'],
  'Low E + High O': ['Editor', 'Game Developer', 'Fiction Writer', 'Graphic Designer'],
  'Low A + High E': ['Lawyer', 'Politician', 'Negotiator', 'Corporate Litigator'],
  'High A + High N': ['Nurse', 'Therapist', 'Caregiver', 'NGO Support Roles']
};

// Generate Career Recommendations
export function recommendCareers(oceanScores, aptitudeScore = null, interestAreas = []) {
  const recommendations = [];
  const profileKeys = [];

  // Check individual traits
  Object.entries(oceanScores).forEach(([trait, data]) => {
    const level = data.level;
    const shortTrait = trait[0]; // O, C, E, A, N
    
    if (trait === 'Neuroticism') {
      if (level === 'Low' || level === 'Very Low') {
        profileKeys.push('Low N');
        recommendations.push({
          profile: `Low ${trait}`,
          description: 'High emotional stability - suited for high-pressure roles',
          careers: CAREER_DATABASE['Low N'],
          matchScore: 95
        });
      }
    } else {
      if (level === 'High' || level === 'Very High') {
        profileKeys.push(`High ${shortTrait}`);
        recommendations.push({
          profile: `High ${trait}`,
          description: getTraitDescription(trait, level),
          careers: CAREER_DATABASE[`High ${shortTrait}`] || [],
          matchScore: data.percentage
        });
      }
    }
  });

  // Check combinations
  const O = oceanScores.Openness.level;
  const C = oceanScores.Conscientiousness.level;
  const E = oceanScores.Extraversion.level;
  const A = oceanScores.Agreeableness.level;
  const N = oceanScores.Neuroticism.level;

  const isHigh = (level) => level === 'High' || level === 'Very High';
  const isLow = (level) => level === 'Low' || level === 'Very Low';

  // High O + High C
  if (isHigh(O) && isHigh(C)) {
    recommendations.push({
      profile: 'High Openness + High Conscientiousness',
      description: 'Innovative yet disciplined - perfect for technical creativity',
      careers: CAREER_DATABASE['High O + High C'],
      matchScore: 98
    });
  }

  // High O + High E
  if (isHigh(O) && isHigh(E)) {
    recommendations.push({
      profile: 'High Openness + High Extraversion',
      description: 'Creative and social - ideal for public-facing creative roles',
      careers: CAREER_DATABASE['High O + High E'],
      matchScore: 96
    });
  }

  // High C + High E
  if (isHigh(C) && isHigh(E)) {
    recommendations.push({
      profile: 'High Conscientiousness + High Extraversion',
      description: 'Organized leader - excellent for corporate management',
      careers: CAREER_DATABASE['High C + High E'],
      matchScore: 97
    });
  }

  // High C + Low E
  if (isHigh(C) && isLow(E)) {
    recommendations.push({
      profile: 'High Conscientiousness + Low Extraversion',
      description: 'Detail-oriented and focused - great for analytical work',
      careers: CAREER_DATABASE['High C + Low E'],
      matchScore: 94
    });
  }

  // High O + Low C
  if (isHigh(O) && isLow(C)) {
    recommendations.push({
      profile: 'High Openness + Low Conscientiousness',
      description: 'Free-flowing creativity - suited for artistic pursuits',
      careers: CAREER_DATABASE['High O + Low C'],
      matchScore: 93
    });
  }

  // Low E + High O
  if (isLow(E) && isHigh(O)) {
    recommendations.push({
      profile: 'Low Extraversion + High Openness',
      description: 'Solo creative - perfect for independent creative work',
      careers: CAREER_DATABASE['Low E + High O'],
      matchScore: 92
    });
  }

  // Low A + High E
  if (isLow(A) && isHigh(E)) {
    recommendations.push({
      profile: 'Low Agreeableness + High Extraversion',
      description: 'Assertive and social - ideal for negotiation and advocacy',
      careers: CAREER_DATABASE['Low A + High E'],
      matchScore: 91
    });
  }

  // High A + High N
  if (isHigh(A) && isHigh(N)) {
    recommendations.push({
      profile: 'High Agreeableness + High Neuroticism',
      description: 'Empathetic and sensitive - suited for caring professions',
      careers: CAREER_DATABASE['High A + High N'],
      matchScore: 90
    });
  }

  // NEW: Add aptitude-based filtering
  if (aptitudeScore !== null) {
    if (aptitudeScore >= 80) {
      recommendations.push({
        profile: 'High Aptitude Profile',
        description: 'Exceptional analytical and problem-solving abilities',
        careers: ['Data Scientist', 'Research Scientist', 'Engineer', 'Surgeon', 'AI Engineer', 'Aerospace Engineer', 'Architect'],
        matchScore: aptitudeScore
      });
    } else if (aptitudeScore >= 60) {
      recommendations.push({
        profile: 'Good Aptitude Profile',
        description: 'Strong reasoning and learning capabilities',
        careers: ['Teacher', 'Business Analyst', 'Project Manager', 'Accountant', 'Bank PO'],
        matchScore: aptitudeScore
      });
    } else if (aptitudeScore >= 40) {
      recommendations.push({
        profile: 'Moderate Aptitude Profile',
        description: 'Balanced analytical skills - suitable for diverse fields',
        careers: ['Sales Manager', 'HR Manager', 'Event Manager', 'Content Writer'],
        matchScore: aptitudeScore
      });
    }
  }
  
  // NEW: Add interest-based matching
  if (interestAreas && interestAreas.length > 0) {
    const interestCareers = {
      'Technology': ['Software Developer', 'Data Scientist', 'AI Engineer', 'Cybersecurity Analyst'],
      'Healthcare': ['Doctor', 'Nurse', 'Psychologist', 'Physiotherapist', 'Pharmacist'],
      'Business': ['MBA', 'Entrepreneur', 'Marketing Manager', 'Sales Director', 'CA'],
      'Creative': ['Designer', 'Writer', 'Filmmaker', 'Musician', 'Architect', 'Fashion Designer'],
      'Social': ['Teacher', 'Social Worker', 'HR Manager', 'NGO Professional', 'Counsellor'],
      'Science': ['Research Scientist', 'Chemist', 'Biologist', 'Environmental Scientist'],
      'Engineering': ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Aerospace Engineer']
    };
    
    interestAreas.forEach(area => {
      if (interestCareers[area]) {
        recommendations.push({
          profile: `${area} Interest Match`,
          description: `Strong alignment with ${area.toLowerCase()} field`,
          careers: interestCareers[area],
          matchScore: 90
        });
      }
    });
  }

  // Sort by match score and return top 7
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 7);
}

// Get trait description
function getTraitDescription(trait, level) {
  const descriptions = {
    Openness: {
      'Very High': 'Extremely creative, imaginative, and open to new experiences',
      'High': 'Creative and intellectually curious',
      'Moderate': 'Balanced approach to new ideas and traditions',
      'Low': 'Prefer practical and conventional approaches',
      'Very Low': 'Strongly prefer familiar routines'
    },
    Conscientiousness: {
      'Very High': 'Highly organized, disciplined, and goal-oriented',
      'High': 'Reliable and well-organized',
      'Moderate': 'Balanced between structure and flexibility',
      'Low': 'More spontaneous and flexible',
      'Very Low': 'Very flexible and spontaneous'
    },
    Extraversion: {
      'Very High': 'Highly outgoing and energized by social interaction',
      'High': 'Sociable and enjoys group activities',
      'Moderate': 'Balanced social energy',
      'Low': 'Prefer smaller groups and quiet environments',
      'Very Low': 'Strongly prefer solitary activities'
    },
    Agreeableness: {
      'Very High': 'Extremely cooperative and compassionate',
      'High': 'Friendly and cooperative',
      'Moderate': 'Balanced between cooperation and assertiveness',
      'Low': 'More competitive and analytical',
      'Very Low': 'Highly competitive and direct'
    },
    Neuroticism: {
      'Very High': 'High sensitivity to stress (consider stress management support)',
      'High': 'May experience stress more easily',
      'Moderate': 'Average emotional stability',
      'Low': 'Emotionally stable',
      'Very Low': 'Highly resilient and calm under pressure'
    }
  };

  return descriptions[trait]?.[level] || '';
}

// Get top 10 career suggestions
export function getTopCareers(recommendations) {
  const allCareers = new Set();
  
  recommendations.forEach(rec => {
    rec.careers.forEach(career => allCareers.add(career));
  });

  return Array.from(allCareers).slice(0, 10);
}
