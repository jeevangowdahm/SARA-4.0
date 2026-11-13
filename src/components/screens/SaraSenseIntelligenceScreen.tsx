import React, { useState } from 'react';
import {
  FieldId,
  ExtractedField,
  SaraSensePipelineResult,
  SenseStage,
} from '../../lib/sara/types';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';
import { extractFieldsFromTranscript } from '../../lib/sara/fieldExtractor';

interface SaraSenseIntelligenceScreenProps {
  pipelineResult?: SaraSensePipelineResult;
  onApplyExtractedFields: (fields: Partial<Record<FieldId, ExtractedField>>) => void;
  onContinueToForm: () => void;
  onSpeakAgain: () => void;
}

export const SaraSenseIntelligenceScreen: React.FC<SaraSenseIntelligenceScreenProps> = ({
  pipelineResult: initialResult,
  onApplyExtractedFields,
  onContinueToForm,
  onSpeakAgain,
}) => {
  // Default demo sentence if opened directly
  const defaultSentence = 'My name is Jeevan Gowda, I am 19 years old, and I live in Bengaluru.';
  const [activeSentence, setActiveSentence] = useState<string>(
    initialResult?.rawTranscript || defaultSentence
  );

  const [currentResult, setCurrentResult] = useState<SaraSensePipelineResult>(() => {
    if (initialResult && Object.keys(initialResult.extractedFields).length > 0) {
      return initialResult;
    }
    return extractFieldsFromTranscript(defaultSentence);
  });

  const [editingField, setEditingField] = useState<FieldId | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const stagesOrder: SenseStage[] = ['LISTEN', 'UNDERSTAND', 'MAP', 'VALIDATE', 'CONFIRM'];

  const stageDescriptions: Record<SenseStage, { title: string; subtitle: string; icon: string }> = {
    LISTEN: {
      title: '1. LISTEN',
      subtitle: 'Acoustic waveform captured & transcribed',
      icon: 'graphic_eq',
    },
    UNDERSTAND: {
      title: '2. UNDERSTAND',
      subtitle: 'Entity extraction & intent disambiguation',
      icon: 'psychology',
    },
    MAP: {
      title: '3. MAP',
      subtitle: 'Multi-field binding to registration schema',
      icon: 'schema',
    },
    VALIDATE: {
      title: '4. VALIDATE',
      subtitle: 'Deterministic rule checks & sanitization',
      icon: 'verified',
    },
    CONFIRM: {
      title: '5. CONFIRM',
      subtitle: 'Human verification required before saving',
      icon: 'how_to_reg',
    },
  };

  const handleTestMultiFieldSentence = (sentence: string) => {
    setActiveSentence(sentence);
    const res = extractFieldsFromTranscript(sentence);
    setCurrentResult(res);
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    SaraSpeechSynthesisService.speak(activeSentence, {
      lang: 'en-IN',
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleStartEdit = (fId: FieldId, val: string) => {
    setEditingField(fId);
    setEditValue(val);
  };

  const handleSaveEdit = (fId: FieldId) => {
    if (currentResult.extractedFields[fId]) {
      const updated = {
        ...currentResult.extractedFields,
        [fId]: {
          ...currentResult.extractedFields[fId]!,
          value: editValue,
          extractionMethod: 'manual_input' as const,
          verifiedByUser: true,
        },
      };
      setCurrentResult({
        ...currentResult,
        extractedFields: updated,
      });
      onApplyExtractedFields(updated);
    }
    setEditingField(null);
  };

  const handleConfirmAll = () => {
    onApplyExtractedFields(currentResult.extractedFields);
    onContinueToForm();
  };

  const extractedList = Object.entries(currentResult.extractedFields) as [FieldId, ExtractedField][];

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-16 space-y-5 max-w-xl mx-auto">
      {/* SARA SENSE Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-md text-xs text-secondary font-bold uppercase tracking-wider">
            SARA SENSE Intelligence Engine
          </span>
        </div>
        <span className="font-mono text-xs text-on-surface-variant">Deterministic v2.0</span>
      </div>

      {/* Raw Speech Audio Origin Container */}
      <section className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="font-label-md text-xs font-semibold text-primary-container uppercase tracking-wider">
              Natural Speech Origin
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayAudio}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-secondary/15 text-primary-container hover:text-secondary text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlayingAudio ? 'stop' : 'volume_up'}
            </span>
            <span>{isPlayingAudio ? 'Pause' : 'Listen back'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <p className="font-body-md text-sm md:text-base text-primary-container font-medium italic leading-relaxed">
            "{activeSentence}"
          </p>
        </div>

        {/* Quick test preset buttons for hackathon judges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handleTestMultiFieldSentence(
                'My name is Jeevan Gowda, I am 19 years old, and I live in Bengaluru.'
              )
            }
            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          >
            Sample: Jeevan (19, Bengaluru)
          </button>
          <button
            type="button"
            onClick={() =>
              handleTestMultiFieldSentence(
                'I am Priya Sharma, aged 22, living in Mysore and my number is 9876543210.'
              )
            }
            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          >
            Sample: Priya (22, Mysore, Phone)
          </button>
        </div>
      </section>

      {/* SARA SENSE 5-Stage Pipeline Progress */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40 space-y-3">
        <h3 className="font-headline-sm text-sm font-bold text-primary-container uppercase tracking-wider">
          SARA SENSE 5-Stage Pipeline
        </h3>

        <div className="space-y-2">
          {stagesOrder.map((stageKey) => {
            const stageInfo = stageDescriptions[stageKey];
            const stageState = currentResult.stages[stageKey];
            const isCompleted = stageState?.status === 'completed';
            const isFlagged = stageState?.status === 'flagged';

            return (
              <div
                key={stageKey}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isFlagged
                    ? 'bg-error-container/20 border-error/40'
                    : isCompleted
                    ? 'bg-surface-container-low border-secondary/30'
                    : 'bg-surface-container-lowest border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      isFlagged
                        ? 'bg-error text-on-error'
                        : isCompleted
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isFlagged ? 'warning' : stageInfo.icon}
                    </span>
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-xs font-bold text-primary-container">
                      {stageInfo.title}
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {stageState?.detail || stageInfo.subtitle}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                      isFlagged
                        ? 'bg-error/10 text-error'
                        : isCompleted
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {isFlagged ? 'Flagged' : isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extracted Fields Breakdown */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-base font-bold text-primary-container">
            {extractedList.length} Fields Recognized Automatically
          </h3>
          <span className="text-xs font-mono text-secondary font-semibold">
            Zero Repetition Needed
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {extractedList.map(([fId, field]) => {
            const isEditing = editingField === fId;

            return (
              <div
                key={fId}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {fId === 'fullName'
                        ? 'Full Name'
                        : fId === 'age'
                        ? 'Age'
                        : fId === 'location'
                        ? 'Location'
                        : fId === 'mobileNumber'
                        ? 'Mobile Number'
                        : 'Volunteering Reason'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container">
                      {field.confidence} confidence
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      isEditing ? handleSaveEdit(fId) : handleStartEdit(fId, field.value)
                    }
                    className="flex items-center gap-1 text-xs text-secondary hover:underline font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isEditing ? 'check' : 'edit'}
                    </span>
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-secondary text-sm bg-surface"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(fId)}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-base md:text-lg font-bold text-primary-container">
                      {field.value}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      verified
                    </span>
                  </div>
                )}

                <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                  <span>Source:</span>
                  <span className="text-primary-container font-medium">"{field.rawTranscript}"</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
        <button
          type="button"
          onClick={onSpeakAgain}
          className="w-full sm:w-auto flex-1 min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-primary-container font-label-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          <span>Speak Again to Adjust</span>
        </button>

        <button
          type="button"
          onClick={handleConfirmAll}
          className="w-full sm:w-auto flex-1 min-h-[50px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>Confirm & Return to Form</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

