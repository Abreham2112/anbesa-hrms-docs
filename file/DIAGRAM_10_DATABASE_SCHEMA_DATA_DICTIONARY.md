# Physical Database Schema & Relational Data Dictionary
## Lion International Bank Human Resource & Integrated Payroll Management System (`anbesa_hr`)
### Engineered for MariaDB 10.6+ & Frappe Framework ORM Architecture
### 100% Aligned with Official Lion International Bank Employee Profile Form (24 Sections)

---

### 1. Database Architecture & Design Foundations

The physical database for **LIBHRMS (`anbesa_hr`)** is hosted on **MariaDB 10.6+ (InnoDB engine)** using the **`utf8mb4`** character set. 

This updated specification is directly aligned with the official **Lion International Bank S.C. Employee Profile Registration Form (Sections 1 through 24)**:
* **Bilingual Biodata & Ethiopic Dates:** Children's birth dates recorded in the **Ethiopian Calendar (EC)** format alongside Gregorian timestamps.
* **Banking Compliance & Conflict of Interest Audits:** Explicit storage for **Relatives working in LIB**, **Criminal conviction history**, and **Nationwide mobility undertaking** (willingness to be posted across any branch in Ethiopia).
* **Family & Dependent Registry:** Spouse details, children (with EC dates of birth), parents' demographics, and non-relative character references.
* **Child Tables for Dossier Sub-Records:** Education history, language abilities matrix (*Fair, Good, Very Good* across Reading/Writing/Speaking), prior employment history, and emergency contacts.

---

### 2. Core Relational Data Dictionary

#### Section A: Core HR & Employee Profile (Official LIB Form Sections 1 &ndash; 24)

##### 1. `tabEmployee` (Core Employee Master Dossier)
*Inherits from Frappe standard `Employee` with `anbesa_hr` banking custom fields.*

| Column Name | Physical Data Type | Form Section | Description & Banking Business Rule |
| :--- | :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | Header | **PK:** Unique Employee ID (Reuses legacy format, e.g., `LIB/01234`). |
| `first_name` | `VARCHAR(140)` | Sec 1 | First Name in English. |
| `middle_name` | `VARCHAR(140)` | Sec 1 | Father's Name in English. |
| `last_name` | `VARCHAR(140)` | Sec 1 | Grandfather's Name in English. |
| `custom_full_name_am` | `VARCHAR(255)` | Sec 1 | **Full Name in Amharic (የሙሉ ስም)**. |
| `image` | `TEXT` | Photo Box | Passport-size photo URL / attachment. |
| `date_of_birth` | `DATE` | Sec 2 | Date of Birth (Gregorian Calendar). |
| `custom_place_of_birth`| `VARCHAR(140)` | Sec 3 | City / Town / Region of birth. |
| `custom_nationality` | `VARCHAR(50)` | Sec 4 | Default: `Ethiopian`. |
| `custom_ethnic_group` | `VARCHAR(60)` | Sec 5 | Ethnic Group (from legacy `hr_lu_ethnic_group`). |
| `custom_religion` | `VARCHAR(60)` | Sec 6 | Religious affiliation (Christianity, Islam, etc.). |
| `gender` | `VARCHAR(20)` | Sec 7 | `Male` / `Female`. |
| **--- Present Address ---** | | **Sec 8** | |
| `custom_region` | `VARCHAR(80)` | Sec 8 | Ethiopian Administrative Region (ክልል). |
| `custom_zone_city` | `VARCHAR(80)` | Sec 8 | Zone or City Administration (ዞን / ከተማ). |
| `custom_subcity_woreda`| `VARCHAR(80)` | Sec 8 | Sub-City or Woreda (ክፍለ ከተማ / ወረዳ). |
| `custom_kebele` | `VARCHAR(50)` | Sec 8 | Kebele (ቀበሌ). |
| `custom_house_number` | `VARCHAR(50)` | Sec 8 | House Number. |
| `custom_tel_residence` | `VARCHAR(30)` | Sec 8 | Residential Landline Phone. |
| `cell_number` | `VARCHAR(30)` | Sec 8 | Primary Mobile Phone. |
| **--- Family Status ---** | | **Sec 9** | |
| `marital_status` | `VARCHAR(30)` | Sec 9.1 | `Single`, `Married`, `Widow/Widower`, `Divorced`. |
| `custom_spouse_name` | `VARCHAR(255)` | Sec 9.1.1 | Name of Spouse (if married). |
| `custom_spouse_occup` | `VARCHAR(140)` | Sec 9.1.1 | Occupation of Spouse. |
| `custom_spouse_employer`| `VARCHAR(140)`| Sec 9.1.1 | Employer Organization of Spouse. |
| `custom_spouse_address` | `TEXT` | Sec 9.1.1 | Sub-City, Kebele, House No, Mobile of spouse. |
| **--- Parents' Demographics ---** | | **Sec 10** | |
| `custom_father_name` | `VARCHAR(255)` | Sec 10 | Father's Full Name, Birthplace & Occupation. |
| `custom_father_address`| `TEXT` | Sec 10 | Father's Administrative Region, Town, Sub-city, Tel. |
| `custom_mother_name` | `VARCHAR(255)` | Sec 10 | Mother's Full Name, Birthplace & Occupation. |
| `custom_mother_address`| `TEXT` | Sec 10 | Mother's Administrative Region, Town, Sub-city, Tel. |
| **--- Banking Compliance ---** | | **Sec 11 - 16** | |
| `custom_crime_convicted`| `INT(1)` | Sec 11 | `1` = Yes, `0` = No (Criminal conviction declaration). |
| `custom_crime_details` | `TEXT` | Sec 11 | Reasons / details if convicted of a crime. |
| `custom_date_available` | `DATE` | Sec 12 | Date available for work. |
| `custom_willing_transfer`| `INT(1)` | Sec 13 | **`1` = Yes, `0` = No (Willing to work anywhere in Ethiopia)**. |
| `custom_transfer_reason`| `TEXT` | Sec 13 | Reason if unwilling to be transferred across branches. |
| `custom_has_relative_lib`| `INT(1)` | Sec 15 | **`1` = Yes, `0` = No (Conflict of Interest / Relatives in LIB)**. |
| `custom_health_handicap`| `TEXT` | Sec 16 | Serious illness, speech/movement/hearing limitations. |
| `custom_life_history` | `TEXT` | Sec 24 | Life history in brief. |
| **--- Institutional Links ---** | | | |
| `status` | `VARCHAR(30)` | Header | `Probationary (45 Days)`, `Permanent`, `Separated`. |
| `custom_employee_class` | `VARCHAR(30)` | Header | `Managerial`, `Clerical`, `Non-Clerical`. |
| `department` | `VARCHAR(140)` | **FK** | Directorate / Division / Branch unit. |
| `branch` | `VARCHAR(140)` | **FK** | City Branch or Outlying Branch. |
| `designation` | `VARCHAR(140)` | **FK** | Position Title. |
| `bank_ac_no` | `VARCHAR(50)` | Sec 14 | **Active Lion Bank Account No** for salary credits. |

