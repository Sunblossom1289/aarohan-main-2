import bank from '../data/aptitude_questions_bank.json';

/**
 * Fisher-Yates shuffle algorithm with immutability
 * @param {Array} arr - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffle(arr) {
  if (!Array.isArray(arr)) return [];
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Validate question structure and content
 * @param {Object} q - Question object
 * @returns {boolean} Whether question is valid
 */
function isValidQuestion(q) {
  if (!q || typeof q !== 'object') return false;

  // Allow both string and numeric IDs
  if (q.id === undefined || q.id === null) return false;
  if (typeof q.id !== 'string' && typeof q.id !== 'number') return false;

  if (!q.text || typeof q.text !== 'string' || q.text.trim() === '') return false;
  if (typeof q.correct !== 'number' || q.correct < 0) return false;

  if (!Array.isArray(q.options) || q.options.length < 2) return false;
  for (const opt of q.options) {
    if (typeof opt !== 'string' || opt.trim() === '') return false;
  }

  if (!['Low', 'Mid', 'High'].includes(q.difficulty)) return false;
  if (q.dimension && typeof q.dimension !== 'string') return false;

  return true;
}

/**
 * Get all mandatory questions (questions with images that must appear in every test)
 * @returns {Array} Array of mandatory question objects
 */
export function getMandatoryQuestions() {
  return bank.questions.filter(q => q.mandatory === true && isValidQuestion(q));
}

/**
 * Get mandatory question IDs
 * @returns {number[]} Array of mandatory question IDs
 */
export function getMandatoryQuestionIds() {
  return getMandatoryQuestions().map(q => q.id);
}

/**
 * Interleave questions across dimensions (round-robin) so no "blocks" appear.
 * This still keeps overall selection balanced by dimension.
 */
function interleaveByDimension(byDimMap, count) {
  const dims = shuffle([...byDimMap.keys()]);
  const pools = new Map();
  dims.forEach((d) => pools.set(d, shuffle(byDimMap.get(d) || [])));

  const out = [];
  while (out.length < count) {
    let pushedThisRound = false;

    for (const dim of dims) {
      if (out.length >= count) break;
      const pool = pools.get(dim);
      if (pool && pool.length) {
        out.push(pool.shift());
        pushedThisRound = true;
      }
    }

    // nothing left in any pool
    if (!pushedThisRound) break;
  }

  return out;
}


/**
 * Fallback difficulty mapping for grade-based selection
 * @param {number|string} grade - Student grade level
 * @returns {string} Mapped difficulty ('Low', 'Mid', 'High')
 */
function gradeToDifficulty(grade) {
  const g = Number(grade);
  if (isNaN(g)) return 'Mid';

  if (g >= 6 && g <= 8) return 'Low';
  if (g >= 9 && g <= 10) return 'Mid';
  if (g >= 11 && g <= 12) return 'High';
  return 'Mid';
}

/**
 * Get all unique valid dimensions from question bank
 * @returns {string[]} Sorted array of dimension names
 */
export function getAvailableDimensions() {
  const dims = new Set();
  for (const q of bank.questions) {
    if (q.dimension && typeof q.dimension === 'string') {
      dims.add(q.dimension.trim());
    }
  }
  return [...dims].sort();
}

