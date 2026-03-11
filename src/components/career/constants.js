export const CAREER_MAP_DATA = {
  archetypes: [
    {
      id: 'wizard',
      name: 'The Wise Wizard',
      description: 'I love solving puzzles and figuring out how things work.',
      strength: 'Aptitude & Logic',
      icon: '🔮',
      color: 'from-blue-600 to-indigo-800',
      imageUrl: 'https://images.unsplash.com/photo-1519076900044-855041830467?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'bard',
      name: 'The Creative Bard',
      description: 'I love telling stories, making art, and expressing new ideas.',
      strength: 'Interest & Creativity',
      icon: '🎨',
      color: 'from-orange-400 to-red-600',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'knight',
      name: 'The Daring Knight',
      description: 'I love building things, taking action, and seeing real-world results.',
      strength: 'Action & Impact',
      icon: '🛡️',
      color: 'from-emerald-400 to-teal-700',
      imageUrl: 'https://images.unsplash.com/photo-1590184439900-47402139638b?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'champion',
      name: 'The People\'s Champion',
      description: 'I love helping people, leading teams, and making a difference.',
      strength: 'Personality & Empathy',
      icon: '🤝',
      color: 'from-yellow-400 to-green-600',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop'
    }
  ],
  clusters: [
    {
      id: 'it-digital',
      name: 'Digital Tech & IT',
      icon: '🏙️',
      description: 'The City-States of Silicon and AI',
      color: 'bg-indigo-600',
      themeImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      buckets: [
        {
          id: 'ai-ml',
          name: 'AI & Machine Learning',
          roles: [
            { id: 'prompt-eng', title: 'Prompt Engineer', startingSalary: '₹6 - ₹10 LPA', seniorSalary: '₹25 - ₹45 LPA+', description: 'Bridge human intent and machine logic.', skills: ['LLM Architecture', 'NLP', 'Python'], educationPath: 'B.Tech CSE / AI Cert', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'bard', relevance:0.7}] },
            { id: 'ml-sci', title: 'ML Scientist', startingSalary: '₹8 - ₹15 LPA', seniorSalary: '₹35 - ₹70 LPA', description: 'Advancing the science of neural networks.', skills: ['Math', 'PyTorch', 'TensorFlow'], educationPath: 'M.Tech / PhD', suitability: [{archetypeId:'wizard', relevance:1.0}] },
            { id: 'ai-ethicist', title: 'AI Ethicist', startingSalary: '₹6 - ₹12 LPA', seniorSalary: '₹25 - ₹50 LPA', description: 'Ensuring AI systems are fair and unbiased.', skills: ['Ethics', 'Social Science', 'AI Policy'], educationPath: 'Humanities/Law with Tech specialization', suitability: [{archetypeId:'champion', relevance:1.0}, {archetypeId:'wizard', relevance:0.6}] }
          ]
        },
        {
          id: 'cybersecurity',
          name: 'Cybersecurity',
          roles: [
            { id: 'cloud-sec', title: 'Cloud Security Specialist', startingSalary: '₹8 - ₹14 LPA', seniorSalary: '₹30 - ₹60 LPA', description: 'Securing cloud-native startups and banks.', skills: ['AWS/Azure Security', 'IAM', 'Encryption'], educationPath: 'B.Tech + CCSP Cert', suitability: [{archetypeId:'knight', relevance:1.0}, {archetypeId:'wizard', relevance:0.9}] },
            { id: 'eth-hack', title: 'Ethical Hacker', startingSalary: '₹5 - ₹10 LPA', seniorSalary: '₹25 - ₹55 LPA', description: 'Testing systems by simulating attacks.', skills: ['Linux', 'Pen-testing', 'Networking'], educationPath: 'CEH / OSCP', suitability: [{archetypeId:'knight', relevance:1.0}] }
          ]
        },
        {
          id: 'data-analytics',
          name: 'Data & Analytics',
          roles: [
            { id: 'data-sci', title: 'Data Scientist', startingSalary: '₹7 - ₹12 LPA', seniorSalary: '₹25 - ₹60 LPA', description: 'Solving complex business problems with data.', skills: ['Python/R', 'Stats', 'SQL'], educationPath: 'B.Sc/M.Sc Stats or CS', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'champion', relevance:0.5}] }
          ]
        }
      ]
    },
    {
      id: 'engineering',
      name: 'Engineering',
      icon: '🏗️',
      description: 'The Kingdom of Construction and Design',
      color: 'bg-slate-700',
      themeImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop",
      buckets: [
        {
          id: 'mech-auto',
          name: 'Mechanical & Auto',
          roles: [
            { id: 'ev-diag', title: 'EV Diagnostics Specialist', startingSalary: '₹3 - ₹6 LPA', seniorSalary: '₹15 - ₹25 LPA', description: 'Backbone of the green mobility movement.', skills: ['Power Electronics', 'Troubleshooting', 'Battery Mgmt'], educationPath: 'Diploma in EV Tech', suitability: [{archetypeId:'knight', relevance:1.0}, {archetypeId:'wizard', relevance:0.8}] },
            { id: 'robot-eng', title: 'Robotics Engineer', startingSalary: '₹6 - ₹12 LPA', seniorSalary: '₹25 - ₹55 LPA+', description: 'Building global-standard production lines.', skills: ['ROS', 'Mechatronics', 'Control Systems'], educationPath: 'B.Tech Robotics', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'knight', relevance:0.9}] }
          ]
        },
        {
          id: 'aero-def',
          name: 'Aerospace & Defense',
          roles: [
            { id: 'rocket-sci', title: 'Rocket Scientist', startingSalary: '₹8 - ₹15 LPA', seniorSalary: '₹35 - ₹80 LPA', description: 'Designing vessels for interplanetary exploration.', skills: ['Propulsion', 'Aerodynamics', 'Orbital Mechanics'], educationPath: 'B.Tech Aerospace (IIST/IIT)', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'knight', relevance:0.7}] }
          ]
        }
      ]
    },
    {
      id: 'finance',
      name: 'Finance & BFSI',
      icon: '💰',
      description: 'The Merchant\'s Port and High Valuations',
      color: 'bg-emerald-600',
      themeImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop",
      buckets: [
        {
          id: 'actuarial-risk',
          name: 'Actuarial & Risk',
          roles: [
            { id: 'actuary', title: 'Actuary', startingSalary: '₹7 - ₹12 LPA', seniorSalary: '₹35 - ₹60 LPA+', description: 'Masters of risk using advanced financial theory.', skills: ['Probability', 'Financial Modeling', 'Risk Assessment'], educationPath: 'B.Sc Math + IAI Exams', suitability: [{archetypeId:'wizard', relevance:1.0}] }
          ]
        },
        {
          id: 'inv-banking',
          name: 'Investment Banking',
          roles: [
            { id: 'ib-analyst', title: 'M&A Advisor', startingSalary: '₹12 - ₹18 LPA', seniorSalary: '₹60 - ₹200 LPA+', description: 'Orchestrating the largest business deals in the world.', skills: ['Valuation', 'Strategy', 'Negotiation'], educationPath: 'MBA Finance / CA', suitability: [{archetypeId:'champion', relevance:1.0}, {archetypeId:'wizard', relevance:0.7}] }
          ]
        }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '⚕️',
      description: 'The Doctor\'s Province and Biological Frontiers',
      color: 'bg-rose-600',
      themeImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      buckets: [
        {
          id: 'rehab-therapy',
          name: 'Rehab & Therapy',
          roles: [
            { id: 'gerontologist', title: 'Gerontologist', startingSalary: '₹3 - ₹8 LPA', seniorSalary: '₹15 - ₹30 LPA', description: 'Essential care for our growing senior population.', skills: ['Geriatric Care', 'Advocacy', 'Empathy'], educationPath: 'M.Sc Psychology / Social Work', suitability: [{archetypeId:'champion', relevance:1.0}, {archetypeId:'wizard', relevance:0.5}] }
          ]
        },
        {
          id: 'pharmacy-rd',
          name: 'Pharmacy & R&D',
          roles: [
            { id: 'bioinfo-analyst', title: 'Bioinformatics Analyst', startingSalary: '₹5 - ₹9 LPA', seniorSalary: '₹22 - ₹50 LPA+', description: 'Intersection of Biology and Big Data.', skills: ['Python/R', 'Genomics', 'Data Mining'], educationPath: 'B.Sc/M.Sc Bioinformatics', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'knight', relevance:0.6}] }
          ]
        }
      ]
    },
    {
      id: 'creative-arts',
      name: 'Creative Arts',
      icon: '🎨',
      description: 'The Artist\'s Haven and Visual Wonders',
      color: 'bg-purple-600',
      themeImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
      buckets: [
        {
          id: 'visual-fine-arts',
          name: 'Visual & Fine Arts',
          roles: [
            { id: 'toy-designer', title: 'Toy Designer', startingSalary: '₹4 - ₹10 LPA', seniorSalary: '₹18 - ₹40 LPA', description: 'Architect of play and child development.', skills: ['Design Thinking', '3D Modeling', 'Child Psychology'], educationPath: 'B.Des (NID/NIFT)', suitability: [{archetypeId:'bard', relevance:1.0}, {archetypeId:'knight', relevance:0.7}] }
          ]
        },
        {
          id: 'digi-prod',
          name: 'Digital Product',
          roles: [
            { id: 'ux-researcher', title: 'UX Researcher', startingSalary: '₹5 - ₹10 LPA', seniorSalary: '₹20 - ₹45 LPA', description: 'Investigating human behavior for digital interaction.', skills: ['User Testing', 'Interaction Design', 'Empathy'], educationPath: 'B.Des / Psychology', suitability: [{archetypeId:'wizard', relevance:0.8}, {archetypeId:'bard', relevance:1.0}] }
          ]
        }
      ]
    },
    {
      id: 'humanities',
      name: 'Humanities',
      icon: '⚖️',
      description: 'The Spires of Policy and Justice',
      color: 'bg-amber-700',
      themeImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
      buckets: [
        {
          id: 'econ-policy',
          name: 'Economics & Policy',
          roles: [
            { id: 'env-econ', title: 'Environmental Economist', startingSalary: '₹5 - ₹15 LPA', seniorSalary: '₹25 - ₹55 LPA', description: 'Quantifying ecological value for climate finance.', skills: ['Quantitative Analysis', 'Policy Impact', 'Sustainability'], educationPath: 'M.A. Economics + PG Env', suitability: [{archetypeId:'wizard', relevance:1.0}, {archetypeId:'champion', relevance:0.9}] }
          ]
        }
      ]
    },
    {
      id: 'public-svc',
      name: 'Public Svc & Ed',
      icon: '📜',
      description: 'The Council of Educators and Leaders',
      color: 'bg-blue-800',
      themeImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
      buckets: [
        {
          id: 'higher-education',
          name: 'Higher Education',
          roles: [
            { id: 'instr-designer', title: 'Instructional Designer', startingSalary: '₹3 - ₹7 LPA', seniorSalary: '₹25 - ₹40 LPA+', description: 'Architect of digital and hybrid learning paths.', skills: ['Pedagogy', 'Articulate Storyline', 'Multimedia'], educationPath: 'B.Ed + ID Cert', suitability: [{archetypeId:'bard', relevance:0.8}, {archetypeId:'champion', relevance:1.0}] }
          ]
        }
      ]
    }
  ]
};
