// Real, lightweight acoustic analysis of an uploaded audio file, computed entirely
// client-side via the Web Audio API. This is NOT a transcription or ML pipeline —
// there's no Whisper/WavLM here — it's honest signal-level analysis (energy-based
// voice-activity detection), clearly scoped as a proxy rather than pretending to be
// full speech biomarker extraction.

export interface SpeechAnalysisResult {
  durationSec: number;
  pauseRatio: number; // fraction of 30ms windows below the adaptive silence threshold
  activityEventsPerMin: number; // count of silence→speech onsets, normalized per minute
  meanRms: number; // 0-1ish average energy across the whole clip
}

export async function analyzeSpeechFile(file: File): Promise<SpeechAnalysisResult> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channel = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.max(1, Math.floor(sampleRate * 0.03)); // ~30ms windows

    const windows: number[] = [];
    for (let i = 0; i < channel.length; i += windowSize) {
      const end = Math.min(i + windowSize, channel.length);
      let sum = 0;
      for (let j = i; j < end; j++) sum += channel[j] * channel[j];
      windows.push(Math.sqrt(sum / (end - i)));
    }

    const maxRms = Math.max(...windows, 1e-6);
    const threshold = maxRms * 0.12; // adaptive: 12% of the loudest window in the clip
    const silentWindows = windows.filter((w) => w < threshold).length;
    const pauseRatio = windows.length ? silentWindows / windows.length : 0;

    let onsets = 0;
    let wasSilent = true;
    for (const w of windows) {
      const isSilent = w < threshold;
      if (wasSilent && !isSilent) onsets++;
      wasSilent = isSilent;
    }

    const durationSec = audioBuffer.duration;
    const activityEventsPerMin = durationSec > 0 ? onsets / (durationSec / 60) : 0;
    const meanRms = windows.length ? windows.reduce((a, b) => a + b, 0) / windows.length : 0;

    return { durationSec, pauseRatio, activityEventsPerMin, meanRms };
  } finally {
    void ctx.close();
  }
}
