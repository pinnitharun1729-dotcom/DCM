# RGUKT RK Valley — Digital No-Dues & Clearance Portal

An enterprise-grade, paperless **Digital No-Dues & Digital Clearance Portal** purpose-built for Rajiv Gandhi University of Knowledge Technologies (RGUKT), RK Valley campus.

This portal replaces manual physical paper clearance slips with an automated, role-based digital verification workflow featuring multi-department digital signatures, SBI Collect fee settlement, receipt verification pipelines, and cryptographic PDF certificate issuance.

---

## 🏛️ Key Features

1. **Strict Role-Based Access Control**:
   - **Student Portal**: Authenticated exclusively via official Google Workspace accounts matching `^r[0-9]{6}@rguktrkv\.ac\.in$`. Manual registration is strictly forbidden.
   - **Faculty / Department Portals**: 6 distinct statutory clearance desks (Library, Hostel, Labs, Finance, Sports, HOD/Dean). Each desk requires its authorized departmental Google account and an admin-issued security password.
   - **Strict Route Protection**: Students cannot access department or HOD portals; department staff can only access their assigned department's queues.

2. **SBI Collect Integration & Receipt Verification Pipeline**:
   - Dues specify clear liability reasons and amounts (INR ₹).
   - "Pending — Pay Now" opens the official SBI Collect portal in a new tab without exposing query parameters, while displaying helpful on-screen instructions.
   - Students upload payment receipts (JPG, PNG, PDF up to 5MB) along with their SBI Transaction Reference Number.
   - Department administrators review receipts in a dedicated **"Payment Receipts Pending Verification"** tab with full receipt inspection, one-click verification & approval, or rejection with mandatory explanations.

3. **Multi-Department Digital Signatures**:
   - Approvals generate verifiable SHA-256 digital signature hashes containing the officer's name, designation, department, and timestamp.
   - Department admins can manually assess new dues against students with immediate dashboard reflection.

4. **Two-Tier Statutory Clearance**:
   - Once all 5 departments (Library, Hostel, Lab, Finance, Sports) approve, the candidate is auto-forwarded to:
     - **Head of Department (HOD)** for Engineering students.
     - **Dean of Academic Affairs** for PUC students.
   - Statutory approval releases a tamper-proof, printable **Official No-Dues Certificate (PDF)** complete with university seal, watermark, QR/verification code, and all 6 digital signatures.

5. **In-App Notification Stream**:
   - Real-time event notifications for due assessments, receipt submissions, approvals, rejections, and certificate releases.

---

## 🔑 Demo Accounts & Test Credentials

The portal is pre-seeded with realistic student scenarios and departmental accounts for end-to-end testing without needing a mock switcher.

### 1. Student Accounts (Google Sign-In)
*Domain requirement: Must match `rXXXXXX@rguktrkv.ac.in`*

| Student Name | RGUKT Email | Branch & Batch | Starting Scenario |
| :--- | :--- | :--- | :--- |
| **K. Sai Charan** | `r240086@rguktrkv.ac.in` | B.Tech CSE (2020-24) | **Active Dues**: ₹350 Library fine & ₹1,200 Hostel mess dues. *Ideal for testing SBI payment redirect & receipt upload.* |
| **P. Haritha** | `r200142@rguktrkv.ac.in` | B.Tech ECE (2020-24) | **Receipt Submitted**: ₹650 Lab breakage fee receipt uploaded, awaiting Lab Admin verification. |
| **M. Venkat Rao** | `r210555@rguktrkv.ac.in` | B.Tech ME (2021-25) | **5/5 Cleared**: All 5 departments approved. *Awaiting final HOD sign-off and certificate generation.* |
| **T. Ananya** | `r230012@rguktrkv.ac.in` | PUC - M.Bi.PC (2023-25) | **Graduated & Certified**: Full clearance signed by Dean of Academics with downloadable PDF certificate. |
| **V. Dinesh Kumar** | `r220891@rguktrkv.ac.in` | B.Tech Civil (2022-26) | **Clean Record**: All 5 departments cleared with zero dues. |

