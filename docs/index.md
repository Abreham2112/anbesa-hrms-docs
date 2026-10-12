# Lion International Bank HRMS (`anbesa_hr`)
## Enterprise Technical Architecture & Software Design Specification Portal

Welcome to the official technical documentation and architecture repository for the modernization of **Lion International Bank S.C. (LIB)** Human Resource & Integrated Payroll Management System (**`anbesa_hr`**).

---

### System Architecture Overview

The system operates securely inside the **Lion International Bank Private Intranet / Domain**, isolated behind corporate network perimeters. Dynamic requests are routed via an **Nginx reverse proxy** to the **Frappe Framework / Python WSGI** application container, heavy computations are decoupled using **Redis Queue (`RQ`)** background workers, and persistent data is stored in **MariaDB Enterprise** alongside a native **Ethiopian Calendar (EC $\leftrightarrow$ GC)** translation engine.

```mermaid
flowchart TB
    %% =========================================================================
    %% LAYER 1: USER & ACTOR ACCESS LAYER
    %% =========================================================================
    subgraph USERS["1. Bank Users Layer (Internal Intranet / Bank Domain)"]
        direction LR
        U_ESS["<b>Employee Self-Service (ESS)</b><br/>• View Payslip<br/>• Submit Leave Request<br/>• Self-Appraisal"]
        U_MSS["<b>Branch & Line Managers</b><br/>• Approve/Reject Leave<br/>• Conduct Appraisals<br/>• Endorse Transfer/Acting"]
        U_HR["<b>HR & Payroll Officers</b><br/>• Employee Dossier Master<br/>• Run Monthly Payroll<br/>• Salary Structure & Admin"]
        U_ADM["<b>System Admin & Auditor</b><br/>• RBAC Permissions<br/>• System Settings & Audit Logs<br/>• Calendar Setup"]
    end

    %% =========================================================================
    %% LAYER 2: GATEWAY & NETWORK PERIMETER
    %% =========================================================================
    subgraph PERIMETER["2. Perimeter & Web Gateway Layer (Ubuntu Server)"]
        direction TB
        FW["<b>Bank Firewall / Domain Gateway</b><br/>Restricted to Internal Bank IP Subnets"]
        NGINX["<b>Nginx Web Server & Reverse Proxy</b><br/>• SSL/TLS Termination (Port 443/80)<br/>• Static Asset Serving (CSS, JS, Photos)<br/>• Request Routing & Rate Limiting"]
        FW -->|HTTPS / WSS| NGINX
    end

    USERS -->|Bank LAN / VPN Access| FW

    %% =========================================================================
    %% LAYER 3: CORE APPLICATION CONTAINER (FRAPPE / ANBESA_HR)
    %% =========================================================================
    subgraph APPLAYER["3. Core Application Layer (Frappe WSGI / Python Runtimes)"]
        direction TB
        WSGI["<b>Frappe Web Application Server (Gunicorn / Python)</b><br/>REST APIs, Authentication, Session Validation, Desk UI"]

        subgraph MODULES["Core Business Modules (anbesa_hr + HRMS)"]
            direction LR
            M_CORE["<b>Core HR Master</b><br/>• Employee 9-Tab Profile<br/>• Amharic / English Data<br/>• Guarantor / Collateral<br/>• Transfers & Clearance"]
            M_LEAVE["<b>Leave Management</b><br/>• Dual-Calendar Allocations<br/>• Multi-Level Approvals<br/>• Birr Balance Encashment"]
            M_PAY["<b>Payroll Engine</b><br/>• Bank Salary Structures<br/>• Tax & Pension Formulas<br/>• Provident Fund & Deductions<br/>• Reconciliation Sheets"]
            M_PERF["<b>Performance Appraisal</b><br/>• Objective / KRA Setup<br/>• Manager Ratings<br/>• Evaluation Scorecards"]
            M_TRAIN["<b>Training & Development</b><br/>• Training History<br/>• Certifications Registry<br/>• Bonding Agreements"]
        end

        WSGI --> MODULES
    end

    NGINX -->|Reverse Proxy / HTTP :8000| WSGI

    %% =========================================================================
    %% LAYER 4: ASYNCHRONOUS TASK QUEUE & CACHING
    %% =========================================================================
    subgraph ASYNC["4. Caching & Asynchronous Queue Layer"]
        direction LR
        REDIS_CACHE[("<b>Redis Cache</b><br/>• User Sessions<br/>• System Settings<br/>• RBAC Permissions")]
        REDIS_QUEUE[("<b>Redis Queue (RQ)</b><br/>Task Message Broker")]
        WORKERS["<b>Frappe Background Workers</b><br/>• Bulk Payroll Calculation Jobs<br/>• PDF / Report Compilation<br/>• Email / System Alerts"]
        
        REDIS_QUEUE -->|Pulls Task| WORKERS
    end

    WSGI <-->|Session / RAM Cache| REDIS_CACHE
    WSGI -->|Enqueues Heavy Jobs| REDIS_QUEUE
    WORKERS -.->|Updates Job Status| WSGI

    %% =========================================================================
    %% LAYER 5: DATA PERSISTENCE & LOCALIZATION
    %% =========================================================================
    subgraph DATA_TIER["5. Persistence & Localization Layer"]
        direction LR
        MARIADB[("<b>MariaDB Relational Database</b><br/>• Employee Records & History<br/>• DocType Relational Schemas<br/>• Financial & Audit Logs<br/>• ACID Compliant")]
        CALENDAR["<b>Ethiopian Calendar Engine</b><br/>• Bidirectional Conversion (EC ↔ GC)<br/>• Ethiopian Fiscal Years (Hamle 1 - Sene 30)<br/>• Holiday & Working Day Rules"]
        FILESTORE[("<b>Private Media Storage</b><br/>• Employee Dossier Photos<br/>• Scanned Guarantor Letters<br/>• Clearance Documents")]
    end

    MODULES <-->|SQL Queries / ORM| MARIADB
    WORKERS <-->|Batch Reads & Writes| MARIADB
    MODULES <-->|Date Calculation API| CALENDAR
    WSGI <-->|Secure File I/O| FILESTORE

    %% =========================================================================
    %% LAYER 6: DOWNSTREAM BANKING & FUTURE INTEGRATIONS
    %% =========================================================================
    subgraph DOWNSTREAM["6. Downstream Financial Processing & Roadmap"]
        direction TB
        
        subgraph PHASE1["Phase 1 Production Flow (File-Based Export)"]
            CBS_FILE["<b>CBS Salary Batch Export File</b><br/>• Formatted Excel / CSV / Text File<br/>• Fields: Account No | Branch | Net Birr | Narration<br/>• Prepared for Finance Settlement Officer"]
            MANUAL_CBS["<b>Core Banking System (CBS)</b><br/>(e.g., Temenos T24 / Finacle / Flexcube)<br/><i>Manual Batch File Upload & Account Crediting</i>"]
            CBS_FILE -->|Manual Batch Upload by Finance| MANUAL_CBS
        end

        subgraph PHASE2["Phase 2 Roadmap (Future Scope)"]
            CBS_API["<i>Direct CBS REST API Integration</i><br/>(Automated Real-Time Posting)"]
            BIOMETRICS["<i>Branch Biometric Attendance Devices</i><br/>(Automated Clock-In Polling)"]
        end
    end

    M_PAY -->|Generates Batch Export| CBS_FILE
    WSGI -.-x|Future Integration| CBS_API
    WSGI -.-x|Future Integration| BIOMETRICS

    %% Styling
    style USERS fill:#EBF5FB,stroke:#2980B9,stroke-width:2px,color:#1B4F72
    style PERIMETER fill:#E8F8F5,stroke:#16A085,stroke-width:2px,color:#0E6251
    style APPLAYER fill:#FEF9E7,stroke:#D4AC0D,stroke-width:2px,color:#7D6608
    style ASYNC fill:#F4ECF7,stroke:#8E44AD,stroke-width:2px,color:#512E5F
    style DATA_TIER fill:#EAEDED,stroke:#7F8C8D,stroke-width:2px,color:#2C3E50
    style DOWNSTREAM fill:#FDF2E9,stroke:#D35400,stroke-width:2px,color:#78281F
    style PHASE2 stroke-dasharray: 5 5
```

