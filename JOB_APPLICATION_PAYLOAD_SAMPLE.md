# Job Application Payload Sample

Payload structure for when a user applies to a job via the API endpoint `POST /job-applications`.

## Sample Payload

```json
{
  "job_id": 1,
  "user_id": 101,
  "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf",
  "cover_letter": "I am excited to apply for the Senior Software Engineer position at TechCorp Solutions. With 5 years of experience in React and Node.js, I believe I would be a great fit for your team.",
  "notes": null
}
```

## Field Descriptions

### Required Fields

| Field        | Type   | Description                            | Example                                          |
| ------------ | ------ | -------------------------------------- | ------------------------------------------------ |
| `job_id`     | number | ID of the job being applied to         | 1                                                |
| `user_id`    | number | ID of the user applying                | 101                                              |
| `resume_url` | string | URL to the user's uploaded resume file | "https://storage.example.com/resumes/resume.pdf" |

### Optional Fields

| Field          | Type   | Description                                          | Example                    |
| -------------- | ------ | ---------------------------------------------------- | -------------------------- |
| `cover_letter` | string | Cover letter text explaining why user wants the job  | "I am excited to apply..." |
| `notes`        | string | Additional notes (usually null for user submissions) | null                       |

## Additional Sample Payloads

### Example 1: Minimal Payload (Required Fields Only)

```json
{
  "job_id": 1,
  "user_id": 101,
  "resume_url": "https://storage.example.com/resumes/john-smith-resume.pdf"
}
```

### Example 2: Complete Payload with Cover Letter

```json
{
  "job_id": 2,
  "user_id": 102,
  "resume_url": "https://storage.example.com/resumes/sarah-johnson-resume.pdf",
  "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Frontend Developer position at Global Logistics Inc. With 4 years of experience in React and JavaScript, I am confident that I possess the skills and passion needed to contribute to your team.\n\nIn my current role, I have successfully developed and maintained multiple React applications, improving user experience and performance. I am particularly drawn to this opportunity because of your company's innovative approach to logistics technology.\n\nI would welcome the opportunity to discuss how my experience and skills align with your team's needs.\n\nBest regards,\nSarah Johnson",
  "notes": null
}
```

### Example 3: Application with Notes (Admin/Recruiter Use)

```json
{
  "job_id": 3,
  "user_id": 103,
  "resume_url": "https://storage.example.com/resumes/mike-wilson-resume.pdf",
  "cover_letter": "I am interested in the DevOps Engineer position. I have extensive experience with AWS, Docker, and Kubernetes.",
  "notes": "Internal note: Candidate referred by employee #45"
}
```

## Success Response

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
    "cover_letter": "I am excited to apply for the Senior Software Engineer position...",
    "notes": null
  },
  "message": "Application submitted successfully"
}
```

## Error Responses

### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "job_id": "Job ID is required",
      "user_id": "User ID is required",
      "resume_url": "Resume URL is required"
    }
  }
}
```

### 404 Not Found - Invalid Job ID

```json
{
  "success": false,
  "error": {
    "message": "Job not found",
    "code": "JOB_NOT_FOUND"
  }
}
```

