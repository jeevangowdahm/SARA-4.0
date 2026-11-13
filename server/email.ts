import nodemailer from 'nodemailer';

export class SaraEmailService {
  private static instance: SaraEmailService;
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });
        this.isConfigured = true;
        console.log(`[SARA Email] SMTP Transport configured for ${user} via ${host}:${port}`);
      } catch (err: any) {
        console.warn('[SARA Email] SMTP initialization error:', err.message);
      }
    }
  }

  public static getInstance(): SaraEmailService {
    if (!SaraEmailService.instance) {
      SaraEmailService.instance = new SaraEmailService();
    }
    return SaraEmailService.instance;
  }

  /**
   * Dispatch real-time 6-digit OTP email to recipient
   */
  public async sendOtpEmail(toEmail: string, otpCode: string, recipientName: string = 'SARA User'): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      console.warn('[SARA Email] SMTP not configured. Falling back to local console dispatch.');
      return false;
    }

    const fromUser = process.env.SMTP_USER || 'no-reply@sara-assistant.org';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0b1329; color: #f1f5f9; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #101B34 0%, #17B99A 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">SARA</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #e2e8f0; font-weight: 500;">Smart Accessible Response Assistant</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="font-size: 15px; margin-top: 0; color: #cbd5e1;">Hello <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
            You requested a secure verification code to access your <strong>SARA Personal Identity & Document Vault</strong>. Use the 6-digit code below to complete your sign in:
          </p>
          
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #032b24; border: 2px solid #17B99A; border-radius: 14px; padding: 16px 36px;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #34d399;">${otpCode}</span>
            </div>
          </div>
          
          <div style="background-color: #1e293b; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
              ⏱ <strong>Code Validity:</strong> This code is valid for <strong>5 minutes</strong> and can only be used once.<br/>
              🛡 <strong>Security Notice:</strong> Never share this code with anyone. SARA staff will never ask for your verification code.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            If you did not request this code, you can safely ignore this message. Your personal document vault remains encrypted and protected.
          </p>
        </div>
        
        <div style="background-color: #060b18; padding: 18px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0; font-size: 11px; color: #475569;">
            Tech-Quest 2.0 | RNSIT | SARA Accessibility Platform<br/>
            "Your voice. Your language. Your access."
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"SARA Assistant" <${fromUser}>`,
        to: toEmail,
        subject: `SARA 4.0 Verification Code: ${otpCode}`,
        text: `Your SARA 4.0 verification code is: ${otpCode}. It is valid for 5 minutes.`,
        html: htmlContent,
      });

      console.log(`[SARA Email] OTP successfully dispatched to ${toEmail} (Message ID: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error(`[SARA Email] Failed to send OTP to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * Send generated Personal Data & Vault PDF export to user's email
   */
  public async sendExportPdfEmail(
    toEmail: string,
    pdfBuffer: Buffer,
    filename: string,
    summary: { profileName: string; factsCount: number; docsCount: number; appsCount: number }
  ): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      console.warn('[SARA Email] SMTP not configured. Cannot send export email.');
      return false;
    }

    const fromUser = process.env.SMTP_USER || 'no-reply@sara-assistant.org';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1329; color: #f1f5f9; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #101B34 0%, #17B99A 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">SARA Personal Dossier Export</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #e2e8f0;">Official Record & Document Intelligence Summary</p>
        </div>
        
        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #cbd5e1;">Dear <strong>${summary.profileName || 'SARA Member'}</strong>,</p>
          <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            As requested from your SARA Privacy & Security Center, your comprehensive personal identity dossier has been compiled into an official PDF document and attached below.
          </p>
          
          <div style="background-color: #111e38; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #1e293b;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #34d399;">Export Summary:</h3>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.8;">
              <li><strong>Verified Profile:</strong> ${summary.profileName || 'Active'}</li>
              <li><strong>Approved Identity Facts:</strong> ${summary.factsCount} records</li>
              <li><strong>Encrypted Documents in Vault:</strong> ${summary.docsCount} files</li>
              <li><strong>Assisted Form Applications:</strong> ${summary.appsCount} completed</li>
            </ul>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
            The attached PDF contains your verified identity attributes, extracted marks card and academic details, and cryptographic audit records.
          </p>
        </div>
        
        <div style="background-color: #060b18; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0; font-size: 11px; color: #475569;">
            Tech-Quest 2.0 | SARA Personal AI Identity & Universal Form Assistance Platform
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"SARA Assistant" <${fromUser}>`,
        to: toEmail,
        subject: `Your SARA Personal Identity & Document Intelligence Dossier (PDF Attached)`,
        text: `Your SARA 4.0 personal data export is attached as ${filename}.`,
        html: htmlContent,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      console.log(`[SARA Email] PDF export successfully sent to ${toEmail} (Message ID: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error(`[SARA Email] Failed to send export PDF to ${toEmail}:`, err.message);
      return false;
    }
  }
}

