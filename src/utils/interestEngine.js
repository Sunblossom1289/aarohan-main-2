// src/utils/interestEngine.js

// Weights for career rows: interest, prestige, parental support
const WEIGHTS = {
  Interest: 0.5,
  Prestige: 0.2,
  Support: 0.3,
};

// Human-readable labels/descriptions for trait codes (Q1–50)
const TRAIT_META = {
  AP: {
    label: 'Analytical Problem-Solving',
    description: 'Enjoys logic, puzzles, data and figuring out how things work.',
    high: 'You excel at breaking down complex problems and thinking systematically. Ideal for STEM, data science, or research roles.',
    medium: 'You can handle analytical tasks when needed, but prefer a balance with other skills.',
    low: 'You may prefer creative or people-focused work over heavy analytical tasks.',
  },
  OP: {
    label: 'Organization & Planning',
    description: 'Likes structure, planning, neatness and doing things in an orderly way.',
    high: 'You thrive in structured environments and excel at project management. Great for operations, accounting, or administrative roles.',
    medium: 'You appreciate some structure but can also adapt to flexible environments.',
    low: 'You prefer spontaneity and may find rigid schedules constraining. Consider creative or entrepreneurial paths.',
  },
  EX: {
    label: 'Extraversion & Social Energy',
    description: 'Drawn to people, activity, group work and leading from the front.',
    high: 'You energize in social settings and excel at networking. Perfect for sales, teaching, or leadership roles.',
    medium: 'You balance solo and group work comfortably.',
    low: 'You recharge in quiet spaces. Consider technical, research, or independent creative work.',
  },
  EM: {
    label: 'Empathy & Helping Orientation',
    description: 'Cares deeply about others, enjoys supporting and encouraging people.',
    high: 'You have a strong desire to help others. Ideal for career mentorship, healthcare, education, or social work.',
    medium: 'You care about people but can also focus on tasks and outcomes.',
    low: 'You prioritize efficiency and results. Consider analytical or technical fields.',
  },
  ES: {
    label: 'Emotional Sensitivity',
    description: 'Sensitive to stress and criticism; needs the right environment to thrive.',
    high: 'You need supportive environments. Seek roles with mentorship, clear feedback, and low-conflict cultures.',
    medium: 'You handle typical workplace stress reasonably well.',
    low: "You're resilient under pressure. Great for high-stakes fields like law, medicine, or startups.",
  },
  CR: {
    label: 'Creativity & Exploration',
    description: 'Loves new ideas, creative expression and experimenting with possibilities.',
    high: 'You thrive on innovation and originality. Perfect for design, arts, marketing, or R&D.',
    medium: 'You appreciate creativity but can also work within established frameworks.',
    low: 'You prefer proven methods and clear guidelines. Consider structured or technical roles.',
  },
  PR: {
    label: 'Practical & Hands-on',
    description: 'Likes building, fixing, working with tools and real-world tasks.',
    high: 'You love tangible, hands-on work. Excellent for engineering, architecture, or skilled trades.',
    medium: 'You balance conceptual thinking with practical application.',
    low: 'You prefer abstract or conceptual work. Consider research, strategy, or theoretical fields.',
  },
};

