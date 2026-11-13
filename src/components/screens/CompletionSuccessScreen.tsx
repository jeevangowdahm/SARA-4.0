import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CompletedRegistration } from '../../lib/sara/types';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';

interface CompletionSuccessScreenProps {
  registration: CompletedRegistration;
  onStartNew: () => void;
  onReturnHome: () => void;
}

export const CompletionSuccessScreen: React.FC<CompletionSuccessScreenProps> = ({
  registration,
  onStartNew,
  onReturnHome,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    // Trigger celebratory confetti burst on completion!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#17B99A', '#6ef6d4', '#101B34', '#DFF8F1'],
      });
    } catch {
      // ignore in environments without canvas
    }
  }, []);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(registration.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlaySummary = () => {
    setIsPlayingAudio(true);
    const summaryText = `Congratulations ${registration.data.fullName}. Your community service registration for ${registration.data.location} has been successfully completed with reference ID ${registration.referenceId}.`;
    SaraSpeechSynthesisService.speak(summaryText, {
      lang: 'en-IN',
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleDownloadSummary = () => {
    const summary = `
======================================================
SARA — SMART ACCESSIBLE RESPONSE ASSISTANT
COMMUNITY SERVICE REGISTRATION SUMMARY
======================================================
Reference ID:  ${registration.referenceId}
Completed At:  ${new Date(registration.completedAt).toLocaleString()}
Mode:          Local Hackathon Demo Workflow

APPLICANT DETAILS:
------------------------------------------------------
Full Name:             ${registration.data.fullName}
Age:                   ${registration.data.age} Years
Indian Mobile Number:  ${registration.data.mobileNumber}
Location / Area:       ${registration.data.location}
Primary Motivation:    ${registration.data.volunteerReason}

ACCESSIBLE PROVENANCE:
------------------------------------------------------
All responses were captured via natural speech or accessible input,
validated deterministically through SARA SENSE, and explicitly
verified and authorized by the applicant.
======================================================
`;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${registration.referenceId}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full px-4 pb-16 pt-2 gap-5 max-w-xl mx-auto">
      {/* Celebration Aura & Hero Badge */}
      <div className="relative flex flex-col items-center text-center mt-2">
        <div className="relative flex items-center justify-center w-28 h-28 my-1">
          <div className="absolute inset-0 rounded-full bg-secondary-container/40 animate-ping opacity-60" />
          <div className="absolute -inset-2 rounded-full bg-secondary-container/20 blur-md" />
          <div className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg relative z-10">
            <span
              className="material-symbols-outlined text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-xs font-mono font-medium mt-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          REGISTRATION COMPLETE
        </div>

        <h1 className="font-display-hero text-2xl md:text-3xl font-bold text-primary-container tracking-tight mt-3">
          Your voice made it happen.
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-md mt-1 leading-relaxed">
          Application completed successfully with SARA without typing barriers.
        </p>
      </div>

      {/* Official Reference Identifier Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-secondary/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Official Application Reference
          </span>
          <button
            type="button"
            onClick={handlePlaySummary}
            className="flex items-center gap-1 text-xs text-secondary hover:underline font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlayingAudio ? 'stop' : 'volume_up'}
            </span>
            <span>{isPlayingAudio ? 'Stop' : 'Audio Summary'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-xl md:text-2xl font-bold text-primary-container tracking-wider">
            {registration.referenceId}
          </span>
          <button
            type="button"
            onClick={handleCopyReference}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Form Submission Recap Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/35 space-y-3">
        <h3 className="font-headline-sm text-sm font-bold text-primary-container uppercase tracking-wider">
          Submitted Application Summary
        </h3>

        <div className="space-y-2.5 divide-y divide-outline-variant/20 font-body-sm text-xs">
          <div className="flex justify-between items-center pt-2">
            <span className="text-on-surface-variant">Full Name:</span>
            <span className="font-semibold text-primary-container text-sm">
              {registration.data.fullName}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-on-surface-variant">Age:</span>
            <span className="font-semibold text-primary-container">
              {registration.data.age} Years
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-on-surface-variant">Indian Mobile Number:</span>
            <span className="font-semibold text-primary-container font-mono">
              +91 {registration.data.mobileNumber}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-on-surface-variant">Location:</span>
            <span className="font-semibold text-primary-container">
              {registration.data.location}
            </span>
          </div>

          <div className="flex flex-col pt-2 text-left">
            <span className="text-on-surface-variant mb-1">Volunteering Motivation:</span>
            <span className="font-semibold text-primary-container italic bg-surface-container-low p-2.5 rounded-lg leading-relaxed">
              "{registration.data.volunteerReason}"
            </span>
          </div>
        </div>
      </div>

      {/* Honest Local Demo Disclosure */}
      <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">verified</span>
        <span>
          <strong>Tech-Quest 2.0 Demo Integrity:</strong> This registration was processed locally in
          demonstration mode. No personal data was transmitted to external servers without explicit
          backend authorization.
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleDownloadSummary}
          className="w-full min-h-[50px] rounded-xl bg-surface-container hover:bg-surface-container-high text-primary-container font-label-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-outline-variant/40"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span>Download Summary (Text / Certificate)</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onStartNew}
            className="min-h-[48px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary font-label-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Start Another Form</span>
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-primary-container font-label-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

