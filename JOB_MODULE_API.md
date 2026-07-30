# Job Module API — Complete Guide (Frontend → Backend)

Simple copy-paste guide for the **entire Job module**.  
Covers everything we built: create, list, details, edit, close, delete, applicants, public jobs, apply, my applications — **and all filters**.

**Auth:** Bearer token on all private APIs.  
**Base URL:** `/api/...` (Next.js proxy → backend).  
**Common success response:**

```json
{ "success": true, "data": {}, "message": "Optional message" }
```

**Common error response:**

```json
{ "success": false, "message": "Reason" }
```

---

# PART A — Who can access what

| Feature | Admin | Company | Expert | User |
|---|---|---|---|---|
| Public Jobs header (`/jobs`) | No | No | Yes | No |
| Job Management (`/app/job`) | Yes (all jobs) | Yes (own jobs only) | No | No |
| Job Applications (`/app/job-applications`) | Yes | No | Yes | Yes |
| Apply to a job | Yes | No | Yes | Yes |

**Company filter:** send `companyId` = logged-in company id.  
**Admin:** do not send `companyId` (see all jobs).

Permission keys:

- `nav_public_jobs` — public Jobs header
- `nav_jobs` — Job Management sidebar
- `nav_job_applications` — Job Applications sidebar
- `jobs_view`, `jobs_add`, `jobs_edit`, `jobs_delete`, `jobs_approve`, `jobs_apply`
- `job_applications_view`

---

# PART B — Pages (UI routes)

| Step | Page | URL |
|---|---|---|
| 1 | Job list (management) | `/app/job` |
| 2 | Create job | `/app/job/create` |
| 3 | Job details + applicants | `/app/job/:jobId` |
| 4 | Edit job | `/app/job/edit/:jobId` |
| 5 | Public job browse | `/jobs` |
| 6 | Public job details + Apply | `/jobs/:jobId` |
| 7 | My applications | `/app/job-applications` |

---

# PART B2 — All Filters (nothing missed)

Backend must support these filters. Frontend already uses them (some client-side today; move to API query when ready).

---

## Filter set 1 — Job Management list (`GET /api/jobs`)

**UI:** `/app/job` toolbar + table

| UI control | API query param | Values / notes |
|---|---|---|
| Segmented: **Active listings** \| **Job history** | `listView` | `active` = `hiringStatus` is `open`; `history` = `filled` or `closed` |
| Search box “Search jobs” | `search` | Match title, company name, city, country, employmentType, workMode, experienceRequired |
| Posted On date picker | `postedFrom`, `postedTo` | `YYYY-MM-DD`. **UI exists; wire to API.** Filter by `jobPostedDate` |
| Company role (automatic) | `companyId` | Own company only. Admin omits this |
| Title column filter Active / Inactive | `isActive` | `true` / `false` (maps to job `isActive`) |
| Column sort (Title, Company, Location, Posted, Applicants) | `sortBy` + `order` | e.g. `sortBy=title&order=asc` |
| Pagination | `page`, `limit` | Defaults `1`, `10` |

**Example with all filters:**

```
GET /api/jobs?page=1&limit=10&listView=active&search=java&postedFrom=2026-07-01&postedTo=2026-07-30&isActive=true&sortBy=jobPostedDate&order=desc&companyId=11
```

---

## Filter set 2 — Applicants list (`GET /api/jobs/:jobId/applicants`)

**UI:** Job details → Applied candidates tab → status dropdown

| UI control | API query param | Values |
|---|---|---|
| Status select | `status` | `all` (or omit) = no filter; OR one of below |

**Status filter options (exact):**

| Value | Label |
|---|---|
| `all` | All |
| `applied` | Applied |
| `under_review` | Under Review |
| `shortlisted` | Shortlisted |
| `interview_scheduled` | Interview Scheduled |
| `selected` | Selected |
| `rejected` | Rejected |

**Also support:** `page`, `limit`

