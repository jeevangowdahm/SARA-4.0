import crypto from 'crypto';
import { SaraDatabase } from './db';
import { AuthSession } from './types';
import { SaraEmailService } from './email';

export interface RequestOtpResult {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  devOtp?: string; // provided for automated testing & development verification
  channel?: 'smtp' | 'clerk' | 'sms' | 'local';
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  session?: AuthSession;
  user?: { id: string; identifier: string; clerkUserId?: string };
}

export class SaraAuthService {
  private db: SaraDatabase;
  private resendTimers: Map<string, number> = new Map(); // identifier -> lastSentTimestamp

  constructor() {
    this.db = SaraDatabase.getInstance();
  }

  /**
   * Validate email or 10-digit Indian phone
   */
  public validateIdentifier(identifier: string): { valid: boolean; type: 'phone' | 'email' | 'invalid' } {
    const clean = identifier.trim();
    const phoneClean = clean.replace(/[\s\-+()]/g, '');

    // Indian 10-digit mobile (or with 91 prefix)
    if (/^(?:91)?[6-9]\d{9}$/.test(phoneClean)) {
      return { valid: true, type: 'phone' };
    }

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { valid: true, type: 'email' };
    }

    return { valid: false, type: 'invalid' };
  }

  /**
   * Request genuine OTP with cooldown and anti-abuse safeguards
   */
  public async requestOtp(identifier: string): Promise<RequestOtpResult> {
    const check = this.validateIdentifier(identifier);
    if (!check.valid) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit mobile number or email address.',
      };
    }

    const cleanId = identifier.toLowerCase().trim();
    const now = Date.now();
    const lastSent = this.resendTimers.get(cleanId);

    // 60-second cooldown between requests
    if (lastSent && now - lastSent < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);
      return {
        success: false,
        message: `Please wait ${waitSec} second${waitSec === 1 ? '' : 's'} before requesting another OTP.`,
        cooldownSeconds: waitSec,
      };
    }

    // Cryptographic 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    this.db.saveOtp(cleanId, otpCode, 5 * 60 * 1000); // 5 min TTL
    this.resendTimers.set(cleanId, now);

    let channel: RequestOtpResult['channel'] = 'local';
    let clerkAttempted = false;

    // 1. If email, attempt Clerk user initialization
    if (check.type === 'email' && process.env.CLERK_SECRET_KEY) {
      try {
        const clerkRes = await fetch('https://api.clerk.com/v1/users', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: [cleanId],
            skip_password_requirement: true,
          }),
        });
        if (clerkRes.ok || clerkRes.status === 422) {
          // 422 means user already exists in Clerk, which is valid
          clerkAttempted = true;
          console.log(`[SARA Auth] Clerk identity verified/registered for ${cleanId}`);
        }
      } catch (clerkErr: any) {
        console.warn(`[SARA Auth] Clerk integration fallback: ${clerkErr.message}`);
      }
    }

    // 2. Real SMTP Protocol Dispatch to recipient's mailbox (skip synthetic testing domains)
    const isSyntheticTest = cleanId.endsWith('.test') || cleanId.endsWith('.local') || cleanId.endsWith('.example');
    if (check.type === 'email' && !isSyntheticTest) {
      const emailService = SaraEmailService.getInstance();
      const emailSent = await emailService.sendOtpEmail(cleanId, otpCode);
      if (emailSent) {
        channel = 'smtp';
      }
    }

    console.log(`\n========================================`);
    console.log(`[SARA OTP DISPATCH]`);
    console.log(`Recipient: ${cleanId}`);
    console.log(`Security Code: ${otpCode}`);
    console.log(`Channel: ${channel} (Clerk: ${clerkAttempted ? 'synced' : 'pending'})`);
    console.log(`Validity: 5 minutes (Max 3 verification attempts)`);
    console.log(`========================================\n`);

    return {
      success: true,
      message:
        channel === 'smtp'
          ? `Verification code sent to your email (${cleanId}) via SMTP. Please check your inbox.`
          : `Verification code sent to your registered contact (${identifier}).`,
      channel,
      ...(isSyntheticTest ? { devOtp: otpCode } : {}),
    };
  }

  /**
   * Verify submitted OTP against database records
   */
  public async verifyOtp(identifier: string, inputCode: string): Promise<VerifyOtpResult> {
    const cleanId = identifier.toLowerCase().trim();
    const verifyResult = this.db.verifyOtp(cleanId, inputCode);

    if (!verifyResult.success) {
      return {
        success: false,
        message: verifyResult.message,
      };
    }

    // Get or create unique user identity
    const user = this.db.createUser(cleanId);

    // Generate secure session token
    const session = this.db.createSession(user.id, user.identifier);

    // Record audit event
    this.db.recordAuditEvent(user.id, 'AUTH_OTP_VERIFIED', 'session', session.token, {
      identifier: cleanId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Authentication successful.',
      session,
      user,
    };
  }

  /**
   * Authenticate session token and return user identity
   */
  public authenticateSession(token: string): AuthSession | null {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return this.db.getSession(cleanToken);
  }

  /**
   * Log out session
   */
  public logout(token: string) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const session = this.db.getSession(cleanToken);
    if (session) {
      this.db.recordAuditEvent(session.userId, 'AUTH_LOGOUT', 'session', cleanToken);
      this.db.deleteSession(cleanToken);
    }
  }
}

