# Module & Component Architecture Diagram (C4 Level 3)
## Lion International Bank Human Resource & Integrated Payroll Management System (`anbesa_hr`)

---

### 1. Purpose & Architectural Context

If the **High-Level System Architecture (HLSA)** provided the 30,000-foot view of the hosting infrastructure and bank network perimeters, this **Module / Component Diagram (C4 Level 3)** zooms directly into **Layer 3 (The Core Application Container)**.

It decomposes the system into its **5 functional business subsystems**, documenting:
1. **Internal Components & DocTypes:** The specific records, business objects, and data structures inside each module.
2. **Business Controllers & Calculation Logic:** The internal validation hooks, formula engines, and workflow state machines.
3. **Inter-Module Data Dependencies:** How data moves across module boundaries (e.g., how Leave balances flow into Payroll deductions, and how Appraisal scores trigger Salary Step Increments).
4. **Cross-Cutting Utilities:** Shared services like the Ethiopian Calendar (EC $\leftrightarrow$ GC) engine and the secure document repository.

---

### 2. Module & Component Architecture Diagram

```mermaid
flowchart TB
    %% =========================================================================
    %% CROSS-CUTTING SHARED UTILITIES
    %% =========================================================================
    subgraph SHARED["Cross-Cutting Banking Utilities & Shared Services"]
        direction LR
        EC_ENGINE["<b>Ethiopian Calendar Engine</b><br/>• Geez-Gregorian Converter<br/>• Ethiopian Fiscal Year (Hamle-Sene)<br/>• Holiday & Working Day Registry"]
        DOC_VAULT["<b>Bank Document & Media Vault</b><br/>• Encrypted ID / Photo Dossier<br/>• Scanned Guarantor Undertakings<br/>• Disciplinary & Clearance Letters"]
        NOTIF_SVC["<b>Notification & Task Dispatcher</b><br/>• Email / Desk Inbox Alerts<br/>• Maker-Checker Task Routing<br/>• Workflow Status Notifications"]
    end

    %% =========================================================================
    %% SUBSYSTEM 1: CORE HR & EMPLOYEE MANAGEMENT
    %% =========================================================================
    subgraph MOD_CORE["1. Core HR & Employee Lifecycle Subsystem (anbesa_hr)"]
        direction TB
        EMP_MASTER["<b>Employee Master Dossier</b><br/>• Amharic & English Names<br/>• 4-Tier Ethiopian Address<br/>• Bank Branch & Position Link<br/>• Employment Status (Permanent/Probation)"]
        
        ORG_TREE["<b>Org & Unit Structure</b><br/>• Head Office Directorates/Divisions<br/>• City & Outlying Branch Hierarchy<br/>• Position & Designation Registry"]
        
        GUARANTOR["<b>Fidelity Guarantee & Collateral</b><br/>• Employee Guarantor Registry<br/>• Guaranteed Persons Cross-Link<br/>• Liability Undertaking Tracking"]
        
        CAREER_OPS["<b>Career Movement & Clearance</b><br/>• Branch Transfer (Lateral)<br/>• Promotions & Acting Positions<br/>• Disciplinary Tracking<br/>• Bank Exit Clearance Checklist"]

        ORG_TREE --> EMP_MASTER
        GUARANTOR --> EMP_MASTER
        CAREER_OPS --> EMP_MASTER
    end

    %% =========================================================================
    %% SUBSYSTEM 2: LEAVE MANAGEMENT
    %% =========================================================================
    subgraph MOD_LEAVE["2. Leave Management Subsystem"]
        direction TB
        LEAVE_ALLOC["<b>Leave Allocation Engine</b><br/>• Annual Leave Seniority Accrual<br/>• Statutory Banking Entitlements<br/>• Dual-Calendar Balance Tracking"]
        
        LEAVE_APP["<b>Leave Application & Workflow</b><br/>• Multi-Level Manager Approval<br/>• Reliever / Handover Endorsement<br/>• Leave Balance Ledger Entry"]
        
        LEAVE_ENCASH["<b>Birr Encashment Calculator</b><br/>• Unused Leave Encashment<br/>• Daily Wage Valuation Formula<br/>• Clearance Payout Preparation"]

        LEAVE_ALLOC --> LEAVE_APP
        LEAVE_APP --> LEAVE_ENCASH
    end

    %% =========================================================================
    %% SUBSYSTEM 3: PAYROLL & COMPENSATION
    %% =========================================================================
    subgraph MOD_PAY["3. Payroll & Compensation Subsystem"]
        direction TB
        SAL_STRUCT["<b>Salary Structure & Scale</b><br/>• Bank Pay Grades & Increments<br/>• Base Pay & Acting Allowances<br/>• Housing / Hardship / Cash Indemnity"]
        
        PAY_ENGINE["<b>Payroll Calculation Engine</b><br/>• Gross Pay Computation<br/>• Ethiopian Tax Brackets (ERCA)<br/>• Pension (7% Staff / 11% Bank)<br/>• Staff Loan & Disciplinary Cuts"]
        
        PAY_RECON["<b>Reconciliation & Handover</b><br/>• Monthly Payroll Entry Review<br/>• Maker-Checker Approval Sign-Off<br/>• <b>CBS Salary Batch Export (CSV/XLS)</b>"]

        SAL_STRUCT --> PAY_ENGINE
        PAY_ENGINE --> PAY_RECON
    end

    %% =========================================================================
    %% SUBSYSTEM 4: PERFORMANCE MANAGEMENT
    %% =========================================================================
    subgraph MOD_PERF["4. Performance Appraisal Subsystem"]
        direction TB
        PERF_GOALS["<b>Objective & KRA Framework</b><br/>• Bank Strategy Cascading<br/>• Key Result Areas (KRAs)<br/>• Role Performance Weights"]
        
        PERF_CYCLE["<b>Appraisal Cycle & Review</b><br/>• Self-Appraisal (ESS)<br/>• Supervisor Evaluation (MSS)<br/>• Peer / Committee Calibration"]
        
        PERF_RESULT["<b>Performance Scorecard</b><br/>• Final Rating Calculation<br/>• Promotion Eligibility Flag<br/>• Annual Increment Recommendation"]

        PERF_GOALS --> PERF_CYCLE
        PERF_CYCLE --> PERF_RESULT
    end

    %% =========================================================================
    %% SUBSYSTEM 5: TRAINING & DEVELOPMENT
    %% =========================================================================
    subgraph MOD_TRAIN["5. Training & Professional Development Subsystem"]
        direction TB
        TRAIN_CAT["<b>Training Program Catalog</b><br/>• Internal Banking Courses<br/>• External / International Programs<br/>• Skill & Competency Targets"]
        
        TRAIN_HIST["<b>Training & Certifications Record</b><br/>• Employee Certification Log<br/>• Language Proficiency Records<br/>• Service Bonding Undertaking"]

        TRAIN_CAT --> TRAIN_HIST
    end

    %% =========================================================================
    %% INTER-MODULE DATA FLOWS & DEPENDENCIES
    %% =========================================================================
    EMP_MASTER ==>|Base Staff & Branch Data| LEAVE_ALLOC
    EMP_MASTER ==>|Active Grade & Bank Account| SAL_STRUCT
    EMP_MASTER ==>|Designation & Reporting Line| PERF_GOALS
    EMP_MASTER ==>|Employee Profile Link| TRAIN_HIST

    LEAVE_APP -.->|Unpaid Leave / LWP Days| PAY_ENGINE
    LEAVE_ENCASH -.->|Leave Encashment Earnings| PAY_ENGINE

    PERF_RESULT -.->|Increment & Promotion Triggers| CAREER_OPS
    PERF_RESULT -.->|Recommended Pay Scale Step| SAL_STRUCT

    TRAIN_HIST -.->|Skill Upgrades / Certifications| EMP_MASTER

    %% Cross-cutting connections
    EC_ENGINE -.->|Date Conversion & Holidays| LEAVE_ALLOC
    EC_ENGINE -.->|Cutoff & Period Dates| PAY_ENGINE
    DOC_VAULT -.->|Attachments & Scans| GUARANTOR
    DOC_VAULT -.->|Certificates & Degrees| TRAIN_HIST
    NOTIF_SVC -.->|Approval Alerts| LEAVE_APP
    NOTIF_SVC -.->|Review Deadline Reminders| PERF_CYCLE

    %% Styling
    style SHARED fill:#F2F4F4,stroke:#7F8C8D,stroke-width:2px,color:#2C3E50
    style MOD_CORE fill:#EBF5FB,stroke:#2980B9,stroke-width:2px,color:#1B4F72
    style MOD_LEAVE fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style MOD_PAY fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style MOD_PERF fill:#F4ECF7,stroke:#8E44AD,stroke-width:2px,color:#512E5F
    style MOD_TRAIN fill:#FDF2E9,stroke:#D35400,stroke-width:2px,color:#78281F
```

