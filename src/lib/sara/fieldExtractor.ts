import { FieldId, ExtractedField, SaraSensePipelineResult, SenseStageState } from './types';
import { validateField, normalizePhoneNumber, normalizeAge } from './validators';
import { COMMUNITY_SERVICE_FORM_SCHEMA } from './formSchema';

/**
 * Extracts multiple fields deterministically from natural language transcripts
 */
export function extractFieldsFromTranscript(
  transcript: string,
  currentFieldId?: FieldId
): SaraSensePipelineResult {
  const cleanText = transcript.trim();
  const lower = cleanText.toLowerCase();

  const extracted: Partial<Record<FieldId, ExtractedField>> = {};
  const unmappedPhrases: string[] = [];
  const now = Date.now();

  // 1. AGE EXTRACTION
  let foundAge: string | null = null;
  const ageRegexPatterns = [
    /\b(?:i am|i'm|age is|aged|age)\s+(\d{1,3}|sixteen|seventeen|eighteen|nineteen|twenty|twenty[- ]one|twenty[- ]two|twenty[- ]three|twenty[- ]four|twenty[- ]five|thirty|forty)\s*(?:years old|yrs old|years|yrs)?\b/i,
    /\b(\d{1,3})\s*(?:years old|yrs old|years of age)\b/i,
  ];

  for (const regex of ageRegexPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      foundAge = match[1];
      break;
    }
  }

  // Fallback if currently on age step
  if (!foundAge && currentFieldId === 'age') {
    const directAgeMatch = cleanText.match(/\b(\d{1,3})\b/);
    if (directAgeMatch) {
      foundAge = directAgeMatch[1];
    } else {
      // Check word number
      const normalizedWord = normalizeAge(cleanText);
      if (normalizedWord !== cleanText) {
        foundAge = normalizedWord;
      }
    }
  }

  if (foundAge) {
    const normAge = normalizeAge(foundAge);
    const validation = validateField('age', normAge);
    extracted.age = {
      fieldId: 'age',
      value: validation.normalizedValue,
      rawTranscript: foundAge,
      extractionMethod: 'deterministic_rule',
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      timestamp: now,
    };
  }

  // 2. INDIAN MOBILE NUMBER EXTRACTION
  let foundPhone: string | null = null;
  const phoneRegexPatterns = [
    /(?:mobile|phone|contact|cell|number)\s*(?:is|number is|:)?\s*([+0-9\s-]{5,16})/i,
    /\b([6-9]\d{9})\b/, // exact 10 digit Indian mobile starting with 6-9
    /\b(\d{5,12})\b/, // any 5-12 digit sequence (allows clarification detection!)
  ];

  for (const regex of phoneRegexPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      foundPhone = match[1];
      break;
    }
  }

  // Fallback if on mobileNumber step
  if (!foundPhone && currentFieldId === 'mobileNumber') {
    foundPhone = cleanText;
  }

  if (foundPhone) {
    const normPhone = normalizePhoneNumber(foundPhone);
    const validation = validateField('mobileNumber', normPhone);
    extracted.mobileNumber = {
      fieldId: 'mobileNumber',
      value: validation.normalizedValue,
      rawTranscript: foundPhone,
      extractionMethod: 'deterministic_rule',
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      timestamp: now,
    };
  }

  // 3. LOCATION EXTRACTION
  let foundLocation: string | null = null;
  const locationRegexPatterns = [
    /(?:i live in|i stay in|residing in|living in|location is|based in|area is|i'm from|i am from)\s+([A-Za-z\s.'-]+?)(?=,\s*i am|\s+and i|\s+and my|\s+my mobile|\.|$)/i,
  ];

  for (const regex of locationRegexPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      foundLocation = match[1].trim();
      break;
    }
  }

  // Fallback if currently on location step
  if (!foundLocation && currentFieldId === 'location') {
    // Strip common filler prefixes
    let locClean = cleanText
      .replace(/^(?:i live in|i stay in|i am in|i'm in|living in|residing in|at)\s+/i, '')
      .replace(/[.!?,]+$/, '')
      .trim();
    if (locClean) {
      foundLocation = locClean;
    }
  }

  if (foundLocation) {
    const validation = validateField('location', foundLocation);
    extracted.location = {
      fieldId: 'location',
      value: validation.normalizedValue,
      rawTranscript: foundLocation,
      extractionMethod: 'deterministic_rule',
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      timestamp: now,
    };
  }

  // 4. FULL NAME EXTRACTION
  let foundName: string | null = null;
  const nameRegexPatterns = [
    /(?:my name is|i am|i'm|this is|call me)\s+([A-Za-z\s.'-]+?)(?=,\s*i am|\s+and i am|\s+and i live|\s+and i stay|\s+i live|\s+my mobile|\s+my phone|\s+my number|\s+age|\s+i'm|\.|$)/i,
  ];

  for (const regex of nameRegexPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure candidate isn't accidentally "19 years old"
      if (!candidate.match(/\b\d+\b/) && !candidate.match(/^(nineteen|twenty|eighteen)$/i)) {
        foundName = candidate;
        break;
      }
    }
  }

  // Fallback if on fullName step
  if (!foundName && currentFieldId === 'fullName') {
    let nameClean = cleanText
      .replace(/^(?:my name is|i am|i'm|this is|myself|it is|it's)\s+/i, '')
      .replace(/[.!?,]+$/, '')
      .trim();
    if (nameClean && !/^\d+$/.test(nameClean)) {
      foundName = nameClean;
    }
  }

  if (foundName) {
    const validation = validateField('fullName', foundName);
    extracted.fullName = {
      fieldId: 'fullName',
      value: validation.normalizedValue,
      rawTranscript: foundName,
      extractionMethod: 'deterministic_rule',
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      timestamp: now,
    };
  }

  // 5. VOLUNTEER REASON / MOTIVATION EXTRACTION
  let foundReason: string | null = null;
  const reasonRegexPatterns = [
    /(?:i want to volunteer because|i would like to volunteer because|volunteer because|my motivation is|i wish to volunteer because)\s+(.+)/i,
    /(?:i want to help|interested in volunteering|passion for community)\s*(.+)?/i,
  ];

  for (const regex of reasonRegexPatterns) {
    const match = cleanText.match(regex);
    if (match) {
      foundReason = cleanText; // preserve full contextual statement
      break;
    }
  }

  // Fallback if currently on volunteerReason step
  if (!foundReason && currentFieldId === 'volunteerReason') {
    if (cleanText.length >= 3) {
      foundReason = cleanText;
    }
  }

  if (foundReason) {
    const validation = validateField('volunteerReason', foundReason);
    extracted.volunteerReason = {
      fieldId: 'volunteerReason',
      value: validation.normalizedValue,
      rawTranscript: foundReason,
      extractionMethod: 'deterministic_rule',
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      timestamp: now,
    };
  }

  // Determine if clarification is required on any extracted field
  let requiresClarification = false;
  let clarificationTarget: SaraSensePipelineResult['clarificationTarget'] = undefined;

  for (const [fId, item] of Object.entries(extracted) as [FieldId, ExtractedField][]) {
    if (item.clarificationNeeded) {
      requiresClarification = true;
      const schemaDef = COMMUNITY_SERVICE_FORM_SCHEMA.find((s) => s.id === fId);
      clarificationTarget = {
        fieldId: fId,
        reason: item.clarificationReason || 'Information requires clarification.',
        suggestedPrompt: schemaDef?.clarificationPrompt || 'Could you please repeat this information clearly?',
        partialValue: item.value,
      };
      break;
    }
  }

  // SARA SENSE Pipeline Stage States
  const stages: Record<string, SenseStageState> = {
    LISTEN: {
      stage: 'LISTEN',
      status: 'completed',
      title: 'Acoustic Capture',
      detail: `Processed ${cleanText.split(/\s+/).filter(Boolean).length} spoken words.`,
      metric: `${cleanText.length} chars`,
    },
    UNDERSTAND: {
      stage: 'UNDERSTAND',
      status: 'completed',
      title: 'Intent & Entity Disambiguation',
      detail: `Discovered ${Object.keys(extracted).length} semantic form entities.`,
      metric: `${Object.keys(extracted).length} matched`,
    },
    MAP: {
      stage: 'MAP',
      status: 'completed',
      title: 'Schema Binding',
      detail: `Mapped to fields: ${Object.keys(extracted).join(', ') || 'None'}`,
    },
    VALIDATE: {
      stage: 'VALIDATE',
      status: requiresClarification ? 'flagged' : 'completed',
      title: 'Deterministic Rules Check',
      detail: requiresClarification
        ? `Ambiguity detected in [${clarificationTarget?.fieldId}]: ${clarificationTarget?.reason}`
        : 'All extracted values passed validation specifications.',
    },
    CONFIRM: {
      stage: 'CONFIRM',
      status: 'idle',
      title: 'Human Review Guarantee',
      detail: 'Awaiting explicit confirmation before storing answers.',
    },
  };

  return {
    stages: stages as Record<any, SenseStageState>,
    rawTranscript: cleanText,
    extractedFields: extracted,
    unmappedPhrases,
    requiresClarification,
    clarificationTarget,
  };
}

