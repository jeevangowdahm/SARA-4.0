/**
 * SARA 3.0 Easy Mode & Teach Mode Coach
 * Accessibility for low-literacy users, voice commands, and digital literacy education.
 */

export type VoiceCommandAction =
  | 'START'
  | 'STOP'
  | 'REPEAT'
  | 'EXPLAIN'
  | 'READ_AGAIN'
  | 'NEXT'
  | 'GO_BACK'
  | 'CLEAR'
  | 'HELP'
  | 'CHANGE_LANGUAGE'
  | 'NONE';

export interface VoiceCommandResult {
  isCommand: boolean;
  action: VoiceCommandAction;
  confidence: number;
}

export function parseVoiceCommand(text: string): VoiceCommandResult {
  const lower = text.trim().toLowerCase();

  // Voice Command dictionary (English, Kannada, Hindi)
  if (/^(repeat|say again|read again|ಮತ್ತೆ ಹೇಳಿ|फिर से बोलो)$/i.test(lower)) {
    return { isCommand: true, action: 'REPEAT', confidence: 0.98 };
  }
  if (/^(explain|what does this mean|explain this|ವಿವರಿಸಿ|ಇದರ ಅರ್ಥವೇನು|समझाओ)$/i.test(lower)) {
    return { isCommand: true, action: 'EXPLAIN', confidence: 0.98 };
  }
  if (/^(next|continue|ಮುಂದೆ|ಮುಂದಿನದು|आगे बढ़ो)$/i.test(lower)) {
    return { isCommand: true, action: 'NEXT', confidence: 0.96 };
  }
  if (/^(back|go back|previous|ಹಿಂದೆ|ಹಿಂದಿನದು|पीछे)$/i.test(lower)) {
    return { isCommand: true, action: 'GO_BACK', confidence: 0.96 };
  }
  if (/^(stop|pause|ನಿಲ್ಲಿಸು|रुको)$/i.test(lower)) {
    return { isCommand: true, action: 'STOP', confidence: 0.99 };
  }
  if (/^(help|help me|ಸಹಾಯ|मदद)$/i.test(lower)) {
    return { isCommand: true, action: 'HELP', confidence: 0.98 };
  }
  if (/^(clear|erase|ಅಳಿಸು|हटाओ)$/i.test(lower)) {
    return { isCommand: true, action: 'CLEAR', confidence: 0.95 };
  }
  if (/^(change language|switch language|ಭಾಷೆ ಬದಲಾಯಿಸಿ|भाषा बदलो)$/i.test(lower)) {
    return { isCommand: true, action: 'CHANGE_LANGUAGE', confidence: 0.95 };
  }

  return { isCommand: false, action: 'NONE', confidence: 0 };
}

export interface TeachConcept {
  key: string;
  title: string;
  simpleExplanation: string;
  example: string;
}

export const TEACH_CONCEPTS: Record<string, TeachConcept> = {
  email: {
    key: 'email',
    title: 'What is an Email Address?',
    simpleExplanation:
      'An email address is like a digital letterbox used to receive online letters and notifications. It always contains the "@" (at) sign.',
    example: 'For example: student@gmail.com',
  },
  mandatory: {
    key: 'mandatory',
    title: 'What does the Red Star (*) mean?',
    simpleExplanation:
      'The red asterisk (*) means this question is required. The website will not allow you to complete the application if you leave it blank.',
    example: 'For example: Full Name and Mobile Number are required.',
  },
  pincode: {
    key: 'pincode',
    title: 'What is a Pincode?',
    simpleExplanation:
      'A Postal Index Number (Pincode) is a 6-digit number that tells postmen and delivery services which local neighborhood you reside in.',
    example: 'For example: 560098 in Bengaluru.',
  },
  otp: {
    key: 'otp',
    title: 'What is an OTP? (Safety Alert)',
    simpleExplanation:
      'An OTP (One-Time Password) is a private verification code sent to your mobile phone. SARA will never ask for your OTP or bank password. Never share it with anyone.',
    example: 'For example: A 6-digit SMS code.',
  },
};

