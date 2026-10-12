# UML Sequence Diagrams: Time-Ordered Interactive Execution
## Lion International Bank Human Resource & Integrated Payroll Management System (`anbesa_hr`)
### Formal Component Interactions for Mission-Critical Banking Workflows

---

### 1. Purpose & UML Modeling Context

While Activity Diagrams specify the internal mathematical algorithms and decision branches, **UML Sequence Diagrams** model the **chronological sequence of messages, API calls, asynchronous tasks, and database transactions** exchanged between system participants (Actors, Frontends, Controllers, Asynchronous Workers, and Persistence Databases).

For **LIBHRMS (`anbesa_hr`)**, this document details the interactions for the **two most critical operational transactions**:
1. **Sequence Diagram 1: Multi-Tier Maker-Checker Monthly Payroll Execution & CBS Export:**
   * Documents the complete decoupled sequence from Payroll Officer initiation &rarr; Redis Queue asynchronous processing &rarr; Finance Director audit verification &rarr; Immutable submission &rarr; Core Banking (CBS) batch export file generation.
2. **Sequence Diagram 2: Dual-Calendar Leave Application, Reliever Handover & Ledger Debit:**
   * Documents the interactive flow from Employee self-service submission in Ethiopian Calendar (EC) &rarr; Calendar translation &rarr; Reliever teller cash acceptance &rarr; Branch Manager approval &rarr; Real-time debit posting to `tabLeave Ledger Entry`.

---

### 2. Sequence Diagram 1: Multi-Tier Maker-Checker Payroll Execution & CBS Export

```mermaid
sequenceDiagram
    autonumber
    actor Maker as 👤 Payroll Officer (Maker)
    participant UI as 🖥️ Frappe Desk Web UI
    participant API as ⚙️ Payroll Controller (Python)
    participant RQ as ⚡ Redis Queue (RQ)
    participant Worker as 🔄 Background Worker
    participant DB as 🗄️ MariaDB Database
    actor Checker as 👔 Finance Director (Checker)
    participant CBS as 🏦 Core Banking System (CBS)

    %% Step 1: Batch Initiation
    Note over Maker,API: 1. Monthly Payroll Initiation & Enqueueing
    Maker->>UI: Selects Pay Period & clicks "Process Monthly Payroll Batch"
    UI->>API: POST /api/method/anbesa_hr.payroll.create_batch(period_id)
    API->>DB: Check active cutoff date & verify period unlocked
    DB-->>API: Period Valid
    API->>RQ: Enqueue job: process_payroll_worker(batch_id)
    RQ-->>API: Task ID #1042 Enqueued
    API-->>UI: Return HTTP 200: "Batch Calculation Dispatched in Background"
    UI-->>Maker: Shows non-blocking toast: "Calculation running in background"

    %% Step 2: Asynchronous Calculation Loop
    Note over RQ,DB: 2. Asynchronous Batch Calculation Loop (3,500+ Staff)
    RQ->>Worker: Worker thread pulls Job #1042
    Worker->>DB: Query active staff, salary scales & allowances
    DB-->>Worker: Return Employee datasets

    loop For each active employee
        Worker->>DB: Query Leave Ledger for unpaid LWP cuts & approved encashment
        DB-->>Worker: Return leave balance adjustments
        Worker->>Worker: Compute Gross Pay = Base + Cash Indemnity + Acting + Allowances ± Leave
        Worker->>Worker: Evaluate ERCA 7-tier progressive tax & 7%/11% Pension
        Worker->>Worker: Deduct staff loan amortization & internal cuts
        Worker->>Worker: Net Pay = Gross - (Tax + Pension + Loans)
        Worker->>DB: INSERT / UPDATE tabSalary Slip (docstatus = 0 Draft)
    end

    Worker->>DB: UPDATE tabPayroll Entry status = "Pending Checker Verification"
    Worker->>UI: Trigger Real-time Desk Notification to Finance Director

    %% Step 3: Maker-Checker Audit & Sign-off
    Note over Checker,DB: 3. Maker-Checker Verification & Final Post
    Checker->>UI: Opens Monthly Payroll Reconciliation Variance Sheet
    UI->>API: GET /api/method/anbesa_hr.payroll.get_variance_report(batch_id)
    API->>DB: Fetch Month-over-Month comparative totals
    DB-->>API: Return Variance Report
    API-->>UI: Render Variance Comparison Dashboard
    Checker->>UI: Verifies totals against General Ledger & clicks "Authorize & Submit"
    UI->>API: POST /api/method/anbesa_hr.payroll.submit_batch(batch_id)
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE tabSalary Slip SET docstatus = 1 (Immutable Lock)
    API->>DB: UPDATE tabPayroll Entry SET docstatus = 1
    API->>DB: COMMIT TRANSACTION

    %% Step 4: CBS Batch File Generation & Downstream Handover
    Note over API,CBS: 4. Downstream Core Banking Handover
    API->>API: Generate CBS Salary Batch Export File (CSV / Excel format)
    API->>DB: Save file URL in tabPayroll Entry.custom_cbs_export
    API-->>UI: Return Success + File Download Link
    UI-->>Checker: Displays Download Button for CBS File
    Checker->>UI: Downloads "LION_BANK_SALARY_2026_10.csv"
    Checker->>CBS: Manually uploads batch file into Core Banking (T24/Finacle)
    CBS-->>Checker: "3,500+ Employee Accounts Credited Successfully"
```

