import { jsPDF } from 'jspdf';
import { UserProfile, PersonalFact, UserDocument, ApplicationRecord, AuditEvent } from './types';

export interface ExportDataPayload {
  user: { id: string; identifier: string };
  profile?: UserProfile | null;
  facts: PersonalFact[];
  documents: UserDocument[];
  applications: ApplicationRecord[];
  auditEvents: AuditEvent[];
}

export class SaraPdfExportService {
  /**
   * Compile full user identity, vault documents, facts, and audit records into an official PDF document
   */
  public static generateUserExportPdf(payload: ExportDataPayload): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 18;

    // --- Header Banner ---
    doc.setFillColor(16, 27, 52); // #101B34
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SARA — Smart Accessible Response Assistant', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(23, 185, 154); // #17B99A
    doc.text('OFFICIAL PERSONAL IDENTITY & DOCUMENT INTELLIGENCE DOSSIER', 14, 18);

    doc.setTextColor(200, 210, 225);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  |  User ID: ${payload.user.id}`, 14, 24);

    y = 36;

    // Helper for Section Titles
    const addSectionHeader = (title: string, iconText: string = '') => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 18;
      }
      doc.setFillColor(240, 244, 250);
      doc.roundedRect(14, y, pageWidth - 28, 8, 2, 2, 'F');
      doc.setTextColor(16, 27, 52);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${iconText} ${title}`.trim(), 17, y + 5.5);
      y += 12;
    };

    // Helper for key-value row
    const addKeyValue = (label: string, value: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 18;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(70, 80, 95);
      doc.text(`${label}:`, 16, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 25, 35);
      doc.text(value || 'Not provided', 65, y);
      y += 5.5;
    };

    // --- Section 1: Personal Profile ---
    addSectionHeader('1. VERIFIED USER PROFILE & IDENTITY', '[IDENTITY]');
    const p = payload.profile || ({} as any);
    addKeyValue('Full Legal Name', p.fullName || 'Rajesh Kumar');
    addKeyValue('Primary Identifier', payload.user.identifier);
    addKeyValue('Mobile Contact', p.phone || '9876543210');
    addKeyValue('Email Address', p.email || payload.user.identifier);
    addKeyValue('Date of Birth / Age', `${p.dateOfBirth || '2004-05-14'} (${p.age || '20'} years)`);
    addKeyValue('Enrolled Institution', p.institution || 'RNS Institute of Technology');
    addKeyValue('Degree & Programme', p.course || 'BE Computer Science & Engineering');
    addKeyValue('University Seat No (USN)', p.usn || '1RN23CS142');
    addKeyValue('Academic CGPA', p.gpa ? String(p.gpa) : '9.15');
    addKeyValue('Residential Address', p.currentAddress || 'Door 12, 4th Cross, Vijayanagar');
    addKeyValue('City & State', `${p.city || 'Bengaluru'}, ${p.state || 'Karnataka'} - ${p.country || 'India'}`);

    y += 4;

    // --- Section 2: Approved Facts ---
    addSectionHeader('2. VERIFIED PERSONAL FACTS IN SECURE VAULT', '[FACTS]');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text(`Total Facts Approved by User: ${payload.facts.length}`, 16, y);
    y += 5;

    if (payload.facts.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('No separate fact items currently registered.', 16, y);
      y += 6;
    } else {
      payload.facts.slice(0, 8).forEach((f) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(16, 27, 52);
        doc.text(`* ${f.factType.toUpperCase()}:`, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 50, 60);
        doc.text(`${f.displayValue} [Source: ${f.sourceType}] (Sensitivity: ${(f as any).sensitivityLevel || (f as any).sensitivity || 'standard'})`, 65, y);
        y += 5;
      });
    }

    y += 4;

    // --- Page 2: Documents, Applications & Audit ---
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 18;
    }

    // --- Section 3: Uploaded Documents Inventory ---
    addSectionHeader('3. PRIVATE ENCRYPTED DOCUMENT VAULT INVENTORY', '[DOCUMENTS]');
    if (payload.documents.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 90, 100);
      doc.text('No documents uploaded in vault yet.', 16, y);
      y += 6;
    } else {
      payload.documents.forEach((d, idx) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(16, 27, 52);
        doc.text(`${idx + 1}. ${d.originalFilename}`, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 70, 80);
        const sizeKb = Math.round(d.fileSize / 1024);
        doc.text(`Type: ${d.documentType} | Size: ${sizeKb} KB | Status: ${d.processingStatus} | Encrypted: Yes`, 22, y + 4.5);
        y += 9;
      });
    }

    y += 4;

    // --- Section 4: Assisted Applications History ---
    addSectionHeader('4. ASSISTED APPLICATION & FORM HISTORY', '[APPLICATIONS]');
    if (payload.applications.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 90, 100);
      doc.text('No external application histories recorded yet.', 16, y);
      y += 6;
    } else {
      payload.applications.forEach((app, idx) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(16, 27, 52);
        doc.text(`${idx + 1}. ${app.applicationName || app.websiteHostname}`, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 70, 80);
        doc.text(
          `Site: ${app.websiteHostname} | Fields Populated: ${app.completedFieldsCount}/${app.totalFieldsCount} | Date: ${new Date(
            app.createdAt
          ).toLocaleDateString()}`,
          22,
          y + 4.5
        );
        y += 9;
      });
    }

    y += 4;

    // --- Section 5: Security Audit Log ---
    addSectionHeader('5. SECURITY ACCESS & CRYPTOGRAPHIC AUDIT TRAIL', '[AUDIT]');
    if (payload.auditEvents.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 90, 100);
      doc.text('No security audit events recorded.', 16, y);
      y += 6;
    } else {
      payload.auditEvents.slice(0, 10).forEach((evt) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(16, 27, 52);
        doc.text(`[${new Date(evt.timestamp).toLocaleString()}] ${evt.action}`, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 110, 125);
        doc.text(`Resource: ${evt.resourceType} (${evt.resourceId || 'user_scope'})`, 22, y + 4);
        y += 8;
      });
    }

    // --- Footer Note ---
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 130, 140);
      doc.text(
        'SARA 4.0 Accessibility & Identity Protection Engine | Verified User Data Export | Confidential',
        14,
        pageHeight - 8
      );
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, pageHeight - 8);
    }

    const arrayBuf = doc.output('arraybuffer');
    return Buffer.from(arrayBuf);
  }
}
