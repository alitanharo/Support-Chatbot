/**
 * Speech-to-Text using Web Speech API
 * Provides browser-based voice recognition
 */

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface SpeechToTextOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
}

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    // Check if browser supports Web Speech API
    if (typeof window === 'undefined') {
      return; // Server-side, skip initialization
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start listening for speech
   */
  startListening(options: SpeechToTextOptions): void {
    if (!this.recognition) {
      options.onError('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    // Configure recognition
    this.recognition.continuous = false; // Stop after detecting speech
    this.recognition.interimResults = true; // Get interim results
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      options.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      options.onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      options.onError(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      options.onError(error instanceof Error ? error.message : 'Failed to start speech recognition');
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

// Export singleton instance
export const speechToText = new SpeechToTextService();