---

### 3. Detailed Component Breakdown & Banking Functions

#### Subsystem 1: Core HR & Employee Lifecycle (`anbesa_hr`)
* **Employee Master Dossier:** Centralizes employee bio-data, dual-language naming (English and Amharic script), 4-tier Ethiopian administrative hierarchy (*Region $\rightarrow$ Zone $\rightarrow$ Woreda $\rightarrow$ Kebele*), and employment terms.
* **Org & Unit Structure:** Implements Lion International Bank's hierarchical tree structure (Head Office Directorates, Support Divisions, City Branches, and Outlying Outpost Branches).
* **Fidelity Guarantee & Collateral (`employee_guarantor`):** Unique banking requirement tracking personal guarantors, liability undertaking letters, and collateral pledged against employee integrity.
* **Career Movement & Separation:** Manages horizontal transfers across branches, vertical promotions with grade changes, temporary acting allowances, disciplinary reprimands, and mandatory bank exit clearance.

#### Subsystem 2: Leave Management
* **Leave Allocation Engine:** Implements statutory Ethiopian labor law and Lion International Bank policy (base annual leave + additional days based on years of banking service).
* **Leave Application & Workflow:** Multi-tier approval routing (Employee $\rightarrow$ Branch Manager $\rightarrow$ HR Operations) with automatic balance validation and conflict checking against the holiday registry.
* **Birr Encashment Calculator:** Computes exact Ethiopian Birr payouts for untaken leave days upon annual cutoffs or employee separation:
  $$\text{Leave Encashment (ETB)} = \frac{\text{Monthly Base Salary}}{30} \times \text{Unused Leave Days}$$