---

##### 2. Official Form Child Tables (`tabEmployee *`)

###### A. `tabEmployee Children` (Section 9.2: Children Demographics)
*Captures children's birth dates natively in the Ethiopian Calendar (EC).*

| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`** (Parent Employee). |
| `child_full_name` | `VARCHAR(255)` | Full Name of Child. |
| `custom_dob_ec` | `VARCHAR(30)` | **Date of Birth in Ethiopian Calendar (ቀን/ወር/ዓ.ም)**. |
| `gender` | `VARCHAR(20)` | `Male` / `Female`. |

###### B. `tabEmployee Relatives in LIB` (Section 15: Conflict of Interest & Audit)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`** (Declaring Employee). |
| `relative_name` | `VARCHAR(255)` | Name of relative working in Lion International Bank. |
| `relationship_type` | `VARCHAR(80)` | Relationship (Spouse, Sibling, Child, Parent, Cousin). |
| `relative_branch_dept`| `VARCHAR(140)` | Branch or Department where relative is stationed. |

###### C. `tabEmployee Character Reference` (Section 17: Non-Relative References)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`**. |
| `ref_number` | `INT(1)` | `1` or `2` (Mandatory two non-relative references). |
| `reference_name` | `VARCHAR(255)` | Full Name of Reference. |
| `workplace` | `VARCHAR(255)` | Place of Work / Organization. |
| `relationship` | `VARCHAR(100)` | Professional or personal relationship. |
| `city_subcity_kebele` | `VARCHAR(255)` | Physical residential address. |
| `phone_number` | `VARCHAR(50)` | Primary Telephone Number. |

###### D. `tabEmployee Education` (Section 18: Academic Credentials)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`**. |
| `level` | `VARCHAR(50)` | `Elementary`, `Junior Secondary`, `Senior Secondary`, `Technical/College`, `University`. |
| `school_univ_name` | `VARCHAR(255)` | Institution Name. |
| `location` | `VARCHAR(100)` | City / Country. |
| `year_from` / `year_to` | `INT(4)` | Years attended. |
| `field_of_study` | `VARCHAR(140)` | Major / Field (e.g., Accounting, Management, IT). |
| `credential_award` | `VARCHAR(100)` | Certificate, Diploma, BSc, MSc, PhD. |

###### E. `tabEmployee Language Proficiency` (Section 19: Language Matrix)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`**. |
| `language` | `VARCHAR(60)` | English, Oromiffa, Tigrinya, Somali, etc. (Amharic excluded per form). |
| `reading_proficiency` | `VARCHAR(20)` | `Fair`, `Good`, `Very Good`. |
| `writing_proficiency` | `VARCHAR(20)` | `Fair`, `Good`, `Very Good`. |
| `speaking_proficiency`| `VARCHAR(20)` | `Fair`, `Good`, `Very Good`. |

