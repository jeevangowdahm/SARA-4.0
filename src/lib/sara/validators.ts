import { FieldId } from './types';

export interface ValidationResult {
  isValid: boolean;
  normalizedValue: string;
  error?: string;
  clarificationNeeded?: boolean;
  clarificationReason?: string;
}

/**
 * Word to digit mapping for speech transcripts like "nine eight seven six five four three two one zero"
 */
const WORD_TO_DIGIT: Record<string, string> = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  oh: '0',
  double: 'double',
  triple: 'triple',
};

/**
 * Spoken number words into age values like "nineteen" -> "19", "twenty one" -> "21"
 */
const WORD_TO_NUMBER: Record<string, number> = {
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  'twenty one': 21,
  'twenty-one': 21,
  'twenty two': 22,
  'twenty-two': 22,
  'twenty three': 23,
  'twenty-three': 23,
  'twenty four': 24,
  'twenty-four': 24,
  'twenty five': 25,
  'twenty-five': 25,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
};

/**
 * Normalizes spoken phone numbers (handles words, spaces, +91 country codes)
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let text = raw.toLowerCase().trim();

  // Convert words to digits
  const tokens = text.split(/[\s-]+/);
  const convertedTokens: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'double' && i + 1 < tokens.length) {
      const next = tokens[i + 1];
      if (WORD_TO_DIGIT[next]) {
        convertedTokens.push(WORD_TO_DIGIT[next], WORD_TO_DIGIT[next]);
        i++;
        continue;
      }
    }
    if (WORD_TO_DIGIT[t] !== undefined) {
      convertedTokens.push(WORD_TO_DIGIT[t]);
    } else {
      convertedTokens.push(t);
    }
  }

  const combined = convertedTokens.join('');
  // Extract all digit characters
  let digits = combined.replace(/\D/g, '');

  // Strip leading 0 or 91 country code if present with 12 or 11 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Normalizes spoken age to an integer string
 */
export function normalizeAge(raw: string): string {
  if (!raw) return '';
  const text = raw.toLowerCase().trim();

  // Check direct word match
  if (WORD_TO_NUMBER[text] !== undefined) {
    return String(WORD_TO_NUMBER[text]);
  }

  // Check compound like "twenty five"
  for (const [phrase, num] of Object.entries(WORD_TO_NUMBER)) {
    if (text.includes(phrase)) {
      return String(num);
    }
  }

  // Extract digits
  const match = text.match(/\b\d{1,3}\b/);
  if (match) {
    return match[0];
  }

  return raw.trim();
}

/**
 * Validate a specific form field value
 */
export function validateField(fieldId: FieldId, value: string): ValidationResult {
  const trimmed = value.trim();

  switch (fieldId) {
    case 'fullName': {
      if (!trimmed) {
        return {
          isValid: false,
          normalizedValue: '',
          error: 'Full name is required.',
          clarificationNeeded: true,
          clarificationReason: 'Full name cannot be blank.',
        };
      }
      if (trimmed.length < 2) {
        return {
          isValid: false,
          normalizedValue: trimmed,
          error: 'Name must contain at least 2 characters.',
          clarificationNeeded: true,
          clarificationReason: 'Please provide your full given and surname.',
        };
      }
      // Check if text is just gibberish numbers
      if (/^\d+$/.test(trimmed)) {
        return {
          isValid: false,
          normalizedValue: trimmed,
          error: 'Name cannot contain only numbers.',
          clarificationNeeded: true,
          clarificationReason: 'A valid personal name is expected.',
        };
      }
      // Capitalize name properly
      const capitalized = trimmed
        .split(/\s+/)
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');

      return {
        isValid: true,
        normalizedValue: capitalized,
      };
    }

    case 'age': {
      const normalized = normalizeAge(trimmed);
      const parsed = parseInt(normalized, 10);

      if (isNaN(parsed)) {
        return {
          isValid: false,
          normalizedValue: trimmed,
          error: 'Please provide a valid numeric age.',
          clarificationNeeded: true,
          clarificationReason: 'Could not recognize a numeric age in the response.',
        };
      }
      if (parsed < 16) {
        return {
          isValid: false,
          normalizedValue: String(parsed),
          error: 'Volunteers must be at least 16 years old.',
          clarificationNeeded: true,
          clarificationReason: 'Minimum required age for community service registration is 16 years.',
        };
      }
      if (parsed > 100) {
        return {
          isValid: false,
          normalizedValue: String(parsed),
          error: 'Please verify age (must be 100 or below).',
          clarificationNeeded: true,
          clarificationReason: 'Age appears unusually high. Please confirm your age.',
        };
      }
      return {
        isValid: true,
        normalizedValue: String(parsed),
      };
    }

    case 'mobileNumber': {
      const normalizedDigits = normalizePhoneNumber(trimmed);

      // Check if partially entered or heard (e.g. 5-9 digits)
      if (normalizedDigits.length > 0 && normalizedDigits.length < 10) {
        return {
          isValid: false,
          normalizedValue: normalizedDigits,
          error: `Incomplete number (${normalizedDigits.length} of 10 digits provided).`,
          clarificationNeeded: true,
          clarificationReason: `SARA captured ${normalizedDigits.length} digits (${normalizedDigits}). Indian mobile numbers require 10 digits starting with 6, 7, 8, or 9.`,
        };
      }

      if (normalizedDigits.length > 10) {
        return {
          isValid: false,
          normalizedValue: normalizedDigits,
          error: `Number has ${normalizedDigits.length} digits (expected 10).`,
          clarificationNeeded: true,
          clarificationReason: 'Too many digits detected. Please state only your 10-digit mobile number.',
        };
      }

      // Exact 10 digits check starting with 6-9
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (!indianMobileRegex.test(normalizedDigits)) {
        return {
          isValid: false,
          normalizedValue: normalizedDigits,
          error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
          clarificationNeeded: true,
          clarificationReason: `The number "${normalizedDigits}" does not match Indian mobile numbering standards (must begin with 6, 7, 8, or 9).`,
        };
      }

      return {
        isValid: true,
        normalizedValue: normalizedDigits,
      };
    }

    case 'location': {
      if (!trimmed) {
        return {
          isValid: false,
          normalizedValue: '',
          error: 'Location is required.',
          clarificationNeeded: true,
          clarificationReason: 'Please name your city or local area.',
        };
      }
      if (trimmed.length < 2) {
        return {
          isValid: false,
          normalizedValue: trimmed,
          error: 'Location name is too short.',
          clarificationNeeded: true,
          clarificationReason: 'Please state the name of your city or town.',
        };
      }
      // Capitalize location properly
      const formattedLoc = trimmed
        .split(/\s+/)
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');

      return {
        isValid: true,
        normalizedValue: formattedLoc,
      };
    }

    case 'volunteerReason': {
      if (!trimmed) {
        return {
          isValid: false,
          normalizedValue: '',
          error: 'Please provide a reason or motivation for volunteering.',
          clarificationNeeded: true,
          clarificationReason: 'A short sentence explaining your motivation is required.',
        };
      }
      if (trimmed.length < 5) {
        return {
          isValid: false,
          normalizedValue: trimmed,
          error: 'Please write or speak at least a few words describing your motivation.',
          clarificationNeeded: true,
          clarificationReason: 'Your response was very short. Please describe what motivates you to volunteer.',
        };
      }
      return {
        isValid: true,
        normalizedValue: trimmed,
      };
    }

    default:
      return {
        isValid: true,
        normalizedValue: trimmed,
      };
  }
}

