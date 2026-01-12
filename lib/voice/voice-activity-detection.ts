/**
 * Voice Activity Detection (VAD) for continuous conversation
 * Detects when user stops speaking to automatically send message
 */

export interface VADConfig {
  silenceThreshold: number; // Volume threshold to consider as silence (0-255)
  silenceDuration: number;  // How long silence before considering speech ended (ms)
  minSpeechDuration: number; // Minimum speech duration to process (ms)
}

const DEFAULT_CONFIG: VADConfig = {
  silenceThreshold: 25,
  silenceDuration: 1500, // 1.5 seconds of silence
  minSpeechDuration: 500, // Min 0.5 seconds of speech
};

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  
  private isSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private lastSoundTime: number = 0;
  
  private config: VADConfig;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onVolumeChange?: (volume: number) => void;

  constructor(config: Partial<VADConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize audio context and analyzer
   */
  async initialize(stream: MediaStream): Promise<void> {
    this.stream = stream;
    
    // Create audio context
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    
    // Create and configure analyzer
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    source.connect(this.analyser);
    
    // Create data array for frequency analysis
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    console.log('VAD initialized');
  }

  /**
   * Start monitoring voice activity
   */
  start(callbacks: {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onVolumeChange?: (volume: number) => void;
  }): void {
    this.onSpeechStart = callbacks.onSpeechStart;
    this.onSpeechEnd = callbacks.onSpeechEnd;
    this.onVolumeChange = callbacks.onVolumeChange;
    
    this.monitor();
    console.log('VAD monitoring started');
  }

  /**
   * Monitor audio levels and detect speech
   */
  private monitor(): void {
    if (!this.analyser || !this.dataArray) return;

    // Get current volume level
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume
    const average = Array.from(this.dataArray).reduce((a, b) => a + b, 0) / this.dataArray.length;
    
    // Notify volume change
    if (this.onVolumeChange) {
      this.onVolumeChange(average);
    }
    
    const now = Date.now();
    const isSoundDetected = average > this.config.silenceThreshold;
    
    if (isSoundDetected) {
      this.lastSoundTime = now;
      
      // Speech just started
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        
        if (this.onSpeechStart) {
          this.onSpeechStart();
        }
        
        console.log('Speech started');
      }
    } else {
      // Check if silence has lasted long enough
      const silenceDuration = now - this.lastSoundTime;
      
      if (this.isSpeaking && silenceDuration > this.config.silenceDuration) {
        const speechDuration = now - this.speechStartTime;
        
        // Only trigger end if speech was long enough
        if (speechDuration > this.config.minSpeechDuration) {
          this.isSpeaking = false;
          
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
          
          console.log(`Speech ended (duration: ${speechDuration}ms)`);
        } else {
          // Speech was too short, reset
          this.isSpeaking = false;
          console.log('Speech too short, ignoring');
        }
      }
    }
    
    // Continue monitoring
    this.animationFrameId = requestAnimationFrame(() => this.monitor());
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.isSpeaking = false;
    console.log('VAD monitoring stopped');
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    
    console.log('VAD cleaned up');
  }

  /**
   * Check if currently detecting speech
   */
  get isDetectingSpeech(): boolean {
    return this.isSpeaking;
  }
}
