/**
 * SARA 3.0 Multi-Model AI Architecture & Task Types
 */

export type ModelTask =
  | 'language_detection'
  | 'speech_transcription'
  | 'translation'
  | 'intent_recognition'
  | 'fact_extraction'
  | 'field_matching'
  | 'question_explanation'
  | 'error_explanation'
  | 'document_extraction'
  | 'conversation_assistance'
  | 'read_aloud';

export type FactCategory =
  | 'full_name'
  | 'age'
  | 'date_of_birth'
  | 'phone'
  | 'email'
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'college'
  | 'course'
  | 'occupation'
  | 'income'
  | 'education'
  | 'reason'
  | 'other';

export interface ExtractedFact {
  category: FactCategory;
  value: string;
  sourceTranscript: string;
  language: string;
  confidence: number;
  requiresConfirmation: boolean;
}

export type ModelProviderName = 'local_deterministic' | 'gemini' | 'openai' | 'anthropic' | 'bhashini';

export interface TaskRoutingConfig {
  task: ModelTask;
  primaryProvider: ModelProviderName;
  fallbackProvider: ModelProviderName;
  timeoutMs: number;
}

export interface ModelResponse<T> {
  success: boolean;
  data?: T;
  providerUsed: ModelProviderName;
  latencyMs: number;
  error?: string;
}

export interface QuestionExplanation {
  fieldId: string;
  fieldLabel: string;
  simplifiedExplanation: string;
  everydayExample: string;
  commonMistakesToAvoid?: string;
  suggestedInputFormat?: string;
  language: string;
}

export interface WebsiteFieldMetadata {
  fieldId: string;
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; text: string }>;
  isSensitive?: boolean;
}

export interface FieldMappingProposal {
  targetFieldId: string;
  targetFieldLabel: string;
  assignedFact: ExtractedFact;
  mappingConfidence: number;
  rationale: string;
  isApprovedByUser: boolean;
}