```
GET /api/jobs/101/applicants?status=shortlisted&page=1&limit=20
```

---

## Filter set 3 — Public Jobs browse (`GET /api/public/jobs`)

**UI:** `/jobs` → Filters panel (desktop sidebar + mobile drawer) + active filter tags + Clear all

| UI control | API query param | Type | Values |
|---|---|---|---|
| Search | `search` | string | Job title, skills, company |
| Experience (multi checkbox) | `experienceRequired` | array or comma-separated | `0-2 years`, `2-5 years`, `5-10 years`, `10+ years` |
| Employment type (multi checkbox) | `employmentType` | array or comma-separated | `Full Time`, `Part Time`, `Contract`, `Internship`, `Temporary`, `Trainee`, `Rotation`, `Remote` |
| Work mode (multi checkbox) | `workMode` | array or comma-separated | `Office`, `Remote`, `Hybrid`, `Offshore`, `Onboard Vessel`, `Field Work` |
| Location text | `location` | string | Match city / state / country |
| Clear all | — | — | Reset all filters |
| (implicit) | — | — | Only jobs with `isActive !== false` |

**Multi-select example (recommended query style):**

```
GET /api/public/jobs?search=java&experienceRequired=2-5 years&experienceRequired=5-10 years&employmentType=Full Time&workMode=Hybrid&workMode=Remote&location=Pune&page=1&limit=12
```

**OR comma-separated style (also fine if backend prefers):**

```
GET /api/public/jobs?search=java&experienceRequired=2-5 years,5-10 years&employmentType=Full Time&workMode=Hybrid,Remote&location=Pune
```

Logic: if an array filter is empty → ignore it; if it has values → job must match **any** selected value (OR within that filter). All filter groups are AND together.

---

## Filter set 4 — My Job Applications (`GET /api/job-applications/me`)

**UI:** `/app/job-applications` toolbar

| UI control | API query param | Values / notes |
|---|---|---|
| Status select | `status` | Same application statuses as Filter set 2 (`all`, `applied`, `under_review`, `shortlisted`, `interview_scheduled`, `selected`, `rejected`) |
| Applied date range | `fromDate`, `toDate` | `YYYY-MM-DD` — filter on `appliedDate` (inclusive) |
| Pagination | `page`, `limit` | Optional |

```
GET /api/job-applications/me?status=interview_scheduled&fromDate=2026-07-01&toDate=2026-07-30&page=1&limit=10
```

**Sort (UI):** latest applied first (`appliedDate` descending). Support `sortBy=appliedDate&order=desc` if needed.

---

## Filters summary cheat-sheet

| Screen | Filters |
|---|---|
| Job Management | `listView`, `search`, `postedFrom`/`postedTo`, `companyId`, `isActive`, `sortBy`/`order`, `page`/`limit` |
| Applicants | `status`, `page`/`limit` |
| Public Jobs | `search`, `experienceRequired[]`, `employmentType[]`, `workMode[]`, `location`, `page`/`limit` |
| My Applications | `status`, `fromDate`/`toDate`, `page`/`limit` |

---

# PART C — APIs step by step

---

## STEP 1 — Create Job

**UI:** `/app/job/create`  
**Who:** Admin, Company  
**Method:** `POST`  
**Endpoint:** `/api/jobs`

### Request body

