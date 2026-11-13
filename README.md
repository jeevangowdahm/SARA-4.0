# SARA 4.0 — Smart Accessible Response Assistant
### Personal AI Identity, Document Intelligence & Universal Form Assistance Platform
**Tech-Quest 2.0 | RNSIT | Production Engineering Mission**

> **Identity:** SARA — Smart Accessible Response Assistant  
> **Tagline:** *"Your voice. Your language. Your access."*  
> **Supporting Promise:** *"Speak naturally. SARA understands."*  
> **Core Safety Principle:** **SARA assists the applicant. It NEVER submits an external form automatically without explicit human authorization.**

---

## 1. Executive Summary & Vision

Traditional online portals, scholarship services, and government applications present formidable hurdles to citizens with limited reading fluency, motor challenges, language unfamiliarity, or digital anxiety.

**SARA 4.0** transforms form completion into an empathetic, natural conversation backed by an authenticated, private personal data vault:
1. **Real User Registration & Cryptographic OTP:** Users sign in once with phone or email via a genuine 6-digit cryptographic OTP service with rate limiting, 5-minute expiry, and session tokens.
2. **Database-Level Row Level Security (RLS):** Relational schema (11 tables) hosted on PostgreSQL (Supabase `ACTIVE_HEALTHY` / local atomic store) strictly enforces that User A can never access User B's profile, facts, documents, or applications.
3. **Private Document Vault ("My Documents — Your Information, Safely Stored"):** Secure private document storage supporting 12 document categories (marks cards, college IDs, bonafide certificates, etc.) with 10MB limits, MIME-signature validation, and per-user vault isolation.
4. **Real AI Document Intelligence:** Uses genuine `pdf-parse` text extraction from uploaded PDF buffers to extract Candidate Name, USN, College, Course, CGPA, and masked Aadhaar/PAN. No hardcoded mock extraction.
5. **Sensitive Identity Data Minimization:** Aadhaar numbers are masked strictly to `XXXX-XXXX-1234`, PAN to `XXXXX1234X`, and Bank account details are masked by default.
6. **Voice-First Experience with 7-State FSM:** Finite State Machine (`IDLE -> REQUESTING_PERMISSION -> LISTENING -> TRANSCRIBING -> REVIEWING -> UNDERSTANDING -> READY`) with audio playback controls (`speak`, `pause`, `resume`, `repeat`, `slowDown`, `stop`).
7. **22 Eighth Schedule Indian Languages:** Transparent tracking matrix for India's 22 official languages with cross-lingual *"Speak in one language, fill another"* support (e.g. Kannada/Hindi speech -> English form fields).
8. **Chrome Extension (Manifest V3) Account Sync:** Connects to the active webpage, authenticates with the user's SARA account, retrieves approved facts from the vault, maps them to webpage fields, autofills using framework-compatible native setters, verifies retention in the DOM, and records completed applications.
9. **Strict Human-in-the-Loop Guarantee:** Passwords, OTPs, CVVs, and CAPTCHAs are categorically shielded. SARA refuses to auto-submit external forms.

---

## 2. System Architecture