### 404 Not Found - Invalid User ID

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  }
}
```

### 409 Conflict - Duplicate Application

```json
{
  "success": false,
  "error": {
    "message": "User has already applied to this job",
    "code": "DUPLICATE_APPLICATION"
  }
}
```

## Field Details

### `job_id`

- **Type**: number
- **Required**: Yes
- **Description**: The unique identifier of the job the user wants to apply to
- **Validation**: Must be a valid job ID that exists in the system
- **Example**: `1`, `2`, `100`

### `user_id`

- **Type**: number
- **Required**: Yes
- **Description**: The unique identifier of the user applying for the job
- **Validation**: Must be a valid user ID that exists in the system
- **Example**: `101`, `102`, `500`

### `resume_url`

- **Type**: string
- **Required**: Yes
- **Description**: Full URL to the uploaded resume file
- **Validation**:
  - Must be a valid URL
  - Should point to an accessible file (PDF, DOC, DOCX typically)
  - File should be uploaded to storage service before creating application
- **Example**:
  - `"https://storage.example.com/resumes/john-smith-resume.pdf"`
  - `"https://s3.amazonaws.com/bucket/resumes/user-101-resume.pdf"`

### `cover_letter`

- **Type**: string
- **Required**: No
- **Description**: Cover letter text explaining why the user wants the job
- **Validation**:
  - Can be null or empty string
  - If provided, should be a non-empty string
  - Maximum length typically 5000 characters
- **Example**:
  - `"I am excited to apply for this position..."`
  - `null`
  - `""`

### `notes`

- **Type**: string | null
- **Required**: No
- **Description**: Internal notes (usually used by admins/recruiters, not users)
- **Validation**: Can be null or string
- **Example**:
  - `null` (for user submissions)
  - `"Referred by employee #45"` (for admin use)

## Workflow Example

### Step 1: Upload Resume

First, upload the resume file to your storage service:

```javascript
// Upload resume file
const formData = new FormData();
formData.append("resume", file);

const uploadResponse = await axios.post("/upload/resume", formData);
// Response: { "url": "https://storage.example.com/resumes/resume-123.pdf" }
```

### Step 2: Create Application

Then, use the resume URL in the application payload:

```javascript
const applicationPayload = {
  job_id: 1,
  user_id: 101,
  resume_url: uploadResponse.data.url,
  cover_letter: "I am excited to apply for this position...",
};

const response = await axios.post("/job-applications", applicationPayload);
```

## Validation Rules

- `job_id`: Required, must be a positive integer, must exist in the system
- `user_id`: Required, must be a positive integer, must exist in the system
- `resume_url`: Required, must be a valid URL string, must be accessible
- `cover_letter`: Optional, if provided must be a non-empty string (max 5000 characters)
- `notes`: Optional, can be null or string

## Business Rules

1. **Duplicate Prevention**: A user cannot apply to the same job twice. If they try, they will receive a 409 Conflict error.

2. **Resume Upload**: The resume must be uploaded to a storage service (S3, Cloud Storage, etc.) before creating the application. The URL returned from the upload service should be used in `resume_url`.

3. **Status**: New applications are automatically set to `"pending"` status.

4. **Timestamps**: `applied_on` and `updated_on` are automatically set by the backend when the application is created.

5. **Application ID**: `application_id` (e.g., "APP-001") is auto-generated by the backend.

6. **User Permissions**:
   - Users can only create applications with their own `user_id`
   - Users cannot set `notes` field (reserved for admins/recruiters)

## API Usage Example

```javascript
import { jobApplicationService } from "@/utilities/apiServices";

// Prepare payload
const payload = {
  job_id: 1,
  user_id: 101,
  resume_url: "https://storage.example.com/resumes/john-smith-resume.pdf",
  cover_letter:
    "I am excited to apply for the Senior Software Engineer position...",
  notes: null,
};

// Submit application
try {
  const response = await jobApplicationService.createApplication(payload);
  console.log("Application submitted:", response.data);
  // Application ID: response.data.application_id
} catch (error) {
  if (error.response?.status === 409) {
    console.error("Already applied to this job");
  } else if (error.response?.status === 404) {
    console.error("Job or user not found");
  } else {
    console.error("Error submitting application:", error);
  }
}
```

## Notes

1. **Resume Upload**: Always upload the resume file first and use the returned URL in the payload
2. **User ID**: In most cases, the `user_id` will be extracted from the authenticated session, but it can also be explicitly provided
3. **Cover Letter**: While optional, a well-written cover letter can improve application chances
4. **Error Handling**: Always handle duplicate application errors (409) and validation errors (400)
5. **File Formats**: Common resume formats include PDF, DOC, DOCX. Check with your backend for supported formats
