import React from 'react';
import { ScreenId, SupportedLanguage } from '../../lib/sara/types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onBack?: () => void;
  canBack?: boolean;
  selectedLanguage: SupportedLanguage;
  onReadAloud?: () => void;
  isSpeaking?: boolean;
  onOpenDocumentModal?: () => void;
  onOpenExtensionModal?: () => void;
  onOpenChatbot?: () => void;
  easyMode?: boolean;
  onToggleEasyMode?: () => void;
  onOpenAuth?: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onBack,
  canBack = true,
  selectedLanguage,
  onReadAloud,
  isSpeaking = false,
  onOpenDocumentModal,
  onOpenExtensionModal,
  onOpenChatbot,
  easyMode = false,
  onToggleEasyMode,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const getScreenTitle = () => {
    if (selectedLanguage === 'kn') {
      switch (currentScreen) {
        case 'dashboard':
          return 'SARA ವೈಯಕ್ತಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್';
        case 'profile':
          return 'ವೈಯಕ್ತಿಕ ಗುರುತಿನ ಪ್ರೊಫೈಲ್';
        case 'vault':
          return 'ದಾಖಲೆಗಳ ಖಾಸಗಿ ವಾಲ್ಟ್';
        case 'history':
          return 'ಅರ್ಜಿ ಇತಿಹಾಸ';
        case 'privacy':
          return 'ಗೌಪ್ಯತೆ ಮತ್ತು ಭದ್ರತಾ ಕೇಂದ್ರ';
        case '01_welcome':
          return 'ಸ್ವಾಗತ ಮತ್ತು ಪರಿಚಯ';
        case '02_language':
          return 'ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ ಆದ್ಯತೆಗಳು';
        case '03_form':
          return 'ಸಹಾಯಕರ ಫಾರ್ಮ್ ಭರ್ತಿ';
        case '04_sense':
          return 'SARA SENSE ಗ್ರಹಿಕೆ';
        case '05_clarification':
          return 'ಧ್ವನಿ ಸ್ಪಷ್ಟೀಕರಣ';
        case '06_review':
          return 'ಪರಿಶೀಲನೆ ಮತ್ತು ದೃಢೀಕರಣ';
        case '07_completion':
          return 'ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ';
        case '08_accessibility':
          return 'ಪ್ರವೇಶಿಸುವಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು';
        default:
          return 'SARA ಸಹಾಯ';
      }
    }
    switch (currentScreen) {
      case 'dashboard':
        return 'SARA Personal Dashboard';
      case 'profile':
        return 'Personal Identity Profile';
      case 'vault':
        return 'Personal Document Vault';
      case 'history':
        return 'Application History';
      case 'privacy':
        return 'Privacy & Security Center';
      case '01_welcome':
        return 'Welcome & Onboarding';
      case '02_language':
        return 'Language & Voice Preferences';
      case '03_form':
        return 'Assisted Form Fill';
      case '04_sense':
        return 'SARA SENSE Intelligence';
      case '05_clarification':
        return 'Voice Clarification';
      case '06_review':
        return 'Review & Verification';
      case '07_completion':
        return 'Registration Success';
      case '08_accessibility':
        return 'Accessibility Settings';
      default:
        return 'Assisted Form Fill';
    }
  };

  const languageLabels: Record<SupportedLanguage, string> = {
    en: 'EN',
    kn: 'ಕನ್ನಡ',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    ml: 'മലയാളം',
    mr: 'मराठी',
    bn: 'বাংলা',
    gu: 'ગુજરાતી',
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/80 shadow-[0_1px_8px_rgba(16,27,52,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Left: Back button + Logo + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {canBack && onBack ? (
            <button
              aria-label="Go back to previous screen"
              onClick={onBack}
              className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          ) : (
            <button
              aria-label="Return to cinematic landing"
              onClick={() => onNavigate('cinematic_landing')}
              className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
            </button>
          )}

          {/* SARA Logo Orb */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            role="button"
            tabIndex={0}
            aria-label="SARA Dashboard"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-secondary to-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-on-secondary">
                  graphic_eq
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col min-w-0 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-xs sm:text-sm text-primary-container truncate font-semibold leading-tight">
                {getScreenTitle()}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-secondary/15 text-secondary rounded font-bold">
                SARA 4.0
              </span>
            </div>
            <span className="font-label-md text-[10px] text-on-surface-variant truncate leading-none mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
              {currentUser ? `User: ${currentUser.identifier}` : 'Personal AI Platform'}
            </span>
          </div>
        </div>

        {/* Center / Right: Navigation Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Dashboard Quick Pill */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            title="SARA Dashboard"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              currentScreen === 'dashboard'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container text-primary-container hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            <span className="hidden md:inline">{selectedLanguage === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Dashboard'}</span>
          </button>

          {/* Document Vault Pill */}
          <button
            type="button"
            onClick={() => onNavigate('vault')}
            title="My Documents Vault"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              currentScreen === 'vault'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container text-primary-container hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            <span className="hidden md:inline">{selectedLanguage === 'kn' ? 'ವಾಲ್ಟ್' : 'Vault'}</span>
          </button>

          {/* Profile Pill */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            title="Personal Profile & Verified Facts"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              currentScreen === 'profile'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container text-primary-container hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span className="hidden md:inline">{selectedLanguage === 'kn' ? 'ಪ್ರೊಫೈಲ್' : 'Profile'}</span>
          </button>

          {/* Privacy Pill */}
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            title="Privacy, Consents & Security"
            className={`px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              currentScreen === 'privacy'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container text-primary-container hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span className="hidden lg:inline">{selectedLanguage === 'kn' ? 'ಗೌಪ್ಯತೆ' : 'Privacy'}</span>
          </button>

          {/* Extension Portal Launcher */}
          {onOpenExtensionModal && (
            <button
              type="button"
              onClick={onOpenExtensionModal}
              title="Connect to External Website (Chrome Extension)"
              className="px-2.5 py-1.5 rounded-xl bg-primary-container text-on-primary hover:bg-[#182746] flex items-center gap-1 text-xs font-semibold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">extension</span>
              <span className="hidden sm:inline">{selectedLanguage === 'kn' ? 'ವಿಸ್ತರಣೆ' : 'Extension'}</span>
            </button>
          )}

          {/* Document Intelligence Chatbot Launcher */}
          {onOpenChatbot && (
            <button
              type="button"
              onClick={onOpenChatbot}
              title="Ask SARA AI about your uploaded documents & profile"
              className="px-2.5 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 flex items-center gap-1 text-xs font-semibold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span className="hidden sm:inline">{selectedLanguage === 'kn' ? 'AI ಕೇಳಿ' : 'Ask AI'}</span>
            </button>
          )}

          {/* Easy Mode Toggle Pill */}
          {onToggleEasyMode && (
            <button
              type="button"
              onClick={onToggleEasyMode}
              title="Toggle Easy Mode (Simplified Language & Guided UX)"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                easyMode
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">sentiment_satisfied</span>
              <span>{selectedLanguage === 'kn' ? 'ಸಹಜ' : 'Easy'}</span>
            </button>
          )}

          {/* Read Aloud Button */}
          {onReadAloud && (
            <button
              aria-label={isSpeaking ? 'Stop speech read-aloud' : 'Read current page prompt aloud'}
              onClick={onReadAloud}
              className={`min-w-[34px] min-h-[34px] px-2 rounded-xl flex items-center justify-center transition-colors ${
                isSpeaking
                  ? 'bg-secondary text-on-secondary shadow-md'
                  : 'bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-secondary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSpeaking ? 'stop' : 'volume_up'}
              </span>
            </button>
          )}

          {/* Language Selector */}
          <button
            aria-label="Change language selection"
            onClick={() => onNavigate('02_language')}
            className="min-h-[34px] px-2 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center gap-1 text-xs font-semibold text-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">translate</span>
            <span>{languageLabels[selectedLanguage]}</span>
          </button>

          {/* Sign In / Out */}
          {currentUser ? (
            <button
              onClick={onLogout}
              title="Sign Out of SARA"
              className="min-h-[34px] px-2.5 rounded-xl bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">logout</span>
              <span className="hidden sm:inline">{selectedLanguage === 'kn' ? 'ನಿರ್ಗಮಿಸಿ' : 'Sign Out'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign In with OTP"
              className="min-h-[34px] px-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-xs flex items-center gap-1 shadow-sm hover:bg-secondary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>{selectedLanguage === 'kn' ? 'ಸೈನ್ ಇನ್' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
