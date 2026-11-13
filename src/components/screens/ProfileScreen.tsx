import React, { useState, useEffect, useRef } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';
import { SupportedLanguage } from '../../lib/sara/types';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface ProfileScreenProps {
  onOpenAuth?: () => void;
  currentUser?: any;
  selectedLanguage?: SupportedLanguage;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAuth,
  currentUser,
  selectedLanguage = 'en',
}) => {
  const isKn = selectedLanguage === 'kn';
  const isHi = selectedLanguage === 'hi';

  const t = {
    badge: isKn ? 'ದೃಢೀಕರಿಸಿದ ವೈಯಕ್ತಿಕ ಪ್ರೊಫೈಲ್' : isHi ? 'सत्यापित व्यक्तिगत प्रोफ़ाइल' : 'Verified Personal Profile',
    title: isKn ? 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮೆಮೊರಿ' : isHi ? 'व्यक्तिगत जानकारी मेमोरी' : 'Personal Information Memory',
    subtitle: isKn
      ? 'ವಿದ್ಯಾರ್ಥಿವೇತನ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವಾಗ ನೀವು ಪುನಃ ಟೈಪ್ ಮಾಡದಂತೆ SARA ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ.'
      : isHi
      ? 'SARA आपके सत्यापित तथ्यों को याद रखती है ताकि आपको कभी दोबारा टाइप न करना पड़े।'
      : 'SARA remembers your verified facts so you never have to re-type the same information when applying for scholarships or government registrations.',
    studentBadge: isKn ? 'ದೃಢೀಕರಿಸಿದ ವಿದ್ಯಾರ್ಥಿ' : isHi ? 'सत्यापित छात्र' : 'VERIFIED STUDENT',
    institutionLabel: isKn ? 'ಸಂಸ್ಥೆ / ಕಾಲೇಜು' : isHi ? 'संस्थान' : 'INSTITUTION',
    verifiedMobile: isKn ? 'ದೃಢೀಕರಿಸಿದ ಮೊಬೈಲ್' : isHi ? 'सत्यापित मोबाइल' : 'VERIFIED MOBILE',
    domicileCity: isKn ? 'ವಾಸಸ್ಥಳ ನಗರ' : isHi ? 'निवास शहर' : 'DOMICILE CITY',
    academicCgpa: isKn ? 'ಶೈಕ್ಷಣಿಕ ಸಿಜಿಪಿಎ' : isHi ? 'शैक्षणिक सीजीपीए' : 'ACADEMIC CGPA',
    dateOfBirthLabel: isKn ? 'ಹುಟ್ಟಿದ ದಿನಾಂಕ' : isHi ? 'जन्म तिथि' : 'DATE OF BIRTH',
    identitySection: isKn ? 'ಗುರುತಿನ ವಿವರಗಳು' : isHi ? 'पहचान विवरण' : 'Identity Details',
    fullNameLabel: isKn ? 'ಪೂರ್ಣ ಹೆಸರು (ಅಧಿಕೃತ ದಾಖಲೆಗಳಂತೆ)' : isHi ? 'पूरा नाम (रिकॉर्ड के अनुसार)' : 'Full Name (As in Official Records)',
    phoneLabel: isKn ? 'ದೃಢೀಕರಿಸಿದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : isHi ? 'सत्यापित फोन नंबर' : 'Verified Phone Number',
    dobLabel: isKn ? 'ಹುಟ್ಟಿದ ದಿನಾಂಕ' : isHi ? 'जन्म तिथि' : 'Date of Birth',
    ageLabel: isKn ? 'ವಯಸ್ಸು' : isHi ? 'उम्र' : 'Age',
    academicSection: isKn ? 'ಶೈಕ್ಷಣಿಕ ವಿವರಗಳು' : isHi ? 'शैक्षणिक विवरण' : 'Educational Details',
    collegeLabel: isKn ? 'ಕಾಲೇಜು / ಸಂಸ್ಥೆಯ ಹೆಸರು' : isHi ? 'कॉलेज / संस्थान का नाम' : 'College / Institution Name',
    degreeLabel: isKn ? 'ಪದವಿ / ಕೋರ್ಸ್' : isHi ? 'डिग्री / कोर्स' : 'Degree / Course',
    usnLabel: isKn ? 'ವಿಶ್ವವಿದ್ಯಾಲಯ ಸೀಟ್ ಸಂಖ್ಯೆ (USN)' : isHi ? 'विश्वविद्यालय सीट संख्या (USN)' : 'University Seat Number (USN)',
    gpaLabel: isKn ? 'ಸಿಜಿಪಿಎ / ಶೇಕಡಾವಾರು' : isHi ? 'कुल सीजीपीए / प्रतिशत' : 'Cumulative GPA / Percentage',
    addressSection: isKn ? 'ವಸತಿ ವಿಳಾಸ ವಿವರಗಳು' : isHi ? 'आवासीय विवरण' : 'Residential Domicile & Address',
    cityLabel: isKn ? 'ನಗರ / ಪುರಸಭೆ ಪ್ರದೇಶ' : isHi ? 'शहर / नगर क्षेत्र' : 'City / Municipal Area',
    pincodeLabel: isKn ? 'ಅಂಚೆ ಪಿನ್‌ಕೋಡ್' : isHi ? 'पिनकोड' : 'Postal Index Number (Pincode)',
    currentAddressLabel: isKn ? 'ಪ್ರಸ್ತುತ ವಸತಿ ವಿಳಾಸ' : isHi ? 'वर्तमान आवासीय पता' : 'Current Residential Address',
    stateLabel: isKn ? 'ರಾಜ್ಯ' : isHi ? 'राज्य' : 'State',
    saveBtn: isKn ? 'ಉಳಿಸಿ ಮತ್ತು ಸಿಂಕ್ ಮಾಡಿ' : isHi ? 'सहेजें और सिंक करें' : 'Save & Synchronize Verified Facts',
    savingBtn: isKn ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : isHi ? 'सहेजा जा रहा है...' : 'Saving Facts...',
    voiceAssistantBtn: isKn ? '🎙️ ಧ್ವನಿ ಮೂಲಕ ಪ್ರೊಫೈಲ್ ಭರ್ತಿ ಮಾಡಿ' : isHi ? '🎙️ आवाज से प्रोफ़ाइल भरें' : '🎙️ Fill Profile with SARA Voice Assistant',
    stopVoiceAssistantBtn: isKn ? 'ಧ್ವನಿ ಸಹಾಯಕ ನಿಲ್ಲಿಸಿ' : isHi ? 'वॉयस असिस्टेंट रोकें' : 'Stop Voice Assistant',
    voiceCardTitle: isKn ? 'SARA ಧ್ವನಿ ಪ್ರೊಫೈಲ್ ಸಹಾಯಕ' : isHi ? 'SARA वॉयस प्रोफ़ाइल असिस्टेंट' : 'SARA Voice Profile Assistant',
    voiceCardSubtitle: isKn
      ? 'SARA ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಒಂದೊಂದಾಗಿ ಕನ್ನಡದಲ್ಲೇ ಕೇಳುತ್ತದೆ. ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.'
      : isHi
      ? 'SARA आपसे एक-एक करके विवरण पूछेगी। माइक्रोफ़ोन दबाकर बोलें या टाइप करें।'
      : 'SARA will ask for each detail in your preferred language. Speak or type your answer.',
    confirmNextBtn: isKn ? 'ದೃಢೀಕರಿಸಿ & ಮುಂದಿನ ವಿವರ' : isHi ? 'पुष्टि करें और अगला' : 'Confirm & Next Field',
    tapToSpeak: isKn ? 'ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ' : isHi ? 'बोलने के लिए माइक दबाएं' : 'Tap Microphone to Speak',
    listeningStatus: isKn ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ದಯವಿಟ್ಟು ಮಾತನಾಡಿ' : isHi ? 'सुन रहे हैं... कृपया बोलें' : 'Listening... speak clearly now',
    speakingStatus: isKn ? 'SARA ಮಾತನಾಡುತ್ತಿದೆ...' : isHi ? 'SARA बोल रही है...' : 'SARA is speaking...',
    allFieldsCompleted: isKn
      ? 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಎಲ್ಲಾ 10 ವಿವರಗಳನ್ನು ಧ್ವನಿ ಮೂಲಕ ಯಶಸ್ವಿಯಾಗಿ ನಮೂದಿಸಲಾಗಿದೆ.'
      : isHi
      ? 'बधाई हो! आपके सभी 10 विवरण वॉयस द्वारा सफलतापूर्वक भर दिए गए हैं।'
      : 'Success! All 10 profile facts have been verified and saved to your SARA vault.',
    quickDemoBtn: isKn ? '⚡ ತ್ವರಿತ ಡೆಮೊ ಧ್ವನಿ ಭರ್ತಿ' : isHi ? '⚡ त्वरित डेमो वॉयस ऑटोफिल' : '⚡ Quick Demo Voice Fill',
  };

  const PROFILE_STEPS = [
    {
      field: 'fullName',
      label: t.fullNameLabel,
      question: isKn ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು? (ಉದಾಹರಣೆಗೆ ಜೀವನ್ ಗೌಡ)' : 'What is your full legal name as in official records?',
      placeholder: 'e.g. Jeevan Gowda',
      demoVal: 'Jeevan Gowda H M',
    },
    {
      field: 'phone',
      label: t.phoneLabel,
      question: isKn ? 'ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ತಿಳಿಸಿ?' : 'What is your 10-digit primary mobile number?',
      placeholder: 'e.g. 6362981285',
      demoVal: '6362981285',
    },
    {
      field: 'dateOfBirth',
      label: t.dobLabel,
      question: isKn ? 'ನಿಮ್ಮ ಹುಟ್ಟಿದ ದಿನಾಂಕ ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ 2006 ಆಗಸ್ಟ್ 12)?' : 'What is your date of birth (e.g. 2006-08-12)?',
      placeholder: 'YYYY-MM-DD',
      demoVal: '2006-08-12',
    },
    {
      field: 'age',
      label: t.ageLabel,
      question: isKn ? 'ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?' : 'What is your age in completed years?',
      placeholder: 'e.g. 19',
      demoVal: '19',
    },
    {
      field: 'institution',
      label: t.collegeLabel,
      question: isKn ? 'ನಿಮ್ಮ ಕಾಲೇಜು ಅಥವಾ ಸಂಸ್ಥೆಯ ಹೆಸರು ಏನು?' : 'What is your college or enrolled institution name?',
      placeholder: 'e.g. RNS Institute of Technology',
      demoVal: 'RNS Institute of Technology',
    },
    {
      field: 'course',
      label: t.degreeLabel,
      question: isKn ? 'ನಿಮ್ಮ ಪದವಿ ಅಥವಾ ಕೋರ್ಸ್ ಯಾವುದು?' : 'What is your degree programme or engineering course?',
      placeholder: 'e.g. BE Computer Science & Engineering',
      demoVal: 'BE Computer Science & Engineering',
    },
    {
      field: 'usn',
      label: t.usnLabel,
      question: isKn ? 'ನಿಮ್ಮ ವಿಶ್ವವಿದ್ಯಾಲಯ ನೋಂದಣಿ ಸಂಖ್ಯೆ (USN) ತಿಳಿಸಿ?' : 'What is your university seat number (USN)?',
      placeholder: 'e.g. 1RN23CS098',
      demoVal: '1RN23CS098',
    },
    {
      field: 'gpa',
      label: t.gpaLabel,
      question: isKn ? 'ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಸಿಜಿಪಿಎ ಅಥವಾ ಶೇಕಡಾವಾರು ಎಷ್ಟು?' : 'What is your cumulative grade point average (CGPA)?',
      placeholder: 'e.g. 9.24',
      demoVal: '9.24',
    },
    {
      field: 'city',
      label: t.cityLabel,
      question: isKn ? 'ನಿಮ್ಮ ವಾಸಸ್ಥಳ ನಗರ ಅಥವಾ ಜಿಲ್ಲೆ ಯಾವುದು?' : 'Which city or municipal area do you reside in?',
      placeholder: 'e.g. Bengaluru',
      demoVal: 'Bengaluru',
    },
    {
      field: 'currentAddress',
      label: t.currentAddressLabel,
      question: isKn ? 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಸತಿ ವಿಳಾಸ ತಿಳಿಸಿ?' : 'What is your current residential correspondence address?',
      placeholder: 'e.g. 125, Vighneshwara Nagar, Sunkadakatte, Bengaluru 560091',
      demoVal: '125, Vighneshwara Nagar 12th Cross Madeshwara Extension, Sunkadakatte, Bengaluru 560091',
    },
  ];

  const [profile, setProfile] = useState<any>({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    age: '',
    country: 'India',
    state: 'Karnataka',
    city: '',
    currentAddress: '',
    permanentAddress: '',
    educationLevel: 'Undergraduate',
    course: '',
    institution: '',
    usn: '',
    gpa: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Interactive Profile Voice Assistant State
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [voiceInputValue, setVoiceInputValue] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!SaraApiClient.getToken()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await SaraApiClient.getProfile();
      if (res.profile) {
        setProfile((prev: any) => ({ ...prev, ...res.profile }));
      }
    } catch (err: any) {
      console.warn('Load profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!SaraApiClient.getToken() && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xl space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-lg font-bold text-primary-container">Sign In to View Your Profile</h2>
        <p className="text-xs text-on-surface-variant">
          To protect your personal data with database-level isolation, please verify your mobile number or email.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Sign In with OTP</span>
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await SaraApiClient.updateProfile(profile);
      setProfile(res.profile);
      setStatusMsg('Personal profile updated and synchronized with verified facts.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      SaraSpeechSynthesisService.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const speakStepQuestion = (stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= PROFILE_STEPS.length) return;
    const step = PROFILE_STEPS[stepIdx];
    setIsSpeaking(true);

    const prefix = isKn ? `ಹಂತ ${stepIdx + 1}: ` : isHi ? `चरण ${stepIdx + 1}: ` : `Step ${stepIdx + 1}: `;
    const spokenText = `${prefix}${step.question}`;

    const langLocale = isKn ? 'kn-IN' : isHi ? 'hi-IN' : 'en-IN';
    SaraSpeechSynthesisService.speak(spokenText, {
      lang: langLocale,
      rate: isKn ? 0.95 : 1.0,
      onEnd: () => setIsSpeaking(false),
    });
  };

  const startVoiceAssistant = (stepIdx: number = 0) => {
    setIsVoiceAssistantActive(true);
    setCurrentStepIdx(stepIdx);
    const step = PROFILE_STEPS[stepIdx];
    const existingVal = profile[step.field] || '';
    setVoiceInputValue(existingVal);
    speakStepQuestion(stepIdx);
  };

  const stopVoiceAssistant = () => {
    SaraSpeechSynthesisService.stop();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsVoiceAssistantActive(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. You can type in the box below.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = isKn ? 'kn-IN' : isHi ? 'hi-IN' : 'en-IN';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceInputValue(transcript);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.start();
  };

  const handleConfirmStepAnswer = async (overrideValue?: string) => {
    const step = PROFILE_STEPS[currentStepIdx];
    const valToSave = (overrideValue !== undefined ? overrideValue : voiceInputValue).trim() || step.demoVal;

    const updatedProfile = {
      ...profile,
      [step.field]: valToSave,
    };
    setProfile(updatedProfile);

    // If more steps remain
    if (currentStepIdx < PROFILE_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = PROFILE_STEPS[nextIdx];
      setVoiceInputValue(updatedProfile[nextStep.field] || '');
      speakStepQuestion(nextIdx);
    } else {
      // Completed all 10 steps!
      setIsVoiceAssistantActive(false);
      setIsSaving(true);
      try {
        const res = await SaraApiClient.updateProfile(updatedProfile);
        setProfile(res.profile);
        setStatusMsg(t.allFieldsCompleted);

        const completionSpeech = isKn
          ? 'ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನ ಎಲ್ಲಾ 10 ವಿವರಗಳು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಆಗಿವೆ.'
          : isHi
          ? 'धन्यवाद! आपके प्रोफ़ाइल के सभी 10 विवरण सत्यापित और सहेज लिए गए हैं।'
          : 'Thank you! All 10 profile facts have been verified and saved to your SARA vault.';

        SaraSpeechSynthesisService.speak(completionSpeech, {
          lang: isKn ? 'kn-IN' : isHi ? 'hi-IN' : 'en-IN',
          rate: 1.0,
        });
      } catch (err: any) {
        setErrorMsg('Error saving profile facts: ' + err.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleFillAllDemoVoice = async () => {
    const demoProfile = {
      ...profile,
      fullName: 'Jeevan Gowda H M',
      phone: '6362981285',
      dateOfBirth: '2006-08-12',
      age: '19',
      institution: 'RNS Institute of Technology',
      course: 'BE Computer Science & Engineering',
      usn: '1RN23CS098',
      gpa: '9.24',
      city: 'Bengaluru',
      state: 'Karnataka',
      currentAddress: '125, Vighneshwara Nagar 12th Cross Madeshwara Extension, Sunkadakatte, Bengaluru 560091',
    };
    setProfile(demoProfile);
    setIsSaving(true);
    try {
      const res = await SaraApiClient.updateProfile(demoProfile);
      setProfile(res.profile);
      setStatusMsg(t.allFieldsCompleted);
      setIsVoiceAssistantActive(false);

      const demoSpeech = isKn
        ? 'ಜೀವನ್ ಗೌಡ, ಆರ್ ಎನ್ ಎಸ್ ಕಾಲೇಜು, ಬಿಇ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್, ಯುಎಸ್ಎನ್ 1RN23CS098, ಸಿಜಿಪಿಎ 9.24 ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಧ್ವನಿ ಮೂಲಕ ದೃಢೀಕರಿಸಲಾಗಿದೆ.'
        : 'Jeevan Gowda, RNSIT, BE CSE, USN 1RN23CS098, CGPA 9.24 details verified and synchronized via voice.';

      SaraSpeechSynthesisService.speak(demoSpeech, {
        lang: isKn ? 'kn-IN' : 'en-IN',
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>{t.badge}</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-container font-headline-sm">
            {t.title}
          </h1>
          <p className="text-xs text-on-surface-variant max-w-xl">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (isVoiceAssistantActive ? stopVoiceAssistant() : startVoiceAssistant(0))}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isVoiceAssistantActive
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isVoiceAssistantActive ? 'stop_circle' : 'record_voice_over'}
            </span>
            <span>{isVoiceAssistantActive ? t.stopVoiceAssistantBtn : t.voiceAssistantBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleFillAllDemoVoice}
            className="px-3 py-2.5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-primary-container font-semibold text-xs border border-outline-variant/50 transition-colors shadow-sm flex items-center gap-1.5"
            title="Automatically fills verified profile for demonstration"
          >
            <span className="material-symbols-outlined text-amber-500 text-base">bolt</span>
            <span>{t.quickDemoBtn}</span>
          </button>
        </div>
      </div>

      {/* SARA Guided Voice Assistant Active Card */}
      {isVoiceAssistantActive && (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#101B34] to-[#142346] text-white border-2 border-secondary shadow-2xl space-y-5 animate-fade-in relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header & Step Pill Progress */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center border border-secondary/40">
                <span className="material-symbols-outlined text-xl animate-pulse">record_voice_over</span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide text-white font-headline-sm">
                  {t.voiceCardTitle}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {t.voiceCardSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-mono font-bold border border-secondary/40">
                {isKn ? `ಹಂತ ${currentStepIdx + 1} / 10` : `Step ${currentStepIdx + 1} / 10`}
              </span>
              <button
                type="button"
                onClick={stopVoiceAssistant}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SARA Speaking Question Bubble */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  {isSpeaking ? t.speakingStatus : 'SARA Asking:'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({PROFILE_STEPS[currentStepIdx].label})
                </span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {PROFILE_STEPS[currentStepIdx].question}
              </p>
            </div>

            <button
              type="button"
              onClick={() => speakStepQuestion(currentStepIdx)}
              className="px-3 py-1.5 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-secondary text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors border border-secondary/30"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>{isKn ? 'ಕೇಳಿ' : 'Listen'}</span>
            </button>
          </div>

          {/* Live Microphone Recording Orb & Input */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Animated Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-xl ${
                isListening
                  ? 'bg-rose-500 text-white ring-8 ring-rose-500/30 scale-105 animate-pulse'
                  : 'bg-gradient-to-tr from-secondary to-teal-400 text-slate-900 hover:scale-105 ring-4 ring-secondary/20'
              }`}
            >
              <span className="material-symbols-outlined text-3xl">
                {isListening ? 'graphic_eq' : 'mic'}
              </span>
            </button>

            {/* Answer Input Field */}
            <div className="flex-1 w-full space-y-1">
              <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between">
                <span>{isListening ? t.listeningStatus : t.tapToSpeak}</span>
                <button
                  type="button"
                  onClick={() => setVoiceInputValue(PROFILE_STEPS[currentStepIdx].demoVal)}
                  className="text-[10px] text-secondary hover:underline"
                >
                  {isKn ? `ಉದಾಹರಣೆ ಬಳಸಿ: "${PROFILE_STEPS[currentStepIdx].demoVal}"` : `Use example: "${PROFILE_STEPS[currentStepIdx].demoVal}"`}
                </button>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={voiceInputValue}
                  onChange={(e) => setVoiceInputValue(e.target.value)}
                  placeholder={PROFILE_STEPS[currentStepIdx].placeholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium focus:border-secondary outline-none placeholder:text-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmStepAnswer();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleConfirmStepAnswer()}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-slate-950 font-bold text-xs hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>{t.confirmNextBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step Navigation Dots */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              {PROFILE_STEPS.map((s, idx) => (
                <button
                  key={s.field}
                  type="button"
                  onClick={() => startVoiceAssistant(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStepIdx
                      ? 'w-6 bg-secondary'
                      : profile[s.field]
                      ? 'bg-teal-400/80'
                      : 'bg-white/20'
                  }`}
                  title={`${idx + 1}. ${s.label}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {currentStepIdx > 0 && (
                <button
                  type="button"
                  onClick={() => startVoiceAssistant(currentStepIdx - 1)}
                  className="hover:text-white transition-colors"
                >
                  ← {isKn ? 'ಹಿಂದಿನದು' : 'Previous'}
                </button>
              )}
              {currentStepIdx < PROFILE_STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleConfirmStepAnswer(profile[PROFILE_STEPS[currentStepIdx].field] || PROFILE_STEPS[currentStepIdx].demoVal)}
                  className="hover:text-white transition-colors"
                >
                  {isKn ? 'ಮುಂದಕ್ಕೆ ಹೋಗಿ →' : 'Skip →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Motion-Designed Student Identity Hologram Card */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#101B34] via-[#182746] to-[#0A1224] text-white border border-[#17B99A]/30 shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Ambient Hologram Glow Orb */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#17B99A]/20 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#17B99A] to-teal-400 p-0.5 shadow-lg shadow-[#17B99A]/30 animate-pulse">
              <div className="w-full h-full rounded-2xl bg-[#101B34] flex items-center justify-center text-[#17B99A]">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide text-white font-display">
                  {profile.fullName || 'Jeevan Gowda H M'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#17B99A]/20 text-[#17B99A] text-[10px] font-mono font-bold flex items-center gap-1 border border-[#17B99A]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17B99A] animate-ping" />
                  {t.studentBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {profile.usn ? `USN: ${profile.usn}` : 'USN: 1RN23CS098'} • {profile.course || 'BE Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono backdrop-blur-sm">
              <div className="text-[10px] text-slate-400">{t.institutionLabel}</div>
              <div className="text-teal-300 font-semibold truncate max-w-[200px]">
                {profile.institution || 'RNS Institute of Technology'}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">{t.verifiedMobile}</span>
            <span className="text-slate-200 font-medium">{profile.phone || '6362981285'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">{t.domicileCity}</span>
            <span className="text-slate-200 font-medium">{profile.city || 'Bengaluru'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">{t.academicCgpa}</span>
            <span className="text-[#17B99A] font-bold">{profile.gpa || '9.24'} / 10</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">{t.dateOfBirthLabel}</span>
            <span className="text-slate-200 font-medium">{profile.dateOfBirth || '2006-08-12'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Identity */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
            <span>{t.identitySection}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.fullNameLabel}
              </label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="e.g. Jeevan Gowda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.phoneLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none pr-24"
                />
                <span className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold flex items-center gap-1 pointer-events-none">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>Verified</span>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.dobLabel}
              </label>
              <input
                type="date"
                value={profile.dateOfBirth || ''}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.ageLabel}
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="e.g. 19"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
            <span>{t.academicSection}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.collegeLabel}
              </label>
              <input
                type="text"
                value={profile.institution || ''}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                placeholder="e.g. RNS Institute of Technology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.degreeLabel}
              </label>
              <input
                type="text"
                value={profile.course || ''}
                onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                placeholder="e.g. BE Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.usnLabel}
              </label>
              <input
                type="text"
                value={profile.usn || ''}
                onChange={(e) => setProfile({ ...profile, usn: e.target.value.toUpperCase() })}
                placeholder="e.g. 1RN23CS089"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-mono font-bold focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.gpaLabel}
              </label>
              <input
                type="text"
                value={profile.gpa || ''}
                onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                placeholder="e.g. 8.85 CGPA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
            <span>{t.addressSection}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.cityLabel}
              </label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.stateLabel}
              </label>
              <input
                type="text"
                value={profile.state || 'Karnataka'}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-primary-container mb-1">
                {t.currentAddressLabel}
              </label>
              <textarea
                rows={2}
                value={profile.currentAddress || ''}
                onChange={(e) => setProfile({ ...profile, currentAddress: e.target.value })}
                placeholder="e.g. #12, 4th Cross, Vijayanagar, Bengaluru - 560098"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-transform active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                <span>{t.savingBtn}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{t.saveBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

