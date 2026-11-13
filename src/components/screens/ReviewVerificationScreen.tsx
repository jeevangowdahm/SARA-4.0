import React, { useState } from 'react';
import { FieldId, ExtractedField } from '../../lib/sara/types';
import { COMMUNITY_SERVICE_FORM_SCHEMA } from '../../lib/sara/formSchema';
import { validateField } from '../../lib/sara/validators';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface ReviewVerificationScreenProps {
  fieldValues: Partial<Record<FieldId, ExtractedField>>;
  onUpdateField: (fieldId: FieldId, newValue: string) => void;
  onConfirmSubmission: () => void;
  onReturnToForm: () => void;
}

export const ReviewVerificationScreen: React.FC<ReviewVerificationScreenProps> = ({
  fieldValues,
  onUpdateField,
  onConfirmSubmission,
  onReturnToForm,
}) => {
  const [editingFieldId, setEditingFieldId] = useState<FieldId | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editError, setEditError] = useState<string>('');
  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);
  const [playingFieldId, setPlayingFieldId] = useState<FieldId | null>(null);

  const handleStartEdit = (fId: FieldId, currentVal: string) => {
    setEditingFieldId(fId);
    setEditValue(currentVal || '');
    setEditError('');
  };

  const handleSaveEdit = (fId: FieldId) => {
    const validation = validateField(fId, editValue);
    if (!validation.isValid) {
      setEditError(validation.error || 'Please enter a valid value.');
      return;
    }

    onUpdateField(fId, validation.normalizedValue);
    setEditingFieldId(null);
  };

  const handlePlayAudio = (fId: FieldId, text: string) => {
    if (!text) return;
    setPlayingFieldId(fId);
    SaraSpeechSynthesisService.speak(text, {
      lang: 'en-IN',
      onEnd: () => setPlayingFieldId(null),
    });
  };

  // Check if form is valid and ready
  const missingOrInvalidFields: string[] = [];
  COMMUNITY_SERVICE_FORM_SCHEMA.forEach((schema) => {
    const val = fieldValues[schema.id]?.value || '';
    const res = validateField(schema.id, val);
    if (!res.isValid) {
      missingOrInvalidFields.push(schema.label);
    }
  });

  const canSubmit = userConfirmed && missingOrInvalidFields.length === 0;

  return (
    <div className="flex flex-col w-full px-4 pb-16 pt-2 gap-5 max-w-xl mx-auto">
      {/* Progress Milestone Indicator */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              task_alt
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-sm font-semibold text-primary-container">
              Step 4 of 4 • Final Review
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              5 Fields Extracted & Validated
            </span>
          </div>
        </div>

        <button
          onClick={onReturnToForm}
          className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">edit_note</span>
          <span>Edit Form</span>
        </button>
      </div>

      {/* Main Review Headline */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary-container tracking-tight">
          Review your details
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Please check your captured answers below. You can tap "Edit" on any field to make
          adjustments.
        </p>
      </div>

      {/* Review Fields List */}
      <div className="space-y-3">
        {COMMUNITY_SERVICE_FORM_SCHEMA.map((schema) => {
          const field = fieldValues[schema.id];
          const val = field?.value || '';
          const validation = validateField(schema.id, val);
          const isEditing = editingFieldId === schema.id;
          const isPlaying = playingFieldId === schema.id;

          let statusBadge = (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              <span>Verified</span>
            </span>
          );

          if (!val) {
            statusBadge = (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-error-container text-on-error-container flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">warning</span>
                <span>Missing</span>
              </span>
            );
          } else if (!validation.isValid) {
            statusBadge = (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-error-container text-on-error-container flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">error</span>
                <span>Invalid</span>
              </span>
            );
          }

          return (
            <div
              key={schema.id}
              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/35 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {schema.label}
                  </span>
                  {statusBadge}
                </div>

                <div className="flex items-center gap-2">
                  {val && (
                    <button
                      type="button"
                      aria-label={`Play audio for ${schema.label}`}
                      onClick={() => handlePlayAudio(schema.id, val)}
                      className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-secondary text-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPlaying ? 'stop' : 'volume_up'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      isEditing ? handleSaveEdit(schema.id) : handleStartEdit(schema.id, val)
                    }
                    className="flex items-center gap-1 text-xs text-secondary hover:underline font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isEditing ? 'check' : 'edit'}
                    </span>
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 pt-1">
                  {schema.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-secondary text-sm bg-surface font-body-md"
                      autoFocus
                    />
                  ) : (
                    <input
                      type={schema.type}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-secondary text-sm bg-surface font-body-md"
                      autoFocus
                    />
                  )}
                  {editError && <span className="text-xs text-error font-medium">{editError}</span>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFieldId(null)}
                      className="px-3 py-1 text-xs text-on-surface-variant hover:text-primary-container"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(schema.id)}
                      className="px-3 py-1 rounded-md bg-secondary text-on-secondary text-xs font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="font-headline-sm text-base font-semibold text-primary-container">
                    {val || <span className="italic text-on-surface-variant text-sm">Not provided</span>}
                  </span>
                  {field?.rawTranscript && field.rawTranscript !== val && (
                    <span className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                      Spoken transcript: "{field.rawTranscript}"
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Critical Trust & Explicit Confirmation Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border-2 border-secondary/40 shadow-md space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-headline-sm text-sm font-bold text-primary-container">
              SARA Human Confirmation Guarantee
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
              "Please review your information carefully. SARA will not submit anything without your
              explicit confirmation."
            </p>
          </div>
        </div>

        {/* Explicit Checkbox Consent */}
        <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer border border-outline-variant/30 hover:border-secondary transition-colors">
          <input
            type="checkbox"
            checked={userConfirmed}
            onChange={(e) => setUserConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-2 border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
          />
          <span className="font-label-md text-xs text-primary-container font-medium leading-relaxed select-none">
            I have reviewed the answers above and explicitly authorize SARA to finalize my registration.
          </span>
        </label>

        {missingOrInvalidFields.length > 0 && (
          <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>
              Please complete or fix invalid fields before submitting: {missingOrInvalidFields.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Submit Action Button */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onConfirmSubmission}
          className={`w-full min-h-[54px] rounded-xl font-label-lg text-base font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
            canSubmit
              ? 'bg-secondary hover:bg-[#149d82] text-on-secondary cursor-pointer active:scale-[0.99]'
              : 'bg-surface-container-high text-on-surface-variant opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          <span>Confirm & Complete Registration</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          type="button"
          onClick={onReturnToForm}
          className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-primary-container text-center"
        >
          Return to Conversational Step-by-Step Mode
        </button>
      </div>
    </div>
  );
};

