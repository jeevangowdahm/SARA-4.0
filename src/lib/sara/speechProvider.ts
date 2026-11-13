/**
 * SARA 4.0 Voice-First Speech Provider & Finite State Machine
 * Compliant with WCAG 2.2 AA audio guidelines and Section 9.3 Lifecycle requirements:
 * IDLE → REQUESTING_PERMISSION → LISTENING → TRANSCRIBING → REVIEWING → UNDERSTANDING → READY
 */

export type VoiceLifecycleState =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'REVIEWING'
  | 'UNDERSTANDING'
  | 'READY';

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechErrorDetails) => void;
  onEnd?: () => void;
  onStateChange?: (state: VoiceLifecycleState) => void;
}

export interface SpeechErrorDetails {
  code: string;
  message: string;
  isPermissionDenied: boolean;
  canRetry: boolean;
  suggestedAction?: 'type_fallback' | 'grant_permission' | 'check_network' | 'retry';
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

export class SaraSpeechRecognitionService {
  private recognition: any = null;
  private state: VoiceLifecycleState = 'IDLE';
  private currentLocale: string = 'en-IN';
  private callbacks: SpeechRecognitionCallbacks = {};
  private lastCapturedTranscript: string = '';

  constructor(locale: string = 'en-IN') {
    this.currentLocale = locale;
  }

  public setLocale(locale: string) {
    this.currentLocale = locale;
    if (this.recognition) {
      try {
        this.recognition.lang = locale;
      } catch {}
    }
  }

  public getState(): VoiceLifecycleState {
    return this.state;
  }

  public getIsListening(): boolean {
    return this.state === 'LISTENING' || this.state === 'TRANSCRIBING';
  }

  private transition(newState: VoiceLifecycleState) {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  public start(callbacks: SpeechRecognitionCallbacks): boolean {
    this.callbacks = callbacks;

    if (!isSpeechRecognitionSupported()) {
      this.transition('IDLE');
      callbacks.onError?.({
        code: 'unsupported_browser',
        message: 'Voice speech recognition is not supported in this browser. Please use typed input.',
        isPermissionDenied: false,
        canRetry: false,
        suggestedAction: 'type_fallback',
      });
      return false;
    }

    // Stop existing recognition if active
    this.stop();

    this.transition('REQUESTING_PERMISSION');

    try {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLocale;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.transition('LISTENING');
        this.callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        this.transition('TRANSCRIBING');
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        this.lastCapturedTranscript = combined;
        this.callbacks.onResult?.(combined, Boolean(finalTranscript));

        if (finalTranscript) {
          this.transition('REVIEWING');
        }
      };

      this.recognition.onerror = (event: any) => {
        const errCode = event.error || 'unknown_speech_error';
        const isPermission = errCode === 'not-allowed' || errCode === 'service-not-allowed';

        let userMsg = 'An error occurred during voice recognition.';
        let action: SpeechErrorDetails['suggestedAction'] = 'retry';

        if (isPermission) {
          userMsg = 'Microphone permission was denied. Please allow microphone access or use typed input.';
          action = 'type_fallback';
        } else if (errCode === 'no-speech') {
          userMsg = 'No speech was detected. Tap the microphone and speak again.';
          action = 'retry';
        } else if (errCode === 'network') {
          userMsg = 'Network connectivity issue with browser speech service.';
          action = 'check_network';
        }

        this.transition('IDLE');
        this.callbacks.onError?.({
          code: errCode,
          message: userMsg,
          isPermissionDenied: isPermission,
          canRetry: !isPermission,
          suggestedAction: action,
        });
      };

      this.recognition.onend = () => {
        if (this.state !== 'REVIEWING') {
          this.transition('READY');
        }
        this.callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.transition('IDLE');
      callbacks.onError?.({
        code: 'start_failed',
        message: err.message || 'Failed to initialize speech recognition.',
        isPermissionDenied: false,
        canRetry: true,
        suggestedAction: 'retry',
      });
      return false;
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.transition('IDLE');
  }

  public getLastTranscript(): string {
    return this.lastCapturedTranscript;
  }
}

/**
 * Text-to-speech synthesized audio service with full playback controls
 */
export class SaraSpeechSynthesisService {
  private static lastSpokenText: string = '';
  private static lastOptions: any = {};
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static activeRate: number = 1.0;

  public static speak(
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
    }
  ): boolean {
    if (!isSpeechSynthesisSupported()) return false;

    try {
      window.speechSynthesis.cancel();

      this.lastSpokenText = text;
      this.lastOptions = options || {};
      this.activeRate = options?.rate || 1.0;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-IN';
      utterance.rate = this.activeRate;
      utterance.pitch = options?.pitch || 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      return false;
    }
  }

  public static pause() {
    if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public static resume() {
    if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public static repeat() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, this.lastOptions);
    }
  }

  public static slowDown() {
    this.activeRate = Math.max(0.6, this.activeRate - 0.2);
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, { ...this.lastOptions, rate: this.activeRate });
    }
  }

  public static stop() {
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    if (!isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}
