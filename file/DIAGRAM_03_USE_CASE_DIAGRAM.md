# Use-Case Diagram & Functional Scope Specification
## Lion International Bank Human Resource & Integrated Payroll Management System (`anbesa_hr`)

---

### 1. Functional Scope Overview & Actor Generalization

The **Use-Case Model** formalizes the behavioral boundaries of the **Lion International Bank HRMS (`anbesa_hr`)**.

#### Universal Actor Inheritance Model
In a commercial bank, every user—whether a Branch Manager, an HR Specialist, a Finance Officer, or a System Administrator—is first and foremost a bank employee. 

In UML, this is modeled via **Actor Generalization (Inheritance)**:
* **`Employee (Base Actor / ESS)`**: The foundational actor representing all bank personnel.
* **Specialized Administrative Actors (`Branch Manager`, `HR Officer`, `Finance Officer`, `System Admin`)**: Specialized actors that **inherit all baseline ESS capabilities** (viewing their own profile, applying for their own leave, viewing their own payslips, completing their own self-appraisal) while adding dedicated operational duties.

```mermaid
flowchart TB
    %% =========================================================================
    %% ACTOR GENERALIZATION / INHERITANCE HIERARCHY
    %% =========================================================================
    subgraph HIERARCHY["Bank Actor Inheritance Model"]
        direction TB
        
        %% Base Actor
        ACT_BASE["👤 <b>Employee (Base Actor / ESS)</b><br/><i>All bank staff, including managers, HR, and admins</i>"]

        %% Specialized Roles
        ACT_MGR["👔 <b>Branch / Line Manager</b>"]
        ACT_HR["📋 <b>HR Operations Officer</b>"]
        ACT_FIN["💰 <b>Payroll & Finance Officer</b>"]
        ACT_ADM["⚙️ <b>System Administrator</b>"]

        %% UML Inheritance (Generalization)
        ACT_MGR -->|«inherits ESS»| ACT_BASE
        ACT_HR -->|«inherits ESS»| ACT_BASE
        ACT_FIN -->|«inherits ESS»| ACT_BASE
        ACT_ADM -->|«inherits ESS»| ACT_BASE
    end

    %% Base Capabilities inherited by everyone
    subgraph ESS_CAPS["Universal Self-Service Capabilities (Inherited by ALL Bank Staff)"]
        direction LR
        UC_PROFILE(["View / Request Update to Own Bio-Data"])
        UC_LEAVE_OWN(["Apply for Own Annual / Sick Leave"])
        UC_PAY_OWN(["View & Download Own Monthly Payslip"])
        UC_PERF_OWN(["Submit Own Periodic Self-Appraisal"])
        UC_TRAIN_OWN(["Browse Training Catalog & Course History"])
    end

    ACT_BASE --> UC_PROFILE
    ACT_BASE --> UC_LEAVE_OWN
    ACT_BASE --> UC_PAY_OWN
    ACT_BASE --> UC_PERF_OWN
    ACT_BASE --> UC_TRAIN_OWN

    style ACT_BASE fill:#D4EFDF,stroke:#27AE60,stroke-width:3px,color:#145A32
    style ACT_MGR fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style ACT_HR fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style ACT_FIN fill:#F4ECF7,stroke:#8E44AD,stroke-width:2px,color:#512E5F
    style ACT_ADM fill:#F2F4F4,stroke:#7F8C8D,stroke-width:2px,color:#2C3E50
    style ESS_CAPS fill:#FFFFFF,stroke:#27AE60,stroke-width:2px,stroke-dasharray: 4 4,color:#145A32
```

---

### 2. Modular Use-Case Model (Zero-Overlap Decomposition)

To ensure zero line crossing and strict readability, the use-case model is decomposed into **3 targeted operational packages**:

