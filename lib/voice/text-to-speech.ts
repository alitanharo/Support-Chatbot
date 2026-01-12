/**
 * Text-to-Speech using Browser SpeechSynthesis API
 * Provides browser-based text-to-speech functionality
 */

export interface TextToSpeechOptions {
  lang?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Check if text-to-speech is supported
   */
  isSupported(): boolean {
    return this.synth !== null;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Get default English voice
   */
  getDefaultVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    
    // Try to find an English voice
    const englishVoice = voices.find(
      (voice) => voice.lang.startsWith('en-')
    );
    
    return englishVoice || voices[0] || null;
  }

  /**
   * Speak text
   */
  speak(text: string, options: TextToSpeechOptions = {}): void {
    if (!this.synth) {
      options.onError?.('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Set voice if provided, otherwise use default
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      const defaultVoice = this.getDefaultVoice();
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
    }

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(
        `Speech synthesis error: ${event.error}`
      );
    };

    // Store current utterance
    this.currentUtterance = utterance;

    // Speak
    try {
      this.synth.speak(utterance);
    } catch (error) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(
        error instanceof Error ? error.message : 'Failed to speak text'
      );
    }
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Pause speaking
   */
  pause(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume speaking
   */
  resume(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

// Export singleton instance
export const textToSpeech = new TextToSpeechService();
