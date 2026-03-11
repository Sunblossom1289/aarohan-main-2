// routes/students.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { verifyToken, requireRole, requireOwnerOrRole } = require('../middleware/auth');

const Student = require('../models/Student');
const TestResult = require('../models/TestResult');
const TestSession = require('../models/TestSession');
// Sheet sync moved to cron job — no longer called inline
// const { syncStudentToSheet } = require('../middleware/sheetsSync');
const { sendOtpEmail } = require('../services/emailService');

/**
 * ✅ NEW: Registration Step-1 (from BannerPage "Start Your Journey")
 * Creates the student account ONLY if phone is not already registered.
 *
 * Expected body (example):
 * {
 * firstName, middleName, lastName,
 * school, standard,
 * phone, email,
 * dateOfBirth, age
 * }
 */
router.post('/register-step1', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      school,
      standard,
      phone,
      email,
      dateOfBirth,
      age
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Basic phone validation (optional but helpful)
    const phoneStr = String(phone).trim();
    if (!/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit phone number required' });
    }

    // Do not allow re-register
    const existing = await Student.findOne({ phone: phoneStr });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Phone already registered. Please login.'
      });
    }

    // Name
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

    // Standard/grade mapping (your schema uses grade as Number)
    const parsedGrade = standard !== undefined && standard !== null && String(standard).trim() !== ''
      ? Number(String(standard).replace(/\D/g, '')) || undefined
      : undefined;

    // Age as number
    const parsedAge =
      age !== undefined && age !== null && String(age).trim() !== '' ? Number(age) : undefined;

    // DOB normalization (store as Date)
    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (dateOfBirth && Number.isNaN(dob.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid dateOfBirth' });
    }

    // Create student
    const student = await Student.create({
      phone: phoneStr,
      name: fullName || undefined,
      email: email || undefined,
      school: school || undefined,
      grade: parsedGrade,
      age: parsedAge,
      dateOfBirth: dob,
      profileCompleted: false,
      registrationStep: 1,
      counselingCredits: 0,
      testCredits: 0
    });

    return res.json({
      success: true,
      student,
      message: 'Registration step 1 completed. Please login to continue.'
    });
  } catch (error) {
    console.error('register-step1 error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
});

// ============================================================
// EMAIL OTP VERIFICATION
// ============================================================

/**
 * Send OTP to student's email for verification
 */
