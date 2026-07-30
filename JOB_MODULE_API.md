# Job Module — Backend API Specification

> Frontend source of truth for Job Management, Public Jobs, Apply, Applicants, and Job Applications.
> All endpoints below are currently mocked on the frontend (`USE_MOCK_JOBS_API` / `USE_MOCK_JOB_MODULE_API`). Replace mock branches with real implementations; keep response shapes compatible unless coordinated with frontend.

**Base path (via Next.js proxy):** `/api/...` → backend `${API_BASE_URL}/...`  
**Auth:** Bearer token (cookie / Authorization header) on all private routes.

---

## 1. Roles & permissions (product rules)

| Capability | Permission key | Admin | Expert | Company | User |
|---|---|---|---|---|---|
| Public site header **Jobs** link + `/jobs` browse | `nav_public_jobs` | ❌ | ✅ | ❌ | ❌ |
| Dashboard **Jobs** (management) | `nav_jobs` | ✅ | ❌ | ✅ | ❌ |
| Dashboard **Job Applications** | `nav_job_applications` | ✅ | ✅ | ❌ | ✅ |
| CRUD jobs | `jobs_view/add/edit/delete/approve` | ✅ | ❌ | ✅ | ❌ |
| Apply to jobs | `jobs_apply` | ✅* | ✅ | ❌ | ✅ |
| View own applications | `job_applications_view` | ✅ | ✅ | ❌ | ✅ |

\* Admin may retain apply for support testing.

### Data scoping

| Role | Job list scope |
|---|---|
| **Admin** | All jobs (no `companyId` filter) |
| **Company** | Only jobs where `postedBy.companyId` === logged-in company id |
| **Expert / User** | No management access; browse/apply via public jobs + Job Applications |

Company id resolution (frontend): `user.company_id ?? user.companyId ?? user.id`.

---

## 2. UI surfaces inventory

### 2.1 Pages / routes

| UI | Route | Who |
|---|---|---|
| Public jobs list | `GET` page `/jobs` | Expert (`nav_public_jobs`) |
| Public job details | `/jobs/:jobId` | Expert / applicants with apply or applications access |
| Job management list | `/app/job` | Admin, Company |
| Create job | `/app/job/create` | Admin, Company (`jobs_add`) |
| Edit job | `/app/job/edit/:jobId` | Admin, Company (`jobs_edit`) |
| Job details + applicants | `/app/job/:jobId` | Admin, Company (`jobs_view`) |
| My job applications | `/app/job-applications` | Expert, User, Admin |

### 2.2 Forms

| # | Form | UI location | Frontend submit | Mock API helper |
|---|---|---|---|---|
| F1 | Create job | `/app/job/create` → `CreateJobForm` | `useJob.createJob` → `jobService.createJob` | `POST /jobs` |
| F2 | Edit job | `/app/job/edit/:jobId` → `CreateJobForm` | `useJob.updateJob` → `jobService.updateJob` | `PUT /jobs/:id` |
| F3 | Close position | `CloseJobModal` (list + details) | `jobService.updateJob` + closure payload | `PUT /jobs/:id` |
| F4 | Delete job | `DeleteConfirmModal` | `jobService.deleteJob` | `DELETE /jobs/:id` |
| F5 | Bulk delete jobs | Job list selection | parallel `deleteJob` | `DELETE /jobs/:id` (×N) |
| F6 | Update applicant status / shortlist | Candidate details modal | `jobApplicantsApi.updateStatus` | `PATCH .../status` |
| F7 | Schedule interview | Candidate details modal | `jobApplicantsApi.scheduleInterview` | `POST .../interview` |
| F8 | Reject applicant (company) | Candidate details modal | `jobApplicantsApi.reject` | `POST .../reject` |
| F9 | Apply to job | `ApplyJobModal` | `publicApplyApi.apply` | `POST /jobs/:id/apply` |
| F10 | Candidate accept / reject | Job Applications ⋯ menu | `myApplicationsApi.respond` | `POST .../respond` |
| F11 | Candidate delete (reject then remove) | Job Applications ⋯ menu | `myApplicationsApi.remove` | `DELETE .../:id` |

