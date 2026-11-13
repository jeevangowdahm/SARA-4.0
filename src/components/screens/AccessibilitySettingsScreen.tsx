import React, { useState } from 'react';
import { AccessibilitySettings, SupportedLanguage } from '../../lib/sara/types';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface AccessibilitySettingsScreenProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onClose: () => void;
}

export const AccessibilitySettingsScreen: React.FC<AccessibilitySettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);

  const sampleVoiceText =
    selectedLanguage === 'kn'
      ? 'ನಮಸ್ಕಾರ, ನಾನು ಸಾರಾ. ನಿಮ್ಮ ಆಯ್ಕೆಯ ವೇಗದಲ್ಲಿ ನಾನು ಮಾತನಾಡುತ್ತೇನೆ.'
      : selectedLanguage === 'hi'
      ? 'नमस्ते, मैं सारा हूँ। मैं आपकी चुनी हुई गति में बात करूँगी।'
      : 'Namaskara, I am SARA. I will speak at your chosen pace and listen as long as you need.';

  const handleTestVoicePreview = () => {
    setIsPlayingTest(true);
    SaraSpeechSynthesisService.speak(sampleVoiceText, {
      lang: selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN',
      rate: settings.speechRate,
      onEnd: () => setIsPlayingTest(false),
    });
  };

  return (
    <div className="flex flex-col w-full px-4 pb-16 pt-2 gap-6 max-w-xl mx-auto">
      {/* Intro Anchor */}
      <section className="flex flex-col gap-2 bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              accessibility_new
            </span>
          </div>
          <h2 className="font-headline-sm text-base md:text-lg font-bold text-primary-container m-0">
            Accessibility & Voice Preferences
          </h2>
        </div>
        <p className="font-body-md text-xs text-on-surface-variant">
          Tailor SARA to your hearing, sight, speech, and mobility needs.
        </p>
        <div className="mt-1 flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low text-on-surface-variant text-xs">
          <span
            className="material-symbols-outlined text-secondary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span className="font-label-md">
            Active profile meets WCAG 2.2 Level AA accessibility criteria.
          </span>
        </div>
      </section>

      {/* Interactive Diagnostic Test Voice Card */}
      <section className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider font-bold">
              Interactive Diagnostic
            </span>
            <h3 className="font-headline-sm text-sm md:text-base font-bold text-primary-container">
              Test My Settings with SARA
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-md">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low flex items-start gap-2.5">
          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
            format_quote
          </span>
          <p className="font-body-md text-xs md:text-sm text-primary-container font-medium">
            "{sampleVoiceText}"
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestVoicePreview}
          className="w-full min-h-[46px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlayingTest ? 'stop' : 'play_arrow'}
          </span>
          <span>{isPlayingTest ? 'Stop Voice Sample' : 'Hear Sample Voice with Current Settings'}</span>
        </button>
      </section>

      {/* Section 1: Speech & Voice Input */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
        <h3 className="font-headline-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">mic</span>
          <span>1. Speech & Voice Input</span>
        </h3>

        {/* Language Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary-container">Speech Language</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English', sub: 'Default' },
              { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
              { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => onSelectLanguage(item.code as SupportedLanguage)}
                className={`p-2.5 rounded-xl border text-center transition-colors ${
                  selectedLanguage === item.code
                    ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container text-on-surface'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-on-surface-variant">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Instructions Toggle */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
          <div className="flex flex-col pr-3">
            <span className="text-xs font-semibold text-primary-container">
              Read Questions Aloud Automatically
            </span>
            <span className="text-[11px] text-on-surface-variant">
              SARA speaks each question when transitioning steps.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.spokenInstructions}
            onChange={(e) => onUpdateSettings({ spokenInstructions: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
          />
        </label>
      </section>

      {/* Section 2: Audio & Read-Aloud Pacing */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
        <h3 className="font-headline-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">volume_up</span>
          <span>2. Audio & Speech Pacing</span>
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary-container">Speaking Rate</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { rate: 0.75, label: '0.75x', sub: 'Relaxed' },
              { rate: 1.0, label: '1.0x', sub: 'Normal' },
              { rate: 1.25, label: '1.25x', sub: 'Brisk' },
            ].map((item) => (
              <button
                key={item.rate}
                type="button"
                onClick={() => onUpdateSettings({ speechRate: item.rate })}
                className={`p-2.5 rounded-xl border text-center transition-colors ${
                  settings.speechRate === item.rate
                    ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container text-on-surface'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-on-surface-variant">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Visual & Display Ergonomics */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
        <h3 className="font-headline-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">visibility</span>
          <span>3. Visual & Display Ergonomics</span>
        </h3>

        {/* Text Scaling */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary-container">Display Text Scaling</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { size: 'normal', label: 'Default', sub: '100%' },
              { size: 'large', label: 'Large', sub: '115%' },
              { size: 'xlarge', label: 'Extra Large', sub: '130%' },
            ].map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => onUpdateSettings({ textSize: item.size as any })}
                className={`p-2.5 rounded-xl border text-center transition-colors ${
                  settings.textSize === item.size
                    ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container text-on-surface'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-on-surface-variant">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast Mode Toggle */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
          <div className="flex flex-col pr-3">
            <span className="text-xs font-semibold text-primary-container">High Contrast Mode</span>
            <span className="text-[11px] text-on-surface-variant">
              Enhance outlines, sharp borders, and high contrast typography (WCAG 2.2 AAA).
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
          />
        </label>

        {/* Reduced Motion Toggle */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
          <div className="flex flex-col pr-3">
            <span className="text-xs font-semibold text-primary-container">Reduce Motion</span>
            <span className="text-[11px] text-on-surface-variant">
              Disable pulsing rings, frame scrolling animations, and continuous transitions.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
          />
        </label>
      </section>

      {/* Section 4: Physical & Assistive Navigation */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-3">
        <h3 className="font-headline-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">keyboard</span>
          <span>4. Keyboard & Switch Accessibility</span>
        </h3>

        <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1.5 text-on-surface-variant">
          <div className="flex justify-between">
            <span className="font-semibold text-primary-container">Space / Enter:</span>
            <span>Trigger active button or microphone</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-primary-container">Tab / Shift+Tab:</span>
            <span>Navigate through accessible controls</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-primary-container">Esc:</span>
            <span>Close settings or cancel listening</span>
          </div>
        </div>
      </section>

      {/* Save / Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full min-h-[50px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
      >
        <span>Save & Return</span>
        <span className="material-symbols-outlined text-[18px]">check</span>
      </button>
    </div>
  );
};