router.post('/:id/send-otp', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // If the student already verified THIS exact email, skip
    if (student.emailVerified && student.email === email) {
      return res.json({ success: true, alreadyVerified: true, message: 'Email already verified' });
    }

    // Generate 6-digit OTP using cryptographically secure random
    const otp = String(crypto.randomInt(100000, 999999));
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to student record (also update email in case it changed)
    student.email = email;
    student.emailOtp = otp;
    student.emailOtpExpiry = expiry;
    student.emailVerified = false; // Reset verification since email may have changed
    await student.save();

    // Send email
    await sendOtpEmail(email, otp, student.name);

    return res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * Verify the OTP entered by the student
 */
router.post('/:id/verify-otp', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, error: 'OTP is required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Check expiry
    if (!student.emailOtpExpiry || new Date() > student.emailOtpExpiry) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP match
    if (student.emailOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    // Mark verified & clear OTP
    student.emailVerified = true;
    student.emailOtp = undefined;
    student.emailOtpExpiry = undefined;
    await student.save();

    return res.json({ success: true, message: 'Email verified successfully!', emailVerified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
});

// Get all students (admin/counselor only)
router.get('/', verifyToken, requireRole('admin', 'counselor'), async (req, res) => {
  try {
    const students = await Student.find().populate('assignedCounselor', 'name district');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single student (owner or admin/counselor)
router.get('/:id', verifyToken, requireOwnerOrRole('admin', 'counselor'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedCounselor')
      .populate('lastAptitudeResult')
      .populate('lastPersonalityResult')
      .populate('lastInterestResult')


    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ✅ UPDATED: Profile update should NOT always force profileCompleted=true
 * because you want users to edit profile anytime.
 *
 * - If frontend explicitly sends profileCompleted, respect it.
 * - Otherwise keep existing value, OR set true only if critical fields exist.
 */
router.put('/:id/profile', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      'name', 'email', 'school', 'grade', 'age', 'gender', 'dateOfBirth',
      'district', 'dreamCareer', 'parentName', 'parentPhone', 'parentEmail',
      'parentOccupation', 'academicPercentage', 'academicStream', 'subjects',
      'profileCompleted'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Optional auto-complete logic:
    // If DOB exists in payload, store it.
    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      if (Number.isNaN(dob.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid dateOfBirth' });
      }
      updateData.dateOfBirth = dob;
    }

    // If client did not send profileCompleted, compute a reasonable value:
    // (You can adjust required fields anytime)
    if (typeof updateData.profileCompleted === 'undefined') {
      const existing = await Student.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      const next = { ...existing.toObject(), ...updateData };

      const hasBasics =
        !!next.name &&
        !!next.phone &&
        !!next.school &&
        (next.grade !== undefined && next.grade !== null && String(next.grade).trim() !== '') &&
        !!next.dateOfBirth &&
        !!next.emailVerified;

      updateData.profileCompleted = !!hasBasics;

      // Also bump registrationStep if they completed profile basics
      if (updateData.profileCompleted) {
        updateData.registrationStep = Math.max(Number(next.registrationStep || 1), 2);
      }
    }

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Frontend expects `user` here (your AppContext uses result.user)
    res.json({ success: true, user: student });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update test results (legacy/manual)
router.put('/:id/test/:testType', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { testType } = req.params;
    const { status, answers, score, dimensionScores } = req.body;

    const updateData = { [`${testType}Status`]: status };

    if (status === 'completed') {
      updateData[`${testType}Results`] = {
        answers,
        score,
        dimensionScores,
        completedAt: new Date()
      };
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign counselor (admin/counselor only)
router.put('/:id/assign-counselor', verifyToken, requireRole('admin', 'counselor'), async (req, res) => {
  try {
    const { counselorId } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { assignedCounselor: counselorId },
      { new: true }
    ).populate('assignedCounselor');

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upgrade program (admin only)
router.put('/:id/upgrade', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { program, counselingCredits, testCredits } = req.body;

    const updateFields = {};
    if (program !== undefined) updateFields.program = program;
    if (counselingCredits !== undefined) updateFields.counselingCredits = counselingCredits;
    if (testCredits !== undefined) updateFields.testCredits = testCredits;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ✅ ENHANCED: Adaptive Aptitude Test Completion with Comprehensive Analytics
 * Saves all detailed tracking data for analysis purposes
 */
// Enhanced adaptive aptitude test completion
// Saves all detailed tracking data
router.post('/:id/test/aptitude/complete', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ DEBUG: Log what we received
    console.log('========== APTITUDE COMPLETION DEBUG ==========');
    console.log('Student ID:', id);
    console.log('Body keys:', Object.keys(req.body));
    console.log('questionsLog length:', req.body.questionsLog?.length);
    console.log('answers length:', req.body.answers?.length);
    
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // ✅ STEP 1: Get data from request body OR from TestSession
    let { answers, questionsLog, blockHistory, categoryAnalysis, summary, timeTaken, completedAt } = req.body;
    
    // If questionsLog is empty/missing, try to get from TestSession
    if (!questionsLog || questionsLog.length === 0) {
      console.log('⚠️ No questionsLog in request body, checking TestSession...');
      
      const testSession = await TestSession.findOne({ 
        userId: id,
        testType: 'aptitude'
      }).sort({ lastUpdated: -1 });
      
      if (testSession) {
        console.log('✅ Found TestSession with', testSession.answers?.length, 'answers');
        
        // Use TestSession data
        questionsLog = testSession.answers || [];
        blockHistory = testSession.blockHistory || [];
        
        // Calculate categoryAnalysis from categoryState
        if (testSession.categoryState) {
          categoryAnalysis = Object.entries(testSession.categoryState).map(([category, state]) => ({
            category,
            total: state.count || 0,
            correct: state.correct || 0,
            accuracy: state.count > 0 ? ((state.correct / state.count) * 100).toFixed(2) : 0
          }));
        }
        
        // Calculate summary from questionsLog
        const totalQuestions = questionsLog.length;
        const correctAnswers = questionsLog.filter(q => q.isCorrect).length;
        const overallAccuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : 0;
        
        summary = {
          totalQuestions,
          correctAnswers,
          overallAccuracy,
          categoriesCompleted: Object.keys(testSession.categoryState || {}).length,
          ...(summary || {})
        };
        
        // Simple answers array (just the selected indices)
        answers = questionsLog.map(q => q.selectedAnswer ?? -1);
        
        console.log('✅ Reconstructed data from TestSession:', {
          questionsCount: questionsLog.length,
          categoriesCount: categoryAnalysis?.length,
          overallAccuracy: summary.overallAccuracy
        });
      } else {
        console.log('❌ No TestSession found for this user');
      }
    }

    // ✅ STEP 2: Format questions for TestResult
    const formattedQuestions = (questionsLog || []).map((q, idx) => ({
      index: q.index ?? idx,
      questionId: q.questionId,
      text: q.questionText || q.text,
      answer: {
        selectedIndex: q.selectedAnswer ?? q.answer?.selectedIndex,
        selectedText: q.selectedAnswerText ?? q.answer?.selectedText
      },
      isCorrect: q.isCorrect,
      dimension: q.dimension,
      difficulty: q.difficulty,
      timestamp: q.timestamp
    }));

    // ✅ STEP 3: Build aptitude scores from categoryAnalysis
    const aptitudeScores = {};
    if (Array.isArray(categoryAnalysis)) {
      categoryAnalysis.forEach(cat => {
        if (cat?.category) {
          aptitudeScores[cat.category] = parseFloat(cat.accuracy || 0);
        }
      });
    }

    // ✅ STEP 4: Calculate overall score properly
    // If dimension scores exist, calculate average; otherwise use overallAccuracy
    let totalAptitudeScore = 0;
    const dimensionValues = Object.values(aptitudeScores).filter(v => typeof v === 'number' && !isNaN(v));
    
    if (dimensionValues.length > 0) {
      // Calculate average of dimension scores
      totalAptitudeScore = dimensionValues.reduce((a, b) => a + b, 0) / dimensionValues.length;
    } else if (summary?.overallAccuracy) {
      totalAptitudeScore = parseFloat(summary.overallAccuracy) || 0;
    } else if (summary?.totalAptitudeScore) {
      totalAptitudeScore = parseFloat(summary.totalAptitudeScore) || 0;
    } else {
      // Fallback: calculate from questions
      const totalQuestions = formattedQuestions.length;
      const correctAnswers = formattedQuestions.filter(q => q.isCorrect).length;
      totalAptitudeScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    }
    
    // Round to 2 decimal places
    totalAptitudeScore = Math.round(totalAptitudeScore * 100) / 100;

    // ✅ STEP 5: Create TestResult
    const testResult = await TestResult.create({
      student: student._id,
      testType: 'aptitude',
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      timeTaken: timeTaken || 0,
      questions: formattedQuestions,
      summary: {
        totalAptitudeScore: totalAptitudeScore,
        aptitudeScores: aptitudeScores,
        totalQuestions: summary?.totalQuestions || formattedQuestions.length,
        correctAnswers: summary?.correctAnswers || formattedQuestions.filter(q => q.isCorrect).length,
        difficultyDistribution: summary?.difficultyDistribution || {},
        adaptiveMetrics: {
          finalDifficultyReached: summary?.finalDifficultyReached || 'Medium',
          averageTimePerQuestion: parseFloat(summary?.averageTimePerQuestion || 0),
          categoriesCompleted: summary?.categoriesCompleted || Object.keys(aptitudeScores).length
        },
        blockHistory: blockHistory
      }
    });

    console.log('✅ Created TestResult:', testResult._id);
    console.log('   - Questions saved:', testResult.questions.length);
    console.log('   - Score:', testResult.summary.totalAptitudeScore);
    console.log('   - Dimension scores:', testResult.summary.aptitudeScores);

    // ✅ STEP 6: Update Student Profile
    student.aptitudeStatus = 'completed';
    student.lastAptitudeResult = testResult._id;
    
    const simpleAnswers = Array.isArray(answers) ? 
      answers.map(a => (typeof a === 'number' && !isNaN(a)) ? a : -1) : [];
    
    student.aptitudeResults = {
      answers: simpleAnswers,
      score: totalAptitudeScore,
      dimensionScores: aptitudeScores,
      completedAt: completedAt ? new Date(completedAt) : new Date()
    };
    
    await student.save();

    // ✅ STEP 7: Optionally mark TestSession as completed
    await TestSession.findOneAndUpdate(
      { userId: id, testType: 'aptitude' },
      { status: 'Completed' }
    );

    console.log('===============================================');

    return res.json({ 
      success: true, 
      student, 
      result: testResult,
      message: 'Aptitude test saved successfully' 
    });

  } catch (error) {
    console.error('❌ Aptitude test save error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// routes/students.js

// ✅ NEW ROUTE: Handle the Unified Test Submission
// This expects the specific structure sent by your UnifiedTestPlayer
router.post('/:id/test/unified/complete', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    // The player sends: { aptitude, personality, interest: { partA, partB } }
    const { aptitude, personality, interest, completedAt } = req.body;

    console.log(`📥 Received Unified Submission for Student: ${id}`);

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // 1. SAVE INTEREST DATA (The part that changed)
    if (interest) {
        student.interestStatus = 'completed';
        student.interestResults = {
            // Part A goes to 'answers'
            answers: interest.partA || [], 
            // Part B goes to new 'careerReality' field
            careerReality: interest.partB || [], 
            completedAt: completedAt || new Date()
        };
        
        // (Optional: If you have logic to calculate RIASEC from Part A, do it here)
        // const scores = calculateRIASEC(interest.partA);
        // student.interestResults.categories = scores;
    }

    // 2. SAVE APTITUDE DATA (If present)
    if (aptitude) {
        student.aptitudeStatus = 'completed';
        // Ensure we map the detailed log if available, or just answers
        student.aptitudeResults = {
            answers: aptitude.answers || [],
            score: aptitude.score || 0, // Ensure your player calculates this or backend does
            completedAt: completedAt || new Date()
        };
    }

    // 3. SAVE PERSONALITY DATA (If present)
    if (personality) {
        student.personalityStatus = 'completed';
        student.personalityResults = {
            answers: personality.answers || personality || [],
            completedAt: completedAt || new Date()
        };
    }

    await student.save();
    console.log("✅ Unified Data Saved Successfully");

    res.json({ success: true, student });

  } catch (error) {
    console.error('❌ Save Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Generic test completion endpoint (personality, interest, etc.)
 * ✅ FIXED: Properly saves personality and interest results to Student document
 * with calculated scores for frontend display
 */
router.post('/:userId/test/:testType/complete', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
    try {
        const { userId, testType } = req.params;
        const testData = req.body;

        console.log('📥 Received test data:', {
            userId,
            testType,
            hasQuestions: !!testData.questions,
            questionCount: testData.questions?.length,
            hasSummary: !!testData.summary
        });

        // ✅ Validate required fields
        if (!testData.student || !testData.questions) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: student or questions'
            });
        }

        // ✅ Save to TestResult collection
        const testResult = new TestResult({
            student: testData.student,
            testType: testData.testType,
            completedAt: testData.completedAt,
            timeTaken: testData.timeTaken,
            questions: testData.questions,
            summary: testData.summary,
            violations: testData.violations || []
        });

        await testResult.save();

        // ✅ Build the update object for Student document
        const studentUpdate = {
            [`${testType}Status`]: 'completed',
            [`${testType}CompletedAt`]: new Date(),
            [`last${testType.charAt(0).toUpperCase() + testType.slice(1)}Result`]: testResult._id
        };

        // ✅ FIX: Properly save personality results with answers and calculated traits
        if (testType === 'personality') {
            // Extract raw answers from questions array
            const rawAnswers = testData.questions.map(q => {
                if (q.answer && typeof q.answer === 'object') {
                    return q.answer.selectedIndex || q.answer;
                }
                return typeof q.answer === 'number' ? q.answer : null;
            }).filter(a => a !== null);
            
            // Calculate OCEAN traits from answers
            const oceanTraits = calculateOCEANScores(rawAnswers);
            
            studentUpdate.personalityResults = {
                answers: rawAnswers,
                traits: oceanTraits,
                completedAt: new Date()
            };
            
            // Also store in TestResult summary
            testResult.summary = {
                ...testResult.summary,
                oceanScores: oceanTraits
            };
            await testResult.save();
            
            console.log('✅ Personality results calculated:', {
                answersCount: rawAnswers.length,
                traits: Object.keys(oceanTraits)
            });
        }

        // ✅ FIX: Properly save interest results with all calculated data
        if (testType === 'interest') {
            // Extract raw answers from questions array
            const rawAnswers = testData.questions.map(q => {
                if (q.answer && typeof q.answer === 'object') {
                    return q.answer.selectedIndex || q.answer;
                }
                return typeof q.answer === 'number' ? q.answer : null;
            }).filter(a => a !== null);
            
            // Use summary data from frontend if available
            const summary = testData.summary || {};
            
            studentUpdate.interestResults = {
                answers: rawAnswers,
                topInterests: summary.topInterests || [],
                categories: summary.categoryScores || summary.interestScores || {},
                categoryScores: summary.categoryScores || summary.interestScores || {},
                traitScores: summary.traitScores || {},
                careerScores: summary.careerScores || {},
                completedAt: new Date()
            };
            
            // Ensure TestResult also has the summary data
            testResult.summary = {
                ...testResult.summary,
                topInterests: summary.topInterests || [],
                interestScores: summary.categoryScores || summary.interestScores || {},
                categoryScores: summary.categoryScores || summary.interestScores || {},
                traitScores: summary.traitScores || {},
                careerScores: summary.careerScores || {}
            };
            await testResult.save();
            
            console.log('✅ Interest results saved:', {
                answersCount: rawAnswers.length,
                topInterests: summary.topInterests?.length || 0,
                categoriesCount: Object.keys(summary.categoryScores || {}).length
            });
        }

        // ✅ FIX: Properly save aptitude score
        if (testType === 'aptitude') {
            const summary = testData.summary || {};
            const dimensionScores = summary.aptitudeScores || {};
            
            // Calculate overall score from dimension scores if not provided
            let totalScore = summary.totalAptitudeScore || 0;
            if (!totalScore && Object.keys(dimensionScores).length > 0) {
                const scores = Object.values(dimensionScores).filter(s => typeof s === 'number');
                totalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            }
            
            studentUpdate.aptitudeResults = {
                answers: testData.questions.map(q => q.answer?.selectedIndex ?? -1),
                score: Math.round(totalScore * 100) / 100,
                dimensionScores: dimensionScores,
                completedAt: new Date()
            };
            studentUpdate.aptitudeScore = Math.round(totalScore * 100) / 100;
        }

        // ✅ Update student document
        const student = await Student.findByIdAndUpdate(
            userId,
            studentUpdate,
            { new: true }
        );

        console.log('✅ Test saved successfully:', testResult._id);
        console.log('✅ Student updated:', student?._id);

        res.json({
            success: true,
            testResult: testResult._id,
            student: student
        });

    } catch (error) {
        console.error('❌ Error saving test:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/test/save-progress
router.post('/save-progress', verifyToken, async (req, res) => {
  try {
    // Use userId from JWT token, not from request body
    const userId = req.user.userId;
    const { answers, blockHistory, categoryState } = req.body;
    
    await TestSession.findOneAndUpdate(
      { userId },
      { 
        userId,
        answers,
        blockHistory,
        categoryState,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper function to calculate OCEAN personality scores
 * (Kept for reference, even if unused in generic route)
 */
function calculateOCEANScores(answers) {
  const getTraitLevel = (score) => {
    if (score >= 32) return 'Very High';
    if (score >= 24) return 'High';
    if (score >= 16) return 'Moderate';
    if (score >= 8) return 'Low';
    return 'Very Low';
  };

  const cleanAnswers = (answers || []).map((a) => Number(a) || 0);

  const O = cleanAnswers.slice(0, 8).reduce((s, v) => s + v, 0);
  const C = cleanAnswers.slice(8, 16).reduce((s, v) => s + v, 0);
  const E = cleanAnswers.slice(16, 24).reduce((s, v) => s + v, 0);
  const A = cleanAnswers.slice(24, 32).reduce((s, v) => s + v, 0);
  const N = cleanAnswers.slice(32, 40).reduce((s, v) => s + v, 0);

  return {
    Openness: { score: O, level: getTraitLevel(O), percentage: Math.round((O / 40) * 100) },
    Conscientiousness: { score: C, level: getTraitLevel(C), percentage: Math.round((C / 40) * 100) },
    Extraversion: { score: E, level: getTraitLevel(E), percentage: Math.round((E / 40) * 100) },
    Agreeableness: { score: A, level: getTraitLevel(A), percentage: Math.round((A / 40) * 100) },
    Neuroticism: { score: N, level: getTraitLevel(N), percentage: Math.round((N / 40) * 100) }
  };
}

module.exports = router;