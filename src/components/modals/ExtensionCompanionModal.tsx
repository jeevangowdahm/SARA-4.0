import React from 'react';

interface ExtensionCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionCompanionModal: React.FC<ExtensionCompanionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleLaunchTestSite = () => {
    window.open('/test-site/index.html', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101B34]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">extension</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-primary-container">
                SARA Chrome Extension & Web Companion
              </h2>
              <span className="text-xs text-on-surface-variant">Manifest V3 External Autofill</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary-container text-lg font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Core Product Principle Alert */}
        <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/30 flex items-start gap-2 text-xs text-primary-container">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
            verified_user
          </span>
          <div>
            <strong>Universal External Form Autofill:</strong> SARA 3.0 connects to actual external
            websites, inspects visible form fields, answers questions using your spoken regional
            language, and populates the inputs.
          </div>
        </div>

        {/* Quick Launch External Test Portal */}
        <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-container">
              Official Test Website: Karnataka Scholarship Portal
            </span>
            <span className="text-[10px] font-mono text-secondary font-semibold">Active</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Contains realistic inputs: Applicant Name, Age, DOB, College, Degree Dropdown, Residential
            Address (bureaucratic wording), Pincode, and Sensitive Password Fields.
          </p>
          <button
            type="button"
            onClick={handleLaunchTestSite}
            className="w-full min-h-[44px] rounded-xl bg-primary-container hover:bg-[#182746] text-on-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>Launch External Scholarship Portal Test Site</span>
          </button>
        </div>

        {/* Extension Installation Guide */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary-container uppercase tracking-wider">
            How to Load SARA Extension in Chrome:
          </span>
          <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal pl-4">
            <li>
              Open Google Chrome and navigate to <code className="bg-surface-container px-1 py-0.5 rounded font-mono">chrome://extensions</code>
            </li>
            <li>Enable <strong>Developer mode</strong> (top-right toggle).</li>
            <li>Click <strong>Load unpacked</strong>.</li>
            <li>Select the folder: <code className="bg-surface-container px-1 py-0.5 rounded font-mono">c:\3rd_sem_hackathon\extension</code></li>
            <li>Open the Scholarship portal and click SARA in the extensions toolbar or side panel!</li>
          </ol>
        </div>

        {/* Strict Security Rules Recap */}
        <div className="p-3 bg-error-container/20 rounded-xl border border-error/30 text-[11px] text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px]">security</span>
          <div>
            <strong>Strict Safety Guarantees:</strong> Passwords, OTPs, and credit card inputs are
            categorically shielded. SARA will <em>never</em> submit a form automatically.
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary-container"
        >
          Close
        </button>
      </div>
    </div>
  );
};