```json
{
  "title": "Senior Software Engineer - Java Technologies",
  "postedBy": {
    "companyId": 11,
    "companyName": "Siemens",
    "companyShortName": "SIEMENS"
  },
  "experienceRequired": "2-5 years",
  "salaryNotDisclosed": false,
  "salaryRange": {
    "min": "12 LPA",
    "max": "18 LPA"
  },
  "location": {
    "city": "Pune",
    "state": "Maharashtra",
    "pinCode": "411001",
    "countryCode": "IN",
    "country": "India"
  },
  "description": "<p>Job description HTML</p>",
  "keyResponsibilities": "<ul><li>Build APIs</li></ul>",
  "requiredSkills": "<ul><li>Java</li><li>Spring</li></ul>",
  "skillsRequired": "<ul><li>Java</li><li>Spring</li></ul>",
  "weOffer": "<ul><li>Health Insurance</li></ul>",
  "qualifications": "Bachelor's or Master's in CS",
  "employmentType": "Full Time",
  "employmentNature": "Permanent",
  "workMode": "Hybrid",
  "openings": 3,
  "jobPostedDate": "2026-07-28",
  "applicationDeadline": "2026-09-15",
  "status": "pending",
  "isActive": true,
  "hiringStatus": "open"
}
```

### Notes

- If salary is hidden: `"salaryNotDisclosed": true` and `salaryRange.min/max = "Not Disclosed"`
- `employmentType`: Full Time, Part Time, Contract, Internship, Temporary, Trainee, Rotation, Remote
- `employmentNature`: Permanent, Temporary, Contractual
- `workMode`: Office, Remote, Hybrid, Offshore, Onboard Vessel, Field Work
- `experienceRequired`: 0-2 years, 2-5 years, 5-10 years, 10+ years

### Response

```json
{
  "success": true,
  "data": {
    "id": 201,
    "jobId": "JOB-201",
    "title": "Senior Software Engineer - Java Technologies",
    "hiringStatus": "open",
    "peopleApplied": 0,
    "createdOn": 1720000000000,
    "updatedOn": 1720000000000
  },
  "message": "Job created successfully"
}
```

---

## STEP 2 — Job Listing (Management)

**UI:** `/app/job`  
**Who:** Admin (all), Company (own only)  
**Method:** `GET`  
**Endpoint:** `/api/jobs`

### Query params (filters — see PART B2 Filter set 1)

| Param | Example | Meaning |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `10` | Page size |
| `search` | `java` | Search title, company, location, type, mode, experience |
| `sortBy` | `title` / `jobPostedDate` / `peopleApplied` | Sort field |
| `order` | `asc` or `desc` | Sort order |
| `listView` | `active` or `history` | Active = open; History = filled/closed |
| `postedFrom` | `2026-07-01` | Posted on from (`jobPostedDate`) |
| `postedTo` | `2026-07-30` | Posted on to |
| `isActive` | `true` / `false` | Active / Inactive column filter |
| `companyId` | `11` | **Company role only** — own jobs |

### Example

```
GET /api/jobs?page=1&limit=10&search=java&listView=active&postedFrom=2026-07-01&postedTo=2026-07-30&isActive=true&companyId=11
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "items": [
      {
        "id": 101,
        "jobId": "PUB-JOB-101",
        "title": "Senior Software Engineer - Java Technologies",
        "postedBy": {
          "companyId": 11,
          "companyName": "Siemens",
          "companyShortName": "SIEMENS"
        },
        "experienceRequired": "2-5 years",
        "salaryNotDisclosed": false,
        "salaryRange": { "min": "12 LPA", "max": "18 LPA" },
        "location": {
          "city": "Pune",
          "state": "Maharashtra",
          "pinCode": "411001",
          "countryCode": "IN",
          "country": "India"
        },
        "employmentType": "Full Time",
        "employmentNature": "Permanent",
        "workMode": "Hybrid",
        "openings": 3,
        "jobPostedDate": "2026-07-28",
        "applicationDeadline": "2026-09-15",
        "isActive": true,
        "status": "approved",
        "hiringStatus": "open",
        "peopleApplied": 42,
        "createdOn": 1720000000000,
        "updatedOn": 1720000000000
      }
    ]
  }
}
```

### Table columns (UI)

1. Job title (+ hiring status + type · mode · experience)
2. Company
3. Location
4. Salary
5. Posted date
6. Applicants count
7. Actions (View / Edit / Close / Delete / Approve)

### Filters & toolbar (UI) — must match API above

