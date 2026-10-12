# LION INTERNATIONAL BANK S.C. (LIB)
## Human Resource & Integrated Payroll Management System (`anbesa_hr`)
### Enterprise Software Design Document (SDD) & Technical Architecture Specification

---

**Document Reference:** `LIB-IT-SDD-2026-V1.0`  
**Target Delivery Date:** Tuesday, October 13, 2026  
**Project Title:** Legacy HRMS Modernization & Frappe Core Banking Handover  
**Target Platform:** `anbesa_hr` on Frappe Framework v15 / MariaDB 10.6+ / Ubuntu Linux  
**Legacy Baseline:** Java SE 6 / IceFaces 1.8.2 / MS SQL Server (`HRADMINDB`)  
**Regulatory Standard:** Ethiopian Labour Proclamation No. 1156/2019 & NBE Directives  

---

## Executive Summary & Modernization Objectives

This document provides the formal **System Design Document (SDD)** and technical architecture blueprint for modernizing the human capital and payroll operations of **Lion International Bank S.C. (LIB)**. 

The initiative migrates legacy operations from a fragmented, static desktop-era database (`HRADMINDB`) to a centralized, web-based enterprise platform (**`anbesa_hr`**).

### Core Business Objectives Addressed:
1. **Permanent Resolution of the 2-Week Leave Archive Nightmare:** Replaces manual searches across dusty branch paper archives and disconnected Head Office Excel spreadsheets with a real-time, immutable **`Leave Ledger Entry`** engine that calculates certified audit balances in 1 millisecond.
2. **Statutory Labour Proclamation No. 1156/2019 Enforcement:** Automates the **Rolling 2-Year Leave Expiration Policy** and tenure-based severance calculations ($< 5$ years service = 0 ETB; $\ge 5$ years service = statutory formula).
3. **Official 24-Section Employee Profile Form Parity:** Mirrors all 24 sections of Lion Bank's physical registration dossier (including dual-calendar birth dates, anti-nepotism audit checks, and nationwide mobility pledges).
4. **Bilingual Performance Appraisal & Bonus Linkage:** Automates the 11-question (Clerical), 14-question (Non-Clerical in Amharic), and 15-question (Managerial) evaluations with mathematical score conversion into $100\%, 75\%, 50\%, 0\%$ tiers for annual bonus distribution and internal vacancy promotions.
5. **Decoupled Downstream Core Banking Handover:** Generates standardized, verified **CBS Salary Batch Export Files** for manual credit to employee accounts via Core Banking (Temenos T24 / Finacle).

---