### 2.3 Listings / tables

| # | Listing | Route / component | Filters | Columns (summary) |
|---|---|---|---|---|
| L1 | Job management table | `/app/job` → `JobTable` | Active / History, search, status | Title, Company, Location, Salary, Posted, Applicants, Actions |
| L2 | Applied candidates | `/app/job/:jobId` → Applied tab | Status | Candidate, Experience, Applied, Status, Interview, Actions |
| L3 | My applications | `/app/job-applications` → `JobApplicationsTable` | Status, applied date range | Job, Company, Applied, Status, Interview, Actions |
| L4 | Public jobs browse | `/jobs` → cards (not table) | Search, experience, employment, work mode, location | Card fields from job object |

---

## 3. API endpoints

Convention for responses:

```json
{
  "success": true,
  "data": {},
  "message": "Optional human message"
}
```

Error:

```json
{
  "success": false,
  "message": "Reason",
  "error": "Optional code"
}
```

HTTP: `401` unauthenticated, `403` forbidden (wrong role / not owner), `404` not found, `422` validation.

---

### 3.1 Jobs (management)

#### L1 — List jobs

- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Query**

| Param | Type | Notes |
|---|---|---|
| `page` | number | default 1 |
| `limit` | number | default 10 |
| `search` | string | title, company, location, etc. |
| `sortBy` | string | optional |
| `order` | `asc` \| `desc` | optional |
| `listView` | `active` \| `history` | active = open; history = filled/closed |
| `companyId` | string/number | **Required for company role** (frontend sends automatically). Admin omits. |

- **Response `data`**

```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "items": [ /* Job object — see §4 */ ]
}
```

---

#### Get job by id

- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId`
- **Auth / ACL:** Admin any; Company only if owner
- **Response `data`:** single Job object (§4)

---

#### F1 — Create job

- **Method:** `POST`
- **Endpoint:** `/api/jobs`
- **Permission:** `jobs_add`
- **Payload**

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
  "salaryRange": { "min": "12 LPA", "max": "18 LPA" },
  "location": {
    "city": "Pune",
    "state": "Maharashtra",
    "pinCode": "411001",
    "countryCode": "IN",
    "country": "India"
  },
  "description": "<p>HTML rich text</p>",
  "keyResponsibilities": "<ul><li>...</li></ul>",
  "requiredSkills": "<ul><li>...</li></ul>",
  "skillsRequired": "<ul><li>...</li></ul>",
  "weOffer": "<ul><li>...</li></ul>",
  "qualifications": "Bachelor's or Master's...",
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

- **Response `data`:** created Job (include `id`, `jobId`, `createdOn`, `peopleApplied`)

---

#### F2 — Update job (full edit)

- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId`
- **Permission:** `jobs_edit` + ownership for company
- **Payload:** same shape as create (partial updates acceptable if documented; frontend currently sends full form payload)
- **Response `data`:** updated Job

---

#### F3 — Close position (filled / closed)

- **Method:** `PUT` (same as update) **or** prefer dedicated `PATCH /api/jobs/:jobId/close`
- **Payload (current frontend)**

```json
{
  "hiringStatus": "filled",
  "hiring_status": "filled",
  "isActive": false,
  "is_active": false
}
```

`hiringStatus`: `filled` | `closed`

- **Effect:** Job leaves Active listings → Job History

---

#### F4 / F5 — Delete job

- **Method:** `DELETE`
- **Endpoint:** `/api/jobs/:jobId`
- **Permission:** `jobs_delete` + ownership for company
- **Response**

```json
{
  "success": true,
  "data": { "id": 101, "deleted": true },
  "message": "Job deleted successfully"
}
```

---

