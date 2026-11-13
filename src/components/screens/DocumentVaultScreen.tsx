import React, { useState, useEffect } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';

interface DocumentVaultScreenProps {
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const DocumentVaultScreen: React.FC<DocumentVaultScreenProps> = ({ onOpenAuth, currentUser }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<string>('college_marks_card');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!SaraApiClient.getToken()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await SaraApiClient.getDocuments();
      setDocuments(res.documents || []);
    } catch (err: any) {
      console.warn('Load documents error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!SaraApiClient.getToken() && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xl space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">folder_special</span>
        </div>
        <h2 className="text-lg font-bold text-primary-container">My Documents Vault</h2>
        <p className="text-xs text-on-surface-variant">
          Sign in to access your private encrypted document vault with database-level isolation.
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    setStatusMsg(`Uploading ${file.name} to your encrypted vault...`);

    try {
      const uploadRes = await SaraApiClient.uploadDocument(file, selectedDocType);
      const doc = uploadRes.document;

      setStatusMsg(`Extracting text and identifying credentials...`);
      await SaraApiClient.extractDocument(doc.id);

      setStatusMsg(`Successfully secured and extracted facts from ${file.name}.`);
      await loadDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName} from your private vault?`)) {
      return;
    }

    try {
      await SaraApiClient.deleteDocument(docId);
      setStatusMsg(`Deleted ${fileName} successfully.`);
      await loadDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not delete document.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">folder_special</span>
          <span>My Documents — Your Information, Safely Stored</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-container font-headline-sm">
          Personal Document Vault
        </h1>
        <p className="text-xs text-on-surface-variant max-w-2xl">
          Upload and maintain your official educational certificates, identity cards, and mark sheets. SARA stores them with private database-level isolation and extracts structured facts with your explicit approval.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Upload Panel */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">upload_file</span>
          <span>Add New Document to Vault</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-primary-container mb-1">
              Document Category
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-xs font-medium focus:border-secondary outline-none"
            >
              <option value="college_marks_card">College Marks Card / Transcript</option>
              <option value="10th_marks_card">10th Standard Marks Card</option>
              <option value="12th_marks_card">12th / PUC Marks Card</option>
              <option value="college_id">College Identity Card</option>
              <option value="bonafide_cert">Bonafide / Study Certificate</option>
              <option value="aadhaar_card">Aadhaar Card (Masked)</option>
              <option value="pan_card">PAN Card (Protected)</option>
              <option value="bank_passbook">Bank Passbook (Masked)</option>
              <option value="income_cert">Income / Caste Certificate</option>
              <option value="general">Other Certificate</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <label className="w-full cursor-pointer py-2 px-4 rounded-xl border-2 border-dashed border-secondary/60 hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-secondary">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Select File (PDF, JPG, PNG - Max 10 MB)</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">inventory_2</span>
            <span>Secured Documents ({documents.length})</span>
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant space-y-2 bg-surface rounded-2xl border border-dashed border-outline-variant/60">
            <span className="material-symbols-outlined text-4xl text-secondary">folder_off</span>
            <p className="font-semibold text-primary-container">Your vault is empty</p>
            <p>Upload a marks card or student ID above to securely extract and store your academic details.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-surface border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {doc.mimeType === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                    </span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-primary-container truncate text-sm">
                      {doc.originalFilename}
                    </div>
                    <div className="text-on-surface-variant text-[11px] flex items-center gap-2">
                      <span className="capitalize">{doc.documentType.replace(/_/g, ' ')}</span>
                      <span>&bull;</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>&bull;</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={SaraApiClient.getDocumentDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View</span>
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id, doc.originalFilename)}
                    className="px-3 py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-error font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