> **Note on Student Login**: In the Google Sign-In prompt, click **"Use r240086@rguktrkv.ac.in"** or enter any valid `rXXXXXX@rguktrkv.ac.in` address. Entering non-RGUKT domains (e.g. `gmail.com`) triggers an official university rejection error.

---

### 2. Department Admin & HOD/Dean Accounts

Select the department card, then enter the official department Google account and admin-issued password:

| Department Desk | Official Google Email | Admin Password | Authorized Signatory |
| :--- | :--- | :--- | :--- |
| **Central Library** | `library@rguktrkv.ac.in` | `Library@2025` | Dr. K. Ramanjaneyulu (Chief Librarian) |
| **Hostel Management** | `hostel@rguktrkv.ac.in` | `Hostel@2025` | Prof. B. Nagendra (Chief Warden) |
| **Laboratories & Workshop** | `lab@rguktrkv.ac.in` | `LabAdmin@2025` | Dr. M. Srinivasulu (Central Lab In-Charge) |
| **Finance & Accounts** | `finance@rguktrkv.ac.in` | `Finance@2025` | Sri K. Venkata Reddy (Finance Officer) |
| **Sports & Physical Ed.** | `sports@rguktrkv.ac.in` | `Sports@2025` | Dr. P. Anjaneyulu (Physical Director) |
| **Department (HOD - CSE)** | `hod.cse@rguktrkv.ac.in` | `HodCSE@2025` | Prof. S. Chandrasekhar Rao (HOD, CSE) |
| **Dean of Academic Affairs** | `dean.academics@rguktrkv.ac.in` | `DeanAcad@2025` | Prof. A. V. Subbarao (Dean of Academics) |

---

## 🧪 Recommended Test Walkthrough

### Scenario A: Pay Due & Upload Receipt (Student Flow)
1. On the landing page, click **"Student Login"**.
2. Click **"Sign in with Google"**, choose `r240086@rguktrkv.ac.in`, and proceed.
3. You will see the **Central Library** due of ₹350. Click **"Pending — Pay Now"**.
4. SBI Collect opens in a new tab; note the on-screen payment instruction banner.
5. In the payment modal, enter an SBI reference (e.g., `DUH98231405`) and attach/simulate a receipt file.
6. Click **"Submit Receipt for Verification"**. The Library status updates to **"Under Review"**.

### Scenario B: Verify & Approve Receipt (Department Flow)
1. Logout or open faculty login, select **"Library"**.
2. Sign in with `library@rguktrkv.ac.in` and password `Library@2025`.
3. In the **"Payment Receipts Pending Verification"** tab, locate `r240086`'s submitted receipt.
4. Click **"View Receipt"** to inspect the document and transaction reference.
5. Click **"Verify & Approve"**. The due is cleared and the department's digital signature hash is applied.

### Scenario C: Final HOD Sign-Off & PDF Certificate Generation
1. Switch to Faculty Login and choose **"Department (HOD)"**.
2. Sign in with `hod.cse@rguktrkv.ac.in` and password `HodCSE@2025`.
3. Note candidate **M. Venkat Rao (`r210555`)** who has cleared all 5 departments.
4. Review the 5-department digital signature badges with verification hashes.
5. Click **"Approve & Issue Certificate"**.
6. The certificate is cryptographically sealed; click **"View Certificate"** or **"Download PDF"** to examine the official printable document.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with responsive layout
- **Icons**: Lucide React
- **PDF Engine**: jsPDF (with high-resolution university seal, custom table layout, and verification hashes)
- **Visuals**: Canvas Confetti for celebratory milestone approvals
- **State & Storage**: Resilient localStorage persistence modeling relational student rosters, department transactions, and digital signatures.