### 3.2 Public jobs (browse / apply)

#### L4 — Public list (optional dedicated endpoint)

Frontend currently filters local mock. Preferred API:

- **Method:** `GET`
- **Endpoint:** `/api/public/jobs` (or `/api/jobs/public`)
- **Auth:** Expert with `nav_public_jobs` (or public read if product changes)
- **Query:** `search`, `experience`, `employmentType`, `workMode`, `location`, `page`, `limit`
- **Response:** same paginated `{ total, page, limit, items }` as management list (public-safe fields only)

#### Public job detail

- **Method:** `GET`
- **Endpoint:** `/api/public/jobs/:jobId`
- **Response `data`:** Job object (+ `alreadyApplied` for current user if authenticated)

---

#### F9 — Apply to job

- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/apply`
- **Permission:** `jobs_apply`
- **Content-Type:** `multipart/form-data` (recommended)

| Field | Type | Required |
|---|---|---|
| `coverLetter` | string (HTML) | yes |
| `resume` | file (pdf/doc/docx, ≤5MB) | yes |
| `jobId` | string/number | yes (also in path) |
| `jobTitle` | string | optional (denormalized) |
| `companyName` | string | optional |

JSON fallback used in mock logs:

```json
{
  "jobId": 101,
  "jobTitle": "Senior Software Engineer...",
  "companyName": "Siemens",
  "coverLetter": "<p>...</p>",
  "resume": { "name": "cv.pdf", "size": 12345, "type": "application/pdf" }
}
```

- **Response**

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

- **Errors:** already applied → `409`; job closed → `400`

---

### 3.3 Applicants (company / admin on a job)

#### L2 — List applicants

- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId/applicants`
- **Query:** `status` (`all` \| application status), `page`, `limit`
- **ACL:** Admin any; Company owner only
- **Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "app-101-1",
      "jobId": 101,
      "name": "Anita Sharma",
      "email": "anita@example.com",
      "phone": "+91...",
      "experience": "4 years",
      "appliedDate": "2026-07-20",
      "status": "applied",
      "remarks": "",
      "resumeUrl": "https://...",
      "interview": null,
      "stageHistory": [
        {
          "status": "applied",
          "remarks": "Applied via portal",
          "date": "2026-07-20",
          "interview": null
        }
      ]
    }
  ]
}
```

**Application status enum**

| Value | Label |
|---|---|
| `applied` | Applied |
| `shortlisted` | Shortlisted |
| `interview_scheduled` | Interview scheduled |
| `rejected` | Rejected |
| *(extend as needed)* | e.g. hired / offered |

---

#### F6 — Update applicant status / shortlist

- **Method:** `PATCH`
- **Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/status`
- **Payload**

```json
{
  "status": "shortlisted",
  "remarks": "Strong Java background",
  "interview": null
}
```

- **Response `data`:** updated applicant (or `{ jobId, applicantId, status, remarks, updatedAt }`)
- **Side effect:** append `stageHistory` entry

---

#### F7 — Schedule interview

- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/interview`
- **Payload**

```json
{
  "date": "2026-08-05",
  "time": "11:00",
  "mode": "video",
  "locationOrLink": "https://meet.example.com/xyz",
  "remarks": "Interview scheduled."
}
```

`mode`: align with frontend `INTERVIEW_MODES` (e.g. `video`, `phone`, `onsite`).

- **Effect:** set status → `interview_scheduled`, store `interview` object, append stage history
- **Response**

```json
{
  "success": true,
  "data": {
    "jobId": 101,
    "applicantId": "app-101-1",
    "status": "interview_scheduled",
    "interview": { "date": "2026-08-05", "time": "11:00", "mode": "video" }
  }
}
```

---

#### F8 — Reject applicant (company)

- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/applicants/:applicantId/reject`
- **Payload**

```json
{ "remarks": "Not a fit for this role" }
```

- **Effect:** status → `rejected`; candidate must **not** see Accept/Reject actions afterward