---

### Documentation Directory

Navigate to any section below or use the sidebar on the left:

| Category | Specification Document | Description |
| :--- | :--- | :--- |
| **Master SDD** | [**Master SDD Specification**](MASTER_SDD_PACKAGE_TEMPLATE_TUESDAY.md) | Complete enterprise Software Design Document unifying all 12 specifications. |
| **Architecture** | [**01. High-Level System Architecture**](DIAGRAM_01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md) | 6-tier infrastructure, security perimeters, and bank domain network boundaries. |
| **Architecture** | [**02. Module & Component Architecture**](DIAGRAM_02_MODULE_COMPONENT_DIAGRAM.md) | C4 Level 3 decomposition of the 5 core banking application subsystems. |
| **Functional Scope** | [**03. Use-Case Model & Scope**](DIAGRAM_03_USE_CASE_DIAGRAM.md) | UML actor generalization, ESS, MSS, HR, Finance, and System Admin use cases. |
| **Governance** | [**04. RBAC & Maker-Checker Matrix**](DIAGRAM_04_RBAC_MAKER_CHECKER_MATRIX.md) | Two-Man Rule enforcement, branch-level row security, and audit permissions. |
| **Workflows** | [**05. Employee Lifecycle Flowchart**](DIAGRAM_05_EMPLOYEE_LIFECYCLE_FLOWCHART.md) | BPMN swimlane: Recruitment, 24-section form onboarding, transfers, exit clearance. |
| **Workflows** | [**06. Leave Management Flowchart**](DIAGRAM_06_LEAVE_MANAGEMENT_FLOWCHART.md) | BPMN swimlane: Dual-calendar accrual, reliever endorsements, 2-year expiration. |
| **Workflows** | [**07. Payroll Reconciliation Flowchart**](DIAGRAM_07_PAYROLL_RECONCILIATION_FLOWCHART.md) | BPMN swimlane: Multi-source collation, Redis batch calculation, CBS export file. |
| **Workflows** | [**08. Performance Appraisal Flowchart**](DIAGRAM_08_PERFORMANCE_APPRAISAL_FLOWCHART.md) | As-Is vs. To-Be: 3-tier questionnaires (including Amharic script) and bonus linkage. |
| **Data Design** | [**09. Entity-Relationship Diagram**](DIAGRAM_09_ENTITY_RELATIONSHIP_DIAGRAM.md) | Logical ER diagram with 18 entities, M:N guarantors, and immutable ledger entries. |
| **Data Design** | [**10. Database Schema & Data Dictionary**](DIAGRAM_10_DATABASE_SCHEMA_DATA_DICTIONARY.md) | Physical MariaDB tables, 24-section form mapping, and SQL Server ETL pipeline. |
| **Algorithms** | [**11. UML Activity Diagrams**](DIAGRAM_11_UML_ACTIVITY_DIAGRAMS.md) | Algorithmic execution logic for Leave balance engines and 7-tier ERCA tax batch. |
| **Interactions** | [**12. UML Sequence Diagrams**](DIAGRAM_12_UML_SEQUENCE_DIAGRAMS.md) | Time-ordered API messages for payroll approvals, CBS export, and leave routing. |