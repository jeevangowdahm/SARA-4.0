import React, { useState, useEffect } from 'react';
import {
  FormFieldDefinition,
  ExtractedField,
  VoiceInteractionState,
  SupportedLanguage,
  SaraSensePipelineResult,
} from '../../lib/sara/types';
import { SaraSpeechRecognitionService, SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';
import { extractFieldsFromTranscript } from '../../lib/sara/fieldExtractor';
import { validateField } from '../../lib/sara/validators';
import { I18N_STRINGS } from '../../lib/sara/languageProvider';

interface ConversationalFormScreenProps {
  currentField: FormFieldDefinition;
  currentStepIndex: number;
  totalSteps: number;
  currentFieldValue?: ExtractedField;
  selectedLanguage: SupportedLanguage;
  speechRate: number;
  onAcceptField: (value: string, rawTranscript: string, method: ExtractedField['extractionMethod']) => void;
  onMultiFieldExtracted: (result: SaraSensePipelineResult) => void;
  onPreviousStep: () => void;
  onOpenSenseDashboard: () => void;
  onTriggerClarification: (result: SaraSensePipelineResult) => void;
}

export const ConversationalFormScreen: React.FC<ConversationalFormScreenProps> = ({
  currentField,
  currentStepIndex,
  totalSteps,
  currentFieldValue,
  selectedLanguage,
  speechRate,
  onAcceptField,
  onMultiFieldExtracted,
  onPreviousStep,
  onOpenSenseDashboard,
  onTriggerClarification,
}) => {
  const strings = I18N_STRINGS[selectedLanguage] || I18N_STRINGS.en;

  const FORM_FIELD_I18N: Record<string, Record<SupportedLanguage, { question: string; helper: string; audio: string }>> = {
    fullName: {
      kn: {
        question: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸೋಣ. ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು?',
        helper: 'ಅಧಿಕೃತ ಸ್ವಯಂಸೇವಕ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ನಿಮ್ಮ ಕಾನೂನುಬದ್ಧ ಹೆಸರು.',
        audio: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸೋಣ. ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು?',
      },
      hi: {
        question: 'नमस्ते! आइए आपका पंजीकरण पूरा करें। आपका पूरा नाम क्या है?',
        helper: 'आधिकारिक प्रमाण पत्र के लिए आपका कानूनी नाम।',
        audio: 'नमस्ते! आइए आपका पंजीकरण पूरा करें। आपका पूरा नाम क्या है?',
      },
      ta: {
        question: 'வணக்கம்! உங்கள் பதிவை முடிப்போம். உங்கள் முழு பெயர் என்ன?',
        helper: 'அதிகாரப்பூர்வ சான்றிதழுக்கான உங்கள் பெயர்.',
        audio: 'வணக்கம்! உங்கள் பதிவை முடிப்போம். உங்கள் முழு பெயர் என்ன?',
      },
      te: {
        question: 'నమస్కారం! మీ నమోదును పూర్తి చేద్దాం. మీ పూర్తి పేరు ఏమిటి?',
        helper: 'అధికారిక సర్టిఫికేట్ కోసం మీ పూర్తి పేరు.',
        audio: 'నమస్కారం! మీ నమోదును పూర్తి చేద్దాం. మీ పూర్తి పేరు ఏమిటి?',
      },
      ml: {
        question: 'നമസ്കാരം! നിങ്ങളുടെ രജിസ്ട്രേഷൻ പൂർത്തിയാക്കാം. നിങ്ങളുടെ മുഴുവൻ പേര് എന്താണ്?',
        helper: 'ഔദ്യോഗിക സർട്ടിഫിക്കറ്റിനായി നിങ്ങളുടെ പേര്.',
        audio: 'നമസ്കാരം! നിങ്ങളുടെ രജിസ്ട്രേഷൻ പൂർത്തിയാക്കാം. നിങ്ങളുടെ മുഴുവൻ പേര് എന്താണ്?',
      },
      mr: {
        question: 'नमस्कार! तुमची नोंदणी पूर्ण करूया. तुमचे पूर्ण नाव काय आहे?',
        helper: 'अधिकृत प्रमाणपत्रासाठी तुमचे पूर्ण नाव.',
        audio: 'नमस्कार! तुमची नोंदणी पूर्ण करूया. तुमचे पूर्ण नाव काय आहे?',
      },
      bn: {
        question: 'নমস্কার! আপনার নিবন্ধন সম্পূর্ণ করি। আপনার পুরো নাম কী?',
        helper: 'অফিসিয়াল সার্টিফিকেটের জন্য আপনার পুরো নাম।',
        audio: 'নমস্কার! আপনার নিবন্ধন সম্পূর্ণ করি। আপনার পুরো নাম কী?',
      },
      gu: {
        question: 'નમસ્તે! તમારી નોંધણી પૂર્ણ કરીએ. તમારું પૂરું નામ શું છે?',
        helper: 'સત્તાવાર પ્રમાણપત્ર માટે તમારું નામ.',
        audio: 'નમસ્તે! તમારી નોંધણી પૂર્ણ કરીએ. તમારું પૂરું નામ શું છે?',
      },
      en: {
        question: "Hello! Let's complete your registration together. What is your full name?",
        helper: 'Your legal or preferred name for official volunteer certification.',
        audio: 'Hello! Let us complete your registration together. What is your full name?',
      },
    },
    age: {
      kn: {
        question: 'ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?',
        helper: 'ಕ್ಷೇತ್ರ ಸೇವೆಗಾಗಿ ಸ್ವಯಂಸೇವಕರಿಗೆ ಕನಿಷ್ಠ 16 ವರ್ಷ ವಯಸ್ಸಾಗಿರಬೇಕು.',
        audio: 'ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?',
      },
      hi: {
        question: 'धन्यवाद। आपकी उम्र कितनी है?',
        helper: 'फील्ड सेवा के लिए स्वयंसेवकों की आयु कम से कम 16 वर्ष होनी चाहिए।',
        audio: 'धन्यवाद। आपकी उम्र कितनी है?',
      },
      ta: {
        question: 'நன்றி. உங்கள் வயது என்ன?',
        helper: 'தன்னார்வலர்களுக்கு குறைந்தபட்சம் 16 வயது இருக்க வேண்டும்.',
        audio: 'நன்றி. உங்கள் வயது என்ன?',
      },
      te: {
        question: 'ధన్యవాదాలు. మీ వయస్సు ఎంత?',
        helper: 'ఫీల్డ్ సర్వీస్ కోసం వాలంటీర్లకు కనీసం 16 సంవత్సరాలు ఉండాలి.',
        audio: 'ధన్యవాదాలు. మీ వయస్సు ఎంత?',
      },
      ml: {
        question: 'നന്ദി. നിങ്ങളുടെ പ്രായം എത്രയാണ്?',
        helper: 'സന്നദ്ധപ്രവർത്തകർക്ക് കുറഞ്ഞത് 16 വയസ്സ് ഉണ്ടായിരിക്കണം.',
        audio: 'നന്ദി. നിങ്ങളുടെ പ്രായം എത്രയാണ്?',
      },
      mr: {
        question: 'धन्यवाद. तुमचे वय किती आहे?',
        helper: 'स्वयंसेवकांचे वय किमान 16 वर्षे असणे आवश्यक आहे.',
        audio: 'धन्यवाद. तुमचे वय किती आहे?',
      },
      bn: {
        question: 'ধন্যবাদ। আপনার বয়স কত?',
        helper: 'স্বেচ্ছাসেবকদের বয়স কমপক্ষে ১৬ বছর হতে হবে।',
        audio: 'ধন্যবাদ। আপনার বয়স কত?',
      },
      gu: {
        question: 'આભાર. તમારી ઉંમર કેટલી છે?',
        helper: 'સ્વયંસેવકોની ઉંમર ઓછામાં ઓછી 16 વર્ષ હોવી જોઈએ.',
        audio: 'આભાર. તમારી ઉંમર કેટલી છે?',
      },
      en: {
        question: 'Thank you. How old are you?',
        helper: 'Volunteers must be at least 16 years of age for community field service.',
        audio: 'Thank you. How old are you?',
      },
    },
    mobileNumber: {
      kn: {
        question: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ತಿಳಿಸಿ?',
        helper: '6, 7, 8 ಅಥವಾ 9 ರಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಮಾನ್ಯ 10-ಅಂಕಿಗಳ ಸಂಖ್ಯೆ.',
        audio: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ತಿಳಿಸಿ?',
      },
      hi: {
        question: 'सत्यापन के लिए आपका 10 अंकों का मोबाइल नंबर क्या है?',
        helper: '6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का वैध मोबाइल नंबर दर्ज करें।',
        audio: 'सत्यापन के लिए आपका 10 अंकों का मोबाइल नंबर क्या है?',
      },
      ta: {
        question: 'சரிபார்ப்பிற்காக உங்கள் 10 இலக்க மொபைல் எண் என்ன?',
        helper: '6, 7, 8 அல்லது 9 இல் தொடங்கும் 10 இலக்க மொபைல் எண்.',
        audio: 'சரிபார்ப்பிற்காக உங்கள் 10 இலக்க மொபைல் எண் என்ன?',
      },
      te: {
        question: 'ధృవీకరణ కోసం మీ 10 అంకెల మొబైల్ నంబర్ ఏమిటి?',
        helper: '6, 7, 8 లేదా 9 తో ప్రారంభమయ్యే 10 అంకెల మొబైల్ నంబర్.',
        audio: 'ధృవీకరణ కోసం మీ 10 అంకెల మొబైల్ నంబర్ ఏమిటి?',
      },
      ml: {
        question: 'സ്ഥിരീകരണത്തിനായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക?',
        helper: '6, 7, 8 അല്ലെങ്കിൽ 9 ൽ തുടങ്ങുന്ന 10 അക്ക മൊബൈൽ നമ്പർ.',
        audio: 'സ്ഥിരീകരണത്തിനായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക?',
      },
      mr: {
        question: 'पडताळणीसाठी तुमचा 10 अंकी मोबाईल नंबर काय आहे?',
        helper: '6, 7, 8 किंवा 9 ने सुरू होणारा वैध मोबाईल नंबर.',
        audio: 'पडताळणीसाठी तुमचा 10 अंकी मोबाईल नंबर काय आहे?',
      },
      bn: {
        question: 'যাচাইকরণের জন্য আপনার ১০ সংখ্যার মোবাইল নম্বর কী?',
        helper: '৬, ৭, ৮ বা ৯ দিয়ে শুরু হওয়া ১০ সংখ্যার মোবাইল নম্বর।',
        audio: 'যাচাইকরণের জন্য আপনার ১০ সংখ্যার মোবাইল নম্বর কী?',
      },
      gu: {
        question: 'ચકાસણી માટે તમારો 10 અંકનો મોબાઈલ નંબર શું છે?',
        helper: '6, 7, 8 અથવા 9 થી શરૂ થતો 10 અંકનો મોબાઈલ નંબર.',
        audio: 'ચકાસણી માટે તમારો 10 અંકનો મોબાઈલ નંબર શું છે?',
      },
      en: {
        question: 'What is your 10-digit Indian mobile number for verification?',
        helper: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        audio: 'What is your 10 digit Indian mobile number for verification?',
      },
    },
    location: {
      kn: {
        question: 'ನೀವು ಪ್ರಸ್ತುತ ಯಾವ ನಗರ ಅಥವಾ ಪ್ರದೇಶದಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?',
        helper: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಸಮುದಾಯದಲ್ಲಿ ಸೇವಾ ಯೋಜನೆಗಳನ್ನು ನಿಯೋಜಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
        audio: 'ನೀವು ಪ್ರಸ್ತುತ ಯಾವ ನಗರ ಅಥವಾ ಪ್ರದೇಶದಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?',
      },
      hi: {
        question: 'आप वर्तमान में किस शहर या क्षेत्र में रहते हैं?',
        helper: 'आपके जिले या समुदाय में सेवा कार्यों को सौंपने में मदद करता है।',
        audio: 'आप वर्तमान में किस शहर या क्षेत्र में रहते हैं?',
      },
      ta: {
        question: 'நீங்கள் தற்போது எந்த நகரம் அல்லது பகுதியில் வசிக்கிறீர்கள்?',
        helper: 'உங்கள் பகுதியில் சேவை பணிகளை ஒதுக்க உதவுகிறது.',
        audio: 'நீங்கள் தற்போது எந்த நகரம் அல்லது பகுதியில் வசிக்கிறீர்கள்?',
      },
      te: {
        question: 'మీరు ప్రస్తుతం ఏ నగరం లేదా ప్రాంతంలో నివసిస్తున్నారు?',
        helper: 'మీ స్థానిక ప్రాంతంలో సేవా కార్యక్రమాలను కేటాయించడంలో సహాయపడుతుంది.',
        audio: 'మీరు ప్రస్తుతం ఏ నగరం లేదా ప్రాంతంలో నివసిస్తున్నారు?',
      },
      ml: {
        question: 'നിങ്ങൾ ഇപ്പോൾ ഏത് നഗരത്തിലാണ് താമസിക്കുന്നത്?',
        helper: 'പ്രാദേശിക സേവന പദ്ധതികൾ കണ്ടെത്താൻ സഹായിക്കുന്നു.',
        audio: 'നിങ്ങൾ ഇപ്പോൾ ഏത് നഗരത്തിലാണ് താമസിക്കുന്നത്?',
      },
      mr: {
        question: 'तुम्ही सध्या कोणत्या शहरात किंवा भागात राहता?',
        helper: 'स्थानिक भागात कार्ये सोपवण्यास मदत होते.',
        audio: 'तुम्ही सध्या कोणत्या शहरात किंवा भागात राहता?',
      },
      bn: {
        question: 'আপনি বর্তমানে কোন শহর বা এলাকায় বাস করেন?',
        helper: 'আপনার স্থানীয় এলাকায় কাজ বরাদ্দ করতে সাহায্য করে।',
        audio: 'আপনি বর্তমানে কোন শহর বা এলাকায় বাস করেন?',
      },
      gu: {
        question: 'તમે હાલમાં કયા શહેરમાં અથવા વિસ્તારમાં રહો છો?',
        helper: 'સ્થાનિક સમુદાયમાં સેવા કાર્યો સોંપવામાં મદદ કરે છે.',
        audio: 'તમે હાલમાં કયા શહેરમાં અથવા વિસ્તારમાં રહો છો?',
      },
      en: {
        question: 'Which city or area do you currently reside in?',
        helper: 'Helps assign service initiatives within your local district or community.',
        audio: 'Which city or area do you currently reside in?',
      },
    },
    volunteerReason: {
      kn: {
        question: 'ನೀವು ಈ ಸಮುದಾಯ ಉಪಕ್ರಮದಲ್ಲಿ ಏಕೆ ಸ್ವಯಂಸೇವಕರಾಗಲು ಬಯಸುತ್ತೀರಿ?',
        helper: 'ನಿಮ್ಮ ಉದ್ದೇಶವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ. ಕೆಲವೇ ಪ್ರಾಮಾಣಿಕ ಪದಗಳು ಸಾಕು.',
        audio: 'ನೀವು ಈ ಸಮುದಾಯ ಉಪಕ್ರಮದಲ್ಲಿ ಏಕೆ ಸ್ವಯಂಸೇವಕರಾಗಲು ಬಯಸುತ್ತೀರಿ?',
      },
      hi: {
        question: 'आप सामुदायिक पहल में स्वयंसेवा क्यों करना चाहते हैं?',
        helper: 'अपना उद्देश्य साझा करें। कुछ ईमानदार शब्द पर्याप्त हैं।',
        audio: 'आप सामुदायिक पहल में स्वयंसेवा क्यों करना चाहते हैं?',
      },
      ta: {
        question: 'நீங்கள் ஏன் தன்னார்வலராக பணியாற்ற விரும்புகிறீர்கள்?',
        helper: 'உங்கள் நோக்கத்தைப் பகிருங்கள்.',
        audio: 'நீங்கள் ஏன் தன்னார்வலராக பணியாற்ற விரும்புகிறீர்கள்?',
      },
      te: {
        question: 'మీరు ఎందుకు వాలంటీర్‌గా చేయాలనుకుంటున్నారు?',
        helper: 'మీ కారణాన్ని క్లుప్తంగా పంచుకోండి.',
        audio: 'మీరు ఎందుకు వాలంటీర్‌గా చేయాలనుకుంటున్నారు?',
      },
      ml: {
        question: 'നിങ്ങൾ എന്തുകൊണ്ട് ഈ സംരംഭത്തിൽ പ്രവർത്തിക്കാൻ ആഗ്രഹിക്കുന്നു?',
        helper: 'നിങ്ങളുടെ ലക്ഷ്യം ചുരുക്കത്തിൽ പങ്കിടുക.',
        audio: 'നിങ്ങൾ എന്തുകൊണ്ട് ഈ സംരംഭത്തിൽ പ്രവർത്തിക്കാൻ ആഗ്രഹിക്കുന്നു?',
      },
      mr: {
        question: 'तुम्हाला या उपक्रमात स्वयंसेवा का करायची आहे?',
        helper: 'तुमचा उद्देश थोडक्यात सांगा.',
        audio: 'तुम्हाला या उपक्रमात स्वयंसेवा का करायची आहे?',
      },
      bn: {
        question: 'আপনি কেন এই উদ্যোগে স্বেচ্ছাসেবক হতে চান?',
        helper: 'আপনার উদ্দেশ্য সংক্ষেপে শেয়ার করুন।',
        audio: 'আপনি কেন এই উদ্যোগে স্বেচ্ছাসেবক হতে চান?',
      },
      gu: {
        question: 'તમે શા માટે સ્વયંસેવા કરવા માંગો છો?',
        helper: 'તમારો હેતુ ટૂંકમાં જણાવો.',
        audio: 'તમે શા માટે સ્વયંસેવા કરવા માંગો છો?',
      },
      en: {
        question: 'Why would you like to volunteer with the community initiative?',
        helper: 'Share what drives you to contribute. A few honest words are perfect.',
        audio: 'Why would you like to volunteer with the community initiative?',
      },
    },
  };

  const localizedData =
    FORM_FIELD_I18N[currentField.id]?.[selectedLanguage] ||
    FORM_FIELD_I18N[currentField.id]?.en || {
      question: currentField.question,
      helper: currentField.helperText,
      audio: currentField.questionAudioText,
    };
  const localizedQuestion = localizedData.question;
  const localizedHelperText = localizedData.helper;
  const localizedAudio = localizedData.audio;

  const [voiceState, setVoiceState] = useState<VoiceInteractionState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [isEditingManually, setIsEditingManually] = useState<boolean>(false);
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [speechService] = useState<SaraSpeechRecognitionService>(
    () => new SaraSpeechRecognitionService(selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN')
  );

  // Sync state when field changes
  useEffect(() => {
    if (currentFieldValue) {
      setTranscript(currentFieldValue.rawTranscript || currentFieldValue.value);
      setManualInputValue(currentFieldValue.value);
    } else {
      setTranscript('');
      setManualInputValue('');
    }
    setVoiceState('idle');
    setIsEditingManually(false);
    setErrorMessage('');
  }, [currentField.id, currentFieldValue]);

  // Read question aloud
  const handleSpeakQuestion = () => {
    setIsSpeakingQuestion(true);
    SaraSpeechSynthesisService.speak(localizedAudio, {
      lang:
        selectedLanguage === 'kn'
          ? 'kn-IN'
          : selectedLanguage === 'hi'
          ? 'hi-IN'
          : selectedLanguage === 'ta'
          ? 'ta-IN'
          : selectedLanguage === 'te'
          ? 'te-IN'
          : selectedLanguage === 'ml'
          ? 'ml-IN'
          : selectedLanguage === 'mr'
          ? 'mr-IN'
          : selectedLanguage === 'bn'
          ? 'bn-IN'
          : selectedLanguage === 'gu'
          ? 'gu-IN'
          : 'en-IN',
      rate: speechRate,
      onEnd: () => setIsSpeakingQuestion(false),
    });
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    setErrorMessage('');
    setVoiceState('requesting_permission');

    const success = speechService.start({
      onStart: () => {
        setVoiceState('listening');
        setTranscript('');
      },
      onResult: (heardText: string, isFinal: boolean) => {
        setTranscript(heardText);
        setManualInputValue(heardText);

        if (isFinal) {
          setVoiceState('processing');
          handleProcessVoiceInput(heardText);
        }
      },
      onError: (err) => {
        setVoiceState('error');
        setErrorMessage(err.message);
        if (err.isPermissionDenied) {
          setIsEditingManually(true);
        }
      },
      onEnd: () => {
        if (voiceState === 'listening') {
          setVoiceState('transcript_ready');
        }
      },
    });

    if (!success) {
      setVoiceState('unsupported');
      setIsEditingManually(true);
    }
  };

  const handleStopListening = () => {
    speechService.stop();
    setVoiceState('transcript_ready');
    if (transcript) {
      handleProcessVoiceInput(transcript);
    }
  };

  // Process recognized or typed speech through SARA SENSE
  const handleProcessVoiceInput = (rawText: string) => {
    const result = extractFieldsFromTranscript(rawText, currentField.id);

    // Check if clarification is required (e.g. 5 digit mobile number)
    if (result.requiresClarification) {
      onTriggerClarification(result);
      return;
    }

    // Check if multi-field extraction detected multiple values
    const extractedCount = Object.keys(result.extractedFields).length;
    if (extractedCount > 1) {
      onMultiFieldExtracted(result);
      return;
    }

    // Single field extraction
    const currentExtracted = result.extractedFields[currentField.id];
    if (currentExtracted && currentExtracted.isValid) {
      setManualInputValue(currentExtracted.value);
      setVoiceState('transcript_ready');
    } else {
      setVoiceState('transcript_ready');
    }
  };

  // Confirm and proceed to next question
  const handleAcceptAndContinue = () => {
    const valueToValidate = isEditingManually ? manualInputValue : transcript || manualInputValue;
    const validation = validateField(currentField.id, valueToValidate);

    if (!validation.isValid) {
      if (validation.clarificationNeeded) {
        const result = extractFieldsFromTranscript(valueToValidate, currentField.id);
        onTriggerClarification(result);
        return;
      }
      setErrorMessage(validation.error || 'Please provide a valid answer.');
      return;
    }

    onAcceptField(
      validation.normalizedValue,
      transcript || valueToValidate,
      isEditingManually ? 'manual_input' : 'deterministic_rule'
    );
  };

  // Quick suggestion chip clicked
  const handleSelectExample = (example: string) => {
    setTranscript(example);
    setManualInputValue(example);
    handleProcessVoiceInput(example);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-16 gap-5 max-w-xl mx-auto">
      {/* Progress & Milestone Card */}
      <div className="flex flex-col gap-2 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-bold">
              {currentStepIndex + 1}
            </span>
            <span className="font-label-lg text-sm font-semibold text-primary-container">
              Step {currentStepIndex + 1} of {totalSteps}: {currentField.label}
            </span>
          </div>
          <button
            onClick={onOpenSenseDashboard}
            className="flex items-center gap-1 text-xs font-mono text-secondary bg-secondary/10 hover:bg-secondary/20 px-2.5 py-1 rounded-full transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>SARA SENSE Live</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="bg-secondary h-full transition-all duration-300"
            style={{ width: `${Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      {/* SARA Question Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col gap-3 relative overflow-hidden">
        {/* Assistant identity stripe */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            </div>
            <span className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider">
              {selectedLanguage === 'kn' ? 'SARA ಕೇಳುತ್ತಿದೆ' : selectedLanguage === 'hi' ? 'SARA पूछ रही है' : 'SARA ASKING'}
            </span>
          </div>

          <button
            type="button"
            aria-label="Listen to question"
            onClick={handleSpeakQuestion}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              isSpeakingQuestion
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container hover:bg-secondary/15 text-primary-container hover:text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSpeakingQuestion ? 'stop' : 'volume_up'}
            </span>
            <span>{selectedLanguage === 'kn' ? 'ಕೇಳಿ' : selectedLanguage === 'hi' ? 'सुनें' : 'Listen'}</span>
          </button>
        </div>

        <h2 className="font-headline-sm text-lg md:text-xl font-bold text-primary-container leading-snug">
          {localizedQuestion}
        </h2>

        <p className="font-body-sm text-xs text-on-surface-variant">
          {localizedHelperText}
        </p>
      </div>

      {/* Voice Interaction Central Hub */}
      <div className="flex flex-col items-center justify-center py-2">
        {/* Pulsing Voice Orb with Mic Action */}
        <div className="relative flex items-center justify-center w-32 h-32">
          {voiceState === 'listening' ? (
            <>
              {/* Expanding Ripple Rings */}
              <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping opacity-75" />
              <div className="absolute -inset-3 rounded-full bg-secondary/10 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-orb-active relative z-10">
                <div className="flex items-center gap-1">
                  <span className="w-1 bg-white rounded-full animate-wave-bar-1" />
                  <span className="w-1 bg-white rounded-full animate-wave-bar-2" />
                  <span className="w-1 bg-white rounded-full animate-wave-bar-3" />
                  <span className="w-1 bg-white rounded-full animate-wave-bar-4" />
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              aria-label="Tap to speak your answer"
              onClick={handleStartListening}
              className="w-24 h-24 rounded-full bg-primary-container hover:bg-[#182746] flex items-center justify-center text-on-primary shadow-lg hover:shadow-orb-ambient transition-all active:scale-95 group relative z-10"
            >
              <span className="material-symbols-outlined text-4xl text-secondary group-hover:scale-110 transition-transform">
                mic
              </span>
            </button>
          )}
        </div>

        {/* Voice State Status Label */}
        <div className="mt-3 text-center">
          {voiceState === 'listening' ? (
            <div className="flex items-center gap-2 text-secondary font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span>{strings.listening}</span>
              <button
                type="button"
                onClick={handleStopListening}
                className="text-xs bg-secondary/15 hover:bg-secondary/25 text-secondary px-2 py-0.5 rounded ml-2"
              >
                Stop
              </button>
            </div>
          ) : voiceState === 'processing' ? (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
              <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <span>SARA SENSE processing speech...</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-on-surface-variant">
              {selectedLanguage === 'kn'
                ? 'ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ, ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ'
                : selectedLanguage === 'hi'
                ? 'बोलने के लिए माइक दबाएं, या नीचे टाइप करें'
                : 'Tap the microphone to speak, or type below'}
            </span>
          )}
        </div>
      </div>

      {/* Recognized Transcript & Editing Box */}
      <div className="flex flex-col gap-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            {selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ' : selectedLanguage === 'hi' ? 'आपकी प्रतिक्रिया' : 'Your Response'}
          </span>
          <button
            type="button"
            onClick={() => setIsEditingManually(!isEditingManually)}
            className="flex items-center gap-1 text-xs text-secondary hover:underline font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isEditingManually ? 'mic' : 'edit'}
            </span>
            <span>
              {isEditingManually
                ? (selectedLanguage === 'kn' ? 'ಧ್ವನಿ ಇನ್ಪುಟ್' : 'Voice Input')
                : (selectedLanguage === 'kn' ? 'ತಿದ್ದುಪಡಿ ಮಾಡಿ' : 'Edit Response')}
            </span>
          </button>
        </div>

        {isEditingManually ? (
          <div className="flex flex-col gap-2">
            {currentField.type === 'textarea' ? (
              <textarea
                rows={3}
                value={manualInputValue}
                onChange={(e) => {
                  setManualInputValue(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={currentField.placeholder}
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
              />
            ) : (
              <input
                type={currentField.type}
                value={manualInputValue}
                onChange={(e) => {
                  setManualInputValue(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={currentField.placeholder}
                className="w-full h-12 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
              />
            )}
          </div>
        ) : (
          <div className="min-h-[50px] p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
            <p className="font-body-md text-sm text-on-surface">
              {transcript || manualInputValue ? (
                <span className="font-medium text-primary-container">
                  "{transcript || manualInputValue}"
                </span>
              ) : (
                <span className="text-on-surface-variant italic">
                  {selectedLanguage === 'kn'
                    ? 'ಇನ್ನೂ ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಬಂದಿಲ್ಲ. ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.'
                    : selectedLanguage === 'hi'
                    ? 'अभी तक कोई आवाज़ नहीं सुनी गई। ऊपर माइक दबाएं या टाइप करें।'
                    : 'No voice response heard yet. Tap microphone above or type.'}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Validation or Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-error font-medium p-2 rounded bg-error-container/30">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Answer Chips */}
      <div className="flex flex-col gap-2">
        <span className="font-label-md text-xs text-on-surface-variant font-medium">
          Try saying or tapping:
        </span>
        <div className="flex flex-wrap gap-2">
          {currentField.examples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className="px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-secondary/15 text-primary-container hover:text-secondary border border-outline-variant/40 text-xs font-medium transition-colors shadow-sm"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={onPreviousStep}
            className="min-h-[48px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary-container font-label-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{strings.previous}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleAcceptAndContinue}
          className="flex-1 min-h-[50px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>{strings.next}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

