/**
 * SARA 4.0 Secure API Client
 * Connects Web Application & Chrome Extension to the SARA Intelligence Backend
 * Handles session tokens, authenticated requests, and database-level RLS.
 */

const API_BASE_URL =
  typeof window !== 'undefined' && (window as any).__SARA_API_URL__
    ? (window as any).__SARA_API_URL__
    : (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export class SaraApiClient {
  private static tokenKey = 'sara_auth_token';

  public static getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  public static setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  public static clearToken() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  }

  // --- Auth & OTP ---
  public static async requestOtp(identifier: string) {
    return this.request<{ success: boolean; message: string; cooldownSeconds?: number; devOtp?: string }>(
      '/api/auth/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      }
    );
  }

  public static async verifyOtp(identifier: string, otpCode: string) {
    const res = await this.request<{
      success: boolean;
      message: string;
      session?: { token: string; userId: string; identifier: string };
      user?: { id: string; identifier: string };
    }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otpCode }),
    });

    if (res.session?.token) {
      this.setToken(res.session.token);
    }
    return res;
  }

  public static async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.clearToken();
  }

  public static async getMe() {
    return this.request<{
      user: { id: string; identifier: string };
      profile: any;
      preferences: any;
    }>('/api/auth/me');
  }

  // --- Profile & Preferences ---
  public static async getProfile() {
    return this.request<{ profile: any }>('/api/profile');
  }

  public static async updateProfile(profileData: any) {
    return this.request<{ profile: any }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  public static async getPreferences() {
    return this.request<{ preferences: any }>('/api/preferences');
  }

  public static async updatePreferences(prefs: any) {
    return this.request<{ preferences: any }>('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }

  // --- Personal Facts ---
  public static async getFacts() {
    return this.request<{ facts: any[] }>('/api/facts');
  }

  public static async approveFact(fact: {
    factType: string;
    displayValue: string;
    sourceDocumentId?: string;
    sourceType?: string;
    sensitivity?: string;
  }) {
    return this.request<{ success: boolean; fact: any }>('/api/facts/approve', {
      method: 'POST',
      body: JSON.stringify(fact),
    });
  }

  // --- Documents Vault ---
  public static async uploadDocument(file: File, documentType?: string) {
    const formData = new FormData();
    formData.append('document', file);
    if (documentType) {
      formData.append('documentType', documentType);
    }

    return this.request<{ success: boolean; document: any }>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  public static async getDocuments() {
    return this.request<{ documents: any[] }>('/api/documents');
  }

  public static async extractDocument(docId: string) {
    return this.request<{ success: boolean; extraction: any }>(`/api/documents/${docId}/extract`, {
      method: 'POST',
    });
  }

  public static async deleteDocument(docId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/documents/${docId}`, {
      method: 'DELETE',
    });
  }

  public static getDocumentDownloadUrl(docId: string): string {
    const token = this.getToken();
    return `${API_BASE_URL}/api/documents/${docId}/download${token ? `?auth=${token}` : ''}`;
  }

  // --- Applications ---
  public static async getApplications() {
    return this.request<{ applications: any[] }>('/api/applications');
  }

  public static async saveApplication(appData: any, fields: any[]) {
    return this.request<{ success: boolean; application: any }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ ...appData, fields }),
    });
  }

  // --- AI Explanations & Semantic Mapping ---
  public static async explainQuestion(req: {
    fieldName: string;
    fieldLabel: string;
    fieldPlaceholder?: string;
    targetLanguage: string;
  }) {
    return this.request<any>('/api/ai/explain-question', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  public static async explainError(req: {
    fieldLabel: string;
    errorMessage: string;
    targetLanguage: string;
  }) {
    return this.request<any>('/api/ai/explain-error', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  public static async mapFields(websiteFields: any[]) {
    return this.request<{ proposals: any[] }>('/api/ai/map-fields', {
      method: 'POST',
      body: JSON.stringify({ websiteFields }),
    });
  }

  // --- Consents & Account Deletion ---
  public static async recordConsent(consentType: string, purpose: string, granted: boolean) {
    return this.request<{ success: boolean; consent: any }>('/api/consent', {
      method: 'POST',
      body: JSON.stringify({ consentType, purpose, granted }),
    });
  }

  public static async getAuditEvents() {
    return this.request<{ events: any[] }>('/api/audit-events');
  }

  // --- PDF Export & SMTP Sharing ---
  public static async exportPdfAndEmail(emailRecipient?: string) {
    return this.request<{
      success: boolean;
      message: string;
      emailSent: boolean;
      emailedTo: string;
      filename: string;
      pdfBase64: string;
    }>('/api/user/export-pdf-email', {
      method: 'POST',
      body: JSON.stringify({ emailRecipient }),
    });
  }

  public static getExportPdfDownloadUrl(): string {
    const token = this.getToken();
    return `${API_BASE_URL}/api/user/export-pdf-download${token ? `?auth=${token}` : ''}`;
  }

  // --- Document Intelligence Chatbot (Groq) ---
  public static async chatWithDocumentAssistant(message: string, language: string = 'en') {
    return this.request<{
      success: boolean;
      answer: string;
      sources: string[];
      provider: string;
      language: string;
    }>('/api/chat/document-assistant', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    });
  }

  public static async translateRegionalSpeech(transcript: string, sourceLanguage: string = 'kn') {
    return this.request<{
      success: boolean;
      englishSummary: string;
      extractedFields: Record<string, string>;
    }>('/api/ai/translate-regional', {
      method: 'POST',
      body: JSON.stringify({ transcript, sourceLanguage }),
    });
  }

  public static async deleteAccount() {
    const res = await this.request<{ success: boolean; message: string }>('/api/user/account', {
      method: 'DELETE',
    });
    this.clearToken();
    return res;
  }
}
