import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  UserPreferences,
  PersonalFact,
  UserDocument,
  DocumentExtractionRecord,
  ApplicationRecord,
  ApplicationFieldRecord,
  UserConsent,
  AuditEvent,
  OtpRecord,
  AuthSession,
} from './types';

interface DatabaseData {
  users: Array<{ id: string; identifier: string; createdAt: string; verifiedAt: string }>;
  profiles: UserProfile[];
  userPreferences: UserPreferences[];
  personalFacts: PersonalFact[];
  userDocuments: UserDocument[];
  documentExtractions: DocumentExtractionRecord[];
  applications: ApplicationRecord[];
  applicationFieldRecords: ApplicationFieldRecord[];
  userConsents: UserConsent[];
  auditEvents: AuditEvent[];
  otps: OtpRecord[];
  sessions: AuthSession[];
}

const DEFAULT_DB_DATA: DatabaseData = {
  users: [],
  profiles: [],
  userPreferences: [],
  personalFacts: [],
  userDocuments: [],
  documentExtractions: [],
  applications: [],
  applicationFieldRecords: [],
  userConsents: [],
  auditEvents: [],
  otps: [],
  sessions: [],
};

export class SaraDatabase {
  private static instance: SaraDatabase;
  private dbFilePath: string;
  private data: DatabaseData;