1. **Active listings** / **Job history** → `listView`
2. **Search jobs** → `search`
3. **Posted On** date picker → `postedFrom` / `postedTo` (wire on backend)
4. Table column **Active / Inactive** → `isActive`
5. Column sorters → `sortBy` + `order`
6. Pagination → `page` + `limit`
7. Company auto-scope → `companyId`
8. Row selection → bulk delete (not a filter)

---

## STEP 3 — Get Job Details (by ID)

**UI:** `/app/job/:jobId`  
**Who:** Admin, Company (owner only)  
**Method:** `GET`  
**Endpoint:** `/api/jobs/:jobId`

### Example

```
GET /api/jobs/101
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 101,
    "jobId": "PUB-JOB-101",
    "title": "Senior Software Engineer - Java Technologies",
    "postedBy": {
      "companyId": 11,
      "companyName": "Siemens",
      "companyShortName": "SIEMENS"
    },
    "experienceRequired": "2-5 years",
    "salaryNotDisclosed": false,
    "salaryRange": { "min": "12 LPA", "max": "18 LPA" },
    "location": {
      "city": "Pune",
      "state": "Maharashtra",
      "pinCode": "411001",
      "countryCode": "IN",
      "country": "India"
    },
    "description": "<p>...</p>",
    "keyResponsibilities": "<ul>...</ul>",
    "requiredSkills": "<ul>...</ul>",
    "skillsRequired": "<ul>...</ul>",
    "weOffer": "<ul>...</ul>",
    "qualifications": "...",
    "employmentType": "Full Time",
    "employmentNature": "Permanent",
    "workMode": "Hybrid",
    "openings": 3,
    "jobPostedDate": "2026-07-28",
    "applicationDeadline": "2026-09-15",
    "isActive": true,
    "status": "approved",
    "hiringStatus": "open",
    "peopleApplied": 42,
    "createdOn": 1720000000000,
    "updatedOn": 1720000000000
  }
}
```

### UI tabs on details page

1. **Job Detail** — full job info  
2. **Applied candidates** — applicants table  

Header actions: **Edit** | **Close Position**

---

## STEP 4 — Edit / Update Job

**UI:** `/app/job/edit/:jobId`  
**Who:** Admin, Company (owner)  
**Method:** `PUT`  
**Endpoint:** `/api/jobs/:jobId`

### Request body

Same shape as **Create Job** (STEP 1). Frontend sends the full form payload.

### Response

```json
{
  "success": true,
  "data": { "id": 101, "jobId": "PUB-JOB-101", "title": "Updated title", "...": "..." },
  "message": "Job updated successfully"
}
```

---

## STEP 5 — Close Position (Filled / Closed)

**UI:** Close Position button → modal  
**Who:** Admin, Company  
**Method:** `PUT`  
**Endpoint:** `/api/jobs/:jobId`  
(Optional dedicated: `PATCH /api/jobs/:jobId/close`)

### Request body

```json
{
  "hiringStatus": "filled",
  "hiring_status": "filled",
  "isActive": false,
  "is_active": false
}
```

OR

```json
{
  "hiringStatus": "closed",
  "hiring_status": "closed",
  "isActive": false,
  "is_active": false
}
```

### Hiring status values

| Value | Meaning |
|---|---|
| `open` | Active listing |
| `filled` | Position filled → moves to Job History |
| `closed` | Hiring stopped → moves to Job History |

---

## STEP 6 — Delete Job

**UI:** Actions → Delete (single or bulk)  
**Who:** Admin, Company  
**Method:** `DELETE`  
**Endpoint:** `/api/jobs/:jobId`

### Request

No body.

### Response

```json
{
  "success": true,
  "data": { "id": 101, "deleted": true },
  "message": "Job deleted successfully"
}
```

### Bulk delete

Frontend calls `DELETE /api/jobs/:jobId` once per selected job.

---

## STEP 7 — List Applicants (for a job)

