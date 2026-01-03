# Job Applications API Structure

API structure for managing job applications - tracking which users have applied to which jobs.

## Endpoints

### 1. GET `/job-applications` - Get All Applications

Get a paginated list of job applications with optional filters.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `job_id` (number, optional): Filter by job ID
- `user_id` (number, optional): Filter by user ID
- `status` (string, optional): Filter by status (pending, shortlisted, rejected, hired)
- `sort_by` (string, optional): Sort field (default: "applied_on")
- `sort_order` (string, optional): Sort order - "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "items": [
      {
        "id": 1,
        "application_id": "APP-001",
        "job_id": 1,
        "job": {
          "id": 1,
          "job_id": "JOB-001",
          "title": "Senior Software Engineer",
          "company_name": "TechCorp Solutions",
          "location": {
            "city": "San Francisco",
            "state": "California",
            "pincode": "94102"
          }
        },
        "user_id": 101,
        "user": {
          "id": 101,
          "name": "John Smith",
          "email": "john.smith@email.com",
          "phone": "+1-555-0123",
          "experience": "5 years",
          "skills": ["React", "Node.js", "TypeScript"]
        },
        "status": "pending",
        "applied_on": 1705708800000,
        "updated_on": 1705708800000,
        "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
        "cover_letter": "I am excited to apply for this position...",
        "notes": null,
        "reviewed_by": null,
        "reviewed_on": null
      }
    ]
  }
}
```

### 2. GET `/job-applications/:id` - Get Application by ID

Get a single job application by its ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": "APP-001",
    "job_id": 1,
    "job": {
      "id": 1,
      "job_id": "JOB-001",
      "title": "Senior Software Engineer",
      "description": "Full-stack development role...",
      "company_name": "TechCorp Solutions",
      "location": {
        "city": "San Francisco",
        "state": "California",
        "pincode": "94102"
      },
      "salary_range": {
        "min": "$120,000",
        "max": "$150,000"
      },
      "employment_type": "Full-time"
    },
    "user_id": 101,
    "user": {
      "id": 101,
      "name": "John Smith",
      "email": "john.smith@email.com",
      "phone": "+1-555-0123",
      "experience": "5 years",
      "skills": ["React", "Node.js", "TypeScript"],
      "address": {
        "city": "New York",
        "state": "New York",
        "pincode": "10001"
      }
    },
    "status": "pending",
    "applied_on": 1705708800000,
    "updated_on": 1705708800000,
    "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
    "cover_letter": "I am excited to apply for this position...",
    "notes": null,
    "reviewed_by": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "reviewed_on": null
  }
}
```

### 3. POST `/job-applications` - Create Application

Create a new job application (user applies to a job).

**Request Body:**

```json
{
  "job_id": 1,
  "user_id": 101,
  "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
  "cover_letter": "I am excited to apply for this position. I have 5 years of experience...",
  "notes": null
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": "APP-001",
    "job_id": 1,
    "user_id": 101,
    "status": "pending",
    "applied_on": 1705708800000,
    "updated_on": 1705708800000,
    "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
    "cover_letter": "I am excited to apply for this position...",
    "notes": null
  },
  "message": "Application submitted successfully"
}
```

### 4. PATCH `/job-applications/:id` - Update Application Status

Update the status of a job application (e.g., shortlist, reject, hire).

**Request Body:**

```json
{
  "status": "shortlisted",
  "notes": "Candidate has strong React experience",
  "reviewed_by": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": "APP-001",
    "status": "shortlisted",
    "updated_on": 1705795200000,
    "notes": "Candidate has strong React experience",
    "reviewed_by": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "reviewed_on": 1705795200000
  },
  "message": "Application status updated successfully"
}
```

### 5. DELETE `/job-applications/:id` - Delete/Withdraw Application

Delete or withdraw a job application.

**Response:**

```json
{
  "success": true,
  "message": "Application withdrawn successfully"
}
```

### 6. GET `/job-applications/job/:job_id` - Get Applications for a Job

Get all applications for a specific job (used in AppliedUsersModal).

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "job": {
      "id": 1,
      "job_id": "JOB-001",
      "title": "Senior Software Engineer",
      "company_name": "TechCorp Solutions"
    },
    "items": [
      {
        "id": 1,
        "application_id": "APP-001",
        "user_id": 101,
        "user": {
          "id": 101,
          "name": "John Smith",
          "email": "john.smith@email.com",
          "phone": "+1-555-0123",
          "experience": "5 years",
          "skills": ["React", "Node.js", "TypeScript"]
        },
        "status": "pending",
        "applied_on": 1705708800000,
        "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf"
      }
    ]
  }
}
```

### 7. GET `/job-applications/user/:user_id` - Get Applications by User

Get all applications submitted by a specific user (used in User/Expert listing modals).

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "user": {
      "id": 101,
      "name": "John Smith",
      "email": "john.smith@email.com"
    },
    "items": [
      {
        "id": 1,
        "application_id": "APP-001",
        "job_id": 1,
        "job": {
          "id": 1,
          "job_id": "JOB-001",
          "title": "Senior Software Engineer",
          "company_name": "TechCorp Solutions",
          "location": {
            "city": "San Francisco",
            "state": "California",
            "pincode": "94102"
          }
        },
        "status": "pending",
        "applied_on": 1705708800000
      }
    ]
  }
}
```

