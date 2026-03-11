// backend/services/transcriptionService.js
// Transcribe audio using Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Transcribe an audio buffer using Gemini.
 * @param {Buffer} audioBuffer - Raw audio data (webm/ogg from browser MediaRecorder)
 * @param {string} mimeType - e.g. "audio/webm" or "audio/ogg"
 * @param {object} meta - { studentName, counselorName, date }
 * @returns {string} transcription text
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/webm', meta = {}) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PLACEHOLDER_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const audioBase64 = audioBuffer.toString('base64');

  const prompt = `You are a professional transcription assistant. 
Transcribe the following career mentorship session audio accurately. 
${meta.studentName ? `Student: ${meta.studentName}` : ''}
${meta.counselorName ? `Counselor: ${meta.counselorName}` : ''}
${meta.date ? `Date: ${meta.date}` : ''}

Instructions:
- Transcribe every spoken word as accurately as possible.
- Use speaker labels like "Speaker 1:" and "Speaker 2:" to distinguish participants.
- Include timestamps approximately every 30 seconds in [MM:SS] format if possible.
- Keep filler words minimal but preserve meaning.
- Format the output cleanly with paragraphs for each speaker turn.

Transcribe the audio:`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    },
  ]);

  const response = result.response;
  const transcription = response.text();

  console.log(`✅ Gemini transcription completed (${transcription.length} chars)`);
  return transcription;
}

module.exports = { transcribeAudio };