// 20 career clusters mapped to the 3-question rows starting at Q51
const CAREER_BUCKETS = [
  { key: 'stem_mech_civil', label: 'STEM – Mechanical / Civil Engineering', description: 'Building infrastructure and mechanical systems that power the modern world.' },
  { key: 'stem_medical', label: 'STEM – Medical Doctor', description: 'Healing and caring for patients through medical science and compassion.' },
  { key: 'commerce_ca', label: 'Commerce – Chartered Accountant', description: 'Managing finances, audits, and compliance for businesses and individuals.' },
  { key: 'civil_services', label: 'Govt / Public – Civil Services (IAS / IPS)', description: 'Serving the nation through policy-making and public administration.' },
  { key: 'creative_graphic', label: 'Creative – Graphic Designer / Artist', description: 'Expressing ideas through visual art, design, and creative storytelling.' },
  { key: 'legal_corporate', label: 'Legal – Corporate Lawyer', description: 'Navigating complex legal systems to protect rights and businesses.' },
  { key: 'tech_data_ai', label: 'Tech – Data Scientist / AI Engineer', description: 'Harnessing data and AI to solve complex problems and drive innovation.' },
  { key: 'humanities_psych', label: 'Humanities – Psychologist / Counselor', description: 'Understanding and supporting mental health and human behavior.' },
  { key: 'business_entrepreneur', label: 'Business – Entrepreneur / Founder', description: 'Building ventures from scratch and taking calculated risks.' },
  { key: 'vocational_chef', label: 'Vocational – Chef / Culinary Arts', description: 'Creating culinary experiences that delight the senses.' },
  { key: 'media_journalism', label: 'Media – Journalist / News Anchor', description: 'Informing the public and holding power accountable through media.' },
  { key: 'defence', label: 'Defence – Armed Forces', description: 'Protecting national security with discipline and valor.' },
  { key: 'commerce_ib', label: 'Commerce – Investment Banker', description: 'Managing high-stakes financial deals and capital markets.' },
  { key: 'aviation_pilot', label: 'Aviation – Commercial Pilot', description: 'Navigating the skies and ensuring passenger safety.' },
  { key: 'education_academia', label: 'Education – Professor / Academic', description: 'Advancing knowledge through research and teaching future generations.' },
  { key: 'creative_fashion', label: 'Creative – Fashion Designer', description: 'Shaping trends and self-expression through clothing and style.' },
  { key: 'tech_gaming', label: 'Tech – Game Developer / E-Sports', description: 'Creating immersive digital experiences and competitive gaming ecosystems.' },
  { key: 'social_ngo', label: 'Social Impact – Social Worker / NGO', description: 'Driving grassroots change and advocating for marginalized communities.' },
  { key: 'architecture', label: 'Architecture – Architect', description: 'Designing spaces that blend form, function, and human experience.' },
  { key: 'science_biotech', label: 'Science – Biotechnologist / Researcher', description: 'Innovating at the intersection of biology and technology.' },
];

function clampLikert(raw) {
  if (raw == null || Number.isNaN(raw)) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(1, Math.min(5, n));
}

export function computeInterestSummary(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    return {
      topLabels: [],
      scoreMap: {},
      traitScores: {},
      careerScores: {},
    };
  }

  const traitTotals = {};
  const traitCounts = {};
  const rawCareer = {};

  questions.forEach((q, idx) => {
    const rawAns = clampLikert(answers[idx]);
    if (!rawAns) return;

    const id = q.id;
    const traitCode = q.trait;

    // Core trait section (Q1–50)
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

  // 1) Trait scores
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

  // 2) Career cluster scores
  const careerScores = {};
  const categoryScoreMap = {};

  Object.entries(rawCareer).forEach(([key, entry]) => {
    const avgInterest = entry.interestCount > 0 ? entry.interestSum / entry.interestCount : 0;
    const avgPrestige = entry.prestigeCount > 0 ? entry.prestigeSum / entry.prestigeCount : 0;
    const avgSupport = entry.supportCount > 0 ? entry.supportSum / entry.supportCount : 0;

    const composite =
      avgInterest * WEIGHTS.Interest +
      avgPrestige * WEIGHTS.Prestige +
      avgSupport * WEIGHTS.Support;

    const interestScore = Math.round((avgInterest / 5) * 100);
    const prestigeScore = Math.round((avgPrestige / 5) * 100);
    const supportScore = Math.round((avgSupport / 5) * 100);
    const totalScore = Math.round((composite / 5) * 100);

    const record = {
      key,
      label: entry.label,
      description: entry.description,
      interestScore,
      prestigeScore,
      supportScore,
      totalScore,
    };

    careerScores[key] = record;
    categoryScoreMap[entry.label] = totalScore;
  });

  // 3) Top 3 areas
  const sortedCareers = Object.values(careerScores).sort((a, b) => b.totalScore - a.totalScore);
  const topLabels = sortedCareers.slice(0, 3).map((c) => c.label);

  return {
    topLabels,
    scoreMap: categoryScoreMap,
    traitScores,
    careerScores,
  };
}

// Helper to get level badge style
export function getInterestLevelBadge(score) {
  if (score >= 70) return { class: 'badge-success', label: 'High' };
  if (score >= 40) return { class: 'badge-warning', label: 'Medium' };
  return { class: 'badge-info', label: 'Low' };
}
