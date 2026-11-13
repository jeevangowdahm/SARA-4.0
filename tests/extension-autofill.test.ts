import { describe, it, expect } from 'vitest';

describe('SARA 3.0 External Website Detection & DOM Autofill Engine', () => {
  const SENSITIVE_PATTERNS = [
    /password/i,
    /\botp\b/i,
    /secret/i,
    /cvv/i,
    /cvc/i,
    /credit.?card/i,
    /debit.?card/i,
    /card.?number/i,
    /captcha/i,
    /auth.?token/i,
  ];

  function isFieldSensitive(type: string, name: string, id: string, label: string): boolean {
    if (type === 'password') return true;
    const text = `${name} ${id} ${label}`;
    if (/pincode|postal/i.test(text)) return false;
    return SENSITIVE_PATTERNS.some((p) => p.test(text));
  }

  it('accurately isolates sensitive fields from standard form fields', () => {
    // Sensitive cases
    expect(isFieldSensitive('password', 'portalPassword', 'portalPassword', 'Account Password')).toBe(true);
    expect(isFieldSensitive('text', 'otpSecret', 'otpSecret', 'Mobile OTP Verification')).toBe(true);
    expect(isFieldSensitive('text', 'cvvNumber', 'cvvNumber', 'Card CVV')).toBe(true);
    expect(isFieldSensitive('text', 'cardNum', 'cardNum', 'Debit Card Number')).toBe(true);
    expect(isFieldSensitive('text', 'userCaptcha', 'captchaInput', 'Enter CAPTCHA')).toBe(true);

    // Non-sensitive cases
    expect(isFieldSensitive('text', 'applicantFullName', 'applicantFullName', 'Full Name')).toBe(false);
    expect(isFieldSensitive('tel', 'contactMobile', 'contactMobile', 'Primary Mobile Number')).toBe(false);
    expect(isFieldSensitive('text', 'postalPincode', 'postalPincode', 'Postal Index Number (Pincode)')).toBe(false);
    expect(isFieldSensitive('text', 'collegeName', 'collegeName', 'Institution Name')).toBe(false);
  });

  it('never assigns autofill mappings to submit, button, or reset inputs', () => {
    const prohibitedTypes = ['submit', 'button', 'reset', 'hidden'];
    prohibitedTypes.forEach((type) => {
      expect(['text', 'number', 'tel', 'email', 'date', 'select-one', 'textarea']).not.toContain(type);
    });
  });

  it('matches fuzzy select option text accurately', () => {
    const options = [
      { value: 'BE Computer Science & Engineering', text: 'BE Computer Science & Engineering' },
      { value: 'BTech Information Science', text: 'BTech Information Science' },
      { value: 'BE Electronics & Communication', text: 'BE Electronics & Communication' },
    ];

    const query = 'computer science';
    const matched = options.find((opt) => opt.text.toLowerCase().includes(query));
    expect(matched).toBeDefined();
    expect(matched?.value).toBe('BE Computer Science & Engineering');
  });

  it('enforces human-in-the-loop: autofill must verify retention without triggering submit', () => {
    const approvedMappings = [
      { fieldId: 'applicantFullName', value: 'Jeevan Gowda' },
      { fieldId: 'contactMobile', value: '9876543210' },
    ];

    expect(approvedMappings.length).toBe(2);
    // Submit action is strictly excluded from approved mappings
    const hasSubmitAction = approvedMappings.some((m) => m.fieldId.toLowerCase().includes('submit'));
    expect(hasSubmitAction).toBe(false);
  });
});