---

### 3. Sequence Diagram 2: Dual-Calendar Leave Application, Reliever Handover & Ledger Debit

```mermaid
sequenceDiagram
    autonumber
    actor Emp as 👤 Employee (ESS)
    participant UI as 📱 Frappe Web / Mobile UI
    participant Cal as 📅 Ethiopian Calendar Engine
    participant Ctrl as ⚙️ Leave Controller
    participant DB as 🗄️ MariaDB (Leave Ledger)
    actor Reliever as 🤝 Designated Reliever
    actor Mgr as 👔 Branch Manager (MSS)

    %% Step 1: Self-Service Submission in Ethiopian Calendar
    Note over Emp,Cal: 1. Application Submission & Dual-Calendar Translation
    Emp->>UI: Selects Leave Type & picks dates in Ethiopian Calendar (EC)
    UI->>Cal: translate_ec_to_gc(from_date_ec, to_date_ec)
    Cal->>Cal: Convert Ge'ez timestamps to Gregorian timestamps
    Cal->>DB: Query official Lion Bank public holiday registry
    DB-->>Cal: Exclude weekend and national/religious holidays
    Cal-->>UI: Return GC Dates & Net Working Days Requested
    
    UI->>Ctrl: validate_balance(employee_id, leave_type_id, requested_days)
    Ctrl->>DB: Query tabLeave Ledger Entry: SUM(leaves)
    DB-->>Ctrl: Current Running Balance = 14 Days
    Ctrl-->>UI: Balance Valid (14 >= 5 Requested)

    Emp->>UI: Selects Reliever (Branch Colleague) & clicks "Submit Application"
    UI->>Ctrl: POST /api/method/anbesa_hr.leave.submit_application()
    Ctrl->>DB: INSERT tabLeave Application (status = "Pending Reliever", docstatus = 0)
    Ctrl->>UI: Dispatch Inbox Alert to Reliever

    %% Step 2: Reliever Cash/Desk Acceptance
    Note over Reliever,Ctrl: 2. Branch Cashier / Desk Handover Acceptance
    Reliever->>UI: Opens "Pending Reliever Endorsement" Notification
    Reliever->>UI: Verifies physical teller cash drawer / keys handover & clicks "Accept"
    UI->>Ctrl: POST /api/method/anbesa_hr.leave.reliever_endorse(app_id, "Accepted")
    Ctrl->>DB: UPDATE tabLeave Application SET custom_reliever_status = "Accepted", status = "Pending Manager"
    Ctrl->>UI: Dispatch Approval Notification to Branch Manager

    %% Step 3: Branch Manager Approval
    Note over Mgr,DB: 3. Branch Manager Operational Review & Sign-Off
    Mgr->>UI: Opens Manager Self-Service (MSS) Leave Inbox
    Mgr->>UI: Reviews branch operational coverage & clicks "Approve"
    UI->>Ctrl: POST /api/method/anbesa_hr.leave.approve_application(app_id)
    
    %% Step 4: Immutable Ledger Debit
    Note over Ctrl,DB: 4. Real-Time Immutable Ledger Posting
    Ctrl->>DB: BEGIN TRANSACTION
    Ctrl->>DB: UPDATE tabLeave Application SET docstatus = 1, status = "Approved"
    Ctrl->>DB: INSERT INTO `tabLeave Ledger Entry` (employee, leave_type, transaction_type='Consumption', leaves=-5.00, docstatus=1)
    Ctrl->>DB: COMMIT TRANSACTION
    
    Ctrl-->>UI: Return HTTP 200: "Leave Approved & Ledger Debited"
    UI-->>Emp: Push Notification: "Your leave has been approved (Remaining: 9 Days)"
    UI-->>Mgr: Confirmation alert displayed
```

---

### 4. Technical Architectural Strengths Documented

1. **Non-Blocking User Experience:**
   * Sequence 1 proves that heavy batch calculations never freeze the browser. The web UI immediately returns a `200 OK` toast, while Redis Queue background workers handle the math.
2. **Two-Man Rule (Maker-Checker) Enforcement:**
   * The Payroll Officer can only generate `Draft` salary slips (`docstatus = 0`). The system strictly prevents file export until the Finance Director signs off and commits (`docstatus = 1`).
3. **Banking Continuity via Reliever Endorsement:**
   * Sequence 2 formally guarantees that branch operational custody (teller drawers, vault keys) is accepted by a colleague before managerial review.
4. **Instant Audit Integrity via `tabLeave Ledger Entry`:**
   * Every approved leave transaction results in an atomic, non-editable `Consumption` debit, keeping real-time balances permanently certified for internal audits.