  private constructor() {
    const dataDir = path.resolve(process.cwd(), 'server', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = path.join(dataDir, 'sara.db.json');
    this.data = this.loadData();
  }

  public static getInstance(): SaraDatabase {
    if (!SaraDatabase.instance) {
      SaraDatabase.instance = new SaraDatabase();
    }
    return SaraDatabase.instance;
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        return { ...DEFAULT_DB_DATA, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('[SARA DB] Could not read existing DB file. Initializing fresh DB.', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
  }

  private persist() {
    try {
      const tempPath = `${this.dbFilePath}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbFilePath);
    } catch (err) {
      console.error('[SARA DB] Persistence write error:', err);
    }
  }

  // --- Row Level Security Enforcer ---
  private enforceRLS(requestedUserId: string, actualSessionUserId: string) {
    if (!actualSessionUserId || requestedUserId !== actualSessionUserId) {
      const err = new Error(`[RLS Access Denied] User '${actualSessionUserId}' is forbidden from accessing data belonging to '${requestedUserId}'.`);
      (err as any).statusCode = 403;
      throw err;
    }
  }

  // --- Auth & Users ---
  public findUserByIdentifier(identifier: string) {
    return this.data.users.find((u) => u.identifier.toLowerCase() === identifier.toLowerCase());
  }

  public findUserById(userId: string) {
    return this.data.users.find((u) => u.id === userId);
  }

  public createUser(identifier: string): { id: string; identifier: string } {
    let existing = this.findUserByIdentifier(identifier);
    if (existing) return existing;

    const id = `usr_${crypto.randomUUID()}`;
    const newUser = {
      id,
      identifier: identifier.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Initialize default preferences
    this.data.userPreferences.push({
      id: `pref_${crypto.randomUUID()}`,
      userId: id,
      preferredLanguage: 'en',
      speechRate: 1.0,
      voiceEnabled: true,
      easyModeEnabled: false,
      teachModeEnabled: false,
      textScale: 'normal',
      highContrast: false,
      reducedMotion: false,
      updatedAt: new Date().toISOString(),
    });

    this.persist();
    return newUser;
  }

  // --- OTP Management ---
  public saveOtp(identifier: string, code: string, ttlMs: number = 5 * 60 * 1000): OtpRecord {
    // Invalidate prior active OTPs for this identifier
    this.data.otps = this.data.otps.filter(
      (o) => o.identifier.toLowerCase() !== identifier.toLowerCase() || o.expiresAt > Date.now()
    );

    const record: OtpRecord = {
      id: `otp_${crypto.randomUUID()}`,
      identifier: identifier.toLowerCase().trim(),
      otpCode: code,
      attempts: 0,
      maxAttempts: 3,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
      verified: false,
    };
    this.data.otps.push(record);
    this.persist();
    return record;
  }

  public verifyOtp(identifier: string, inputCode: string): { success: boolean; message: string } {
    const cleanId = identifier.toLowerCase().trim();
    const active = this.data.otps
      .filter((o) => o.identifier === cleanId && !o.verified && o.expiresAt > Date.now())
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!active) {
      return { success: false, message: 'OTP has expired or no pending OTP was found. Please request a new code.' };
    }

    if (active.attempts >= active.maxAttempts) {
      return { success: false, message: 'Too many incorrect attempts. For security, please request a new OTP.' };
    }

    active.attempts += 1;

    if (active.otpCode.trim() !== inputCode.trim()) {
      this.persist();
      const remaining = active.maxAttempts - active.attempts;
      return {
        success: false,
        message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      };
    }

    active.verified = true;
    this.persist();
    return { success: true, message: 'OTP successfully verified.' };
  }

  // --- Sessions ---
  public createSession(userId: string, identifier: string, ttlMs: number = 7 * 24 * 60 * 60 * 1000): AuthSession {
    const token = `sara_sess_${crypto.randomBytes(32).toString('hex')}`;
    const session: AuthSession = {
      token,
      userId,
      identifier,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  public getSession(token: string): AuthSession | null {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.deleteSession(token);
      return null;
    }
    return session;
  }

  public deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  // --- Profiles (RLS Protected) ---
  public getProfile(userId: string, requestingUserId: string): UserProfile | null {
    this.enforceRLS(userId, requestingUserId);
    return this.data.profiles.find((p) => p.userId === userId) || null;
  }

  public upsertProfile(userId: string, requestingUserId: string, update: Partial<UserProfile>): UserProfile {
    this.enforceRLS(userId, requestingUserId);
    const existingIndex = this.data.profiles.findIndex((p) => p.userId === userId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const merged = {
        ...this.data.profiles[existingIndex],
        ...update,
        userId,
        updatedAt: now,
      };
      this.data.profiles[existingIndex] = merged;
      this.persist();
      return merged;
    } else {
      const newProfile: UserProfile = {
        id: `prof_${crypto.randomUUID()}`,
        userId,
        fullName: update.fullName || '',
        phone: update.phone || '',
        email: update.email || '',
        country: update.country || 'India',
        state: update.state || 'Karnataka',
        city: update.city || '',
        currentAddress: update.currentAddress || '',
        dateOfBirth: update.dateOfBirth,
        age: update.age,
        educationLevel: update.educationLevel,
        course: update.course,
        institution: update.institution,
        currentSemester: update.currentSemester,
        usn: update.usn,
        gpa: update.gpa,
        createdAt: now,
        updatedAt: now,
        ...update,
      };
      this.data.profiles.push(newProfile);
      this.persist();
      return newProfile;
    }
  }

  // --- Preferences (RLS Protected) ---
  public getPreferences(userId: string, requestingUserId: string): UserPreferences | null {
    this.enforceRLS(userId, requestingUserId);
    return this.data.userPreferences.find((p) => p.userId === userId) || null;
  }

  public updatePreferences(
    userId: string,
    requestingUserId: string,
    update: Partial<UserPreferences>
  ): UserPreferences {
    this.enforceRLS(userId, requestingUserId);
    const pref = this.data.userPreferences.find((p) => p.userId === userId);
    const now = new Date().toISOString();

    if (pref) {
      Object.assign(pref, update, { updatedAt: now });
      this.persist();
      return pref;
    } else {
      const newPref: UserPreferences = {
        id: `pref_${crypto.randomUUID()}`,
        userId,
        preferredLanguage: update.preferredLanguage || 'en',
        speechRate: update.speechRate ?? 1.0,
        voiceEnabled: update.voiceEnabled ?? true,
        easyModeEnabled: update.easyModeEnabled ?? false,
        teachModeEnabled: update.teachModeEnabled ?? false,
        textScale: update.textScale || 'normal',
        highContrast: update.highContrast ?? false,
        reducedMotion: update.reducedMotion ?? false,
        updatedAt: now,
      };
      this.data.userPreferences.push(newPref);
      this.persist();
      return newPref;
    }
  }

  // --- Personal Facts (RLS Protected) ---
  public getPersonalFacts(userId: string, requestingUserId: string): PersonalFact[] {
    this.enforceRLS(userId, requestingUserId);
    return this.data.personalFacts.filter((f) => f.userId === userId);
  }

  public savePersonalFact(
    userId: string,
    requestingUserId: string,
    fact: Omit<PersonalFact, 'id' | 'userId' | 'updatedAt'>
  ): PersonalFact {
    this.enforceRLS(userId, requestingUserId);
    const now = new Date().toISOString();

    // Check if factType already exists for this user to supersede or update
    const existingIndex = this.data.personalFacts.findIndex(
      (f) => f.userId === userId && f.factType === fact.factType
    );

    const newFact: PersonalFact = {
      id: `fact_${crypto.randomUUID()}`,
      userId,
      ...fact,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      // Mark old as superseded if value changed
      this.data.personalFacts[existingIndex].verificationStatus = 'superseded';
      this.data.personalFacts.push(newFact);
    } else {
      this.data.personalFacts.push(newFact);
    }

    this.persist();
    return newFact;
  }

  // --- Documents (RLS Protected) ---
  public getUserDocuments(userId: string, requestingUserId: string): UserDocument[] {
    this.enforceRLS(userId, requestingUserId);
    return this.data.userDocuments.filter((d) => d.userId === userId && !d.deletedAt);
  }

  public getDocumentById(docId: string, requestingUserId: string): UserDocument | null {
    const doc = this.data.userDocuments.find((d) => d.id === docId && !d.deletedAt);
    if (!doc) return null;
    this.enforceRLS(doc.userId, requestingUserId);
    return doc;
  }

  public getDocumentUnsafe(docId: string): UserDocument | null {
    return this.data.userDocuments.find((d) => d.id === docId && !d.deletedAt) || null;
  }

  public saveUserDocument(
    userId: string,
    requestingUserId: string,
    doc: Omit<UserDocument, 'id' | 'userId' | 'uploadedAt'>
  ): UserDocument {
    this.enforceRLS(userId, requestingUserId);
    const newDoc: UserDocument = {
      id: `doc_${crypto.randomUUID()}`,
      userId,
      ...doc,
      uploadedAt: new Date().toISOString(),
    };
    this.data.userDocuments.push(newDoc);
    this.persist();
    return newDoc;
  }

  public deleteUserDocument(docId: string, requestingUserId: string): boolean {
    const doc = this.data.userDocuments.find((d) => d.id === docId && !d.deletedAt);
    if (!doc) return false;
    this.enforceRLS(doc.userId, requestingUserId);

    doc.deletedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- Document Extractions (RLS Protected) ---
  public saveDocumentExtraction(
    userId: string,
    requestingUserId: string,
    record: Omit<DocumentExtractionRecord, 'id' | 'userId' | 'createdAt'>
  ): DocumentExtractionRecord {
    this.enforceRLS(userId, requestingUserId);
    const newRecord: DocumentExtractionRecord = {
      id: `ext_${crypto.randomUUID()}`,
      userId,
      ...record,
      createdAt: new Date().toISOString(),
    };
    this.data.documentExtractions.push(newRecord);
    this.persist();
    return newRecord;
  }

  public getExtractionsForDocument(docId: string, requestingUserId: string): DocumentExtractionRecord[] {
    const doc = this.getDocumentById(docId, requestingUserId);
    if (!doc) return [];
    return this.data.documentExtractions.filter((e) => e.documentId === docId && e.userId === requestingUserId);
  }

  public getDocumentExtractions(docId: string, requestingUserId: string): DocumentExtractionRecord[] {
    return this.getExtractionsForDocument(docId, requestingUserId);
  }

  // --- Applications (RLS Protected) ---
  public getApplications(userId: string, requestingUserId: string): ApplicationRecord[] {
    this.enforceRLS(userId, requestingUserId);
    return this.data.applications.filter((a) => a.userId === userId);
  }

  public saveApplication(
    userId: string,
    requestingUserId: string,
    app: Omit<ApplicationRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    fields: Array<Omit<ApplicationFieldRecord, 'id' | 'userId' | 'applicationId' | 'createdAt'>>
  ): ApplicationRecord {
    this.enforceRLS(userId, requestingUserId);
    const appId = `app_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newApp: ApplicationRecord = {
      id: appId,
      userId,
      ...app,
      createdAt: now,
      updatedAt: now,
    };
    this.data.applications.push(newApp);

    for (const f of fields) {
      this.data.applicationFieldRecords.push({
        id: `appf_${crypto.randomUUID()}`,
        userId,
        applicationId: appId,
        ...f,
        createdAt: now,
      });
    }

    this.persist();
    return newApp;
  }

  // --- User Consents (RLS Protected) ---
  public recordConsent(
    userId: string,
    requestingUserId: string,
    consentType: UserConsent['consentType'],
    purpose: string,
    granted: boolean
  ): UserConsent {
    this.enforceRLS(userId, requestingUserId);
    const now = new Date().toISOString();

    const existing = this.data.userConsents.find((c) => c.userId === userId && c.consentType === consentType);
    if (existing) {
      existing.granted = granted;
      if (!granted) existing.revokedAt = now;
      this.persist();
      return existing;
    }

    const consent: UserConsent = {
      id: `cst_${crypto.randomUUID()}`,
      userId,
      consentType,
      purpose,
      granted,
      grantedAt: now,
    };
    this.data.userConsents.push(consent);
    this.persist();
    return consent;
  }

  // --- Audit Events ---
  public recordAuditEvent(userId: string, action: string, resourceType: string, resourceId?: string, metadata?: any) {
    this.data.auditEvents.push({
      id: `aud_${crypto.randomUUID()}`,
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
      nonSensitiveMetadata: metadata,
    });
    this.persist();
  }

  public getAuditEvents(userId: string, requestingUserId: string): AuditEvent[] {
    this.enforceRLS(userId, requestingUserId);
    return this.data.auditEvents.filter((a) => a.userId === userId);
  }

  // Delete entire user account and cascade delete all personal records
  public deleteUserAccount(userId: string, requestingUserId: string): boolean {
    this.enforceRLS(userId, requestingUserId);

    this.data.users = this.data.users.filter((u) => u.id !== userId);
    this.data.profiles = this.data.profiles.filter((p) => p.userId !== userId);
    this.data.userPreferences = this.data.userPreferences.filter((p) => p.userId !== userId);
    this.data.personalFacts = this.data.personalFacts.filter((f) => f.userId !== userId);
    this.data.userDocuments = this.data.userDocuments.filter((d) => d.userId !== userId);
    this.data.documentExtractions = this.data.documentExtractions.filter((e) => e.userId !== userId);
    this.data.applications = this.data.applications.filter((a) => a.userId !== userId);
    this.data.applicationFieldRecords = this.data.applicationFieldRecords.filter((f) => f.userId !== userId);
    this.data.userConsents = this.data.userConsents.filter((c) => c.userId !== userId);
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);

    this.persist();
    return true;
  }
}

