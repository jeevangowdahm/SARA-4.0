import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:3001';

describe('SARA 4.0 Multi-User Row Level Security (RLS) & Account Isolation Tests', () => {
  let userA: { id: string; identifier: string };
  let tokenA: string;

  let userB: { id: string; identifier: string };
  let tokenB: string;

  let docAId: string;

  beforeAll(async () => {
    const idA = `alpha_${Date.now()}@sara.test`;
    const idB = `beta_${Date.now()}@sara.test`;

    // 1. Register & Verify User A
    const otpResA = await fetch(`${BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: idA }),
    }).then((r) => r.json());

    expect(otpResA.success).toBe(true);

    const verifyA = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: idA, otpCode: otpResA.devOtp }),
    }).then((r) => r.json());

    expect(verifyA.success).toBe(true);
    userA = verifyA.user;
    tokenA = verifyA.session.token;

    // 2. Register & Verify User B
    const otpResB = await fetch(`${BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: idB }),
    }).then((r) => r.json());

    expect(otpResB.success).toBe(true);

    const verifyB = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: idB, otpCode: otpResB.devOtp }),
    }).then((r) => r.json());

    expect(verifyB.success).toBe(true);
    userB = verifyB.user;
    tokenB = verifyB.session.token;
  });

  it('assigns unique, immutable, non-overlapping user IDs to independent accounts', () => {
    expect(userA.id).toBeDefined();
    expect(userB.id).toBeDefined();
    expect(userA.id).not.toBe(userB.id);
    expect(tokenA).not.toBe(tokenB);
  });

  it('isolates User Profile data: User B cannot observe User A profile updates', async () => {
    // User A updates profile
    const updateRes = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        fullName: 'Alpha Applicant',
        institution: 'Alpha National College',
        city: 'Bengaluru',
      }),
    }).then((r) => r.json());

    expect(updateRes.profile.fullName).toBe('Alpha Applicant');

    // User B reads their own profile
    const profileB = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }).then((r) => r.json());

    expect(profileB.profile?.fullName).not.toBe('Alpha Applicant');
  });

  it('isolates Personal Facts: User B cannot retrieve facts saved by User A', async () => {
    // User A saves an approved fact
    const factRes = await fetch(`${BASE_URL}/api/facts/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        factType: 'usn',
        displayValue: '1AL23CS001',
        sourceType: 'user_statement',
        sensitivity: 'personal',
      }),
    }).then((r) => r.json());

    expect(factRes.success).toBe(true);

    // User B fetches facts
    const factsB = await fetch(`${BASE_URL}/api/facts`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }).then((r) => r.json());

    const hasUserAFact = factsB.facts.some((f: any) => f.displayValue === '1AL23CS001');
    expect(hasUserAFact).toBe(false);
  });

  it('isolates Document Vault: User B cannot download or delete User A documents', async () => {
    // Create synthetic PDF buffer for User A
    const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Alpha Marks Card) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const formData = new FormData();
    const blob = new Blob([dummyPdf], { type: 'application/pdf' });
    formData.append('document', blob, 'Alpha_Marks_Card.pdf');
    formData.append('documentType', 'college_marks_card');

    const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formData,
    }).then((r) => r.json());

    expect(uploadRes.success).toBe(true);
    docAId = uploadRes.document.id;
    expect(docAId).toBeDefined();

    // User B lists documents
    const docsB = await fetch(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }).then((r) => r.json());

    const hasDocA = docsB.documents.some((d: any) => d.id === docAId);
    expect(hasDocA).toBe(false);

    // User B attempts to download User A's document directly (Forbidden by RLS)
    const downloadAttempt = await fetch(`${BASE_URL}/api/documents/${docAId}/download`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(downloadAttempt.status);

    // User B attempts to delete User A's document (Forbidden by RLS)
    const deleteAttempt = await fetch(`${BASE_URL}/api/documents/${docAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(deleteAttempt.status);
  });

  it('isolates Application History: User B cannot view User A completed applications', async () => {
    // User A saves an application
    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        websiteHostname: 'scholarships.gov.in',
        applicationName: 'National Merit Fellowship',
        applicationCategory: 'scholarship',
        completedFieldsCount: 5,
        totalFieldsCount: 5,
        fields: [{ fieldId: 'candidateName', selectedValue: 'Alpha Applicant' }],
      }),
    }).then((r) => r.json());

    expect(appRes.success).toBe(true);

    // User B lists applications
    const appsB = await fetch(`${BASE_URL}/api/applications`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }).then((r) => r.json());

    const hasAppA = appsB.applications.some((a: any) => a.applicationName === 'National Merit Fellowship');
    expect(hasAppA).toBe(false);
  });

  it('rejects unauthenticated requests to protected endpoints with 401 Unauthorized', async () => {
    const unauthProfile = await fetch(`${BASE_URL}/api/profile`);
    expect(unauthProfile.status).toBe(401);

    const unauthDocs = await fetch(`${BASE_URL}/api/documents`);
    expect(unauthDocs.status).toBe(401);

    const unauthFacts = await fetch(`${BASE_URL}/api/facts`);
    expect(unauthFacts.status).toBe(401);
  });
});
