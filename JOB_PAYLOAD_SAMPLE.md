# Job Creation Payload Sample

Based on the job management module structure, here's a sample payload for creating a new job via the API endpoint `POST /jobs`.

## Sample Payload

```json
{
  "title": "Senior Software Engineer",
  "posted_by": {
    "company_id": 1,
    "company_name": "TechCorp Solutions",
    "company_short_name": "TechCorp"
  },
  "experience_required": "5-8 years",
  "salary_range": {
    "min": "$120,000",
    "max": "$150,000"
  },
  "location": {
    "city": "San Francisco",
    "state": "California",
    "pincode": "94102"
  },
  "description": "Full-stack development role",
  "employment_type": "Full-time",
  "skills_required": ["React", "Node.js"],
  "application_deadline": 1708214400000,
  "status": "pending",
  "isActive": true
}
```

## Field Descriptions

### Required Fields

| Field                  | Type   | Description                                           | Example                                            |
| ---------------------- | ------ | ----------------------------------------------------- | -------------------------------------------------- |
| `title`                | string | Job title/position name                               | "Senior Software Engineer"                         |
| `posted_by`            | object | Company information that posted the job               | See below                                          |
| `experience_required`  | string | Required years of experience                          | "5-8 years", "3-5 years", "0-1 years"              |
| `salary_range`         | object | Salary range for the position                         | See below                                          |
| `location`             | object | Job location details                                  | See below                                          |
| `description`          | string | Detailed job description                              | "Full-stack development role..."                   |
| `employment_type`      | string | Type of employment                                    | "Full-time", "Part-time", "Contract", "Internship" |
| `skills_required`      | array  | Array of required skills                              | ["React", "Node.js", "AWS"]                        |
| `application_deadline` | number | Application deadline (Unix timestamp in milliseconds) | 1708214400000                                      |

### Optional Fields

| Field      | Type    | Description                         | Default   | Example                          |
| ---------- | ------- | ----------------------------------- | --------- | -------------------------------- |
| `status`   | string  | Job approval status                 | "pending" | "pending", "approved", "blocked" |
| `isActive` | boolean | Whether the job is currently active | true      | true, false                      |

### Nested Object: `posted_by`

| Field                | Type   | Description                       | Example              |
| -------------------- | ------ | --------------------------------- | -------------------- |
| `company_id`         | number | Unique identifier for the company | 1                    |
| `company_name`       | string | Full company name                 | "TechCorp Solutions" |
| `company_short_name` | string | Short/abbreviated company name    | "TechCorp"           |

### Nested Object: `salary_range`

| Field | Type   | Description    | Example    |
| ----- | ------ | -------------- | ---------- |
| `min` | string | Minimum salary | "$120,000" |
| `max` | string | Maximum salary | "$150,000" |

### Nested Object: `location`

| Field     | Type   | Description         | Example         |
| --------- | ------ | ------------------- | --------------- |
| `city`    | string | City name           | "San Francisco" |
| `state`   | string | State/Province name | "California"    |
| `pincode` | string | Postal/ZIP code     | "94102"         |

## Additional Sample Payloads

### Example 1: Remote Full-time Position

```json
{
  "title": "DevOps Engineer",
  "posted_by": {
    "company_id": 1,
    "company_name": "TechCorp Solutions",
    "company_short_name": "TechCorp"
  },
  "experience_required": "4-6 years",
  "salary_range": {
    "min": "$110,000",
    "max": "$140,000"
  },
  "location": {
    "city": "Remote",
    "state": "Remote",
    "pincode": "00000"
  },
  "description": "Cloud infrastructure and deployment automation. Manage CI/CD pipelines and container orchestration.",
  "employment_type": "Full-time",
  "skills_required": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  "application_deadline": 1710460800000,
  "status": "pending",
  "isActive": true
}
```

### Example 2: Part-time Position

```json
{
  "title": "Frontend Developer",
  "posted_by": {
    "company_id": 2,
    "company_name": "Global Logistics Inc",
    "company_short_name": "GLI"
  },
  "experience_required": "2-4 years",
  "salary_range": {
    "min": "$50,000",
    "max": "$70,000"
  },
  "location": {
    "city": "Miami",
    "state": "Florida",
    "pincode": "33101"
  },
  "description": "React and JavaScript development for logistics management platform.",
  "employment_type": "Part-time",
  "skills_required": ["React", "JavaScript", "CSS", "HTML", "Redux"],
  "application_deadline": 1709251200000,
  "status": "pending",
  "isActive": true
}
```

### Example 3: Entry-level Position

```json
{
  "title": "Junior Software Developer",
  "posted_by": {
    "company_id": 3,
    "company_name": "StartupXYZ",
    "company_short_name": "XYZ"
  },
  "experience_required": "0-1 years",
  "salary_range": {
    "min": "$60,000",
    "max": "$80,000"
  },
  "location": {
    "city": "Austin",
    "state": "Texas",
    "pincode": "78701"
  },
  "description": "Entry-level position for recent graduates. Opportunity to work on cutting-edge AI solutions.",
  "employment_type": "Full-time",
  "skills_required": ["Python", "JavaScript", "Git", "Basic Machine Learning"],
  "application_deadline": 1711929600000,
  "status": "pending",
  "isActive": true
}
```

## Notes

1. **Auto-generated Fields**: The following fields are typically auto-generated by the backend and should NOT be included in the creation payload:

   - `id` - Auto-generated unique identifier
   - `job_id` - Auto-generated job ID (e.g., "JOB-001")
   - `people_applied` - Starts at 0, incremented when users apply
   - `posted_on` - Set to current date/time by backend
   - `updated_on` - Set to current date/time by backend

2. **Status Values**:

   - `"pending"` - Job is awaiting approval (default for new jobs)
   - `"approved"` - Job has been approved and is visible
   - `"blocked"` - Job has been blocked/hidden

3. **Employment Type Values**:

   - `"Full-time"`
   - `"Part-time"`
   - `"Contract"`
   - `"Internship"`

4. **Timestamp Format**: Use Unix timestamp in milliseconds for `application_deadline`. In JavaScript, you can get the timestamp using `new Date('2024-02-18').getTime()` or `Date.now()` for current timestamp.

5. **Salary Range Object**: The `salary_range` field must be an object with `min` and `max` fields:

   ```json
   "salary_range": {
     "min": "$120,000",
     "max": "$150,000"
   }
   ```

6. **Location Object**: The `location` field must be an object with `city`, `state`, and `pincode` fields. For remote positions, you can use:

   ```json
   "location": {
     "city": "Remote",
     "state": "Remote",
     "pincode": "00000"
   }
   ```

7. **API Usage**:

   ```javascript
   import { jobService } from "@/utilities/apiServices";

   const payload = {
     /* your payload here */
   };
   const response = await jobService.createJob(payload);
   ```

## Validation Rules

- `title`: Required, should be a non-empty string
- `posted_by.company_id`: Required, should be a valid company ID
- `experience_required`: Required, typically in format "X-Y years" or "X+ years"
- `salary_range`: Required, must be an object with `min` and `max` fields
- `salary_range.min`: Required, non-empty string representing minimum salary
- `salary_range.max`: Required, non-empty string representing maximum salary
- `location`: Required, must be an object with `city`, `state`, and `pincode` fields
- `location.city`: Required, non-empty string
- `location.state`: Required, non-empty string
- `location.pincode`: Required, non-empty string (can be "00000" for remote positions)
- `description`: Required, non-empty string
- `employment_type`: Required, must be one of the valid employment types
- `skills_required`: Required, must be a non-empty array
- `application_deadline`: Required, must be a valid future timestamp (Unix milliseconds)