#### Package 1: Self-Service & Branch Supervisory Workflows (ESS & MSS)
```mermaid
flowchart LR
    %% Actors
    ACT_EMP["👤 <b>Employee (ESS)</b><br/><i>Branch / HO Staff</i>"]
    ACT_MGR["👔 <b>Branch / Line Manager (MSS)</b><br/><i>Supervisor / Branch Head</i>"]

    %% Self Service & Management Use Cases
    subgraph ESS_MSS["1. Self-Service & Branch Operations"]
        direction TB
        UC_EMP_VIEW(["View Own Dossier & Bio-Data"])
        UC_EMP_UPDATE(["Submit Profile Update Request"])
        UC_PAY_SLIP(["View & Download Monthly Payslip"])
        UC_TRAIN_VIEW(["Browse Training Catalog"])
        
        subgraph LEAVE_FLOW["Leave Workflow"]
            direction LR
            UC_LEAVE_APPLY(["Submit Leave Application"])
            UC_LEAVE_APPROVE(["Approve / Reject Leave Request"])
            UC_LEAVE_APPLY -.->|«triggers»| UC_LEAVE_APPROVE
        end

        subgraph PERF_FLOW["Appraisal Workflow"]
            direction LR
            UC_PERF_SELF(["Submit Self-Appraisal"])
            UC_PERF_EVAL(["Conduct Manager Appraisal & Rating"])
            UC_PERF_SELF -.->|«triggers»| UC_PERF_EVAL
        end
    end

    %% Clean, Direct Associations
    ACT_EMP --> UC_EMP_VIEW
    ACT_EMP --> UC_EMP_UPDATE
    ACT_EMP --> UC_PAY_SLIP
    ACT_EMP --> UC_TRAIN_VIEW
    ACT_EMP --> UC_LEAVE_APPLY
    ACT_EMP --> UC_PERF_SELF

    ACT_MGR --> UC_LEAVE_APPROVE
    ACT_MGR --> UC_PERF_EVAL

    style ACT_EMP fill:#EBF5FB,stroke:#2980B9,stroke-width:2px,color:#1B4F72
    style ACT_MGR fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style ESS_MSS fill:#FFFFFF,stroke:#34495E,stroke-width:2px,color:#2C3E50
```

---

#### Package 2: HR Operations & Personnel Lifecycle (Head Office HR)
```mermaid
flowchart LR
    %% Actor
    ACT_HR["📋 <b>HR Operations Officer</b><br/><i>Head Office Personnel Specialist</i>"]

    %% HR Operations Use Cases
    subgraph HR_OPS["2. Core Personnel Operations (anbesa_hr)"]
        direction TB
        UC_EMP_MANAGE(["Manage Complete 9-Tab Employee Master"])
        UC_GUARANTOR(["Register Guarantor & Collateral Undertakings"])
        UC_TRANSFER(["Process Branch Transfers (Lateral / Promotion)"])
        UC_DISCIPLINE(["Log Disciplinary Actions & Commendations"])
        UC_CLEARANCE(["Execute Exit Clearance Checklist"])
        UC_LEAVE_ALLOC(["Manage Leave Allocations & Entitlements"])
        UC_LEAVE_ENCASH(["Calculate Unused Leave Birr Encashment"])
        UC_TRAIN_RECORD(["Log Training History & Certifications"])
        UC_TRAIN_BOND(["Record Service Bonding Agreements"])
    end

    %% Clean direct lines
    ACT_HR --> UC_EMP_MANAGE
    ACT_HR --> UC_GUARANTOR
    ACT_HR --> UC_TRANSFER
    ACT_HR --> UC_DISCIPLINE
    ACT_HR --> UC_CLEARANCE
    ACT_HR --> UC_LEAVE_ALLOC
    ACT_HR --> UC_LEAVE_ENCASH
    ACT_HR --> UC_TRAIN_RECORD
    ACT_HR --> UC_TRAIN_BOND

    style ACT_HR fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style HR_OPS fill:#FFFFFF,stroke:#34495E,stroke-width:2px,color:#2C3E50
```

---