## Table of Contents
1. [System Boundaries & High-Level Architecture](#1-system-boundaries--high-level-architecture)
2. [Module & Component Architecture (C4 Level 3)](#2-module--component-architecture-c4-level-3)
3. [Functional Scope & Use-Case Model](#3-functional-scope--use-case-model)
4. [Role-Based Access Control (RBAC) & Governance Matrix](#4-role-based-access-control-rbac--governance-matrix)
5. [Core Business Process Workflows (BPMN Swimlanes)](#5-core-business-process-workflows-bpmn-swimlanes)
   - 5.1 [End-to-End Employee Lifecycle Flow](#51-end-to-end-employee-lifecycle-flow)
   - 5.2 [Dual-Calendar Leave Management Flow](#52-dual-calendar-leave-management-flow)
   - 5.3 [Asynchronous Monthly Payroll Reconciliation Flow](#53-asynchronous-monthly-payroll-reconciliation-flow)
   - 5.4 [Performance Appraisal: Current-State vs. Future-State](#54-performance-appraisal-current-state-vs-future-state)
6. [Data Architecture & Relational Database Design](#6-data-architecture--relational-database-design)
   - 6.1 [Entity-Relationship (ER) Diagram](#61-entity-relationship-er-diagram)
   - 6.2 [Physical Database Schema & Relational Data Dictionary](#62-physical-database-schema--relational-data-dictionary)
   - 6.3 [ETL Legacy Data Migration Mapping Table](#63-etl-legacy-data-migration-mapping-table)
7. [Detailed Algorithmic & Behavioral Design](#7-detailed-algorithmic--behavioral-design)
   - 7.1 [UML Activity Diagrams (Calculation Engines)](#71-uml-activity-diagrams-calculation-engines)
   - 7.2 [UML Sequence Diagrams (Interactive Message Sequences)](#72-uml-sequence-diagrams-interactive-message-sequences)
8. [Infrastructure Footprint & Non-Functional Requirements (NFR)](#8-infrastructure-footprint--non-functional-requirements-nfr)

---

## 1. System Boundaries & High-Level Architecture

The system operates strictly within the **Lion International Bank Private Intranet / Domain**, isolated behind corporate firewalls. External web entry is managed by an **Nginx reverse proxy** terminating SSL on standard ports (`443/80`), which accelerates static media and routes dynamic traffic to the Frappe application runtime (Python WSGI). Heavy computations are offloaded to **Redis Queue (`RQ`)** background workers, while data is persisted in **MariaDB Enterprise (InnoDB `utf8mb4`)**.

```
[ INSERT DIAGRAM 1 HERE ]
Copy content from: DIAGRAM_01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md
```

---

## 2. Module & Component Architecture (C4 Level 3)

The application layer decomposes into **5 cohesive business subsystems** plus shared banking utilities:
* **Core HR Master (`anbesa_hr`):** Employee dossier, 4-tier Ethiopian address, fidelity guarantor records, and exit clearance checklist.
* **Leave Management:** Accrual rules, reliever endorsements, dual-calendar balances, and Birr encashment calculations.
* **Payroll & Compensation:** Pay Grade + Scale Step matrix, allowances (Cash Indemnity, Acting), progressive ERCA income tax, and pension liabilities.
* **Performance Appraisal:** 3-tier questionnaire catalogs, double supervisory sign-off, and bonus/vacancy linkage.
* **Training History:** Academic records, certifications, and service bonding agreements.
* **Shared Utilities:** Ethiopian Calendar (EC $\leftrightarrow$ GC) translation engine, secure Document Media Vault, and notification dispatcher.

```
[ INSERT DIAGRAM 2 HERE ]
Copy content from: DIAGRAM_02_MODULE_COMPONENT_DIAGRAM.md
```

---

## 3. Functional Scope & Use-Case Model

To eliminate role confusion and preserve software modularity, the functional scope is modeled using **UML Actor Generalization**:
* **Universal Base Role:** Every user in the bank (Branch Manager, HR Officer, Finance Officer, IT Admin) inherits baseline **Employee Self-Service (ESS)** capabilities (viewing payslips, applying for leave, and reviewing appraisals).
* **Specialized Operational Realms:** Decomposed into non-overlapping packages: (1) Self-Service & Branch Operations, (2) HR Operations & Personnel Lifecycle, and (3) Compensation & System Governance.

```
[ INSERT DIAGRAM 3 HERE ]
Copy content from: DIAGRAM_03_USE_CASE_DIAGRAM.md
```

---

## 4. Role-Based Access Control (RBAC) & Governance Matrix

In compliance with National Bank of Ethiopia (NBE) governance and external audit standards, access control enforces the **Two-Man Rule (Maker-Checker)** and branch-level row security:
* **The Maker (Preparer):** Drafts records (`docstatus = 0`). Cannot authorize their own submission.
* **The Checker (Authorizer):** Formally reviews, verifies General Ledger/policy compliance, and commits (`docstatus = 1`).
* **Deletion Lockdown:** Physical `Delete (D)` permissions are locked down on financial, leave ledger, and personnel records to ensure an immutable audit trail.

```
[ INSERT DIAGRAM 4 HERE ]
Copy content from: DIAGRAM_04_RBAC_MAKER_CHECKER_MATRIX.md
```

---

## 5. Core Business Process Workflows (BPMN Swimlanes)

### 5.1 End-to-End Employee Lifecycle Flow
Governs the staff journey across 4 audited phases:
1. **Recruitment & 24-Section Form Onboarding:** Candidate fills paper form with a pen; file is verified and bound; HR Data Encoder enters data into `anbesa_hr` (mandatory core fields vs. optional child tables).
2. **45-Day Statutory Probation & Guarantor Gate:** Confirmation to permanent status requires verified personal guarantors and signed liability undertakings recorded in `employee_guarantor`.
3. **Career Operations:** Lateral branch transfers (preserving pay scale) and merit promotions (updating pay grade and `hr_emp_salary`).
4. **Separation & Exit Clearance (Labour Proc. 1156/2019):** Single 4-point checklist (Branch, IT, Finance, Property); instant 1-second Leave Ledger reconciliation; automated severance pay ($< 5$ yrs = 0 ETB; $\ge 5$ yrs = statutory formula); and 1-click Certificate of Service generation.

```
[ INSERT DIAGRAM 5 HERE ]
Copy content from: DIAGRAM_05_EMPLOYEE_LIFECYCLE_FLOWCHART.md
```

---

### 5.2 Dual-Calendar Leave Management Flow
* **Seniority Accrual:** Computes statutory baseline ($16 \text{ days} + 1 \text{ day per 2 years of service}$) aligned with the Ethiopian fiscal year (*Hamle 1 – Sene 30*).
* **Reliever Handover Endorsement:** Branch tellers/cashiers cannot depart on leave without a designated reliever formally accepting cash drawer, vault key, and client responsibilities.
* **Rolling 2-Year Leave Expiration Policy:** Unutilized leave older than two fiscal cycles expires automatically per Labour Proclamation No. 1156/2019.
* **Bidirectional Exit Settlement:** Reconciled balance feeds into final settlement: Positive balance $\rightarrow$ Encashment Earning in Birr; Negative balance $\rightarrow$ Wage Recovery Deduction paid back to the bank.

```
[ INSERT DIAGRAM 6 HERE ]
Copy content from: DIAGRAM_06_LEAVE_MANAGEMENT_FLOWCHART.md
```

---

### 5.3 Asynchronous Monthly Payroll Reconciliation Flow
* **Multi-Source Input Collation:** Dynamic collation of base salaries, branch allowances (Teller Cash Indemnity, Acting allowances, Transport), and leave adjustments (LWP cuts or encashment earnings).
* **Decoupled Asynchronous Processing:** Redis Queue (`RQ`) background workers process 3,500+ employees in parallel without web timeouts.
* **Statutory Deductions:** 7-tier ERCA progressive personal income tax, 7% employee pension, 11% bank pension liability, and loan amortization deductions.
* **Core Banking Handover:** Final generation of the formatted **CBS Salary Batch Export File** (CSV/Excel) for manual credit upload into Core Banking.

```
[ INSERT DIAGRAM 7 HERE ]
Copy content from: DIAGRAM_07_PAYROLL_RECONCILIATION_FLOWCHART.md
```

---

### 5.4 Performance Appraisal: Current-State vs. Future-State
Contrasts the **2-to-3 month postal delay** of the legacy paper process with the **real-time digital workflow** in `anbesa_hr`:
* **Role-Specific Templates:** Managerial (15 questions), Clerical (11 questions), and Non-Clerical (**14 questions in Amharic script**).
* **Discrete Score Bands:** Average score (scale 1–5) automatically converts to **$\ge 4.0 \rightarrow 100\%$**, **$3.5 - 3.9 \rightarrow 75\%$**, **$3.0 - 3.49 \rightarrow 50\%$**, and **$< 3.0 \rightarrow \text{No Value (0\%)}$**.
* **Double Supervisory Sign-off:** Assistant Branch Manager grades &rarr; Main Branch Manager countersigns &rarr; Employee reviews and digitally acknowledges.
* **Direct Outcomes:** Feeds annual performance bonus calculations and unlocks internal vacancy competition across job categories.

```
[ INSERT DIAGRAM 8 HERE ]
Copy content from: DIAGRAM_08_PERFORMANCE_APPRAISAL_FLOWCHART.md
```

---

## 6. Data Architecture & Relational Database Design

### 6.1 Entity-Relationship (ER) Diagram
Logical data blueprint comprising 18 relational entities, $M:N$ guarantor structures, the immutable `LEAVE_LEDGER_ENTRY` table, Grade/Step compensation matrices, and child entities supporting all 24 sections of the official profile form.

```
[ INSERT DIAGRAM 9 HERE ]
Copy content from: DIAGRAM_09_ENTITY_RELATIONSHIP_DIAGRAM.md
```

---

### 6.2 Physical Database Schema & Relational Data Dictionary
Physical specifications engineered for **MariaDB 10.6+ (InnoDB `utf8mb4`)** on Frappe Framework:
* `tabEmployee`: Full dossier mapping all 24 form sections (Amharic names, children with EC dates, mobility pledge, anti-nepotism checks, references, emergency contacts).
* `tabDepartment`: NestedSet tree hierarchy mapping `BusUnits`.
* `tabLeave Ledger Entry`: Immutable audit ledger.
* `tabSalary Structure` & `tabSalary Slip`: Grade/Step compensation with progressive tax and pension.
* `tabAppraisal` & `tabAppraisal Criteria Detail`: Normalized questionnaire scorecards.
* `tabEmployee Separation` & `tabClearance Checklist`: Single-doc 4-station sign-off.

```
[ INSERT TABLES FROM DIAGRAM 10 HERE ]
Copy content from: DIAGRAM_10_DATABASE_SCHEMA_DATA_DICTIONARY.md (Section 2)
```

---

### 6.3 ETL Legacy Data Migration Mapping Table
Specifies the transformation pipeline from legacy Microsoft SQL Server (`HRADMINDB`) to MariaDB, clearly separating migrated historical biodata from freshly initialized operational modules (Leave, Payroll, Performance).

```
[ INSERT MIGRATION TABLE FROM DIAGRAM 10 HERE ]
Copy content from: DIAGRAM_10_DATABASE_SCHEMA_DATA_DICTIONARY.md (Section 3)
```

---

## 7. Detailed Algorithmic & Behavioral Design

### 7.1 UML Activity Diagrams (Calculation Engines)
Algorithmic execution logic, decision diamonds, and concurrency models for:
1. **Dual-Calendar Leave Accrual, 2-Year Rolling Expiration & Bidirectional Exit Settlement.**
2. **Asynchronous Monthly Payroll Batch Execution with 7-Tier Progressive ERCA Tax Schedule.**

```
[ INSERT DIAGRAM 11 HERE ]
Copy content from: DIAGRAM_11_UML_ACTIVITY_DIAGRAMS.md
```

---

### 7.2 UML Sequence Diagrams (Interactive Message Sequences)
Time-ordered message and API exchanges between actors, frontends, controllers, Redis queues, and database tables for:
1. **Multi-Tier Maker-Checker Monthly Payroll Run & CBS Batch Export Handover.**
2. **Dual-Calendar Leave Application with Reliever Acceptance & Immutable Ledger Debit.**

```
[ INSERT DIAGRAM 12 HERE ]
Copy content from: DIAGRAM_12_UML_SEQUENCE_DIAGRAMS.md
```

---

## 8. Infrastructure Footprint & Non-Functional Requirements (NFR)

| Parameter | Specification | Banking Justification |
| :--- | :--- | :--- |
| **Hosting Environment** | Ubuntu Linux 22.04 / 24.04 LTS | Enterprise stability, security patching, long-term support. |
| **Network Location** | Bank Private Intranet / Domain (LAN/VPN) | Data confidentiality; zero exposure to public internet. |
| **Web Gateway / Proxy** | Nginx 1.24+ Reverse Proxy | SSL termination, static asset acceleration, IP subnet restrictions. |
| **Application Runtime**| Python 3.10+ / Frappe Bench (Gunicorn WSGI)| Enterprise web framework with built-in ORM, RBAC, and document lifecycle. |
| **Task Queue / Cache** | Redis 7.x (Cache & Queue instances) | Separates synchronous web requests from bulk batch computations (payroll). |
| **Database Server** | MariaDB 10.6+ Enterprise (InnoDB `utf8mb4`)| ACID transactional integrity, full Amharic Ge'ez Unicode support. |
| **Downstream Disbursal**| Formatted Excel / CSV Batch File | Decoupled, audit-safe Maker-Checker handover for Core Banking System crediting. |

---

### Project Sign-Off & Approvals Block

| Role | Name | Department / Unit | Signature | Date |
| :--- | :--- | :--- | :--- | :--- |
| **Project Lead / Architect** | | IT Directorate | ____________________ | ___/___/2026 |
| **HR Operations Representative**| | Human Resource Directorate| ____________________ | ___/___/2026 |
| **Finance / Payroll Lead** | | Finance Directorate | ____________________ | ___/___/2026 |
| **Internal IS Auditor** | | Internal Audit Directorate| ____________________ | ___/___/2026 |
