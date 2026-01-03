# Job GET API Response Format

Mock response format for the GET `/jobs` API endpoint with pagination.

## Response Structure

```json
{
  "success": true,
  "data": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "items": [
      {
        "id": 1,
        "job_id": "JOB-001",
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
        "people_applied": 25,
        "posted_on": 1705536000000,
        "updated_on": 1705708800000,
        "status": "approved",
        "description": "Full-stack development role with React and Node.js. We are looking for an experienced software engineer to join our dynamic team.",
        "employment_type": "Full-time",
        "skills_required": ["React", "Node.js", "AWS", "TypeScript", "MongoDB"],
        "application_deadline": 1708214400000,
        "isActive": true
      },
      {
        "id": 2,
        "job_id": "JOB-002",
        "title": "Frontend Developer",
        "posted_by": {
          "company_id": 1,
          "company_name": "TechCorp Solutions",
          "company_short_name": "TechCorp"
        },
        "experience_required": "3-5 years",
        "salary_range": {
          "min": "$90,000",
          "max": "$120,000"
        },
        "location": {
          "city": "San Francisco",
          "state": "California",
          "pincode": "94103"
        },
        "people_applied": 18,
        "posted_on": 1705708800000,
        "updated_on": 1705881600000,
        "status": "approved",
        "description": "React and JavaScript development for modern web applications. Build responsive and interactive user interfaces.",
        "employment_type": "Full-time",
        "skills_required": ["React", "JavaScript", "CSS", "HTML", "Redux"],
        "application_deadline": 1708300800000,
        "isActive": true
      },
      {
        "id": 3,
        "job_id": "JOB-003",
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
        "people_applied": 22,
        "posted_on": 1706313600000,
        "updated_on": 1706486400000,
        "status": "pending",
        "description": "Cloud infrastructure and deployment automation. Manage CI/CD pipelines and container orchestration.",
        "employment_type": "Full-time",
        "skills_required": [
          "AWS",
          "Docker",
          "Kubernetes",
          "CI/CD",
          "Terraform"
        ],
        "application_deadline": 1708992000000,
        "isActive": true
      }
    ]
  }
}
```

## Response Fields Description

### Top Level

| Field     | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| `success` | boolean | Indicates if the request was successful |
| `data`    | object  | Contains pagination and job items       |

### Data Object

| Field        | Type   | Description                           |
| ------------ | ------ | ------------------------------------- |
| `total`      | number | Total number of jobs matching filters |
| `page`       | number | Current page number (1-indexed)       |
| `limit`      | number | Number of items per page              |
| `totalPages` | number | Total number of pages                 |
| `items`      | array  | Array of job objects                  |

### Job Item Object

| Field                  | Type    | Description                                              |
| ---------------------- | ------- | -------------------------------------------------------- |
| `id`                   | number  | Unique identifier for the job                            |
| `job_id`               | string  | Auto-generated job ID (e.g., "JOB-001")                  |
| `title`                | string  | Job title/position name                                  |
| `posted_by`            | object  | Company information (see below)                          |
| `experience_required`  | string  | Required years of experience                             |
| `salary_range`         | object  | Salary range with min and max (see below)                |
| `location`             | object  | Location details with city, state, pincode               |
| `people_applied`       | number  | Number of people who applied                             |
| `posted_on`            | number  | Timestamp when job was posted (Unix milliseconds)        |
| `updated_on`           | number  | Timestamp when job was last updated (Unix milliseconds)  |
| `status`               | string  | Job status: "approved", "pending", "blocked"             |
| `description`          | string  | Detailed job description                                 |
| `employment_type`      | string  | Type: "Full-time", "Part-time", "Contract", "Internship" |
| `skills_required`      | array   | Array of required skills                                 |
| `application_deadline` | number  | Application deadline timestamp (Unix milliseconds)       |
| `isActive`             | boolean | Whether the job is currently active                      |

### Nested Object: `posted_by`

| Field                | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| `company_id`         | number | Unique identifier for the company |
| `company_name`       | string | Full company name                 |
| `company_short_name` | string | Short/abbreviated company name    |

### Nested Object: `salary_range`

| Field | Type   | Description    |
| ----- | ------ | -------------- |
| `min` | string | Minimum salary |
| `max` | string | Maximum salary |

### Nested Object: `location`

| Field     | Type   | Description         |
| --------- | ------ | ------------------- |
| `city`    | string | City name           |
| `state`   | string | State/Province name |
| `pincode` | string | Postal/ZIP code     |

## Example: Empty Response

```json
{
  "success": true,
  "data": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0,
    "items": []
  }
}
```

## Example: Paginated Response (Page 2)

```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 2,
    "limit": 10,
    "totalPages": 3,
    "items": [
      {
        "id": 11,
        "job_id": "JOB-011",
        "title": "Product Manager",
        "posted_by": {
          "company_id": 2,
          "company_name": "Global Logistics Inc",
          "company_short_name": "GLI"
        },
        "experience_required": "5-7 years",
        "salary_range": {
          "min": "$130,000",
          "max": "$160,000"
        },
        "location": {
          "city": "Miami",
          "state": "Florida",
          "pincode": "33101"
        },
        "people_applied": 8,
        "posted_on": 1705276800000,
        "updated_on": 1705449600000,
        "status": "approved",
        "description": "Lead product development initiatives and manage product roadmap.",
        "employment_type": "Full-time",
        "skills_required": ["Product Management", "Agile", "Analytics"],
        "application_deadline": 1707955200000,
        "isActive": true
      }
    ]
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE"
  }
}
```

## Notes

1. **Field Naming**: All fields use snake_case to match the payload structure
2. **Pagination**: The response includes pagination metadata for client-side pagination handling
3. **Location Format**: Location is returned as an object. Frontend may need to format it as a string for display (e.g., "San Francisco, California 94102")
4. **Salary Range Format**: Salary range is returned as an object. Frontend may need to format it as a string for display (e.g., "$120,000 - $150,000")
5. **Timestamp Format**: All date fields (`posted_on`, `updated_on`, `application_deadline`) are Unix timestamps in milliseconds. Use `new Date(timestamp)` in JavaScript to convert to Date object.
6. **Status Values**:
   - `"approved"` - Job is approved and visible
   - `"pending"` - Job is awaiting approval
   - `"blocked"` - Job is blocked/hidden
