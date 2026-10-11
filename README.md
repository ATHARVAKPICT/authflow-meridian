# AuthFlow: AI-Native Pre-Authorisation & Cashless Claims Copilot
### Meridian Health (2,500 Beds across India, UAE, and KSA)
*Clickable, production-ready prototype for consulting-style operational case assessment*

---

> ⚠️ **SYNTHETIC DATA DISCLAIMER**  
> Meridian Health is a fictional multi-specialty hospital network. All patient names, policy numbers, clinical observations, diagnostic reports, and insurer communications are 100% synthetic and generated for demonstration purposes. No real protected health information (PHI) or proprietary insurer data is used.

---

## 1. Executive Summary & Objective

Modern hospital operations suffer from severe friction at two critical points:
1. **Admission Pre-Authorisation:** Takes 3–5 hours of manual document collation, medical necessity drafting, and insurer ping-pong (query rate ~32%).
2. **Discharge Cashless Clearance:** Patients and families routinely wait 3–4 hours post-clinical discharge for final bill approval, causing severe room turnover bottlenecks and patient dissatisfaction.

**AuthFlow** transforms this process into a 18-minute, evidence-grounded, AI-assisted copilot:
- **Zero Hallucination:** Every extracted clinical claim is anchored to exact evidence spans in uploaded hospital notes.
- **Deterministic Rules Engine:** 15 rules codify policy clauses, IRDAI master circular regulations, room rent proportionate deductions, and waiting periods.
- **Clinical Safety Imperative:** Emergency medical treatment is NEVER conditioned upon or delayed by insurance pre-authorisation.
- **IRDAI 60-Minute SLA & Delay Ledger:** Automatically enforces the 60-minute discharge clearance mandate and logs insurer-attributable delay costs.
- **Offline Replay Mode:** Operates completely offline without any third-party API keys or external dependencies.

---

## 2. Core Architecture & Feature Matrix

| Feature | Description | Implementation Details |
|---|---|---|
| **Grounded Extraction** | Extracts clinical findings, ICD-10 codes, lab values (e.g. Troponin I, WBC) | Bound to exact char spans in `DocumentViewer.tsx` |
| **Rules Engine (15 Rules)** | Deterministic evaluation of policy terms, waiting periods, and room caps | `engine/rules.ts` & `engine/money.ts` |
| **Room Rent Proportionate Capping** | Computes proportionate deduction factors (Rule 05) | Exact math matching Case 1 specification (0.625 factor) |
| **Interactive Payer Simulator** | Simulates approvals, queries, partial cappings, and rejections | `components/PayerSimulator.tsx` |
| **IRDAI 60-Min SLA Clock** | Real-time countdown and delay ledger recording | `engine/sla.ts` & `engine/delayLedger.ts` |
| **Doctor One-Tap Attestation** | Dedicated clinical review flow for treating consultants | `components/CaseWorkspace.tsx` & `PacketDrafter.tsx` |
| **Patient Transparency Portal** | Explains out-of-pocket costs and discharge roadmap in plain English | `components/PatientView.tsx` |
| **Executive COO Intelligence** | 2,500-bed network KPI analytics and traditional vs. AI comparison | `components/InsightsPage.tsx` |
| **FHIR Pre-Auth Bundle** | Standards-compliant FHIR bundle for India's NHCX exchange | JSON preview & download in Case Workspace |

---

## 3. Assumptions Made

As requested in specification section 0, all reasonable operational decisions and modeling assumptions are documented here:

1. **Room Rent Proportionate Deductions (Rule 05):**
   - In accordance with standard Indian health insurance practices (GIPSA and non-life retail policies), when a patient opts for a room higher than their room rent cap (e.g., ₹8,000/day vs. ₹5,000 cap), associated charges (doctor visits, nursing fees, operation theatre charges) are proportionately reduced by the factor `Cap / Billed` ($5,000 / 8,000 = 0.625$).
   - Medical implants, fixed pharmacy items, and diagnostic investigations are assumed non-proportionate and exempt from this scaling factor.
2. **Initial 30-Day Waiting Period (Rule 01):**
   - IRDAI rules waive the initial 30-day waiting period **only** for accidental injury hospitalizations. Emergency illnesses (such as acute appendicitis in Case 2) still fall under the 30-day exclusion. Emergency surgery proceeds immediately on clinical grounds while financial counseling is activated.
3. **Multi-Policy Coordination (Rule 12 - Case 4):**
   - Where a patient holds multiple policies (e.g. Senior Citizen + Corporate Group Cover), AuthFlow models three sequential settlement options (Option A only, Option B only, and Primary B then Secondary A). Exact insurer-to-insurer coordination order is assumed customizable per TPA agreement.
4. **IRDAI 60-Minute Discharge Penalty Enforcement:**
   - Under the IRDAI 2024 Health Insurance Master Circular, final authorization must be provided within 60 minutes of discharge request. Any hospital bed/stay charges accrued after 60 minutes are classified as insurer-attributable and tracked in the *Delay Ledger* to prevent charging the patient.
5. **Replay Mode vs. Live Mode:**
   - Replay Mode uses deterministic seeded extractions and mock responses to ensure zero flaky network calls during reviews and demonstrations.

---

## 4. Running the Project Locally

### Prerequisites
- Node.js (v18+ or v20+)
- Conda environment: `D:\conda_envs\torch_env` (or standard npm)

### Setup & Dev Server
```bash
# Activate designated conda environment
conda activate D:\conda_envs\torch_env

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Engine Unit Tests
```bash
# Run the 29-case comprehensive test suite
npx vitest run
```
All 29 tests validate expected numbers from specification section 7 (proportionate factor 0.625, patient liability ₹57,875, standard room savings ₹52,875, multi-policy coordination, waiting period waivers, and risk scoring).

---

## 5. Personas & Roles

Use the top-right **Role Switcher** to experience AuthFlow from different perspectives:
- **🖥️ Desk Executive:** Triage cases, upload supplemental lab notes, review rule alerts, approve pre-auth packets, and manage payer queries.
- **👨‍⚕️ Doctor:** Fast, one-tap clinical review and attestation without administrative clutter.
- **📈 RCM Head / Group COO:** Macro operational visibility, turnaround time reductions, query prevention rates, and multi-hospital unit analytics.
- **👤 Patient:** Transparent plain-language cost breakdown, explanation of room caps, and live cashless discharge roadmap.