## Data Structure

### Application Object

| Field            | Type   | Description                                     | Required |
| ---------------- | ------ | ----------------------------------------------- | -------- |
| `id`             | number | Unique identifier for the application           | Auto     |
| `application_id` | string | Auto-generated application ID (e.g., "APP-001") | Auto     |
| `job_id`         | number | ID of the job being applied to                  | Yes      |
| `job`            | object | Job details (included in GET responses)         | No       |
| `user_id`        | number | ID of the user applying                         | Yes      |
| `user`           | object | User details (included in GET responses)        | No       |
| `status`         | string | Application status (see below)                  | Yes      |
| `applied_on`     | number | Timestamp when application was submitted        | Auto     |
| `updated_on`     | number | Timestamp when application was last updated     | Auto     |
| `resume_url`     | string | URL to the user's resume file                   | Yes      |
| `cover_letter`   | string | Cover letter text (optional)                    | No       |
| `notes`          | string | Internal notes (for admin/recruiter)            | No       |
| `reviewed_by`    | object | Admin/recruiter who reviewed (if reviewed)      | No       |
| `reviewed_on`    | number | Timestamp when application was reviewed         | No       |

### Application Status Values

| Status        | Description                            |
| ------------- | -------------------------------------- |
| `pending`     | Application submitted, awaiting review |
| `shortlisted` | Application reviewed and shortlisted   |
| `rejected`    | Application rejected                   |
| `hired`       | Candidate hired for the position       |

### Nested Object: `job` (in GET responses)

| Field             | Type   | Description                               |
| ----------------- | ------ | ----------------------------------------- |
| `id`              | number | Job ID                                    |
| `job_id`          | string | Job identifier (e.g., "JOB-001")          |
| `title`           | string | Job title                                 |
| `description`     | string | Job description (full response only)      |
| `company_name`    | string | Company name                              |
| `location`        | object | Location object with city, state, pincode |
| `salary_range`    | object | Salary range (full response only)         |
| `employment_type` | string | Employment type (full response only)      |

### Nested Object: `user` (in GET responses)

| Field        | Type   | Description                           |
| ------------ | ------ | ------------------------------------- |
| `id`         | number | User ID                               |
| `name`       | string | User's full name                      |
| `email`      | string | User's email address                  |
| `phone`      | string | User's phone number                   |
| `experience` | string | Years of experience (e.g., "5 years") |
| `skills`     | array  | Array of user's skills                |
| `address`    | object | User address (full response only)     |

### Nested Object: `reviewed_by` (when application is reviewed)

| Field   | Type   | Description        |
| ------- | ------ | ------------------ |
| `id`    | number | Reviewer's user ID |
| `name`  | string | Reviewer's name    |
| `email` | string | Reviewer's email   |

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "job_id": "Job ID is required",
      "user_id": "User ID is required"
    }
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Application not found",
    "code": "NOT_FOUND"
  }
}
```

### 409 Conflict (Duplicate Application)

```json
{
  "success": false,
  "error": {
    "message": "User has already applied to this job",
    "code": "DUPLICATE_APPLICATION"
  }
}
```

## Example: Create Application Payload

```json
{
  "job_id": 1,
  "user_id": 101,
  "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
  "cover_letter": "I am excited to apply for the Senior Software Engineer position at TechCorp Solutions. With 5 years of experience in React and Node.js, I believe I would be a great fit for your team."
}
```

## Example: Update Application Status Payload

```json
{
  "status": "shortlisted",
  "notes": "Strong technical background. Recommended for technical interview.",
  "reviewed_by": 1
}
```

## Notes

1. **Field Naming**: All fields use snake_case to match the job API structure
2. **Timestamps**: All date fields (`applied_on`, `updated_on`, `reviewed_on`) use Unix timestamps in milliseconds
3. **Status Flow**: Applications typically flow: `pending` → `shortlisted` → `hired` or `pending` → `rejected`
4. **Duplicate Prevention**: Users should not be able to apply to the same job twice
5. **Resume Upload**: Resume URL should be provided after file upload to storage service
6. **Permissions**:
   - Users can create and delete their own applications
   - Admins/Recruiters can update application status
   - Users can view their own applications
   - Admins can view all applications