**UI:** `/app/job/:jobId` → Applied candidates tab  
**Who:** Admin, Company (owner)  
**Method:** `GET`  
**Endpoint:** `/api/jobs/:jobId/applicants`

### Query params (filters — see PART B2 Filter set 2)

| Param | Example | Meaning |
|---|---|---|
| `status` | `all` / `applied` / `under_review` / `shortlisted` / `interview_scheduled` / `selected` / `rejected` | Status dropdown on Applied candidates tab |
| `page` | `1` | Page |
| `limit` | `20` | Page size |

### Example

```
GET /api/jobs/101/applicants?status=interview_scheduled&page=1&limit=20
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "101-app-1",
      "jobId": 101,
      "name": "Anita Sharma",
      "email": "anita@example.com",
      "phone": "+91-9876543210",
      "experience": "4 years",
      "skills": ["Java", "Spring"],
      "appliedDate": "2026-07-20",
      "status": "applied",
      "remarks": "",
      "resumeUrl": "https://example.com/resume.pdf",
      "resumeName": "Anita_Resume.pdf",
      "coverLetter": "<p>I am interested...</p>",
      "interview": null,
      "stageHistory": [
        {
          "id": "stage-1",
          "status": "applied",
          "label": "Applied",
          "remarks": "Applied via portal",
          "date": "2026-07-20",
          "interview": null
        }
      ]
    }
  ]
}
```

### Table columns (UI)

1. Candidate (name + email)
2. Experience
3. Applied date
4. Status
5. Interview
6. Action → open candidate details

### Application status values

| Value | Label |
|---|---|
| `applied` | Applied |
| `under_review` | Under Review |
| `shortlisted` | Shortlisted |
| `interview_scheduled` | Interview Scheduled |
| `selected` | Selected |
| `rejected` | Rejected |

---

## STEP 8 — Update Applicant Status / Shortlist

**UI:** Candidate details modal → change status  
**Who:** Admin, Company  
**Method:** `PATCH`  
**Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/status`

### Request body

```json
{
  "status": "shortlisted",
  "remarks": "Strong Java background",
  "interview": null
}
```

### Response

```json
{
  "success": true,
  "data": {
    "jobId": 101,
    "applicantId": "101-app-1",
    "status": "shortlisted",
    "remarks": "Strong Java background",
    "updatedAt": "2026-07-30T10:00:00.000Z"
  },
  "message": "Applicant status updated"
}
```

**Also:** append a new entry in `stageHistory`.

---

## STEP 9 — Schedule Interview

**UI:** Candidate details modal → status = Interview Scheduled  
**Who:** Admin, Company  
**Method:** `POST`  
**Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/interview`

### Request body

```json
{
  "date": "2026-08-05",
  "time": "11:00",
  "mode": "video",
  "location": "Office / address if in person",
  "meetingLink": "https://meet.example.com/xyz",
  "remarks": "Interview scheduled."
}
```

### Interview modes

| Value | Label |
|---|---|
| `in_person` | In Person |
| `video` | Video Call |
| `phone` | Phone |

### Response

```json
{
  "success": true,
  "data": {
    "jobId": 101,
    "applicantId": "101-app-1",
    "status": "interview_scheduled",
    "interview": {
      "date": "2026-08-05",
      "time": "11:00",
      "mode": "video",
      "location": "",
      "meetingLink": "https://meet.example.com/xyz"
    }
  },
  "message": "Interview scheduled"
}
```

**Effect:** set applicant `status` = `interview_scheduled`, save `interview`, append `stageHistory`.

---

## STEP 10 — Reject Applicant (by company)

