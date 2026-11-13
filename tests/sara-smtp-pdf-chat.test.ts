import { describe, it, expect, beforeAll } from 'vitest';
import { SaraPdfExportService } from '../server/pdfExport';
import { SaraAiTaskRouter } from '../server/aiRouter';

const BASE_URL = 'http://localhost:3001';

describe('SARA 4.0 SMTP, PDF Export & Groq Document Intelligence Tests', () => {
  let token: string;
  let user: any;

  beforeAll(async () => {
    const id = `test_smtp_${Date.now()}@sara.test`;
    const otpRes = await fetch(`${BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: id }),
    }).then((r) => r.json());

    const verify = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: id, otpCode: otpRes.devOtp }),
    }).then((r) => r.json());

    user = verify.user;
    token = verify.session.token;
  });

  it('generates a valid, structured A4 PDF dossier from user records and vault metadata', () => {
    const pdfBuffer = SaraPdfExportService.generateUserExportPdf({
      user: { id: user.id, identifier: user.identifier },
      profile: {
        id: 'prof_1',
        userId: user.id,
        fullName: 'Jeevan Gowda H M',
        phone: '9876543210',
        email: 'jeevangowdahm6@gmail.com',
        institution: 'RNS Institute of Technology',
        course: 'BE Computer Science & Engineering',
        usn: '1RN23CS142',
        gpa: '9.15',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        dateOfBirth: '2004-05-14',
        age: 20,
        currentAddress: 'Vijayanagar, Bengaluru',
        permanentAddress: 'Vijayanagar, Bengaluru',
        educationLevel: 'Undergraduate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any,
      facts: [
        {
          id: 'fact_1',
          userId: user.id,
          factType: 'usn',
          displayValue: '1RN23CS142',
          sourceType: 'document_ocr',
          sensitivity: 'standard',
          userApproved: true,
          confidenceScore: 0.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as any,
      documents: [
        {
          id: 'doc_1',
          userId: user.id,
          documentType: 'college_marks_card',
          storageObjectKey: 'key_1.pdf',
          originalFilename: 'VTU_Semester_Report.pdf',
          mimeType: 'application/pdf',
          fileSize: 45000,
          encryptionStatus: 'stored_private',
          processingStatus: 'processed',
          deletedAt: null,
        },
      ] as any,
      applications: [],
      auditEvents: [],
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // PDF Magic Header %PDF-
    expect(pdfBuffer.slice(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('invokes Groq Document Intelligence Chatbot with document context', async () => {
    const aiRouter = new SaraAiTaskRouter();
    const result = await aiRouter.chatWithDocumentIntelligence(
      'What is my USN and CGPA according to my marks card?',
      [
        {
          title: 'VTU_Semester_Report.pdf',
          type: 'college_marks_card',
          text: 'VISVESVARAYA TECHNOLOGICAL UNIVERSITY Name: Jeevan Gowda USN: 1RN23CS142 College: RNS Institute of Technology Branch: CSE CGPA: 9.15',
          facts: {
            usn: '1RN23CS142',
            cgpa: '9.15',
            institution: 'RNS Institute of Technology',
          },
        },
      ],
      {
        fullName: 'Jeevan Gowda H M',
        usn: '1RN23CS142',
        gpa: '9.15',
        institution: 'RNS Institute of Technology',
      },
      'en'
    );

    expect(result).toBeDefined();
    expect(result.answer).toBeDefined();
    expect(result.answer.length).toBeGreaterThan(10);
    expect(result.answer).toMatch(/1RN23CS142|9\.15/);
  }, 15000);

  it('translates Kannada speech into formal English form fields', async () => {
    const aiRouter = new SaraAiTaskRouter();
    const result = await aiRouter.translateRegionalSpeechToEnglish(
      'ನನ್ನ ಹೆಸರು ಜೀವನ್ ಗೌಡ. ನಾನು ಆರ್ ಎನ್ ಎಸ್ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಟೆಕ್ನಾಲಜಿಯಲ್ಲಿ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಓದುತ್ತಿದ್ದೇನೆ. ಮೊಬೈಲ್ 9876543210.',
      'kn'
    );

    expect(result).toBeDefined();
    expect(result.extractedFields).toBeDefined();
    expect(result.extractedFields.fullName || result.extractedFields.institution || result.extractedFields.mobile).toBeDefined();
  }, 15000);

  it('dispatches PDF export via API and returns base64 and SMTP status', async () => {
    const res = await fetch(`${BASE_URL}/api/user/export-pdf-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailRecipient: 'jeevangowdahm6@gmail.com',
      }),
    }).then((r) => r.json());

    expect(res.success).toBe(true);
    expect(res.filename).toContain('.pdf');
    expect(res.pdfBase64).toBeDefined();
    expect(res.pdfBase64.length).toBeGreaterThan(500);
    expect(res.emailedTo).toBe('jeevangowdahm6@gmail.com');
  }, 15000);
});
