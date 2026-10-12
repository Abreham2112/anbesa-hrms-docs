# UML Activity Diagrams: Algorithmic Execution Specifications
## Lion International Bank Human Resource & Integrated Payroll Management System (`anbesa_hr`)
### Formal Behavioral Logic for Complex Banking Computational Engines

---

### 1. Purpose & UML Modeling Context

While high-level business flowcharts model operational human handoffs across departments, **UML Activity Diagrams** model the **internal algorithmic behavior, decision branching, mathematical calculations, and parallel concurrency** executed by system services and database engines.

For **LIBHRMS (`anbesa_hr`)**, this document provides the formal activity logic for the **two most computationally complex banking engines**:
1. **Activity Diagram 1: Dual-Calendar Statutory Leave Accrual & Birr Encashment Engine:**
   * Calculates tenure-based statutory annual leave accrual ($16 + \lfloor\frac{\text{Years}}{2}\rfloor$).
   * Executes dual-calendar synchronization (Gregorian GC $\leftrightarrow$ Ethiopian EC).
   * Executes exact monetary valuation in Ethiopian Birr: $\text{Daily Wage} = \frac{\text{Base}}{30} \times \text{Days}$.
   * Commits immutable debits/credits to `tabLeave Ledger Entry`.
2. **Activity Diagram 2: Asynchronous Monthly Payroll Batch Execution & Statutory Deduction Engine:**
   * Redis Queue background task dispatching.
   * Concurrent processing of banking allowances (Teller Cash Indemnity, Acting allowances, Transport).
   * Exact evaluation of the **Ethiopian Ministry of Revenues (ERCA) 7-Tier Progressive Tax Schedule**.
   * Computation of $7\%$ employee pension and $11\%$ bank expense liability.
   * Loan amortization deductions and automated compilation of the **CBS Salary Batch Export File**.

---

### 2. Activity Diagram 1: Dual-Calendar Leave Accrual & Birr Encashment Engine

```mermaid
flowchart TD
    %% =========================================================================
    %% ACTIVITY DIAGRAM 1: LEAVE ACCRUAL, EXPIRATION & BIDIRECTIONAL SETTLEMENT
    %% =========================================================================
    
    START([● Initial Node: Trigger Event]) --> CHECK_TRIGGER{"Trigger Type?"}
    
    %% Branch A: Fiscal Year Allocation & Expiration (Hamle 1)
    CHECK_TRIGGER -->|Annual Fiscal Run: Hamle 1| CALC_TENURE["Query tabEmployee.date_of_joining<br/>Calculate Total Banking Tenure in Months"]
    CALC_TENURE --> EVAL_SENIORITY["Calculate New Year Statutory Entitlement:<br/>Base = 16 Working Days<br/>Bonus = floor(Years of Service / 2) Days (Unlimited Increments)<br/>Current Year Entitlement = Base + Bonus"]
    
    EVAL_SENIORITY --> CHECK_EXPIRATION["<b>Evaluate 2-Year Expiration Rule (Proc. 1156/2019):</b><br/>Query Unused Leave older than 2 Fiscal Cycles (Year N - 2)"]
    CHECK_EXPIRATION --> HAS_EXPIRED{"Any Leave Older<br/>than 2 Years?"}
    
    HAS_EXPIRED -->|Yes| POST_EXPIRE["Post Forfeiture to tabLeave Ledger Entry:<br/>transaction_type = 'Expiration'<br/>leaves = -Expired_Days (Forfeited)"]
    HAS_EXPIRED -->|No| POST_ALLOC["Post Credit to tabLeave Ledger Entry:<br/>transaction_type = 'Allocation'<br/>leaves = +Current_Year_Days"]
    POST_EXPIRE --> POST_ALLOC
    POST_ALLOC --> STOP_ALLOC([◉ Activity Final: Allocation & Expiration Complete])

    %% Branch B: Exit Settlement (Termination Reconciliation)
    CHECK_TRIGGER -->|Termination Trigger: Exit Settlement| QUERY_BALANCE["Query tabLeave Ledger Entry for Employee:<br/>Reconciled Balance = SUM(leaves)"]
    QUERY_BALANCE --> CHECK_BAL_SIGN{"Reconciled Balance<br/>Positive or Negative?"}
    
    %% B1: Positive Balance
    CHECK_BAL_SIGN -->|Balance > 0 Positive| COMPUTE_ENCASH["<b>Positive Balance: Bank Pays Employee</b><br/>Daily Wage Rate = Base Salary / 30.00<br/>Encashment Earning (ETB) = Daily Rate × Unused Days"]
    COMPUTE_ENCASH --> POST_DEBIT_ENCASH["Post to tabLeave Ledger Entry:<br/>transaction_type = 'Encashment'<br/>leaves = -Unused_Days"]
    POST_DEBIT_ENCASH --> PUSH_PAY_EARN["Push to Final Settlement Slip:<br/><b>custom_leave_rec_etb = +Encashment (Taxable Earning)</b>"]
    PUSH_PAY_EARN --> STOP_POS([◉ Activity Final: Positive Encashment Added to Settlement])

    %% B2: Negative Balance
    CHECK_BAL_SIGN -->|Balance < 0 Negative| COMPUTE_RECOVERY["<b>Negative Balance: Employee Pays Bank</b><br/>Daily Wage Rate = Base Salary / 30.00<br/>Wage Recovery (ETB) = Daily Rate × abs(Negative Days)"]
    COMPUTE_RECOVERY --> POST_CREDIT_RECOVERY["Post to tabLeave Ledger Entry:<br/>transaction_type = 'Wage Recovery Settlement'<br/>leaves = +abs(Negative Days) (Balances Ledger to 0)"]
    POST_CREDIT_RECOVERY --> PUSH_PAY_DEDUCT["Push to Final Settlement Slip:<br/><b>custom_leave_rec_etb = -Wage Recovery (Payroll Deduction)</b><br/>(Deducted from Final Payout / Billed to Staff)"]
    PUSH_PAY_DEDUCT --> STOP_NEG([◉ Activity Final: Negative Recovery Deducted from Settlement])

    %% B3: Zero Balance
    CHECK_BAL_SIGN -->|Balance = 0 Neutral| ZERO_ADJ["Zero Adjustment: Leave is fully balanced"]
    ZERO_ADJ --> STOP_ZERO([◉ Activity Final: Zero Impact on Settlement])

    %% Visual Styling
    style START fill:#2C3E50,stroke:#2C3E50,color:#FFFFFF
    style STOP_ALLOC fill:#2C3E50,stroke:#2C3E50,color:#FFFFFF
    style STOP_POS fill:#27AE60,stroke:#27AE60,color:#FFFFFF
    style STOP_NEG fill:#C0392B,stroke:#C0392B,color:#FFFFFF
    style STOP_ZERO fill:#7F8C8D,stroke:#7F8C8D,color:#FFFFFF
    style CHECK_TRIGGER fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style CHECK_BAL_SIGN fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style HAS_EXPIRED fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style POST_EXPIRE fill:#FADBD8,stroke:#C0392B,stroke-width:2px,color:#78281F
    style POST_ALLOC fill:#D4EFDF,stroke:#27AE60,stroke-width:2px,color:#145A32
    style PUSH_PAY_EARN fill:#D4EFDF,stroke:#27AE60,stroke-width:2px,color:#145A32
    style PUSH_PAY_DEDUCT fill:#FADBD8,stroke:#C0392B,stroke-width:2px,color:#78281F
```

