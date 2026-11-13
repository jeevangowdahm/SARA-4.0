import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScreenId,
  SupportedLanguage,
  AccessibilitySettings,
  FieldId,
  ExtractedField,
  SaraSensePipelineResult,
  CompletedRegistration,
} from './lib/sara/types';
import { SaraConversationEngine } from './lib/sara/conversationEngine';
import { SaraSpeechSynthesisService } from './lib/sara/speechProvider';
import { SaraApiClient } from './lib/sara/api/client';

// Existing Screens & Cinematic Experience
import { CinematicScrollExperience } from './components/cinematic/CinematicScrollExperience';
import { Header } from './components/layout/Header';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LanguageSelectionScreen } from './components/screens/LanguageSelectionScreen';
import { ConversationalFormScreen } from './components/screens/ConversationalFormScreen';
import { SaraSenseIntelligenceScreen } from './components/screens/SaraSenseIntelligenceScreen';
import { ClarificationScreen } from './components/screens/ClarificationScreen';
import { ReviewVerificationScreen } from './components/screens/ReviewVerificationScreen';
import { CompletionSuccessScreen } from './components/screens/CompletionSuccessScreen';
import { AccessibilitySettingsScreen } from './components/screens/AccessibilitySettingsScreen';

// SARA 4.0 Platform Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { DocumentVaultScreen } from './components/screens/DocumentVaultScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ApplicationHistoryScreen } from './components/screens/ApplicationHistoryScreen';
import { PrivacySecurityScreen } from './components/screens/PrivacySecurityScreen';

// Modals
import { SmartDocumentModal } from './components/modals/SmartDocumentModal';
import { ExtensionCompanionModal } from './components/modals/ExtensionCompanionModal';
import { AuthModal } from './components/modals/AuthModal';
import { DocumentChatbotModal } from './components/modals/DocumentChatbotModal';