---

### 3.4 My job applications (candidate)

#### L3 — List my applications

- **Method:** `GET`
- **Endpoint:** `/api/job-applications/me`
- **Query:** `status`, `fromDate`, `toDate`, `page`, `limit`
- **Response `data`:** array of application rows:

```json
{
  "id": "app-101-user",
  "applicationId": "app-101-user",
  "jobId": 101,
  "jobTitle": "Senior Software Engineer...",
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
```

`candidateResponse`: `pending` | `accepted` | `rejected`

---

#### F10 — Candidate accept / reject

- **Method:** `POST`
- **Endpoint:** `/api/job-applications/:applicationId/respond`
- **Payload**

```json
{
  "response": "accepted",
  "remarks": "Looking forward to next steps"
}
```

`response`: `accepted` | `rejected`

- **Rules:** Forbidden if company already `status=rejected` OR candidate already responded
- **Response `data`:** `{ applicationId, response, remarks, respondedAt }`

---

#### F11 — Delete application (reject then delete)

- **Method:** `DELETE`
- **Endpoint:** `/api/job-applications/:applicationId`
- **Body (optional)**

```json
{
  "action": "reject_and_delete",
  "remarks": "Not able to continue"
}
```

- **Flow:** If still pending → treat as candidate reject, then soft/hard delete from candidate list
- **Response**

```json
{
  "success": true,
  "data": { "applicationId": "app-101-user", "deleted": true },
  "message": "Application rejected and deleted"
}
```

---

## 4. Shared Job object

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
  "qualifications": "...",
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

**Enums**

| Field | Values |
|---|---|
| `status` (moderation) | `pending`, `approved`, `blocked` (as used by product) |
| `hiringStatus` | `open`, `filled`, `closed` |
| `employmentType` | e.g. Full Time, Part Time, Contract |
| `employmentNature` | Permanent, Temporary, ... |
| `workMode` | Office, Hybrid, Remote |

---

## 5. Frontend mock switches (for engineers)

| Flag | File | Controls |
|---|---|---|
| `USE_MOCK_JOBS_API` | `src/module/Job/constants/mockJobsApiResponse.js` | Job CRUD list/get/create/update (+ delete mock in `jobService`) |
| `USE_MOCK_JOB_MODULE_API` | `src/module/Job/services/jobModuleApi.js` | Applicants, my applications, public apply |

When flipping to real APIs, keep payload/response shapes above or update frontend in the same PR.

---

## 6. Suggested implementation order (backend)

1. Jobs CRUD + company scoping (`companyId` query + ownership checks)
2. Close job (`hiringStatus`) + list `listView=active|history`
3. Public jobs list/detail + apply (multipart)
4. Applicants list + status / interview / reject
5. My applications list + respond + delete
6. Wire role permissions (`nav_public_jobs`, `nav_jobs`, `nav_job_applications`) on auth/me or roles API

---

## 7. Checklist — nothing missed

- [x] Public Jobs header (Expert only)
- [x] Job management for Admin (all) + Company (own)
- [x] Create / Edit / Close / Delete / Bulk delete jobs
- [x] Job details + Applied candidates table
- [x] Applicant status, interview, reject
- [x] Public apply (cover letter + resume)
- [x] Job Applications list (candidate)
- [x] Candidate Accept / Reject / Delete
- [x] Permission keys for nav + actions
- [x] Consistent success/error envelopes

**Questions for product/backend (if undecided):**

1. Soft-delete vs hard-delete for jobs and applications?
2. Should public `/jobs` ever be anonymous, or stay Expert-only?
3. Notify candidate on interview schedule / company reject (email/push)?
4. Resume storage (S3/Blob) + signed download URLs for company view?

---

*Generated for the nipunah-web-app Job module. Frontend contacts: see `src/module/Job/`, `src/module/JobApplications/`, `src/module/PublicJobs/`.*