---

### 3. Activity Diagram 2: Asynchronous Payroll Batch Execution & Statutory Deductions

```mermaid
flowchart TD
    %% =========================================================================
    %% ACTIVITY DIAGRAM 2: PAYROLL & PROGRESSIVE TAX ENGINE
    %% =========================================================================

    P_START([● Initial Node: Monthly Payroll Triggered]) --> P_INIT["Finance / HR Clicks 'Create Monthly Payroll Entry'<br/>Select Cutoff Period & Company"]
    P_INIT --> P_ENQUEUE["Enqueue Task into Redis Queue (RQ):<br/><code>anbesa_hr.payroll.process_batch(payroll_entry)</code>"]
    P_ENQUEUE --> P_RESP["Immediate Web HTTP 200 Response:<br/>'Task Dispatched to Background Worker'"]
    
    %% Background Worker Execution Loop
    P_ENQUEUE --> P_WORKER["Background Python Worker Thread Picks Job"]
    P_WORKER --> P_QUERY_STAFF["Query all active staff (status = 'Permanent' or 'Probationary')<br/>Initialize Process Loop (Iterate Staff)"]
    
    P_QUERY_STAFF --> LOOP_START{"More Staff<br/>in Batch?"}
    
    %% Staff Processing Pipeline (Fork / Concurrent Evaluation)
    LOOP_START -->|Yes: Next Employee| FORK_START[["== FORK: Concurrent Earnings Collation =="]]
    
    FORK_START --> COMP_BASE["1. Base Pay per Active Grade & Step Assignment"]
    FORK_START --> COMP_ALLOW["2. Banking Allowances:<br/>• Cash Indemnity (if teller)<br/>• Acting Allowance (if acting)<br/>• Housing / Representation"]
    FORK_START --> COMP_LEAVE_ADJ["3. Leave Ledger Adjustments:<br/>• (+) Approved Encashment ETB<br/>• (-) Unpaid LWP Days × (Base/30)"]
    
    COMP_BASE --> JOIN_EARNINGS[["== JOIN: Consolidate Gross Earnings =="]]
    COMP_ALLOW --> JOIN_EARNINGS
    COMP_LEAVE_ADJ --> JOIN_EARNINGS
    
    JOIN_EARNINGS --> COMP_GROSS["Gross Pay = Base Pay + Allowances + Encashment - LWP"]
    
    %% Statutory Deduction Engine (ERCA Tax Schedule)
    COMP_GROSS --> COMP_TAXABLE["Calculate Taxable Income = Gross Pay - Exempt Thresholds"]
    COMP_TAXABLE --> ERCA_BRACKET{"Evaluate Taxable Income<br/>against ERCA Progressive Brackets"}
    
    ERCA_BRACKET -->|0 to 600 ETB| TAX_T1["Tax Rate = 0% | Deduct 0 ETB"]
    ERCA_BRACKET -->|601 to 1,650 ETB| TAX_T2["Tax = (Taxable × 10%) - 60.00 ETB"]
    ERCA_BRACKET -->|1,651 to 3,200 ETB| TAX_T3["Tax = (Taxable × 15%) - 142.50 ETB"]
    ERCA_BRACKET -->|3,201 to 5,250 ETB| TAX_T4["Tax = (Taxable × 20%) - 302.50 ETB"]
    ERCA_BRACKET -->|5,251 to 7,800 ETB| TAX_T5["Tax = (Taxable × 25%) - 565.00 ETB"]
    ERCA_BRACKET -->|7,801 to 10,900 ETB| TAX_T6["Tax = (Taxable × 30%) - 955.00 ETB"]
    ERCA_BRACKET -->|> 10,900 ETB| TAX_T7["Tax = (Taxable × 35%) - 1,500.00 ETB"]
    
    TAX_T1 --> CONSOLIDATE_TAX["Consolidate Total Income Tax (ERCA)"]
    TAX_T2 --> CONSOLIDATE_TAX
    TAX_T3 --> CONSOLIDATE_TAX
    TAX_T4 --> CONSOLIDATE_TAX
    TAX_T5 --> CONSOLIDATE_TAX
    TAX_T6 --> CONSOLIDATE_TAX
    TAX_T7 --> CONSOLIDATE_TAX
    
    %% Pension & Loans
    CONSOLIDATE_TAX --> COMP_PENSION["Calculate Statutory Pension Scheme:<br/>• Staff Pension (7%) = Base Salary × 0.07<br/>• Bank Liability (11%) = Base Salary × 0.11"]
    COMP_PENSION --> COMP_LOANS["Fetch Active Staff Loan Amortization Cuts<br/>(Monthly Principal + Interest Deductions)"]
    COMP_LOANS --> COMP_NET["Compute Net Pay:<br/>Net Pay = Gross Pay - (Tax + 7% Pension + Loans)"]
    
    COMP_NET --> SAVE_SLIP["Insert / Update tabSalary Slip<br/>Set bank_ac_no, docstatus = 0 (Draft)"]
    SAVE_SLIP --> LOOP_START
    
    %% Loop Finalization & Batch Export
    LOOP_START -->|No: All Staff Processed| COMPUTE_BATCH_TOTALS["Aggregate Batch Totals:<br/>• Total Bank-wide Gross Pay<br/>• Total Bank-wide Net Pay Disbursed<br/>• Total Tax Liability & Pension Fund"]
    
    COMPUTE_BATCH_TOTALS --> GEN_CBS_FILE["<b>Generate CBS Salary Batch Export File:</b><br/>Format: Standard Bank CSV / Excel<br/>Columns: <code>Account_No | Staff_Name | Branch_Code | Net_ETB | Narration</code>"]
    GEN_CBS_FILE --> NOTIFY_MAKER["Send Desk Notification to Payroll Officer & Finance Director:<br/>'Monthly Payroll Batch Calculated Successfully'"]
    NOTIFY_MAKER --> P_DONE([◉ Activity Final: Ready for Maker-Checker Sign-Off])

    %% Visual Styling
    style P_START fill:#2C3E50,stroke:#2C3E50,color:#FFFFFF
    style P_DONE fill:#27AE60,stroke:#27AE60,color:#FFFFFF
    style ERCA_BRACKET fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style LOOP_START fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style FORK_START fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style JOIN_EARNINGS fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style GEN_CBS_FILE fill:#D4EFDF,stroke:#27AE60,stroke-width:2px,color:#145A32
```

