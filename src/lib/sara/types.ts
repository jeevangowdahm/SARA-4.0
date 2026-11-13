/**
 * SARA - Smart Accessible Response Assistant
 * Core Domain Types and Schema Definitions
 */

export type FieldId = 'fullName' | 'age' | 'mobileNumber' | 'location' | 'volunteerReason';

export type FieldType = 'text' | 'number' | 'tel' | 'textarea';

export type FieldVerificationStatus = 'unfilled' | 'needs_review' | 'verified' | 'invalid' | 'missing';

export interface FormFieldDefinition {
  id: FieldId;
  label: string;
  stepIndex: number;
  question: string;
  questionAudioText: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  helperText: string;
  clarificationPrompt: string;
  examples: string[];
}

export type ExtractionMethod = 'deterministic_rule' | 'intent_heuristic' | 'manual_input' | 'clarification';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedField {
  fieldId: FieldId;
  value: string;
  rawTranscript: string;
  extractionMethod: ExtractionMethod;
  confidence: ConfidenceLevel;
  isValid: boolean;
  validationError?: string;
  clarificationNeeded?: boolean;
  clarificationReason?: string;
  verifiedByUser?: boolean;
  timestamp: number;
}

export type SenseStage = 'LISTEN' | 'UNDERSTAND' | 'MAP' | 'VALIDATE' | 'CONFIRM';

export interface SenseStageState {
  stage: SenseStage;
  status: 'idle' | 'processing' | 'completed' | 'flagged';
  title: string;
  detail: string;
  metric?: string;
}

export interface SaraSensePipelineResult {
  stages: Record<SenseStage, SenseStageState>;
  rawTranscript: string;
  extractedFields: Partial<Record<FieldId, ExtractedField>>;
  unmappedPhrases: string[];
  requiresClarification: boolean;
  clarificationTarget?: {
    fieldId: FieldId;
    reason: string;
    suggestedPrompt: string;
    partialValue?: string;
  };
}

export type VoiceInteractionState =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'processing'
  | 'transcript_ready'
  | 'editing'
  | 'error'
  | 'unsupported';

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'mr' | 'bn' | 'gu';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechLocale: string;
  sampleGreeting: string;
  sampleAudioText: string;
  supportedByBrowserSpeech?: boolean;
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  spokenInstructions: boolean;
  speechRate: number; // 0.75, 0.85, 1.0, 1.25
  voicePersona: 'warm' | 'articulated' | 'calm';
  microphoneSensitivity: 'gentle' | 'normal' | 'crisp';
  singleSwitchNavigation: boolean;
}

export type ScreenId =
  | 'cinematic_landing'
  | 'dashboard'
  | 'profile'
  | 'vault'
  | 'history'
  | 'privacy'
  | '01_welcome'
  | '02_language'
  | '03_form'
  | '04_sense'
  | '05_clarification'
  | '06_review'
  | '07_completion'
  | '08_accessibility';

export interface CompletedRegistration {
  referenceId: string;
  completedAt: string;
  data: Record<FieldId, string>;
  isDemoLocalOnly: boolean;
  provenance: Record<FieldId, {
    method: ExtractionMethod;
    confidence: ConfidenceLevel;
    rawTranscript: string;
  }>;
}

