import React, { useState, useEffect } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';
import { ScreenId, SupportedLanguage } from '../../lib/sara/types';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenAuth: () => void;
  onOpenDocumentVault: () => void;
  currentUser: any;
  selectedLanguage?: SupportedLanguage;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenDocumentVault,
  currentUser,
  selectedLanguage = 'en',
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isKn = selectedLanguage === 'kn';

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (SaraApiClient.getToken()) {
        const [profRes, docsRes, factsRes, appsRes] = await Promise.all([
          SaraApiClient.getProfile().catch(() => ({ profile: null })),
          SaraApiClient.getDocuments().catch(() => ({ documents: [] })),
          SaraApiClient.getFacts().catch(() => ({ facts: [] })),
          SaraApiClient.getApplications().catch(() => ({ applications: [] })),
        ]);

        setProfile(profRes.profile);
        setDocuments(docsRes.documents || []);
        setFacts(factsRes.facts || []);
        setApplications(appsRes.applications || []);
      }
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute profile completion score
  const calculateCompletion = () => {
    if (!profile) return 20; // baseline if authenticated
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.phone) score += 20;
    if (profile.institution) score += 20;
    if (profile.course) score += 15;
    if (profile.city || profile.currentAddress) score += 15;
    if (profile.usn) score += 10;
    return Math.min(score, 100);
  };

  const completionPct = calculateCompletion();

  const getFactLabel = (factType: string) => {
    if (!isKn) {
      return factType.replace(/_/g, ' ');
    }
    const map: Record<string, string> = {
      full_name: 'ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು',
      institution: 'ಶಾಲಾ / ಕಾಲೇಜು ಸಂಸ್ಥೆ',
      course: 'ವ್ಯಾಸಂಗದ ಕೋರ್ಸ್ / ವಿಭಾಗ',
      usn: 'ವಿಶ್ವವಿದ್ಯಾಲಯ ಸೀಟ್ ಸಂಖ್ಯೆ (USN)',
      gpa: 'ಸಿಜಿಪಿಎ (CGPA)',
      phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      email: 'ಇಮೇಲ್ ವಿಳಾಸ',
      city: 'ನಗರ / ಜಿಲ್ಲೆ',
      current_address: 'ಪ್ರಸ್ತುತ ವಾಸಸ್ಥಳ ವಿಳಾಸ',
      pincode: 'ಅಂಚೆ ಪಿನ್‌ಕೋಡ್',
      age: 'ವಯಸ್ಸು',
      motivation: 'ಅರ್ಜಿಯ ಮುಖ್ಯ ಉದ್ದೇಶ',
    };
    return map[factType] || factType.replace(/_/g, ' ');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Banner with animated glow */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-container via-[#142340] to-[#0A1224] text-white shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-xs font-semibold backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px] animate-pulse">verified_user</span>
            <span>{isKn ? 'SARA 4.0 ವೈಯಕ್ತಿಕ AI ಪ್ಲಾಟ್‌ಫಾರ್ಮ್' : 'SARA 4.0 Personal AI Platform'}</span>
          </div>
          <h1 className="text-2xl font-bold font-headline-sm tracking-tight">
            {isKn
              ? profile?.fullName
                ? `ಮರಳಿ ಸ್ವಾಗತ, ${profile.fullName}`
                : 'ನಿಮ್ಮ SARA ಗುರುತಿನ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ'
              : profile?.fullName
                ? `Welcome back, ${profile.fullName}`
                : 'Welcome to your SARA Identity Hub'}
          </h1>
          <p className="text-xs text-white/80 leading-relaxed font-body-md">
            {isKn
              ? 'ನಿಮ್ಮ ದೃಢೀಕೃತ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ, ಶೈಕ್ಷಣಿಕ ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ನೆರವು ನೆನಪುಗಳು ಡೇಟಾಬೇಸ್ ಮಟ್ಟದ ಪ್ರತ್ಯೇಕತೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಖಾಸಗಿ ವಾಲ್ಟ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿವೆ.'
              : 'Your verified personal information, documents, and form assistance memories are stored in your private vault with database-level isolation.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('03_form')}
              className="px-4 py-2 rounded-xl bg-secondary text-on-secondary font-semibold text-xs hover:bg-secondary/90 transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-secondary/20"
            >
              <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
              <span>{isKn ? 'ಫಾರ್ಮ್ ಸಹಾಯ ಪ್ರಾರಂಭಿಸಿ' : 'Start Form Assistance'}</span>
            </button>

            <button
              onClick={onOpenDocumentVault}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
              <span>{isKn ? 'ನನ್ನ ದಾಖಲೆಗಳ ವಾಲ್ಟ್' : 'My Document Vault'}</span>
            </button>
          </div>
        </div>

        {/* Ambient Orb Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none animate-pulse" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Profile Completion */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-2 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>{isKn ? 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ' : 'Profile Completion'}</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">pie_chart</span>
          </div>
          <div className="text-2xl font-bold text-primary-container font-mono">
            {completionPct}%
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Stored Documents */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-2 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>{isKn ? 'ದಾಸ್ತಾನು ದಾಖಲೆಗಳು' : 'Stored Documents'}</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">description</span>
          </div>
          <div className="text-2xl font-bold text-primary-container font-mono">
            {documents.length}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {documents.length > 0
              ? isKn
                ? 'ಖಾಸಗಿ & ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿದೆ'
                : 'Private & Encrypted'
              : isKn
                ? 'ಇನ್ನೂ ಅಪ್‌ಲೋಡ್ ಇಲ್ಲ'
                : 'No uploads yet'}
          </div>
        </div>

        {/* Metric 3: Verified Facts */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-2 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>{isKn ? 'ದೃಢೀಕೃತ ಸತ್ಯಾಂಶಗಳು' : 'Verified Facts'}</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          </div>
          <div className="text-2xl font-bold text-primary-container font-mono">
            {facts.length}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {isKn ? 'ಫಾರ್ಮ್‌ಗಳಲ್ಲಿ ಮರುಬಳಕೆ ಸಾಧ್ಯ' : 'Reusable across forms'}
          </div>
        </div>

        {/* Metric 4: Form Applications */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-2 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>{isKn ? 'ನೆರವು ಅರ್ಜಿಗಳು' : 'Applications'}</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">history_edu</span>
          </div>
          <div className="text-2xl font-bold text-primary-container font-mono">
            {applications.length}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {isKn ? 'ಪೂರ್ಣಗೊಂಡ ದಾಖಲೆಗಳು' : 'Assisted records'}
          </div>
        </div>
      </div>

      {/* Main Grid: Verified Information + Recent Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Facts Preview */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">badge</span>
              <span>{isKn ? 'ನಿಮ್ಮ ದೃಢೀಕೃತ ಗುರುತಿನ ವಿವರಗಳು' : 'Your Verified Identity Facts'}</span>
            </h2>
            <button
              onClick={() => onNavigate('06_review')}
              className="text-xs text-secondary hover:underline font-semibold"
            >
              {isKn ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' : 'View all'}
            </button>
          </div>

          {facts.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant space-y-2 bg-surface rounded-2xl border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-3xl text-secondary">contact_page</span>
              <p>{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ವಿವರಗಳು ಸಂಗ್ರಹವಾಗಿಲ್ಲ.' : 'No verified facts stored yet.'}</p>
              <button
                onClick={() => onNavigate('03_form')}
                className="text-secondary font-semibold hover:underline"
              >
                {isKn ? 'ನಿಮ್ಮ ಮೊದಲ ಅರ್ಜಿಯನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Speak or fill your first application'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {facts.slice(0, 5).map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-outline-variant/30 flex items-center justify-between text-xs hover:border-secondary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-primary-container">
                      {getFactLabel(fact.factType)}
                    </span>
                    <div className="text-on-surface font-semibold">{fact.displayValue}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/15 text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                    <span>{isKn ? 'ದೃಢೀಕೃತ' : 'Verified'}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications Preview */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">history</span>
              <span>{isKn ? 'ಇತ್ತೀಚಿನ ಫಾರ್ಮ್ ನೆರವು ಇತಿಹಾಸ' : 'Recent Form Assistance Records'}</span>
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant space-y-2 bg-surface rounded-2xl border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-3xl text-secondary">assignment</span>
              <p>{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿಗಳು ಪೂರ್ಣಗೊಂಡಿಲ್ಲ.' : 'No applications completed yet.'}</p>
              <p className="text-[11px]">
                {isKn
                  ? 'ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅಥವಾ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡಲು SARA ಬಳಸಿ.'
                  : 'Connect SARA to any scholarship or government website to populate fields automatically.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {applications.slice(0, 4).map((app, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-outline-variant/30 flex items-center justify-between text-xs hover:border-secondary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-primary-container">{app.applicationName}</div>
                    <div className="text-on-surface-variant text-[11px] font-mono">
                      {app.websiteHostname} &bull; {new Date(app.createdAt).toLocaleDateString(isKn ? 'kn-IN' : 'en-IN')}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container/10 text-primary-container">
                    {app.completedFieldsCount} {isKn ? 'ವಿವರಗಳು ಭರ್ತಿಯಾಗಿವೆ' : 'fields filled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
