import React, { useState, useEffect } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';

interface ApplicationHistoryScreenProps {
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const ApplicationHistoryScreen: React.FC<ApplicationHistoryScreenProps> = ({ onOpenAuth, currentUser }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    if (!SaraApiClient.getToken()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await SaraApiClient.getApplications();
      setApplications(res.applications || []);
    } catch (err: any) {
      console.warn('Load applications error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!SaraApiClient.getToken() && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xl space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">history_edu</span>
        </div>
        <h2 className="text-lg font-bold text-primary-container">Application History</h2>
        <p className="text-xs text-on-surface-variant">
          Sign in to review your past form assistance records and populated fields.
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">history_edu</span>
          <span>My Applications — Form Records</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-container font-headline-sm">
          Application History
        </h1>
        <p className="text-xs text-on-surface-variant max-w-xl">
          Review external portal applications assisted by SARA. SARA records which fields you approved and populated. Final submissions remain under your manual control.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant space-y-2 bg-surface rounded-2xl border border-dashed border-outline-variant/60">
            <span className="material-symbols-outlined text-4xl text-secondary">assignment_late</span>
            <p className="font-semibold text-primary-container">No application records yet</p>
            <p>
              When you use SARA to populate an external scholarship or government form, a verified record will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-surface border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary-container">
                      {app.applicationName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/15 text-secondary capitalize">
                      {app.applicationCategory}
                    </span>
                  </div>

                  <div className="text-on-surface-variant text-[11px] font-mono flex items-center gap-2">
                    <span>{app.websiteHostname}</span>
                    <span>&bull;</span>
                    <span>Started: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>

                  {app.notes && (
                    <div className="text-[11px] text-on-surface italic">
                      "{app.notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-secondary font-mono">
                      {app.completedFieldsCount} fields filled
                    </div>
                    <div className="text-[10px] text-on-surface-variant capitalize">
                      {app.applicationStatus.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