#### Subsystem 3: Payroll & Compensation
* **Salary Structure & Scale:** Configures bank pay bands, grade scales, and standard banking allowances (Cash Indemnity Allowance for tellers, Acting Allowance, Representation Allowance, Fuel/Transport Allowance).
* **Payroll Calculation Engine:** Automates complex monthly deductions:
  * Ethiopian Personal Income Tax (Progressive brackets up to 35%).
  * Mandatory Pension (7% Employee contribution, 11% Lion International Bank contribution).
  * Staff Provident Fund, Staff Loan repayments, and disciplinary cash recovery.
* **Reconciliation & Handover:** Implements Maker-Checker authorization and exports the final **CBS Salary Batch File** (Excel/CSV) for manual crediting via Core Banking.

#### Subsystem 4: Performance Management
* **Objective & KRA Framework:** Cascades institutional bank targets down to branch performance objectives and individual Key Result Areas (KRAs).
* **Appraisal Cycle & Review:** Orchestrates bi-annual/annual evaluation cycles with ESS self-scoring, supervisor evaluations, and managerial calibration.
* **Performance Scorecard:** Produces final calibrated ratings that directly feed promotion candidate lists and annual step increments in the salary structure.

#### Subsystem 5: Training & Professional Development
* **Training Program Catalog:** Manages bank-wide curricula (AML/CFT compliance, Core Banking operations, customer service excellence, leadership tracks).
* **Training History & Certifications (`employee_certification`):** Records past career credentials, language proficiencies, and training service bonding contracts (obligatory service periods following bank-sponsored courses).

---

### 4. Cross-Module Data Interactions

| Source Module | Target Module | Data Exchanged | Business Rationale |
| :--- | :--- | :--- | :--- |
| **Core HR** | **Payroll** | Grade, Scale, Base Salary, Bank Account | Governs baseline compensation and bank account for credit. |
| **Core HR** | **Leave** | Date of Joining (Tenure) | Determines statutory annual leave accrual entitlement. |
| **Leave** | **Payroll** | Leave Without Pay (LWP) Days | Deducts daily wage rate from monthly gross salary. |
| **Leave** | **Payroll** | Approved Leave Encashment Days | Adds taxable monetary leave payouts to the salary slip. |
| **Performance**| **Core HR** | Final Appraisal Score $\ge$ Benchmark | Unlocks promotion workflows and transfer recommendations. |
| **Performance**| **Payroll** | Merit Increment Level | Triggers automatic step advancement in the bank salary scale. |
| **Utilities (EC)**| **All Modules**| Ethiopian Fiscal Year / Date Mapping | Synchronizes Hamle 1 – Sene 30 fiscal cutoffs and public holidays. |
