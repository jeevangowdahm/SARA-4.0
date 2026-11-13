import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:3001';

describe('SARA 4.0 Document Vault & Real Text Extraction Tests', () => {
  let token: string;
  let user: any;
  let uploadedDocId: string;

  beforeAll(async () => {
    // Register and authenticate a test user
    const id = `doc_tester_${Date.now()}@sara.test`;
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

  it('uploads a real PDF document to the user private vault with MIME validation', async () => {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 380 >>
stream
BT
/F1 12 Tf
72 700 Td
(VISVESVARAYA TECHNOLOGICAL UNIVERSITY) Tj
0 -20 Td
(Name of Candidate: Rajesh Kumar) Tj
0 -20 Td
(USN: 1RN23CS142) Tj
0 -20 Td
(College: RNS Institute of Technology) Tj
0 -20 Td
(Branch: BE Computer Science & Engineering) Tj
0 -20 Td
(CGPA: 9.15) Tj
0 -20 Td
(Aadhaar: 5544 3322 8901) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000659 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('document', blob, 'VTU_Semester_Report.pdf');
    formData.append('documentType', 'college_marks_card');

    const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((r) => r.json());

    expect(uploadRes.success).toBe(true);
    expect(uploadRes.document.originalFilename).toBe('VTU_Semester_Report.pdf');
    expect(uploadRes.document.mimeType).toBe('application/pdf');
    uploadedDocId = uploadRes.document.id;
  });

  it('performs real PDF text extraction and structured parsing via pdf-parse', async () => {
    const extractRes = await fetch(`${BASE_URL}/api/documents/${uploadedDocId}/extract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    expect(extractRes.success).toBe(true);
    const facts = extractRes.extraction.extractedFields;
    expect(facts.length).toBeGreaterThan(0);

    // Verify Candidate Name extracted from PDF text stream
    const nameFact = facts.find((f: any) => f.field === 'full_name');
    expect(nameFact).toBeDefined();
    expect(nameFact.value).toBe('Rajesh Kumar');

    // Verify USN extracted
    const usnFact = facts.find((f: any) => f.field === 'usn');
    expect(usnFact).toBeDefined();
    expect(usnFact.value).toBe('1RN23CS142');

    // Verify CGPA extracted
    const gpaFact = facts.find((f: any) => f.field === 'gpa');
    expect(gpaFact).toBeDefined();
    expect(gpaFact.value).toBe('9.15');

    // Verify Strict Aadhaar Masking
    const aadhaarFact = facts.find((f: any) => f.field === 'aadhaar_masked');
    expect(aadhaarFact).toBeDefined();
    expect(aadhaarFact.value).toBe('XXXX-XXXX-8901');
    expect(aadhaarFact.sensitivity).toBe('highly_sensitive');
  });

  it('allows user to approve extracted fact and synchronizes with personal facts memory', async () => {
    const approveRes = await fetch(`${BASE_URL}/api/facts/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        factType: 'usn',
        displayValue: '1RN23CS142',
        sourceDocumentId: uploadedDocId,
        sourceType: 'document_ocr',
        sensitivity: 'personal',
      }),
    }).then((r) => r.json());

    expect(approveRes.success).toBe(true);
    expect(approveRes.fact.displayValue).toBe('1RN23CS142');

    // Verify fact is retrieved
    const factsRes = await fetch(`${BASE_URL}/api/facts`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    const hasApproved = factsRes.facts.some((f: any) => f.factType === 'usn' && f.displayValue === '1RN23CS142');
    expect(hasApproved).toBe(true);
  });

  it('allows secure deletion of the document from the private vault', async () => {
    const deleteRes = await fetch(`${BASE_URL}/api/documents/${uploadedDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    expect(deleteRes.success).toBe(true);

    // Verify document is no longer listed in active documents
    const listRes = await fetch(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    const exists = listRes.documents.some((d: any) => d.id === uploadedDocId);
    expect(exists).toBe(false);
  });
});