**UI:** Candidate details modal → status = Rejected  
**Who:** Admin, Company  
**Method:** `POST`  
**Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/reject`

### Request body

```json
{
  "remarks": "Not a fit for this role"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "jobId": 101,
    "applicantId": "101-app-1",
    "status": "rejected",
    "remarks": "Not a fit for this role"
  },
  "message": "Applicant rejected"
}
```

**Important:** After company rejects, candidate must **not** see Accept / Reject buttons on Job Applications.

---

## STEP 11 — Public Jobs List (browse)

**UI:** `/jobs` (Expert only — header menu)  
**Who:** Expert (`nav_public_jobs`)  
**Method:** `GET`  
**Endpoint:** `/api/public/jobs`  
(Alternative: `/api/jobs/public`)

### Query params (filters — see PART B2 Filter set 3)

| Param | Type | Example | UI |
|---|---|---|---|
| `search` | string | `java` | Search input |
| `experienceRequired` | multi | `2-5 years`, `5-10 years` | Experience checkboxes |
| `employmentType` | multi | `Full Time`, `Contract` | Employment type checkboxes |
| `workMode` | multi | `Hybrid`, `Remote` | Work mode checkboxes |
| `location` | string | `Pune` | Location text |
| `page` | number | `1` | Pagination |
| `limit` | number | `12` | Page size |

Only return active jobs (`isActive !== false`). Support **Clear all** (no filter params).

### Response

Same paginated shape as STEP 2 (`total`, `page`, `limit`, `items`).  
Only return public-safe job fields. Include `alreadyApplied` if user is logged in.

---

## STEP 12 — Public Job Details

**UI:** `/jobs/:jobId`  
**Method:** `GET`  
**Endpoint:** `/api/public/jobs/:jobId`

### Response

Same Job object as STEP 3, plus:

```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "...",
    "alreadyApplied": false
  }
}
```

---

## STEP 13 — Apply to Job

**UI:** Apply button on public job details → Apply modal  
**Who:** Expert / User (logged in, `jobs_apply`)  
**Method:** `POST`  
**Endpoint:** `/api/jobs/:jobId/apply`  
**Content-Type:** `multipart/form-data` (recommended)

### Form fields

| Field | Type | Required |
|---|---|---|
| `coverLetter` | HTML string | Yes |
| `resume` | file (pdf / doc / docx, max 5MB) | Yes |
| `jobId` | number/string | Yes (also in URL) |
| `jobTitle` | string | Optional |
| `companyName` | string | Optional |

### Example JSON (what frontend logs; file sent separately)

```json
{
  "jobId": 101,
  "jobTitle": "Senior Software Engineer - Java Technologies",
  "companyName": "Siemens",
  "coverLetter": "<p>I am excited to apply...</p>",
  "resume": {
    "name": "resume.pdf",
    "size": 12345,
    "type": "application/pdf"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1720000000000",
    "jobId": 101,
    "status": "applied",
    "appliedAt": "2026-07-30"
  },
  "message": "Application submitted"
}
```

### Errors

| Case | HTTP |
|---|---|
| Already applied | `409` |
| Job closed / filled | `400` |
| Not logged in | `401` |

---

## STEP 14 — My Job Applications (list)

**UI:** `/app/job-applications`  
**Who:** Expert, User, Admin  
**Method:** `GET`  
**Endpoint:** `/api/job-applications/me`

### Query params (filters — see PART B2 Filter set 4)

| Param | Example | UI |
|---|---|---|
| `status` | `all` / `applied` / `under_review` / `shortlisted` / `interview_scheduled` / `selected` / `rejected` | Status dropdown |
| `fromDate` | `2026-07-01` | Applied date range (start) |
| `toDate` | `2026-07-30` | Applied date range (end) |
| `page` | `1` | Pagination |
| `limit` | `10` | Page size |
| `sortBy` | `appliedDate` | Default sort field |
| `order` | `desc` | Latest applied first |

### Response (array of applications)

```json
{
  "success": true,
  "data": [
    {
      "id": "app-101-user",
      "applicationId": "app-101-user",
      "jobId": 101,
      "jobTitle": "Senior Software Engineer - Java Technologies",
      "companyName": "Siemens",
      "companyShortName": "SIEMENS",
      "employmentType": "Full Time",
      "workMode": "Hybrid",
      "experienceRequired": "2-5 years",
      "appliedDate": "2026-07-28",
      "status": "interview_scheduled",
      "candidateResponse": "pending",
      "candidateResponseAt": null,
      "candidateRemarks": null,
      "interview": {
        "date": "2026-08-05",
        "time": "11:00",
        "mode": "video"
      },
      "stageHistory": []
    }
  ]
}
```

### Table columns (UI)

1. Job (link to public details)
2. Company
3. Applied date
4. Status
5. Interview
6. Actions (View / Accept / Reject / Delete)

### Filters (UI) — must match API above

1. **Status** dropdown → `status`
2. **Applied from / to** RangePicker → `fromDate` + `toDate`
3. Default sort: latest `appliedDate` first

### `candidateResponse` values

| Value | Meaning |
|---|---|
| `pending` | Not responded yet |
| `accepted` | Candidate accepted |
| `rejected` | Candidate rejected / withdrew |

---

## STEP 15 — Candidate Accept / Reject

**UI:** Job Applications → ⋯ menu → Accept or Reject  
**Who:** Expert / User (own application)  
**Method:** `POST`  
**Endpoint:** `/api/job-applications/:applicationId/respond`

### Accept body

```json
{
  "response": "accepted",
  "remarks": "Looking forward to next steps"
}
```

### Reject body

```json
{
  "response": "rejected",
  "remarks": "Not able to continue at this time"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "applicationId": "app-101-user",
    "response": "accepted",
    "remarks": "Looking forward to next steps",
    "respondedAt": "2026-07-30T10:00:00.000Z"
  },
  "message": "Application response saved"
}
```

### Rules (important)

Do **NOT** allow Accept / Reject if:

1. Company already rejected (`status === "rejected"`), OR  
2. Candidate already responded (`candidateResponse` is `accepted` or `rejected`)

---

## STEP 16 — Candidate Delete Application

**UI:** Job Applications → ⋯ menu → Delete  
**Flow:** Reject first (if still pending), then remove from list  
**Who:** Expert / User  
**Method:** `DELETE`  
**Endpoint:** `/api/job-applications/:applicationId`

### Optional body

```json
{
  "action": "reject_and_delete",
  "remarks": "Not able to continue"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "applicationId": "app-101-user",
    "deleted": true
  },
  "message": "Application rejected and deleted"
}
```

---

# PART D — Shared Job object (full)

Use this shape everywhere (list, details, create response, public jobs):

```json
{
  "id": 101,
  "jobId": "PUB-JOB-101",
  "title": "Senior Software Engineer - Java Technologies",
  "postedBy": {
    "companyId": 11,
    "companyName": "Siemens",
    "companyShortName": "SIEMENS"
  },
  "experienceRequired": "2-5 years",
  "salaryNotDisclosed": false,
  "salaryRange": { "min": "12 LPA", "max": "18 LPA" },
  "location": {
    "city": "Pune",
    "state": "Maharashtra",
    "pinCode": "411001",
    "countryCode": "IN",
    "country": "India"
  },
  "employmentType": "Full Time",
  "employmentNature": "Permanent",
  "workMode": "Hybrid",
  "openings": 3,
  "qualifications": "Bachelor's or Master's...",
  "description": "<p>...</p>",
  "keyResponsibilities": "<ul>...</ul>",
  "requiredSkills": "<ul>...</ul>",
  "skillsRequired": "<ul>...</ul>",
  "weOffer": "<ul>...</ul>",
  "skillTags": ["Java", "React"],
  "preferredSkillTags": ["Agile"],
  "jobPostedDate": "2026-07-28",
  "applicationDeadline": "2026-09-15",
  "isActive": true,
  "status": "pending",
  "hiringStatus": "open",
  "peopleApplied": 42,
  "createdOn": 1720000000000,
  "updatedOn": 1720000000000,
  "alreadyApplied": false
}
```

### Enums quick reference

| Field | Values |
|---|---|
| `status` (moderation) | `pending`, `approved`, `blocked` |
| `hiringStatus` | `open`, `filled`, `closed` |
| Applicant `status` | `applied`, `under_review`, `shortlisted`, `interview_scheduled`, `selected`, `rejected` |
| `candidateResponse` | `pending`, `accepted`, `rejected` |
| Interview `mode` | `in_person`, `video`, `phone` |

---

# PART E — Quick API checklist (all endpoints)

| # | Method | Endpoint | Used for |
|---|---|---|---|
| 1 | `POST` | `/api/jobs` | Create job |
| 2 | `GET` | `/api/jobs` | Job listing |
| 3 | `GET` | `/api/jobs/:jobId` | Job details |
| 4 | `PUT` | `/api/jobs/:jobId` | Edit job / Close position |
| 5 | `DELETE` | `/api/jobs/:jobId` | Delete job |
| 6 | `GET` | `/api/jobs/:jobId/applicants` | Applicants list |
| 7 | `PATCH` | `/api/jobs/:jobId/applicants/:id/status` | Update / shortlist |
| 8 | `POST` | `/api/jobs/:jobId/applicants/:id/interview` | Schedule interview |
| 9 | `POST` | `/api/jobs/:jobId/applicants/:id/reject` | Reject applicant |
| 10 | `GET` | `/api/public/jobs` | Public jobs list |
| 11 | `GET` | `/api/public/jobs/:jobId` | Public job details |
| 12 | `POST` | `/api/jobs/:jobId/apply` | Apply to job |
| 13 | `GET` | `/api/job-applications/me` | My applications |
| 14 | `POST` | `/api/job-applications/:id/respond` | Accept / Reject |
| 15 | `DELETE` | `/api/job-applications/:id` | Delete application |

---

# PART F — Suggested backend build order

1. Create / List / Get / Update / Delete jobs + company scoping  
2. Close job (`hiringStatus` filled/closed) + Active vs History list  
3. **All list filters** (PART B2) — job list, applicants, public jobs, my applications  
4. Applicants list + status + interview + reject  
5. Public jobs list/details + Apply (multipart resume)  
6. My applications list + respond + delete  
7. Role permissions (`nav_jobs`, `nav_public_jobs`, `nav_job_applications`, etc.)

---

# PART G — Coverage checklist (filters included)

### Features
- [x] Create / Edit / Close / Delete / Bulk delete jobs
- [x] Job listing + details tabs (Job Detail | Applied candidates)
- [x] Applicants: status update, interview, reject, resume download (UI)
- [x] Public jobs browse + details + Apply (cover letter + resume)
- [x] My applications: Accept / Reject / Delete
- [x] Roles & permissions + company scoping

### Filters
- [x] Job Management: `listView`, `search`, `postedFrom`/`postedTo`, `isActive`, `companyId`, sort, pagination
- [x] Applicants: `status` (all 6 statuses + all)
- [x] Public Jobs: `search`, `experienceRequired[]`, `employmentType[]`, `workMode[]`, `location`, Clear all
- [x] My Applications: `status`, `fromDate`/`toDate`, sort by applied date

---

# PART H — Open questions for backend / product

1. Soft delete or hard delete for jobs and applications?  
2. Should `/jobs` ever be public (no login), or stay Expert-only?  
3. Email/push when interview is scheduled or applicant is rejected?  
4. Where are resumes stored (S3 / Blob) and how does company download them?  
5. Multi-filter query style for public jobs: repeated keys vs comma-separated?  

---

**Frontend reference folders**

- `src/module/Job/` — management (create, list, details, applicants)  
- `src/module/PublicJobs/` — public browse + apply  
- `src/module/JobApplications/` — my applications  
- Mock flags: `USE_MOCK_JOBS_API`, `USE_MOCK_JOB_MODULE_API`