export const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('cinematic_landing');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Modals & Easy Mode State
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [easyMode, setEasyMode] = useState<boolean>(() => {
    return localStorage.getItem('sara_easy_mode') === 'true';
  });

  // Selected Language State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('sara_selected_language');
    return (saved as SupportedLanguage) || 'en';
  });

  // Accessibility Settings State
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('sara_accessibility_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      textSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      spokenInstructions: true,
      speechRate: 1.0,
      voicePersona: 'warm',
      microphoneSensitivity: 'normal',
      singleSwitchNavigation: false,
    };
  });

  // Core Conversation Engine
  const engine = useMemo(() => new SaraConversationEngine(), []);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [fieldValues, setFieldValues] = useState<Partial<Record<FieldId, ExtractedField>>>({});
  const [pipelineResult, setPipelineResult] = useState<SaraSensePipelineResult | undefined>(undefined);
  const [completedRegistration, setCompletedRegistration] = useState<CompletedRegistration | null>(null);
  const [isGlobalSpeaking, setIsGlobalSpeaking] = useState<boolean>(false);

  // Check authenticated session on mount
  useEffect(() => {
    if (SaraApiClient.getToken()) {
      SaraApiClient.getMe()
        .then((res) => {
          if (res.user) {
            setCurrentUser(res.user);
          }
        })
        .catch(() => {
          SaraApiClient.clearToken();
        });
    }
  }, []);

  // Apply Accessibility Classes to document
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${accessibilitySettings.textSize}`);

    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    localStorage.setItem('sara_accessibility_settings', JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  // Save Language & Easy Mode
  useEffect(() => {
    localStorage.setItem('sara_selected_language', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('sara_easy_mode', String(easyMode));
  }, [easyMode]);

  // Navigation Handler
  const navigateTo = useCallback(
    (screen: ScreenId, addToHistory: boolean = true) => {
      SaraSpeechSynthesisService.stop();
      setIsGlobalSpeaking(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (addToHistory) {
        setScreenHistory((prev) => [...prev, currentScreen]);
      }
      setCurrentScreen(screen);
    },
    [currentScreen]
  );

  // Back Navigation Handler
  const handleBack = useCallback(() => {
    SaraSpeechSynthesisService.stop();
    setIsGlobalSpeaking(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('dashboard');
    }
  }, [screenHistory]);

  // Logout Handler
  const handleLogout = useCallback(async () => {
    await SaraApiClient.logout();
    setCurrentUser(null);
    navigateTo('cinematic_landing');
  }, [navigateTo]);

  // Spoken overview for active screen
  const handleGlobalReadAloud = useCallback(() => {
    if (isGlobalSpeaking) {
      SaraSpeechSynthesisService.stop();
      setIsGlobalSpeaking(false);
      return;
    }

    let speechText = '';
    switch (currentScreen) {
      case 'dashboard':
        speechText = 'Welcome to your SARA Dashboard. Manage your documents, verified identity, and form assistance records.';
        break;
      case 'vault':
        speechText = 'Personal Document Vault. Your documents are stored safely with encryption and data isolation.';
        break;
      case 'profile':
        speechText = 'Personal identity profile. Review and update your verified facts.';
        break;
      case 'privacy':
        speechText = 'Privacy and security center. Inspect your audit trail or export your personal data.';
        break;
      case '01_welcome':
        speechText = 'Welcome to SARA, your Smart Accessible Response Assistant. Speak naturally to complete digital forms without typing.';
        break;
      case '02_language':
        speechText = 'Choose your preferred language. You can select English, Kannada, or Hindi, and set your comfortable speech pacing.';
        break;
      case '03_form': {
        const cur = engine.getCurrentFieldDefinition();
        speechText = cur ? cur.questionAudioText : 'Please speak your answer clearly.';
        break;
      }
      case '04_sense':
        speechText = 'SARA SENSE Live Dashboard. SARA extracts and maps your speech directly to form fields with deterministic validation.';
        break;
      case '05_clarification':
        speechText =
          pipelineResult?.clarificationTarget?.suggestedPrompt ||
          'Please clarify your response so SARA can record it accurately.';
        break;
      case '06_review':
        speechText =
          'Review your details. Please verify each field. SARA will never submit anything without your explicit confirmation.';
        break;
      case '07_completion':
        speechText = 'Congratulations! Your community service registration has been completed successfully.';
        break;
      case '08_accessibility':
        speechText = 'Accessibility settings. Adjust text size, contrast, speech speed, or test your voice profile with SARA.';
        break;
      default:
        speechText = 'SARA is listening and ready to assist.';
    }

    setIsGlobalSpeaking(true);
    SaraSpeechSynthesisService.speak(speechText, {
      lang: selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN',
      rate: accessibilitySettings.speechRate,
      onEnd: () => setIsGlobalSpeaking(false),
    });
  }, [currentScreen, engine, pipelineResult, selectedLanguage, accessibilitySettings.speechRate, isGlobalSpeaking]);

  // Form field accepted
  const handleAcceptField = (
    value: string,
    rawTranscript: string,
    method: ExtractedField['extractionMethod']
  ) => {
    const cur = engine.getCurrentFieldDefinition();
    if (!cur) return;

    engine.setFieldValue(cur.id, value, rawTranscript, method);
    setFieldValues(engine.getFieldValues());

    // Advance to next step or go to review
    const hasMore = engine.nextStep();
    if (hasMore) {
      setStepIndex(engine.getCurrentStepIndex());
      if (accessibilitySettings.spokenInstructions) {
        const nextDef = engine.getCurrentFieldDefinition();
        if (nextDef) {
          SaraSpeechSynthesisService.speak(nextDef.questionAudioText, {
            lang: selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN',
            rate: accessibilitySettings.speechRate,
          });
        }
      }
    } else {
      navigateTo('06_review');
    }
  };

  // Multi-field extraction detected
  const handleMultiFieldExtracted = (result: SaraSensePipelineResult) => {
    setPipelineResult(result);
    for (const [fId, item] of Object.entries(result.extractedFields) as [FieldId, ExtractedField][]) {
      engine.setFieldValue(fId, item.value, item.rawTranscript, item.extractionMethod);
    }
    setFieldValues(engine.getFieldValues());
    navigateTo('04_sense');
  };

  // Trigger Clarification
  const handleTriggerClarification = (result: SaraSensePipelineResult) => {
    setPipelineResult(result);
    navigateTo('05_clarification');
  };

  // Resolve Clarification
  const handleResolveClarification = (correctedValue: string, rawTranscript: string) => {
    const target = pipelineResult?.clarificationTarget?.fieldId || 'mobileNumber';
    engine.setFieldValue(target, correctedValue, rawTranscript, 'clarification');
    setFieldValues(engine.getFieldValues());
    navigateTo('03_form');
  };

  // Confirm final review & complete registration
  const handleConfirmSubmission = () => {
    const reg = engine.finalizeRegistration();
    setCompletedRegistration(reg);

    // Save to real database if authenticated
    if (SaraApiClient.getToken()) {
      SaraApiClient.saveApplication(
        {
          websiteHostname: 'local.sara.community',
          applicationName: 'Community Volunteer & Scholarship Registration',
          applicationCategory: 'scholarship',
          applicationStatus: 'fields_populated',
          completedFieldsCount: Object.keys(reg.data).length,
          totalFieldsCount: 5,
          notes: 'Completed with SARA Voice Assistance',
        },
        Object.entries(reg.data).map(([k, v]) => ({
          fieldId: k,
          fieldLabel: k,
          fieldSemanticType: k,
          selectedValue: v,
          userApproved: true,
        }))
      ).catch(console.warn);
    }

    navigateTo('07_completion');
  };

  // Apply Document Extracted Data
  const handleApplyDocumentData = (data: Record<string, string>) => {
    if (data.full_name || data.applicantName) {
      const name = data.full_name || data.applicantName;
      engine.setFieldValue('fullName', name, name, 'deterministic_rule');
    }
    if (data.city || data.institution) {
      const loc = data.city || 'Bengaluru';
      engine.setFieldValue('location', loc, loc, 'deterministic_rule');
    }
    setFieldValues(engine.getFieldValues());
    navigateTo('03_form');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* 1. CINEMATIC SCROLL EXPERIENCE */}
      {currentScreen === 'cinematic_landing' && (
        <CinematicScrollExperience
          onStartApp={() => navigateTo(currentUser ? 'dashboard' : '01_welcome')}
          reducedMotion={accessibilitySettings.reducedMotion}
        />
      )}

      {/* 2. SARA PLATFORM WITH ACCESSIBLE HEADER */}
      {currentScreen !== 'cinematic_landing' && (
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={navigateTo}
            onBack={handleBack}
            canBack={currentScreen !== 'dashboard' && currentScreen !== '01_welcome'}
            selectedLanguage={selectedLanguage}
            onReadAloud={handleGlobalReadAloud}
            isSpeaking={isGlobalSpeaking}
            onOpenDocumentModal={() => setIsDocumentModalOpen(true)}
            onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            easyMode={easyMode}
            onToggleEasyMode={() => setEasyMode(!easyMode)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="flex-1 w-full pt-20 pb-safe">
            {/* SCREEN: Dashboard */}
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                onNavigate={navigateTo}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenDocumentVault={() => navigateTo('vault')}
                currentUser={currentUser}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* SCREEN: Personal Document Vault */}
            {currentScreen === 'vault' && (
              <DocumentVaultScreen
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* SCREEN: Personal Profile */}
            {currentScreen === 'profile' && (
              <ProfileScreen
                currentUser={currentUser}
                selectedLanguage={selectedLanguage}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* SCREEN: Application History */}
            {currentScreen === 'history' && (
              <ApplicationHistoryScreen
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* SCREEN: Privacy & Security */}
            {currentScreen === 'privacy' && (
              <PrivacySecurityScreen
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* SCREEN 1: Welcome & Onboarding */}
            {currentScreen === '01_welcome' && (
              <WelcomeScreen
                onStartVoice={() => navigateTo('03_form')}
                onStartTyped={() => navigateTo('03_form')}
                onOpenLanguage={() => navigateTo('02_language')}
                onOpenAccessibility={() => navigateTo('08_accessibility')}
                onPlayAudioExplanation={handleGlobalReadAloud}
                selectedLanguage={selectedLanguage}
                isSpeaking={isGlobalSpeaking}
              />
            )}

            {/* SCREEN 2: Language Selection */}
            {currentScreen === '02_language' && (
              <LanguageSelectionScreen
                selectedLanguage={selectedLanguage}
                onSelectLanguage={(lang) => setSelectedLanguage(lang)}
                speechRate={accessibilitySettings.speechRate}
                onSelectSpeechRate={(rate) =>
                  setAccessibilitySettings((prev) => ({ ...prev, speechRate: rate }))
                }
                onContinue={() => navigateTo('03_form')}
              />
            )}

            {/* SCREEN 3: Conversational Form */}
            {currentScreen === '03_form' && (
              <ConversationalFormScreen
                currentField={engine.getCurrentFieldDefinition()!}
                currentStepIndex={stepIndex}
                totalSteps={engine.getTotalSteps()}
                currentFieldValue={engine.getFieldValue(engine.getCurrentFieldDefinition()!.id)}
                selectedLanguage={selectedLanguage}
                speechRate={accessibilitySettings.speechRate}
                onAcceptField={handleAcceptField}
                onMultiFieldExtracted={handleMultiFieldExtracted}
                onPreviousStep={() => {
                  engine.previousStep();
                  setStepIndex(engine.getCurrentStepIndex());
                }}
                onOpenSenseDashboard={() => navigateTo('04_sense')}
                onTriggerClarification={handleTriggerClarification}
              />
            )}

            {/* SCREEN 4: SARA SENSE Intelligence */}
            {currentScreen === '04_sense' && (
              <SaraSenseIntelligenceScreen
                pipelineResult={pipelineResult}
                onApplyExtractedFields={(fields) => {
                  for (const [fId, item] of Object.entries(fields) as [FieldId, ExtractedField][]) {
                    engine.setFieldValue(fId, item.value, item.rawTranscript, item.extractionMethod);
                  }
                  setFieldValues(engine.getFieldValues());
                }}
                onContinueToForm={() => navigateTo('03_form')}
                onSpeakAgain={() => navigateTo('03_form')}
              />
            )}

            {/* SCREEN 5: Clarification State */}
            {currentScreen === '05_clarification' && (
              <ClarificationScreen
                pipelineResult={pipelineResult}
                onResolveClarification={handleResolveClarification}
                onCancel={() => navigateTo('03_form')}
              />
            )}

            {/* SCREEN 6: Review & Verification */}
            {currentScreen === '06_review' && (
              <ReviewVerificationScreen
                fieldValues={fieldValues}
                onUpdateField={(fId, val) => {
                  engine.setFieldValue(fId, val, val, 'manual_input');
                  setFieldValues(engine.getFieldValues());
                }}
                onConfirmSubmission={handleConfirmSubmission}
                onReturnToForm={() => navigateTo('03_form')}
              />
            )}

            {/* SCREEN 7: Completion & Success */}
            {currentScreen === '07_completion' && completedRegistration && (
              <CompletionSuccessScreen
                registration={completedRegistration}
                onStartNew={() => navigateTo('dashboard')}
                onReturnHome={() => navigateTo('dashboard')}
              />
            )}

            {/* SCREEN 8: Accessibility Settings */}
            {currentScreen === '08_accessibility' && (
              <AccessibilitySettingsScreen
                settings={accessibilitySettings}
                onUpdateSettings={(newSet) =>
                  setAccessibilitySettings((prev) => ({ ...prev, ...newSet }))
                }
                selectedLanguage={selectedLanguage}
                onSelectLanguage={(lang) => setSelectedLanguage(lang)}
                onClose={handleBack}
              />
            )}
          </main>

          {/* SARA Modals */}
          <SmartDocumentModal
            isOpen={isDocumentModalOpen}
            onClose={() => setIsDocumentModalOpen(false)}
            onApplyExtractedData={handleApplyDocumentData}
          />

          <ExtensionCompanionModal
            isOpen={isExtensionModalOpen}
            onClose={() => setIsExtensionModalOpen(false)}
          />

          <DocumentChatbotModal
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            selectedLanguage={selectedLanguage}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('dashboard');
            }}
          />
        </>
      )}
    </div>
  );
};
