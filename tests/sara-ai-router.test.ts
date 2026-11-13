import { describe, it, expect } from 'vitest';
import { SaraTaskRouter } from '../src/lib/sara/ai/taskRouter';
import { sanitizeAndAnchorFacts } from '../src/lib/sara/ai/hallucinationProtection';
import { EIGHTH_SCHEDULE_LANGUAGES, getLanguageCapability } from '../src/lib/sara/multilingual/languageMatrix';
import { parseVoiceCommand, TEACH_CONCEPTS } from '../src/lib/sara/easyMode/easyModeCoach';

describe('SARA 3.0 AI Task Router & Multi-Model Architecture', () => {
  const router = new SaraTaskRouter('local_deterministic');

  it('extracts structured facts from complex scholarship natural speech', async () => {
    const transcript =
      'My name is Jeevan Gowda, I am 19 years old. I study BE Computer Science & Engineering at RNS Institute of Technology in Bengaluru. My mobile number is 9876543210 and my pincode is 560098. I need financial support for my education.';

    const response = await router.extractFacts(transcript, 'en');
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();

    const facts = response.data!;
    const nameFact = facts.find((f) => f.category === 'full_name');
    const ageFact = facts.find((f) => f.category === 'age');
    const phoneFact = facts.find((f) => f.category === 'phone');
    const collegeFact = facts.find((f) => f.category === 'college');
    const courseFact = facts.find((f) => f.category === 'course');
    const cityFact = facts.find((f) => f.category === 'city');

    expect(nameFact?.value).toBe('Jeevan Gowda');
    expect(ageFact?.value).toBe('19');
    expect(phoneFact?.value).toBe('9876543210');
    expect(collegeFact?.value).toBe('RNS Institute of Technology');
    expect(courseFact?.value).toBe('BE Computer Science & Engineering');
    expect(cityFact?.value).toBe('Bengaluru');
  });

  it('extracts facts from Kannada regional speech ("Speak in one language, fill another")', async () => {
    const kannadaTranscript =
      'ನನ್ನ ಹೆಸರು ಜೀವನ್ ಗೌಡ. ನಾನು 19 ವರ್ಷದವನು. ನಾನು ಆರ್ ಎನ್ ಎಸ್ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಟೆಕ್ನಾಲಜಿಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೇನೆ ಮತ್ತು ಬೆಂಗಳೂರಿನಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೇನೆ. ಮೊಬೈಲ್ 9876543210.';

    const response = await router.extractFacts(kannadaTranscript, 'kn');
    expect(response.success).toBe(true);

    const facts = response.data!;
    expect(facts.find((f) => f.category === 'full_name')?.value).toContain('ಜೀವನ್ ಗೌಡ');
    expect(facts.find((f) => f.category === 'age')?.value).toBe('19');
    expect(facts.find((f) => f.category === 'phone')?.value).toBe('9876543210');
    expect(facts.find((f) => f.category === 'college')?.value).toBe('RNS Institute of Technology');
    expect(facts.find((f) => f.category === 'city')?.value).toBe('Bengaluru');
  });

  it('provides simplified question explanations for bureaucratic questions', () => {
    const addressExp = router.explainQuestion('Official Residential Correspondence Address', 'en');
    expect(addressExp.simplifiedExplanation).toContain('Tell me where you live');
    expect(addressExp.everydayExample).toContain('Door No');

    const addressExpKn = router.explainQuestion('Official Residential Correspondence Address', 'kn');
    expect(addressExpKn.simplifiedExplanation).toContain('ನೀವು ವಾಸಿಸುವ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ');
  });

  it('explains validation errors simply (AI Error Explainer)', () => {
    const phoneErr = router.explainValidationError('pattern mismatch', 'Applicant Primary Mobile Number');
    expect(phoneErr).toContain('exactly 10 digits starting with 6, 7, 8, or 9');

    const requiredErr = router.explainValidationError('valueMissing', 'Full Name');
    expect(requiredErr).toContain('cannot leave this field empty');
  });

  it('protects against hallucination and rejects un-attested facts', () => {
    const transcript = 'I live in Bengaluru.';
    const hallucinatedFacts = [
      {
        category: 'city' as const,
        value: 'Bengaluru',
        sourceTranscript: 'Bengaluru',
        language: 'en',
        confidence: 0.95,
        requiresConfirmation: false,
      },
      {
        category: 'address' as const,
        value: '42 MG Road, Indiranagar', // Hallucinated by model
        sourceTranscript: 'Indiranagar',
        language: 'en',
        confidence: 0.4,
        requiresConfirmation: true,
      },
    ];

    const { verifiedFacts, rejectedFacts } = sanitizeAndAnchorFacts(hallucinatedFacts, transcript);
    expect(verifiedFacts.length).toBe(1);
    expect(verifiedFacts[0].value).toBe('Bengaluru');
    expect(rejectedFacts.length).toBe(1);
    expect(rejectedFacts[0].reason).toContain('not substantiated in transcript');
  });
});

describe('SARA 3.0 Multilingual System & 22 Eighth Schedule Languages', () => {
  it('covers all 22 official languages of India with capability flags', () => {
    expect(EIGHTH_SCHEDULE_LANGUAGES.length).toBe(22);

    const kannada = getLanguageCapability('kn');
    expect(kannada.name).toBe('Kannada');
    expect(kannada.isSpeechRecognitionSupported).toBe(true);
    expect(kannada.isSpeechSynthesisSupported).toBe(true);

    const hindi = getLanguageCapability('hi');
    expect(hindi.name).toBe('Hindi');
    expect(hindi.isSpeechRecognitionSupported).toBe(true);

    const bodo = getLanguageCapability('brx');
    expect(bodo.name).toBe('Bodo');
    expect(bodo.isTranslationSupported).toBe(true);
    // Bodo STT not yet available in browser Web Speech API
    expect(bodo.isSpeechRecognitionSupported).toBe(false);
  });
});

describe('SARA 3.0 Easy Mode & Voice Commands', () => {
  it('distinguishes voice commands from normal speech answers', () => {
    expect(parseVoiceCommand('Explain').isCommand).toBe(true);
    expect(parseVoiceCommand('Explain').action).toBe('EXPLAIN');

    expect(parseVoiceCommand('ಮುಂದೆ').isCommand).toBe(true);
    expect(parseVoiceCommand('ಮುಂದೆ').action).toBe('NEXT');

    expect(parseVoiceCommand('रुको').isCommand).toBe(true);
    expect(parseVoiceCommand('रुको').action).toBe('STOP');

    // Ordinary name should NOT be a command
    expect(parseVoiceCommand('My name is Jeevan Gowda').isCommand).toBe(false);
  });

  it('provides educational Teach Mode concepts', () => {
    expect(TEACH_CONCEPTS.email.simpleExplanation).toContain('digital letterbox');
    expect(TEACH_CONCEPTS.mandatory.simpleExplanation).toContain('red asterisk');
    expect(TEACH_CONCEPTS.otp.simpleExplanation).toContain('Never share it with anyone');
  });
});