```
sara-4.0/
├── server/                        # SARA 4.0 Intelligence Backend (Node/Express/TypeScript)
│   ├── index.ts                   # REST API Entrypoint (Port 3001) with CORS & Auth Middleware
│   ├── auth.ts                    # Real 6-Digit OTP Generator, Rate Limiter & Session Manager
│   ├── db.ts                      # Multi-User Relational Engine with strict RLS enforcement
│   ├── documents.ts               # Private Document Vault & pdf-parse Structured Extraction
│   ├── aiRouter.ts                # AI Task Router, Explainer & Semantic Field Mapper
│   ├── types.ts                   # Relational Schema & TypeScript Contracts
│   ├── data/sara.db.json          # Atomic Local Relational Database Storage
│   └── uploads/documents/<userId> # Isolated Private Document Storage Vaults
│
├── extension/                     # Chrome Manifest V3 Extension
│   ├── manifest.json              # SidePanel, activeTab, storage, scripting
│   ├── background.js              # Service Worker managing side panel & messaging
│   ├── contentScript.js           # Non-invasive DOM detection & React-compatible autofill
│   ├── sidepanel.html             # SARA Side Panel with Account Sync Strip
│   ├── sidepanel.css              # SARA Design System styling (#101B34, #17B99A)
│   ├── sidepanel.js               # Side Panel controller, Vault Sync, SARA SENSE
│   └── popup.html                 # Toolbar quick-launcher
│
├── public/
│   ├── test-site/                 # Realistic External Portal for Demonstrations
│   │   └── index.html             # Karnataka Post-Matric Merit Scholarship Portal (15 fields)
│   └── frames/                    # 40-Frame 3D Voice Orb Cinematic Sequence & Manifest
│
├── src/                           # SARA 4.0 Web Application (React, Vite, Tailwind)
│   ├── lib/sara/
│   │   ├── api/client.ts          # Authenticated SARA API Client with Bearer Token Storage
│   │   ├── ai/taskRouter.ts       # Client-side AI Task Router & Evidence Guardian
│   │   ├── speechProvider.ts      # 7-State Finite State Machine & Speech Synthesis
│   │   ├── multilingual/          # 22 Indian Languages Capability Matrix
│   │   ├── easyMode/              # Easy Mode & Teach Mode Coach
│   │   └── conversationEngine.ts  # 5-Step Conversational Form Engine
│   ├── components/
│   │   ├── cinematic/             # Canvas-based 40-frame scroll hero
│   │   ├── screens/               # 13 Application Screens:
│   │   │   ├── DashboardScreen.tsx            # Main User Dashboard & Metrics
│   │   │   ├── DocumentVaultScreen.tsx        # "My Documents - Safely Stored"
│   │   │   ├── ProfileScreen.tsx              # Editable Profile & Verified Badges
│   │   │   ├── ApplicationHistoryScreen.tsx   # Real Application Records
│   │   │   ├── PrivacySecurityScreen.tsx      # Consents, Audit Logs, Data Export, Erasure
│   │   │   └── 01_welcome to 08_accessibility # Guided Conversational Fill Experience
│   │   └── modals/
│   │       ├── AuthModal.tsx                  # Real OTP Authentication Modal
│   │       ├── SmartDocumentModal.tsx         # Document Upload & Fact Extraction Modal
│   │       └── ExtensionCompanionModal.tsx    # Extension Quick-Launch Guide
│   ├── App.tsx                    # Root SARA 4.0 Platform
│   └── index.css                  # Global WCAG 2.2 AA Theme & Tokens
│
├── tests/                         # Vitest Test Suite (30 passing tests)
│   ├── groq-live.test.ts                 # Live Groq LLM (openai/gpt-oss-120b) multilingual explanations
│   ├── cross-user-isolation.test.ts      # Multi-user RLS & cross-account isolation
│   ├── document-vault-extraction.test.ts # Real PDF upload & pdf-parse text extraction
│   ├── extension-autofill.test.ts        # Sensitive field shield & DOM retention verification
│   ├── sara-ai-router.test.ts            # Multi-model routing & multilingual translation
│   └── sara-engine.test.ts               # Conversational form engine
│
├── extension.zip                  # Packaged Chrome Extension ZIP for installation
├── IMPLEMENTATION_AUDIT.md        # Comprehensive Audit Report
├── IMPLEMENTATION_LOG.md          # Multi-Phase Engineering Log
└── .env                           # Environment configuration
```

---

## 3. Database Schema & Security Policies

SARA 4.0 implements 11 relational tables hosted on **PostgreSQL 17.6 (Supabase project `cvqmxzzrqotinggyjfga` in schema `sara`)** and backed by our atomic local engine:

1. `profiles`: Full name, phone, email, date of birth, age, addresses, college, course, USN, CGPA.
2. `user_preferences`: Language, speech rate, Easy Mode, Teach Mode, text scale, contrast.
3. `personal_facts`: Provenance-tracked identity facts (`full_name`, `dob`, `usn`, `cgpa`, `phone`, `institution`, etc.) with sensitivity levels (`normal`, `personal`, `sensitive`, `highly_sensitive`).
4. `user_documents`: Metadata, encrypted object keys, MIME types, file sizes, processing status.
5. `document_extractions`: Extracted facts, confidence summaries, raw text previews, parser metadata.
6. `applications`: External website hostname, application name, category, status, completion count.
7. `application_field_records`: Field-level records of approved values populated on external forms.
8. `user_consents`: Explicit consent records for OCR, field mapping, and profile memory.
9. `audit_events`: Security audit trail of logins, uploads, extractions, and exports.
10. `otps`: Real OTP codes, attempt counters, 60-second cooldowns, 5-minute expiry timestamps.
11. `sessions`: Cryptographic session tokens (`sara_sess_<hex>`) with user identity derivation.

### Row Level Security (RLS) Policy
Every query enforces:
```sql
ALTER TABLE sara.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sara.personal_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sara.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sara.applications ENABLE ROW LEVEL SECURITY;
```
Every backend request validates the bearer session token, derives `userId`, and enforces that no user can read, write, or delete another user's rows. Cross-user attempts result in **403 Forbidden**.

---

## 4. Verification & Automated Test Results

Running `npm test` executes all **30 automated tests with 100% pass rate** across 6 test suites:

```
✓ tests/extension-autofill.test.ts (4 tests)
✓ tests/sara-engine.test.ts (5 tests)
✓ tests/sara-ai-router.test.ts (8 tests)
✓ tests/document-vault-extraction.test.ts (4 tests)
✓ tests/cross-user-isolation.test.ts (6 tests)
✓ tests/groq-live.test.ts (3 tests)

Test Files  6 passed (6)
     Tests  30 passed (30)
```