#### Package 3: Payroll, Financial Handover & Governance (Finance & Admin)
```mermaid
flowchart LR
    %% Actors
    ACT_FIN["💰 <b>Payroll & Finance Officer</b><br/><i>Compensation Specialist</i>"]
    ACT_ADM["⚙️ <b>System Administrator</b><br/><i>IT & Security Auditor</i>"]

    %% Finance & Payroll
    subgraph PAY_GOV["3. Compensation & System Governance"]
        direction TB
        
        subgraph PAYROLL["Payroll Processing & Settlement"]
            direction TB
            UC_PAY_SCALE(["Configure Bank Salary Grades & Scales"])
            UC_PAY_RUN(["Execute Monthly Payroll Calculation"])
            UC_PAY_RECON(["Reconcile Tax, Pension & Loan Cuts"])
            UC_PAY_EXPORT(["Generate CBS Salary Batch Export (CSV/XLS)"])
            
            UC_PAY_RUN -.->|«includes»| UC_PAY_RECON
            UC_PAY_RECON -.->|«enables»| UC_PAY_EXPORT
        end

        subgraph GOVERNANCE["Security & Infrastructure"]
            direction TB
            UC_ADM_RBAC(["Manage User Roles & Permissions"])
            UC_ADM_CAL(["Configure Ethiopian Calendar & Holidays"])
            UC_ADM_AUDIT(["Inspect System Audit Logs & Activity Trails"])
        end
    end

    %% Finance Links
    ACT_FIN --> UC_PAY_SCALE
    ACT_FIN --> UC_PAY_RUN
    ACT_FIN --> UC_PAY_EXPORT

    %% Admin Links
    ACT_ADM --> UC_ADM_RBAC
    ACT_ADM --> UC_ADM_CAL
    ACT_ADM --> UC_ADM_AUDIT

    style ACT_FIN fill:#F4ECF7,stroke:#8E44AD,stroke-width:2px,color:#512E5F
    style ACT_ADM fill:#F2F4F4,stroke:#7F8C8D,stroke-width:2px,color:#2C3E50
    style PAY_GOV fill:#FFFFFF,stroke:#34495E,stroke-width:2px,color:#2C3E50
```

---

### 3. Detailed Actor-to-Use-Case Matrix

| Actor | Functional Domain | Primary Use Cases | Governance / Security Rule |
| :--- | :--- | :--- | :--- |
| **Employee (ESS)** | Self-Service | • View Bio-Data & Amharic Profile<br>• Submit Leave Application<br>• View Monthly Payslips<br>• Complete Self-Appraisal<br>• Browse Training Catalog | Read-only access to confidential HR data; restricted strictly to own employee record. |
| **Branch / Line Manager** | Team Oversight | • Approve / Reject Leave Requests<br>• Conduct Subordinate Appraisals<br>• Endorse Acting / Transfer requests | Access restricted strictly to employees within their direct branch or reporting line. |
| **HR Operations Officer** | Core HR Operations | • Manage 9-Tab Employee Master<br>• Register Guarantors & Collateral<br>• Process Transfers & Promotions<br>• Log Disciplinary Actions<br>• Manage Exit Clearances | Full write access to HR records; maker in personnel lifecycle events. |
| **Payroll & Finance Officer** | Compensation | • Configure Salary Grades & Scales<br>• Run Monthly Payroll Batch<br>• Reconcile Deductions (Tax, Pension)<br>• Export CBS Salary Batch File | Maker-Checker separation; can generate the Core Banking export file but cannot alter personal bio-data. |
| **System Administrator** | Governance & IT | • Assign User Roles & Permissions<br>• Set Ethiopian Calendar & Holidays<br>• Inspect Security & Audit Logs | Administrative privileges; strictly audited via system change logs. |

---

### 4. Key Banking Business Rules Captured

1. **Guarantor & Collateral Tracking (`UC_GUARANTOR`):**
   * Before an employee's probation can be confirmed, HR must register at least one verified guarantor and upload their liability undertaking document into the system.
2. **Leave Balance Validation (`UC_LEAVE_APPLY` $\rightarrow$ `UC_LEAVE_BAL`):**
   * The system automatically blocks leave requests if the requested days exceed the accrued balance (calculated across Gregorian and Ethiopian Calendar rules).
3. **CBS Disbursement Export (`UC_PAY_EXPORT`):**
   * Once the monthly payroll batch is finalized and reconciled by Finance, the system generates the standardized Excel/CSV file with account numbers and net ETB amounts for manual Core Banking upload.
4. **Exit Clearance Checklist (`UC_CLEARANCE`):**
   * An employee cannot be marked as "Separated" until mandatory bank clearances are signed off (Outstanding staff loans cleared, branch cash balanced, bank ID returned, and guarantor liabilities released).