###### F. `tabEmployee External Work History` (Section 22: Career History)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`**. |
| `employer_name` | `VARCHAR(255)` | Former Employer Name. |
| `job_title` | `VARCHAR(140)` | Former Job Title. |
| `from_date` / `to_date`| `DATE` | Tenure start and end dates. |
| `last_basic_pay` | `DECIMAL(18,4)` | Last earned basic salary in ETB. |
| `reason_for_leaving` | `TEXT` | Resignation / Career change reason. |

###### G. `tabEmployee Emergency Contact` (Section 23: Emergency Notification)
| Column Name | Physical Data Type | Description & Banking Business Rule |
| :--- | :--- | :--- |
| `name` | `VARCHAR(140)` | **PK:** Unique Row UUID. |
| `parent` | `VARCHAR(140)` | **FK &rarr; `tabEmployee.name`**. |
| `contact_name` | `VARCHAR(255)` | Name of Emergency Contact. |
| `relationship` | `VARCHAR(80)` | Relationship to Employee. |
| `occupation` | `VARCHAR(100)` | Occupation. |
| `mobile_phone` | `VARCHAR(30)` | Mobile Phone Number. |
| `residence_phone` | `VARCHAR(30)` | Residence Phone Number. |
| `subcity_kebele_house` | `TEXT` | Sub-City, Kebele, House No. |

---

#### Section B: Operational Banking Modules (Recap)

1. **`tabEmployee Guarantor`:** M:N Guarantor records tracking internal and external guarantors with liability amounts and undertaking forms.
2. **`tabDepartment`:** Tree hierarchy (`BusUnits`) mapping Head Office Directorates and Branch networks.
3. **`tabLeave Ledger Entry`:** Immutable transaction ledger tracking earned and debited leave in milliseconds.
4. **`tabSalary Structure` & `tabSalary Slip`:** Pay Grade + Scale Step matrix with ERCA progressive tax, 7%/11% pension, and loan amortization deductions.
5. **`tabAppraisal` & `tabAppraisal Criteria Detail`:** 11, 14 (Amharic), and 15 criteria questionnaires mapping 1–5 scores to $100\%, 75\%, 50\%, 0\%$ bands.
6. **`tabEmployee Separation` & `tabClearance Checklist`:** Labour Proclamation 1156/2019 severance automation and 4-point operational clearance checklist.

---

### 3. ETL Data Migration Mapping: `HRADMINDB` (SQL Server) &rarr; MariaDB

| Legacy SQL Server Table (`HRADMINDB`) | Target MariaDB Table (`frappe-bench`) | Field-by-Field Transformation & Business Logic |
| :--- | :--- | :--- |
| `Empls.EmplID` | `tabEmployee.name` | **Direct 1:1 mapping.** Preserves legacy employee identifier. |
| `Empls.First_Name` + `Father_Name` + `Grand_Father_Name` | `tabEmployee.first_name`, `middle_name`, `last_name` | Direct string transfer. |
| `Empls.Amh_First_Name` + `Amh_Father_Name` | `tabEmployee.custom_full_name_am` | Concatenates into bilingual Amharic Ge'ez script. |
| `Empls.Hire_Date` | `tabEmployee.date_of_joining` | Normalized from legacy string format to standard `YYYY-MM-DD`. |
| `Empls.State` / `Empls.Status` | `tabEmployee.status` | Maps: `Active` &rarr; `Permanent`, `Probation` &rarr; `Probationary (45 Days)`, `Terminated` &rarr; `Separated`. |
| `hr_emp_address` | `tabEmployee` custom address fields | Maps Region, Zone, Woreda, Kebele, House No, Tel. |
| `hr_emp_education` | `tabEmployee Education` | Imports degree level, institution, field of study, graduation date. |
| `hr_emp_experience` | `tabEmployee External Work History` | Imports former employers, job titles, start/end dates, prior salaries. |
| `hr_emp_language` | `tabEmployee Language Proficiency` | Maps reading, writing, and speaking proficiencies. |
| `hr_emp_family` | `tabEmployee Children` & `tabEmployee Emergency Contact` | Segregates children (with EC dates) and emergency contacts. |
| `hr_emp_guarantee` | `tabEmployee Guarantor` | Imports guarantor names, liability amounts, employer info; sets status to `Active`. |
| `BusUnits` | `tabDepartment` | **Hierarchical Import:** `UnitID` &rarr; `name`, `UnitName` &rarr; `department_name`, `ParentID` &rarr; `parent_department`. Automatically computes NestedSet `lft`/`rgt` tree indices. |
| `Jobs` / `JobPositions` | `tabDesignation` | Maps standardized job catalog into Frappe designations. |

#### Explicit Fresh-Start Boundaries (Clean Slate):
* `EmplLeave` &rarr; **NOT Migrated directly:** Legacy balance rows discarded; initialized fresh in `tabLeave Allocation` and `tabLeave Ledger Entry`.
* `EmplSalHist` / Payroll Tables &rarr; **NOT Migrated directly:** Active salary scale grid configured cleanly into `tabSalary Structure`.
* `EmplPerfRate` &rarr; **NOT Migrated directly:** Obsolete single-field rating table replaced with normalized 11/14/15 criteria model in `tabAppraisal`.
