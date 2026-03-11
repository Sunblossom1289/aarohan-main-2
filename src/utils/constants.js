export const PROGRAMS = [
  { id: 1, name: 'Free', price: 0, counselingEligible: false, counselingCredits: 0, testCredits: 0, description: 'Basic aptitude test only', features: ['Aptitude Test', 'Basic Results'] },
  { id: 2, name: 'Silver', price: 1999, counselingEligible: true, counselingCredits: 1, testCredits: 1, description: 'All tests + 1 career mentorship session', features: ['All Tests', '1 Career Mentorship Session', 'Detailed Reports', 'Career Recommendations'] },
  { id: 3, name: 'Gold', price: 4999, counselingEligible: true, counselingCredits: 3, testCredits: 1, description: 'All tests + 3 career mentorship sessions + priority support', features: ['All Tests', '3 Career Mentorship Sessions', 'Priority Support', 'Advanced Analytics', 'Personalized Roadmap'] }
];

export const CAREER_RECOMMENDATIONS = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer',
  'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Medical Professional', 'Chartered Accountant',
  'MBA Specialist', 'Business Analyst', 'Digital Marketer', 'Content Writer', 'Graphic Designer',
  'Architect', 'Pilot', 'Banker', 'Teacher', 'Consultant'
];

export const DISTRICTS = ['Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

export const SCHOOLS = [
  'DPS Pune', 'St. Xavier\'s High School', 'Bangalore Public School', 'Delhi Public School',
  'Vidyamandir Classes', 'Brilliant Academy', 'Rise Academy', 'Global Indian School',
  'Cathedral School', 'Aditya Birla World Academy'
];

export const COUNSELORS = [
  { id: 1, name: 'Dr. Meera Sharma', district: 'Pune', languages: 'Hindi, English, Marathi', experience: 8, verificationStatus: 'approved', photo: '👩‍⚕️', assignedStudents: 12, sessionsCompleted: 45 },
  { id: 2, name: 'Mr. Arjun Desai', district: 'Mumbai', languages: 'Hindi, English, Gujarati', experience: 6, verificationStatus: 'approved', photo: '👨‍⚕️', assignedStudents: 8, sessionsCompleted: 32 },
  { id: 3, name: 'Dr. Priya Patel', district: 'Bangalore', languages: 'Hindi, English, Kannada', experience: 10, verificationStatus: 'approved', photo: '👩‍⚕️', assignedStudents: 15, sessionsCompleted: 67 },
  { id: 4, name: 'Mr. Rajesh Kumar', district: 'Delhi', languages: 'Hindi, English', experience: 5, verificationStatus: 'pending', photo: '👨‍⚕️', assignedStudents: 0, sessionsCompleted: 0 }
];

export const APTITUDE_QUESTIONS = [
  { id: 1, text: 'What is 15 × 8?', options: ['80', '100', '120', '140'], correct: 2, dimension: 'Numerical' },
  { id: 2, text: 'Select the odd one out: Apple, Orange, Carrot, Banana', options: ['Apple', 'Orange', 'Carrot', 'Banana'], correct: 2, dimension: 'Logical' },
  { id: 3, text: 'Complete the series: 2, 4, 8, 16, ?', options: ['24', '28', '32', '36'], correct: 2, dimension: 'Logical' },
  { id: 4, text: 'A car travels 100 km in 2 hours. What is its average speed?', options: ['25 km/h', '50 km/h', '75 km/h', '100 km/h'], correct: 1, dimension: 'Numerical' },
  { id: 5, text: 'Which shape comes next? Square, Circle, Triangle, ?', options: ['Star', 'Rectangle', 'Pentagon', 'Hexagon'], correct: 2, dimension: 'Spatial' },
  { id: 6, text: 'If all roses are flowers and all flowers fade, then roses...', options: ['Are red', 'Fade', 'Bloom', 'Are beautiful'], correct: 1, dimension: 'Logical' },
  { id: 7, text: 'What is the antonym of "Generous"?', options: ['Kind', 'Stingy', 'Humble', 'Brave'], correct: 1, dimension: 'Verbal' },
  { id: 8, text: 'If APPLE = 1, BALL = 2, then CAT = ?', options: ['1', '2', '3', '4'], correct: 2, dimension: 'Logical' },
  { id: 9, text: 'How many sides does a hexagon have?', options: ['4', '5', '6', '7'], correct: 2, dimension: 'Spatial' },
  { id: 10, text: 'Which of these is not a prime number?', options: ['7', '11', '15', '13'], correct: 2, dimension: 'Numerical' }
];

// OCEAN Personality Test Questions (Big Five)
export const PERSONALITY_QUESTIONS = [
  // Openness (8 questions)
  { id: 1, text: 'I enjoy trying new foods, ideas, and experiences.', trait: 'Openness', scale: 5 },
  { id: 2, text: 'I have a vivid imagination.', trait: 'Openness', scale: 5 },
  { id: 3, text: 'I enjoy reflecting on abstract concepts.', trait: 'Openness', scale: 5 },
  { id: 4, text: 'I appreciate art, music, and literature deeply.', trait: 'Openness', scale: 5 },
  { id: 5, text: 'I am curious about how things work.', trait: 'Openness', scale: 5 },
  { id: 6, text: 'I like to come up with new, innovative solutions.', trait: 'Openness', scale: 5 },
  { id: 7, text: 'I enjoy learning new skills just for fun.', trait: 'Openness', scale: 5 },
  { id: 8, text: 'I get bored easily with routine tasks.', trait: 'Openness', scale: 5 },
  
  // Conscientiousness (8 questions)
  { id: 9, text: 'I always complete tasks on time.', trait: 'Conscientiousness', scale: 5 },
  { id: 10, text: 'I pay attention to details.', trait: 'Conscientiousness', scale: 5 },
  { id: 11, text: 'I make plans and follow them strictly.', trait: 'Conscientiousness', scale: 5 },
  { id: 12, text: 'I can be relied upon to finish what I start.', trait: 'Conscientiousness', scale: 5 },
  { id: 13, text: 'I prefer an organized and structured environment.', trait: 'Conscientiousness', scale: 5 },
  { id: 14, text: 'I set goals for myself and achieve them.', trait: 'Conscientiousness', scale: 5 },
  { id: 15, text: 'I rarely act without thinking.', trait: 'Conscientiousness', scale: 5 },
  { id: 16, text: 'I try to do things thoroughly and carefully.', trait: 'Conscientiousness', scale: 5 },
  
  // Extraversion (8 questions)
  { id: 17, text: 'I enjoy being around groups of people.', trait: 'Extraversion', scale: 5 },
  { id: 18, text: 'I feel comfortable leading others.', trait: 'Extraversion', scale: 5 },
  { id: 19, text: 'I easily strike up conversations.', trait: 'Extraversion', scale: 5 },
  { id: 20, text: 'I feel energized after social interactions.', trait: 'Extraversion', scale: 5 },
  { id: 21, text: 'I enjoy being the center of attention.', trait: 'Extraversion', scale: 5 },
  { id: 22, text: 'I prefer action over quiet reflection.', trait: 'Extraversion', scale: 5 },
  { id: 23, text: 'I make friends quickly.', trait: 'Extraversion', scale: 5 },
  { id: 24, text: 'I enjoy public speaking.', trait: 'Extraversion', scale: 5 },
  
  // Agreeableness (8 questions)
  { id: 25, text: 'I am considerate and kind to almost everyone.', trait: 'Agreeableness', scale: 5 },
  { id: 26, text: 'I enjoy helping others.', trait: 'Agreeableness', scale: 5 },
  { id: 27, text: 'I try to avoid conflicts.', trait: 'Agreeableness', scale: 5 },
  { id: 28, text: 'I trust people easily.', trait: 'Agreeableness', scale: 5 },
  { id: 29, text: 'I empathize with the feelings of others.', trait: 'Agreeableness', scale: 5 },
  { id: 30, text: 'I cooperate rather than compete.', trait: 'Agreeableness', scale: 5 },
  { id: 31, text: 'I forgive people easily.', trait: 'Agreeableness', scale: 5 },
  { id: 32, text: 'I value harmony in relationships.', trait: 'Agreeableness', scale: 5 },
  
  // Neuroticism (8 questions)
  { id: 33, text: 'I get stressed out easily.', trait: 'Neuroticism', scale: 5 },
  { id: 34, text: 'I often worry about things.', trait: 'Neuroticism', scale: 5 },
  { id: 35, text: 'I feel easily hurt by criticism.', trait: 'Neuroticism', scale: 5 },
  { id: 36, text: 'I experience mood swings.', trait: 'Neuroticism', scale: 5 },
  { id: 37, text: 'I feel anxious in unfamiliar situations.', trait: 'Neuroticism', scale: 5 },
  { id: 38, text: 'I get upset over small problems.', trait: 'Neuroticism', scale: 5 },
  { id: 39, text: 'I feel insecure at times.', trait: 'Neuroticism', scale: 5 },
  { id: 40, text: 'I tend to overthink situations.', trait: 'Neuroticism', scale: 5 }
];


// Psychometric (Excel) questions rendered like personality (Likert 1–5)
export const INTEREST_QUESTIONS = [
  { id: 1, text: 'I enjoy solving puzzles, riddles, or brain teasers.', trait: 'AP', scale: 5 },
  { id: 2, text: 'I like working with numbers, data, or statistics.', trait: 'AP', scale: 5 },
  { id: 3, text: 'I often question information and try to verify if it’s true.', trait: 'AP', scale: 5 },
  { id: 4, text: 'I enjoy debating and discussing different ideas.', trait: 'AP', scale: 5 },
  { id: 5, text: 'I like reading about science, technology, or discoveries.', trait: 'AP', scale: 5 },
  { id: 6, text: 'I like learning new concepts even if they are difficult.', trait: 'AP', scale: 5 },
  { id: 7, text: 'I enjoy analyzing situations before making decisions.', trait: 'AP', scale: 5 },
  { id: 8, text: 'I like figuring out how things work.', trait: 'AP', scale: 5 },
  { id: 9, text: 'I like organizing tasks and planning my work in advance.', trait: 'OP', scale: 5 },
  { id: 10, text: 'I feel satisfied when I complete work neatly and correctly.', trait: 'OP', scale: 5 },
  { id: 11, text: 'I prefer following a structured schedule rather than doing things randomly.', trait: 'OP', scale: 5 },
  { id: 12, text: 'I like to keep my things clean and in order.', trait: 'OP', scale: 5 },
  { id: 13, text: 'I am good at managing time and meeting deadlines.', trait: 'OP', scale: 5 },
  { id: 14, text: 'I like to make lists and set goals for myself.', trait: 'OP', scale: 5 },
  { id: 15, text: 'I feel uncomfortable when things are messy or disorganized.', trait: 'OP', scale: 5 },
  { id: 16, text: 'I take responsibilities seriously.', trait: 'OP', scale: 5 },
  { id: 17, text: 'I enjoy social gatherings and meeting new people.', trait: 'EX', scale: 5 },
  { id: 18, text: 'I feel energetic when I am around others.', trait: 'EX', scale: 5 },
  { id: 19, text: 'I like taking the lead in group activities.', trait: 'EX', scale: 5 },
  { id: 20, text: 'I enjoy speaking in front of a group.', trait: 'EX', scale: 5 },
  { id: 21, text: 'I find it easy to start conversations with strangers.', trait: 'EX', scale: 5 },
  { id: 22, text: 'I feel confident when expressing my opinions.', trait: 'EX', scale: 5 },
  { id: 23, text: 'I enjoy being active and doing exciting activities.', trait: 'EX', scale: 5 },
  { id: 24, text: 'I like to be part of a team rather than working alone.', trait: 'EX', scale: 5 },
  { id: 25, text: 'I enjoy helping people who are in need.', trait: 'EM', scale: 5 },
  { id: 26, text: 'I try to understand how others feel.', trait: 'EM', scale: 5 },
  { id: 27, text: 'I often comfort friends when they are upset.', trait: 'EM', scale: 5 },
  { id: 28, text: 'I feel happy when I can make others smile.', trait: 'EM', scale: 5 },
  { id: 29, text: 'I find it easy to forgive others.', trait: 'EM', scale: 5 },
  { id: 30, text: 'I enjoy working in a supportive and friendly environment.', trait: 'EM', scale: 5 },
  { id: 31, text: 'I care about how my actions affect others.', trait: 'EM', scale: 5 },
  { id: 32, text: 'I often volunteer or help without expecting rewards.', trait: 'EM', scale: 5 },
  { id: 33, text: 'I get nervous easily in stressful situations.', trait: 'ES', scale: 5 },
  { id: 34, text: 'I often worry about what might go wrong.', trait: 'ES', scale: 5 },
  { id: 35, text: 'I feel anxious when facing new challenges.', trait: 'ES', scale: 5 },
  { id: 36, text: 'I sometimes feel overwhelmed by emotions.', trait: 'ES', scale: 5 },
  { id: 37, text: 'I get upset when people criticize me.', trait: 'ES', scale: 5 },
  { id: 38, text: 'I find it difficult to stay calm under pressure.', trait: 'ES', scale: 5 },
  { id: 39, text: 'I often overthink situations.', trait: 'ES', scale: 5 },
  { id: 40, text: 'I feel stressed when I have too many tasks at once.', trait: 'ES', scale: 5 },
  { id: 41, text: 'I enjoy drawing, painting, music, or creative activities.', trait: 'CR', scale: 5 },
  { id: 42, text: 'I like coming up with new ideas or inventions.', trait: 'CR', scale: 5 },
  { id: 43, text: 'I enjoy imagining stories or writing creatively.', trait: 'CR', scale: 5 },
  { id: 44, text: 'I like exploring new hobbies and interests.', trait: 'CR', scale: 5 },
  { id: 45, text: 'I enjoy learning about different cultures and places.', trait: 'CR', scale: 5 },
  { id: 46, text: 'I like trying new things even if they feel risky.', trait: 'CR', scale: 5 },
  { id: 47, text: 'I enjoy brainstorming and thinking outside the box.', trait: 'CR', scale: 5 },
  { id: 48, text: 'I like expressing myself through art or creativity.', trait: 'CR', scale: 5 },
  { id: 49, text: 'I enjoy working with hands-on tools or building things.', trait: 'PR', scale: 5 },
  { id: 50, text: 'I like outdoor activities and practical work.', trait: 'PR', scale: 5 },
  
  // Row 1: STEM (Mechanical/Civil Engineering)
  { id: 51, text: 'How interested are you in designing and building?', trait: 'Interest', scale: 5 },
  { id: 52, text: 'How much respect does society give to a civil or mechanical engineer?', trait: 'Prestige', scale: 5 },
  { id: 53, text: 'If you chose Mechanical/Civil, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 2: STEM (Medical Doctor)
  { id: 54, text: 'How interested are you in treating patients and studying medicine?', trait: 'Interest', scale: 5 },
  { id: 55, text: 'How much prestige do you attribute to being a Doctor?', trait: 'Prestige', scale: 5 },
  { id: 56, text: 'If you chose Medicine, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 3: Commerce (Chartered Accountant)
  { id: 57, text: 'How interested are you in auditing, taxation, and finance?', trait: 'Interest', scale: 5 },
  { id: 58, text: 'How much respect does a CA command in your society?', trait: 'Prestige', scale: 5 },
  { id: 59, text: 'If you chose to become a CA, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 4: Govt/Public (Civil Services IAS/IPS)
  { id: 60, text: 'How interested are you in administration and public policy?', trait: 'Interest', scale: 5 },
  { id: 61, text: 'How much power/prestige does society attribute to an IAS officer?', trait: 'Prestige', scale: 5 },
  { id: 62, text: 'If you decided to prepare for UPSC, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 5: Creative (Graphic Designer / Artist)
  { id: 63, text: 'How interested are you in visual arts and design?', trait: 'Interest', scale: 5 },
  { id: 64, text: 'How much value does society place on a career in Arts?', trait: 'Prestige', scale: 5 },
  { id: 65, text: 'If you chose Graphic Design, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 6: Legal (Corporate Lawyer)
  { id: 66, text: 'How interested are you in corporate law and legal arguments?', trait: 'Interest', scale: 5 },
  { id: 67, text: 'How much prestige do you attribute to the Legal profession?', trait: 'Prestige', scale: 5 },
  { id: 68, text: 'If you chose Law, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 7: Tech (Data Scientist / AI Engineer)
  { id: 69, text: 'How interested are you in mathematics, statistics and coding?', trait: 'Interest', scale: 5 },
  { id: 70, text: 'How much prestige is currently given to AI/Data careers?', trait: 'Prestige', scale: 5 },
  { id: 71, text: 'If you chose Data Science, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 8: Humanities (Psychologist / Counselor)
  { id: 72, text: 'How interested are you in understanding human behavior?', trait: 'Interest', scale: 5 },
  { id: 73, text: 'How much respect does society give to mental health professionals?', trait: 'Prestige', scale: 5 },
  { id: 74, text: 'If you chose Psychology, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 9: Business (Entrepreneur / Startup Founder)
  { id: 75, text: 'How interested are you in building your own business?', trait: 'Interest', scale: 5 },
  { id: 76, text: 'How much prestige is attributed to being a "Founder"?', trait: 'Prestige', scale: 5 },
  { id: 77, text: 'If you chose to start a business instead of a job, would parents support it?', trait: 'Support', scale: 5 },

  // Row 10: Vocational (Chef / Culinary Arts)
  { id: 78, text: 'How interested are you in cooking and culinary arts?', trait: 'Interest', scale: 5 },
  { id: 79, text: 'How much prestige do you attribute to a Chef profession?', trait: 'Prestige', scale: 5 },
  { id: 80, text: 'If you chose to be a Chef, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 11: Media (Journalist / News Anchor)
  { id: 81, text: 'How interested are you in reporting and media production?', trait: 'Interest', scale: 5 },
  { id: 82, text: 'How much influence/prestige do you attribute to Journalists?', trait: 'Prestige', scale: 5 },
  { id: 83, text: 'If you chose Media/Journalism, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 12: Defence (Armed Forces)
  { id: 84, text: 'How interested are you in serving in the military?', trait: 'Interest', scale: 5 },
  { id: 85, text: 'How much patriotism/prestige is associated with Defence?', trait: 'Prestige', scale: 5 },
  { id: 86, text: 'If you chose the Defence services, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 13: Commerce (Investment Banker)
  { id: 87, text: 'How interested are you in stock markets and high finance?', trait: 'Interest', scale: 5 },
  { id: 88, text: 'How much prestige/status do you attribute to high finance?', trait: 'Prestige', scale: 5 },
  { id: 89, text: 'If you chose Investment Banking, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 14: Aviation (Commercial Pilot)
  { id: 90, text: 'How interested are you in flying and aviation?', trait: 'Interest', scale: 5 },
  { id: 91, text: 'How much glamour/prestige is attributed to being a Pilot?', trait: 'Prestige', scale: 5 },
  { id: 92, text: 'If you chose to be a Pilot, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 15: Education (Professor / Academic Researcher)
  { id: 93, text: 'How interested are you in teaching and deep research?', trait: 'Interest', scale: 5 },
  { id: 94, text: 'How much respect does society give to Professors?', trait: 'Prestige', scale: 5 },
  { id: 95, text: 'If you chose to go into Academia/PhD, how much would parents support it?', trait: 'Support', scale: 5 },

  // Row 16: Creative (Fashion Designer)
  { id: 96, text: 'How interested are you in clothing, trends, and fashion?', trait: 'Interest', scale: 5 },
  { id: 97, text: 'How much prestige do you attribute to the Fashion Industry?', trait: 'Prestige', scale: 5 },
  { id: 98, text: 'If you chose Fashion Design, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 17: Tech (Game Developer / E-Sports)
  { id: 99, text: 'How interested are you in gaming mechanics and coding?', trait: 'Interest', scale: 5 },
  { id: 100, text: 'How much value does society place on Gaming careers?', trait: 'Prestige', scale: 5 },
  { id: 101, text: 'If you chose Game Development, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 18: Social (Social Worker / NGO Management)
  { id: 102, text: 'How interested are you in community service and social impact?', trait: 'Interest', scale: 5 },
  { id: 103, text: 'How much prestige do you attribute to social work?', trait: 'Prestige', scale: 5 },
  { id: 104, text: 'If you chose Social Work as a full-time career, would parents support it?', trait: 'Support', scale: 5 },

  // Row 19: Architecture (Architect)
  { id: 105, text: 'How interested are you in designing buildings and spaces?', trait: 'Interest', scale: 5 },
  { id: 106, text: 'How much prestige is attributed to Architecture?', trait: 'Prestige', scale: 5 },
  { id: 107, text: 'If you chose Architecture, how much would your parents support it?', trait: 'Support', scale: 5 },

  // Row 20: Science (Biotechnologist / Researcher)
  { id: 108, text: 'How interested are you in lab research and genetics?', trait: 'Interest', scale: 5 },
  { id: 109, text: 'How much respect does society give to scientists?', trait: 'Prestige', scale: 5 },
  { id: 110, text: 'If you chose a career in Pure Sciences, how much would parents support it?', trait: 'Support', scale: 5 }

];

// Add these to constants.js
export const QUALIFICATIONS = [
  'M.A. Psychology',
  'M.Sc. Psychology',
  'M.Phil. Psychology',
  'Ph.D. Psychology',
  'M.A. Clinical Psychology',
  'M.Sc. Counseling Psychology'
];

export const SPECIALIZATIONS = [
  'Career Mentorship',
  'Academic Guidance',
  'Mental Health',
  'Study Abroad',
  'Competitive Exams',
  'Skill Development',
  'Clinical Psychology',
  'Educational Psychology'
];


