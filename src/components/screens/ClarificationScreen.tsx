import React, { useState } from 'react';
import { SaraSensePipelineResult } from '../../lib/sara/types';
import { validateField } from '../../lib/sara/validators';
import { SaraSpeechRecognitionService, SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface ClarificationScreenProps {
  pipelineResult?: SaraSensePipelineResult;
  onResolveClarification: (correctedValue: string, rawTranscript: string) => void;
  onCancel: () => void;
}

export const ClarificationScreen: React.FC<ClarificationScreenProps> = ({
  pipelineResult,
  onResolveClarification,
  onCancel,
}) => {
  const target = pipelineResult?.clarificationTarget || {
    fieldId: 'mobileNumber',
    reason: 'SARA captured 5 digits (98765). Indian mobile numbers require 10 digits starting with 6, 7, 8, or 9.',
    suggestedPrompt: 'I may not have heard your complete 10-digit mobile number. Could you please repeat it?',
    partialValue: '98765',
  };

  const [inputMode, setInputMode] = useState<'voice' | 'typed'>('voice');
  const [correctedValue, setCorrectedValue] = useState<string>(target.partialValue || '');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechService] = useState<SaraSpeechRecognitionService>(
    () => new SaraSpeechRecognitionService('en-IN')
  );

  const handlePlayPrompt = () => {
    setIsPlayingAudio(true);
    SaraSpeechSynthesisService.speak(target.suggestedPrompt, {
      lang: 'en-IN',
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleStartVoice = () => {
    setValidationError('');
    setIsListening(true);

    speechService.start({
      onStart: () => setIsListening(true),
      onResult: (text: string, isFinal: boolean) => {
        // Strip out non-digits if mobile number
        const digits = text.replace(/\D/g, '');
        if (digits) {
          setCorrectedValue(digits);
        } else {
          setCorrectedValue(text);
        }

        if (isFinal) {
          setIsListening(false);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setValidationError(err.message);
      },
      onEnd: () => setIsListening(false),
    });
  };

  const handleStopVoice = () => {
    speechService.stop();
    setIsListening(false);
  };

  const handleConfirmCorrection = () => {
    const validation = validateField(target.fieldId, correctedValue);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Please provide a valid complete value.');
      return;
    }

    onResolveClarification(validation.normalizedValue, correctedValue);
  };

  // Dialpad click handler for mobile number
  const handleDialpadPress = (digit: string) => {
    setCorrectedValue((prev) => (prev.length < 10 ? prev + digit : prev));
    setValidationError('');
  };

  const handleDialpadBackspace = () => {
    setCorrectedValue((prev) => prev.slice(0, -1));
    setValidationError('');
  };

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-16 space-y-4 max-w-xl mx-auto">
      {/* Context Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-error-container/40 text-error font-label-md text-xs font-bold">
            Needs Clarification
          </span>
          <span className="font-label-md text-xs text-on-surface-variant font-medium">
            Contact Verification
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-on-surface-variant hover:text-primary-container"
        >
          Cancel
        </button>
      </div>

      {/* SARA Empathetic Prompt Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-error/30 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hearing</span>
            </div>
            <span className="font-label-md text-xs font-bold text-error uppercase tracking-wider">
              Acoustic Ambiguity Detected
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayPrompt}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-secondary/15 text-primary-container text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlayingAudio ? 'stop' : 'volume_up'}
            </span>
            <span>Listen</span>
          </button>
        </div>

        <h2 className="font-headline-sm text-lg md:text-xl font-bold text-primary-container mb-2">
          "{target.suggestedPrompt}"
        </h2>

        <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
          {target.reason}
        </p>

        {/* What was heard pill */}
        <div className="mt-3 p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">Captured so far:</span>
          <span className="font-mono text-sm font-bold text-error bg-error-container/30 px-2 py-0.5 rounded">
            {correctedValue || 'None'} ({correctedValue.replace(/\D/g, '').length}/10 digits)
          </span>
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="grid grid-cols-2 gap-2 bg-surface-container p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setInputMode('voice')}
          className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            inputMode === 'voice'
              ? 'bg-surface-container-lowest text-primary-container shadow-sm'
              : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          <span>Speak to Clarify</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('typed')}
          className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            inputMode === 'typed'
              ? 'bg-surface-container-lowest text-primary-container shadow-sm'
              : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dialpad</span>
          <span>Keypad / Type</span>
        </button>
      </div>

      {/* Mode 1: Voice Clarification */}
      {inputMode === 'voice' ? (
        <div className="flex flex-col items-center justify-center py-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
          <div className="relative flex items-center justify-center w-28 h-28 mb-3">
            {isListening ? (
              <>
                <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-orb-active">
                  <span className="material-symbols-outlined text-3xl animate-pulse">mic</span>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartVoice}
                className="w-20 h-20 rounded-full bg-primary-container hover:bg-[#182746] text-on-primary flex items-center justify-center shadow-lg active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:scale-110 transition-transform">
                  mic
                </span>
              </button>
            )}
          </div>

          <span className="text-xs font-medium text-on-surface-variant mb-4">
            {isListening
              ? 'Listening... state your full 10-digit mobile number'
              : 'Tap to speak your full 10-digit number'}
          </span>

          {isListening && (
            <button
              type="button"
              onClick={handleStopVoice}
              className="px-4 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-primary-container"
            >
              Done Speaking
            </button>
          )}

          {/* Quick simulator shortcut for demo */}
          <div className="mt-4 pt-3 border-t border-outline-variant/20 w-full flex items-center justify-center gap-2">
            <span className="text-[11px] text-on-surface-variant font-mono">Demo Simulator:</span>
            <button
              type="button"
              onClick={() => {
                setCorrectedValue('9876543210');
                setValidationError('');
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-secondary/10 text-secondary hover:bg-secondary/20 font-semibold"
            >
              Simulate: 9876543210
            </button>
          </div>
        </div>
      ) : (
        /* Mode 2: Keypad / Dialpad */
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="font-mono text-xl font-bold tracking-wider text-primary-container">
              {correctedValue || 'Enter 10 digits'}
            </span>
            <button
              type="button"
              onClick={handleDialpadBackspace}
              className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDialpadPress(d)}
                className="h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary-container font-mono text-lg font-bold flex items-center justify-center transition-colors active:scale-95"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Confirm Action Button */}
      <button
        type="button"
        onClick={handleConfirmCorrection}
        className="w-full min-h-[50px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
      >
        <span>Confirm Corrected Number</span>
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
      </button>
    </div>
  );
};

