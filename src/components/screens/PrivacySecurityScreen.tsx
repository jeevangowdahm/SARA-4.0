import React, { useState, useEffect } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';

interface PrivacySecurityScreenProps {
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onOpenAuth, currentUser }) => {
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportEmail, setExportEmail] = useState<string>(() => {
    return currentUser?.identifier && currentUser.identifier.includes('@')
      ? currentUser.identifier
      : 'jeevangowdahm6@gmail.com';
  });
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    loadAuditEvents();
  }, []);

  const loadAuditEvents = async () => {
    if (!SaraApiClient.getToken()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await SaraApiClient.getAuditEvents();
      setAuditEvents(res.events || []);
    } catch (err: any) {
      console.warn('Load audit events error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!SaraApiClient.getToken() && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xl space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">security</span>
        </div>
        <h2 className="text-lg font-bold text-primary-container">Privacy & Security Center</h2>
        <p className="text-xs text-on-surface-variant">
          Sign in to inspect your security audit trail, manage consent settings, or export your personal records.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Sign In with OTP</span>
        </button>
      </div>
    );
  }

  const handleExportPdfAndEmail = async () => {
    setIsExporting(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await SaraApiClient.exportPdfAndEmail(exportEmail.trim());

      // Trigger browser download from base64
      if (res.pdfBase64) {
        const byteCharacters = atob(res.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = res.filename || `SARA_Data_Export_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }

      setStatusMsg(
        res.emailSent
          ? `Official PDF dossier downloaded and emailed to ${res.emailedTo} via SMTP protocol!`
          : `Official PDF dossier downloaded successfully!`
      );
      loadAuditEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not export PDF dossier.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'WARNING: This will permanently delete your SARA account, your private document vault, verified facts, and application history. This action CANNOT be undone.\n\nDo you wish to proceed?'
      )
    ) {
      return;
    }

    try {
      await SaraApiClient.deleteAccount();
      alert('Your account and all associated personal records have been permanently deleted.');
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not delete account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">security</span>
          <span>Your Privacy, Ownership & Controls</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-container font-headline-sm">
          Privacy & Security Center
        </h1>
        <p className="text-xs text-on-surface-variant max-w-xl">
          You own your information. SARA operates with database-level isolation and strict data minimization. Review audit logs or export and delete your data at any time.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Core Privacy Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
          <div className="font-bold text-primary-container">Row Level Security</div>
          <p className="text-on-surface-variant text-[11px]">
            Every personal fact and document is tied to your verified identity. Cross-user access is impossible.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">password</span>
          <div className="font-bold text-primary-container">Credential Shielding</div>
          <p className="text-on-surface-variant text-[11px]">
            Passwords, OTPs, CVVs, and CAPTCHAs are strictly shielded. SARA never touches them.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">pan_tool</span>
          <div className="font-bold text-primary-container">Human Control Guarantee</div>
          <p className="text-on-surface-variant text-[11px]">
            SARA assists with filling. Final application submission is always under your manual control.
          </p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
            <span>Security & Access Audit Trail ({auditEvents.length})</span>
          </h2>
          <span className="text-[11px] text-on-surface-variant font-mono bg-surface-container-low px-2 py-0.5 rounded-full border border-outline-variant/30">
            Immutable Log
          </span>
        </div>

        {auditEvents.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-2">No security events recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {auditEvents.slice(0, 15).map((evt) => {
              const isAuth = evt.action.includes('AUTH');
              const isExport = evt.action.includes('EXPORT');
              const isDoc = evt.action.includes('DOCUMENT') || evt.action.includes('CHAT');
              const badgeClass = isExport
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : isAuth
                ? 'bg-secondary/15 text-secondary border-secondary/30'
                : 'bg-primary/15 text-primary-container border-primary/30';

              return (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${badgeClass}`}>
                      {evt.action}
                    </span>
                    <span className="text-on-surface-variant text-[11px] font-mono">
                      {evt.resourceType}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {new Date(evt.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official PDF Export & SMTP Protocol Sharing */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold mb-1.5">
            <span className="material-symbols-outlined text-[14px]">mail</span>
            <span>SMTP Protocol Dispatch Active (smtp.gmail.com:587)</span>
          </div>
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">picture_as_pdf</span>
            <span>Official Identity & Document Intelligence PDF Export</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Export your complete verified identity, marks cards extractions, approved facts, and security audit trail in an official PDF dossier, and deliver it directly to your email via secure SMTP protocol.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3">
          <label className="block text-xs font-semibold text-primary-container">
            Recipient Email Address for SMTP Delivery:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={exportEmail}
              onChange={(e) => setExportEmail(e.target.value)}
              placeholder="jeevangowdahm6@gmail.com"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
            <button
              onClick={handleExportPdfAndEmail}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs hover:bg-secondary/90 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
                  <span>Compiling & Sending via SMTP...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Export & Email PDF via SMTP</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
            <span>SMTP Config: smtp.gmail.com (Port 587) | Generates structured A4 PDF dossier attachment</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <div className="space-y-1 text-xs text-on-surface-variant">
            <div className="font-bold text-error">Permanent Account Deletion</div>
            <p>Erase your account, encrypted vault files, and all associated personal facts immediately.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-error font-semibold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            <span>Delete My Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