---

### 4. Technical Precision Breakdown

#### 1. The ERCA Progressive Tax Algorithm
In Ethiopian commercial banking, calculating personal income tax is mathematically non-linear. The Activity Diagram specifies the standard marginal tax equation:
$$\text{Tax Payable} = (\text{Taxable Income} \times \text{Bracket Rate}) - \text{Statutory Deduction Constant}$$

| Monthly Taxable Income (ETB) | Marginal Rate | Statutory Constant (ETB) |
| :--- | :---: | :---: |
| $0 \text{ to } 600$ | $0\%$ | $0.00$ |
| $601 \text{ to } 1,650$ | $10\%$ | $60.00$ |
| $1,651 \text{ to } 3,200$ | $15\%$ | $142.50$ |
| $3,201 \text{ to } 5,250$ | $20\%$ | $302.50$ |
| $5,251 \text{ to } 7,800$ | $25\%$ | $565.00$ |
| $7,801 \text{ to } 10,900$ | $30\%$ | $955.00$ |
| Over $10,900$ | $35\%$ | $1,500.00$ |

#### 2. Fork/Join Concurrency in Earnings
The worker thread executes a UML **Fork** to evaluate base pay, dynamic allowances (Cash Indemnity, Acting, Representation), and leave adjustments independently before a **Join** node aggregates total gross compensation. This architecture eliminates sequential calculation bottlenecks for large branch payroll runs.