### Highlights of Executed Tests
1. **Live Groq LLM Intelligence (`groq-live.test.ts`):**
   - Connected live to Groq API endpoint with model `openai/gpt-oss-120b`.
   - Verified dynamic question explanations and relatable examples generated in native conversational **Kannada** and **Hindi** with strict JSON schemas.
   - Verified gentle validation error explanations and actionable step guidance.
   - Connected Groq Whisper (`whisper-large-v3`) for high-fidelity multilingual audio transcription.
2. **Cross-User Data Isolation (`cross-user-isolation.test.ts`):**
   - Two independent accounts (`User Alpha` and `User Beta`) registered and authenticated via OTP.
   - User B is verified unable to observe User A's profile updates.
   - User B is verified unable to read User A's personal facts.
   - User B is rejected with **403 Forbidden** when attempting to download or delete User A's private vault documents.
   - User B is verified unable to see User A's application history.
   - Unauthenticated requests receive **401 Unauthorized**.
2. **Real Document Intelligence (`document-vault-extraction.test.ts`):**
   - Generates and uploads a real PDF buffer with embedded text layer.
   - `pdf-parse` extracts candidate name (*"Rajesh Kumar"*), USN (*"1RN23CS142"*), and CGPA (*"9.15"*).
   - Verifies strict masking of Aadhaar numbers (*"XXXX-XXXX-8901"*).
   - Verifies user approval into personal facts memory.
   - Verifies secure document deletion.
3. **External Website Autofill & Safety (`extension-autofill.test.ts`):**
   - Verifies sensitive field isolation (passwords/OTPs/CVVs).
   - Verifies fuzzy select option matching.
   - Verifies human-in-the-loop guarantee: autofill verifies DOM retention without triggering form submission.

---

## 5. Judge Demonstration Guide

### Demonstration 1: Real OTP Authentication & Account Creation
1. Open `http://localhost:4173/` in Google Chrome.
2. In the header, click **Sign In**.
3. Enter mobile number: `9876543210` (or your email).
4. SARA dispatches a genuine 6-digit OTP code (logged in console and shown in the test helper).
5. Enter the 6-digit OTP code and click **Verify & Sign In**.
6. SARA issues a secure session token and transitions to your personalized **SARA Dashboard**.

### Demonstration 2: Personal Document Vault & Real PDF Extraction
1. In the header, click **Vault** (or navigate to `http://localhost:4173/` -> My Documents).
2. Click **Test Real VTU Marks Card PDF** (or upload your own PDF/JPG/PNG marks card).
3. The backend stores the file in `server/uploads/documents/<userId>/` with private encryption.
4. `pdf-parse` extracts:
   - **Candidate Name:** `Jeevan Gowda`
   - **USN:** `1RN23CS089`
   - **Institution:** `RNS Institute of Technology`
   - **Course:** `BE Computer Science & Engineering`
   - **CGPA:** `8.85`
5. Click **Approve** on any fact to permanently store it into your verified identity memory.

### Demonstration 3: Chrome Extension Active Website Autofill
1. Install the extension in Google Chrome from `c:\3rd_sem_hackathon\extension` (via `chrome://extensions/` -> **Load unpacked**).
2. Open the realistic test portal: `http://localhost:4173/test-site/index.html`.
3. Open the SARA Side Panel.
4. Click **Sync Vault** -> enter your phone or email to sync with your SARA account.
5. Click **Inspect Form**: SARA detects all 15 inputs and shields `#portalPassword` and `#otpSecret`.
6. SARA maps the verified facts from your vault into the form fields.
7. Click **Approve & Autofill**:
   - The external webpage fields populate instantly with verified green indicators.
   - Passwords and OTPs remain completely empty.
   - The Submit button is untouched. SARA prompts you to review and submit manually.
8. Refresh your SARA Dashboard: The application is now recorded under **Recent Form Assistance Records**!

### Demonstration 4: Privacy, Data Export & Account Erasure
1. Navigate to **Privacy** in the SARA header.
2. View the real-time **Security & Access Audit Trail** documenting logins, uploads, and extractions.
3. Click **Export Personal Data** to download your complete profile and verified facts as open JSON.
4. Test **Permanent Account Deletion**: Clicking delete cascades through the database, deleting all profiles, documents, extractions, facts, and sessions.

---

## 6. How to Run Locally

### Start Backend Server (Port 3001)
```bash
npm run server
```

### Run Automated Test Suite
```bash
npm test
```

### Build Production Bundle
```bash
npm run build
```

### Start Web Application (Port 4173)
```bash
npm run preview
```
Visit `http://localhost:4173/` in your browser.
