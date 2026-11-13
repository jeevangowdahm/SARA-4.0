/**
 * SARA 4.0 Backend Type Definitions & Relational Schema Contracts
 */

export type SensitivityLevel = 'normal' | 'personal' | 'sensitive' | 'highly_sensitive';

export type FactVerificationStatus =
  | 'extracted'
  | 'needs_review'
  | 'user_confirmed'
  | 'verified_from_source'
  | 'expired'
  | 'superseded';

export interface UserProfile {
  id: string; // uuid
  userId: string; // primary identity key
  fullName: string;
  preferredName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age?: number;
  phone: string; // verified phone
  email?: string;
  country: string;
  state: string;
  district?: string;
  city: string;
  currentAddress: string;
  permanentAddress?: string;
  educationLevel?: string;
  course?: string;
  institution?: string;
  currentSemester?: string;
  usn?: string;
  gpa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredLanguage: string; // 'en' | 'kn' | 'hi' | ...
  secondaryLanguage?: string;
  speechRate: number;
  voiceEnabled: boolean;
  easyModeEnabled: boolean;
  teachModeEnabled: boolean;
  textScale: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  updatedAt: string;
}

export interface PersonalFact {
  id: string;
  userId: string;
  factType: string; // 'full_name' | 'dob' | 'mobile' | 'college' | 'course' | 'address' | 'usn' | 'cgpa' | 'annual_income'
  displayValue: string;
  encryptedOrProtectedValue?: string;
  verificationStatus: FactVerificationStatus;
  sourceDocumentId?: string;
  sourceType: 'user_statement' | 'document_ocr' | 'clarification' | 'manual_input';
  confidence: number;
  evidenceText?: string;
  sensitivity: SensitivityLevel;
  verifiedAt?: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  documentType:
    | '10th_marks_card'
    | '12th_marks_card'
    | 'college_marks_card'
    | 'college_id'
    | 'bonafide_cert'
    | 'aadhaar_card'
    | 'pan_card'
    | 'bank_passbook'
    | 'income_cert'
    | 'general';
  storageObjectKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  encryptionStatus: 'encrypted_at_rest' | 'stored_private';
  processingStatus: 'uploaded' | 'processing' | 'processed' | 'failed';
  uploadedAt: string;
  deletedAt?: string | null;
}

export interface DocumentFact {
  field: string;
  value: string;
  sourceDocumentId: string;
  evidenceText?: string;
  confidence: number;
  needsReview: boolean;
  sensitivity: SensitivityLevel;
}

export interface DocumentExtractionRecord {
  id: string;
  userId: string;
  documentId: string;
  extractedFields: DocumentFact[];
  rawTextPreview?: string;
  extractionProvider: string;
  extractionModel: string;
  extractionStatus: 'success' | 'partial' | 'failed';
  confidenceSummary: number;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  websiteHostname: string;
  applicationName: string;
  applicationCategory: string; // 'scholarship' | 'education' | 'government_service' | 'employment'
  applicationStatus: 'draft_created' | 'fields_populated' | 'user_reviewed' | 'user_manually_submitted';
  completedFieldsCount: number;
  totalFieldsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFieldRecord {
  id: string;
  userId: string;
  applicationId: string;
  fieldLabel: string;
  fieldSemanticType: string;
  fieldId: string;
  selectedValue: string;
  sourceFactId?: string;
  verificationStatus: 'user_approved' | 'auto_mapped' | 'manual_entry';
  userApproved: boolean;
  createdAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: 'document_ocr' | 'ai_field_mapping' | 'profile_memory' | 'extension_active_tab';
  purpose: string;
  granted: boolean;
  grantedAt: string;
  revokedAt?: string | null;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  nonSensitiveMetadata?: Record<string, any>;
}

export interface OtpRecord {
  id: string;
  identifier: string; // phone or email
  otpCode: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number; // timestamp ms
  createdAt: number;
  verified: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  identifier: string;
  createdAt: number;
  expiresAt: number;
}

