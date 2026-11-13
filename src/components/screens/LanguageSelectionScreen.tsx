import React from 'react';
import { SupportedLanguage } from '../../lib/sara/types';
import { SUPPORTED_LANGUAGES, I18N_STRINGS } from '../../lib/sara/languageProvider';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface LanguageSelectionScreenProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  speechRate: number;
  onSelectSpeechRate: (rate: number) => void;
  onContinue: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  selectedLanguage,
  onSelectLanguage,
  speechRate,
  onSelectSpeechRate,
  onContinue,
}) => {
  const strings = I18N_STRINGS[selectedLanguage] || I18N_STRINGS.en;

  const handlePlaySample = (e: React.MouseEvent, sampleText: string, locale: string) => {
    e.stopPropagation();
    SaraSpeechSynthesisService.speak(sampleText, {
      lang: locale,
      rate: speechRate,
    });
  };

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-20 gap-5 max-w-xl mx-auto">
      {/* Progress & Stepper Meta */}
      <div className="flex items-center justify-between w-full">
        <div className="inline-flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-md text-xs text-on-surface-variant font-medium">
            Setup • Language & Voice
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-secondary font-label-mono text-xs">
          <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
          <span>Voice Ready</span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary-container tracking-tight">
          {strings.chooseLanguage}
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Select the language you are most comfortable speaking. SARA adapts its voice, listening
          model, and speech pacing.
        </p>
      </div>

      {/* Language Option Cards */}
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Language selection">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <div
              key={lang.code}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectLanguage(lang.code)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onSelectLanguage(lang.code);
                }
              }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-surface-container-lowest border-secondary shadow-md ring-1 ring-secondary/30'
                  : 'bg-surface-container-lowest border-outline-variant/40 hover:border-secondary/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Radio Circle */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-secondary bg-secondary' : 'border-outline-variant'
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-on-secondary" />}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-base font-semibold text-primary-container">
                      {lang.nativeName}
                    </span>
                    {lang.code === 'en' && (
                      <span className="text-[10px] font-mono uppercase bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="font-body-sm text-xs text-on-surface-variant">{lang.name}</span>
                </div>
              </div>

              {/* Sample Audio Button */}
              <button
                type="button"
                aria-label={`Listen to sample voice in ${lang.name}`}
                onClick={(e) => handlePlaySample(e, lang.sampleAudioText, lang.speechLocale)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-secondary/15 text-primary-container hover:text-secondary text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>Listen</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Speech Pacing Option */}
      <div className="flex flex-col gap-2 pt-2">
        <label className="font-label-lg text-xs font-semibold text-primary-container">
          Speech & Listening Pacing
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectSpeechRate(0.85)}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              speechRate <= 0.85
                ? 'bg-surface-container-lowest border-secondary ring-1 ring-secondary/30'
                : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-container mb-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                psychology_alt
              </span>
              <span>Gentle (0.85x)</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">
              Clear pauses, ideal for older citizens or noisy rooms.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSpeechRate(1.0)}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              speechRate >= 1.0
                ? 'bg-surface-container-lowest border-secondary ring-1 ring-secondary/30'
                : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-container mb-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
              <span>Standard (1.0x)</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">
              Natural conversational everyday speed.
            </span>
          </button>
        </div>
      </div>

      {/* BHASHINI & Multilingual Adapter Disclosure */}
      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">info</span>
        <span>
          SARA integrates browser speech recognition with pluggable Indian language adapters
          (supporting future BHASHINI / AI4Bharat integration). If voice is unsupported on your
          device, typed input remains available.
        </span>
      </div>

      {/* Fixed/Sticky Bottom Continue CTA */}
      <div className="pt-2">
        <button
          onClick={onContinue}
          className="w-full min-h-[52px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-base font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>{strings.continueWith}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