export function pickAdaptiveQuestions(difficulty, dimension = null, count = 3, excludeIds = []) {
  // ✅ CRITICAL FIX: Validate and map difficulty
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    console.warn('❌ Invalid difficulty:', difficulty);
    console.log('ℹ️ Available difficulties: Easy, Medium, Hard');
    difficulty = 'Medium'; // Safe default
  }

  const bankDifficulty = mapDifficultyToBank(difficulty);
  console.log(`🎯 Picker: Converting "${difficulty}" → "${bankDifficulty}"`);

  const excludeSet = new Set(excludeIds);

  // ✅ Filter by mapped difficulty
  let eligible = bank.questions.filter(q => {
    if (q.difficulty !== bankDifficulty) return false; // Strict match
    if (!isValidQuestion(q)) return false;
    if (excludeSet.has(q.id)) return false;
    return true;
  });

  console.log(`📊 Found ${eligible.length} eligible questions for difficulty "${bankDifficulty}"`);

  // ✅ FAILSAFE: If no questions at this difficulty, try Mid level as fallback
  if (eligible.length === 0 && bankDifficulty !== 'Mid') {
    console.warn(`⚠️ No questions at "${bankDifficulty}", falling back to "Mid" difficulty`);
    eligible = bank.questions.filter(q => {
      if (q.difficulty !== 'Mid') return false;
      if (!isValidQuestion(q)) return false;
      if (excludeSet.has(q.id)) return false;
      return true;
    });
    console.log(`📊 Fallback: Found ${eligible.length} eligible questions for difficulty "Mid"`);
  }

  if (eligible.length === 0) {
    console.error(`❌ NO QUESTIONS FOUND even with fallback!`);
    console.log('Available difficulties in bank:', [...new Set(bank.questions.map(q => q.difficulty))]);
    console.log('Sample questions:', bank.questions.slice(0, 3).map(q => ({ id: q.id, difficulty: q.difficulty })));
    return []; // Return empty, don't default!
  }

  // ✅ If dimension is specified, filter further
  if (dimension) {
    const dimensionFiltered = eligible.filter(q => q.dimension === dimension);
    if (dimensionFiltered.length > 0) {
      eligible = dimensionFiltered;
      console.log(`🔍 Filtered to ${eligible.length} questions in dimension "${dimension}"`);
    } else {
      // ✅ FAILSAFE FOR DIMENSION: If no questions for this dimension at current difficulty,
      // try to find questions for this dimension at ANY difficulty
      console.warn(`⚠️ No questions for "${dimension}" at current difficulty. Trying any difficulty...`);
      const anyDifficultyForDimension = bank.questions.filter(q => {
        if (q.dimension !== dimension) return false;
        if (!isValidQuestion(q)) return false;
        if (excludeSet.has(q.id)) return false;
        return true;
      });
      
      if (anyDifficultyForDimension.length > 0) {
        eligible = anyDifficultyForDimension;
        console.log(`✅ Found ${eligible.length} questions for "${dimension}" at mixed difficulties`);
      } else {
        console.warn(`⚠️ No questions for "${dimension}" at ANY difficulty. Using any available.`);
      }
    }
  }

  // ✅ Return shuffled, limited results
  const shuffled = shuffle(eligible);
  const result = shuffled.slice(0, count);

  console.log(`✅ Returning ${result.length} questions:`, result.map(q => ({ id: q.id, difficulty: q.difficulty, dimension: q.dimension })));

  return result;
}

/**
 * ✅ FIXED: Proper mapping of component difficulty to bank difficulty
 */
function mapDifficultyToBank(adaptiveDifficulty) {
  const map = {
    'Easy': 'Low',
    'Medium': 'Mid',
    'Hard': 'High'
  };

  const result = map[adaptiveDifficulty];

  if (!result) {
    console.error(`❌ mapDifficultyToBank: Unknown input "${adaptiveDifficulty}"`);
    console.log('Valid inputs:', Object.keys(map));
    return 'Mid'; // Fallback
  }

  return result;
}


/**
 * Pick questions for grade-based testing with dimension balancing
 * @param {Object} params - Selection parameters
 * @param {number|string} params.grade - Student grade level
 * @param {number} [params.count=50] - Number of questions to return
 * @returns {Array} Array of selected questions
 */
export function pickAptitudeQuestions({ grade, count = 50 }) {
  const difficulty = gradeToDifficulty(grade);
  return pickByDifficulty(difficulty, count);
}

/**
 * Internal helper: Pick questions by bank difficulty level
 * ✅ CHANGE: instead of returning “dimension blocks”, we interleave across dimensions.
 */
function pickByDifficulty(difficulty, count) {
  const eligible = bank.questions.filter(
    (q) => q.difficulty === difficulty && isValidQuestion(q)
  );

  if (eligible.length === 0) {
    console.warn(`No eligible questions found for difficulty: ${difficulty}`);
    return [];
  }

  // Group by dimension
  const byDim = new Map();
  for (const q of eligible) {
    const dim = q.dimension?.trim() || 'Uncategorized';
    if (!byDim.has(dim)) byDim.set(dim, []);
    byDim.get(dim).push(q);
  }

  // Interleave across dimensions so the test “feels mixed”
  const interleaved = interleaveByDimension(byDim, count);

  // Top-up if needed
  if (interleaved.length < count) {
    const pickedIds = new Set(interleaved.map((q) => q.id));
    const remaining = shuffle(eligible).filter((q) => !pickedIds.has(q.id));
    interleaved.push(...remaining.slice(0, count - interleaved.length));
  }

  if (interleaved.length < count) {
    console.warn(
      `Requested ${count} questions but only found ${interleaved.length} for difficulty: ${difficulty}`
    );
  }

  // Final shuffle to avoid any visible round-robin pattern
  return shuffle(interleaved).slice(0, count);
}
