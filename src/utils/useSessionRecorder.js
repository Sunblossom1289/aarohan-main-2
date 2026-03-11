// src/utils/useSessionRecorder.js
// Stub — recording/transcription removed in favor of plain Google Meet sessions.
// Keep the export signature so existing imports don't break.

export function useSessionRecorder() {
  return {
    isRecording: false,
    status: 'idle',
    transcription: null,
    docUrl: null,
    startRecording: () => {},
    stopAndTranscribe: () => {},
  };
}
