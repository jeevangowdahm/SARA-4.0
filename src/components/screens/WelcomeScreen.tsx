import React from 'react';
import { SupportedLanguage } from '../../lib/sara/types';
import { I18N_STRINGS } from '../../lib/sara/languageProvider';

interface WelcomeScreenProps {
  onStartVoice: () => void;
  onStartTyped: () => void;
  onOpenLanguage: () => void;
  onOpenAccessibility: () => void;
  onPlayAudioExplanation: () => void;
  selectedLanguage: SupportedLanguage;
  isSpeaking?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartVoice,
  onStartTyped,
  onOpenLanguage,
  onOpenAccessibility,
  onPlayAudioExplanation,
  selectedLanguage,
  isSpeaking = false,
}) => {
  const strings = I18N_STRINGS[selectedLanguage] || I18N_STRINGS.en;

  return (
    <div className="flex flex-col w-full px-4 py-4 space-y-6 max-w-xl mx-auto">
      {/* Floating Audio Read-Aloud Helper */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-2 px-3 rounded-full shadow-sm border border-outline-variant/30">
        <div className="flex items-center space-x-2 pl-1">
          <span className="flex h-2.5 w-2.5 rounded-full bg-secondary animate-ping" />
          <span className="font-label-md text-xs text-on-surface-variant font-medium">
            Listen to SARA overview
          </span>
        </div>
        <button
          aria-label={isSpeaking ? 'Stop voice explanation' : 'Play voice explanation'}
          onClick={onPlayAudioExplanation}
          type="button"
          className="flex items-center space-x-1 bg-surface-container hover:bg-secondary/15 hover:text-secondary text-primary-container px-3 py-1.5 rounded-full transition-colors font-label-md text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSpeaking ? 'stop' : 'volume_up'}
          </span>
          <span>{isSpeaking ? 'Pause' : 'Play'}</span>
        </button>
      </div>

      {/* Visual Hero Anchor with SARA Voice Orb */}
      <div className="flex flex-col items-center justify-center pt-4 pb-2 relative">
        <div className="relative flex items-center justify-center w-36 h-36">
          {/* Ambient Breathing Glow */}
          <div className="absolute inset-0 rounded-full bg-secondary-container/40 blur-xl animate-pulse" />
          <div className="absolute inset-2 rounded-full border border-secondary/20 animate-spin-slow" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-container via-[#182746] to-secondary flex items-center justify-center shadow-orb-ambient animate-voice-pulse relative z-10">
            <span className="material-symbols-outlined text-4xl text-on-primary">
              graphic_eq
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-xs font-mono font-medium mt-4">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          COMMUNITY SERVICE REGISTRATION
        </div>
      </div>

      {/* Main Copy */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-display-hero text-3xl md:text-4xl text-primary-container tracking-tight font-bold">
          {selectedLanguage === 'en'
            ? 'Let your voice do the work.'
            : selectedLanguage === 'kn'
            ? 'ನಿಮ್ಮ ಧ್ವನಿಯೇ ಕೆಲಸ ಮಾಡಲಿ.'
            : 'अपनी आवाज़ से फॉर्म भरें।'}
        </h1>
        <p className="font-body-md text-on-surface-variant text-base leading-relaxed max-w-md mx-auto">
          {strings.tagline} SARA listens, extracts each answer, and completes your digital application
          with you.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col space-y-3 pt-2">
        <button
          onClick={onStartVoice}
          className="min-h-[56px] w-full bg-primary-container text-on-primary rounded-xl font-label-lg font-semibold flex items-center justify-between px-5 shadow-md hover:bg-[#182746] active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">Start with Voice</span>
              <span className="text-xs text-on-primary-container font-normal">
                {strings.tapToSpeak}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-2xl text-secondary group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>

        <button
          onClick={onStartTyped}
          className="min-h-[48px] w-full bg-surface-container-lowest text-primary-container border border-outline-variant/50 rounded-xl font-label-lg font-medium flex items-center justify-center space-x-2 shadow-card hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            keyboard_alt
          </span>
          <span>{strings.typeInstead}</span>
        </button>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 text-secondary mt-0.5">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
        </div>
        <div className="flex flex-col space-y-1 text-left">
          <h2 className="font-headline-sm text-sm font-semibold text-primary-container">
            Human Confirmation Guarantee
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            {strings.reviewNotice} You review, edit, or clarify any response before final submission.
          </p>
        </div>
      </div>

      {/* Quick Access Badges (Language & Accessibility) */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onOpenLanguage}
          className="flex items-center space-x-2 text-xs font-medium text-primary-container bg-surface-container-low px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">translate</span>
          <span>Language: {selectedLanguage.toUpperCase()}</span>
        </button>

        <button
          onClick={onOpenAccessibility}
          className="flex items-center space-x-2 text-xs font-medium text-primary-container bg-surface-container-low px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">
            accessibility_new
          </span>
          <span>Accessibility Preferences</span>
        </button>
      </div>
    </div>
  );
};

