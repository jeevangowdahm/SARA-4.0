import { describe, it, expect } from 'vitest';
import { extractFieldsFromTranscript } from '../src/lib/sara/fieldExtractor';
import { validateField, normalizePhoneNumber, normalizeAge } from '../src/lib/sara/validators';
import { SaraConversationEngine } from '../src/lib/sara/conversationEngine';

describe('SARA Core Intelligence & Extraction Engine', () => {
  it('extracts multiple fields from a single natural sentence', () => {
    const transcript = 'My name is Jeevan Gowda, I am 19 years old, and I live in Bengaluru.';
    const result = extractFieldsFromTranscript(transcript);

    expect(result.extractedFields.fullName).toBeDefined();
    expect(result.extractedFields.fullName?.value).toBe('Jeevan Gowda');
    expect(result.extractedFields.fullName?.isValid).toBe(true);

    expect(result.extractedFields.age).toBeDefined();
    expect(result.extractedFields.age?.value).toBe('19');
    expect(result.extractedFields.age?.isValid).toBe(true);

    expect(result.extractedFields.location).toBeDefined();
    expect(result.extractedFields.location?.value).toBe('Bengaluru');
    expect(result.extractedFields.location?.isValid).toBe(true);

    // Verify SARA SENSE stages
    expect(result.stages.LISTEN.status).toBe('completed');
    expect(result.stages.UNDERSTAND.status).toBe('completed');
    expect(result.stages.MAP.status).toBe('completed');
    expect(result.stages.VALIDATE.status).toBe('completed');
  });

  it('detects partial Indian mobile number and triggers clarification', () => {
    const transcript = 'My mobile number is 98765';
    const result = extractFieldsFromTranscript(transcript, 'mobileNumber');

    expect(result.requiresClarification).toBe(true);
    expect(result.clarificationTarget?.fieldId).toBe('mobileNumber');
    expect(result.clarificationTarget?.reason).toContain('5 digits');
    expect(result.stages.VALIDATE.status).toBe('flagged');
  });

  it('normalizes formatted and spoken Indian mobile numbers', () => {
    expect(normalizePhoneNumber('+91 98765-43210')).toBe('9876543210');
    expect(normalizePhoneNumber('09876543210')).toBe('9876543210');
    expect(normalizePhoneNumber('nine eight seven six five four three two one zero')).toBe('9876543210');

    const validRes = validateField('mobileNumber', '9876543210');
    expect(validRes.isValid).toBe(true);

    const invalidPrefix = validateField('mobileNumber', '5123456789');
    expect(invalidPrefix.isValid).toBe(false);
    expect(invalidPrefix.error).toContain('must start with 6, 7, 8, or 9');
  });

  it('normalizes spoken word ages', () => {
    expect(normalizeAge('nineteen')).toBe('19');
    expect(normalizeAge('twenty one')).toBe('21');
    expect(normalizeAge('I am 24 years old')).toBe('24');

    const validAge = validateField('age', '19');
    expect(validAge.isValid).toBe(true);

    const underage = validateField('age', '14');
    expect(underage.isValid).toBe(false);
    expect(underage.error).toContain('at least 16');
  });

  it('handles step progression and complete form validation', () => {
    const engine = new SaraConversationEngine();
    expect(engine.getCurrentStepIndex()).toBe(0);

    engine.setFieldValue('fullName', 'Jeevan Gowda');
    engine.nextStep();
    expect(engine.getCurrentStepIndex()).toBe(1);

    engine.setFieldValue('age', '19');
    engine.nextStep();
    expect(engine.getCurrentStepIndex()).toBe(2);

    engine.setFieldValue('mobileNumber', '9876543210');
    engine.nextStep();
    expect(engine.getCurrentStepIndex()).toBe(3);

    engine.setFieldValue('location', 'Bengaluru');
    engine.nextStep();
    expect(engine.getCurrentStepIndex()).toBe(4);

    engine.setFieldValue('volunteerReason', 'I want to help people and contribute to my community.');
    
    const summary = engine.getCompletionSummary();
    expect(summary.isComplete).toBe(true);
    expect(summary.missingFields.length).toBe(0);

    const registration = engine.finalizeRegistration();
    expect(registration.referenceId).toMatch(/^SARA-2026-KA-\d{4}$/);
    expect(registration.data.fullName).toBe('Jeevan Gowda');
  });
});
