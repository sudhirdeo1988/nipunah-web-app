# API Utility Usage Guide

This document explains how to use the centralized API utility for making HTTP requests in the application.

## Setup

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add the following environment variable:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://64.227.184.238/api/
   ```

## Bearer Token Authentication

The API utility automatically handles Bearer token authentication for protected routes:

- **Automatic Token Injection**: By default, all API calls include the Bearer token from cookies
- **401 Error Handling**: Automatically clears expired/invalid tokens and can trigger logout
- **Token Override**: You can pass a token directly if needed
- **Public Endpoints**: Use `includeAuth: false` for public endpoints that don't require authentication

## Basic Usage

### Import the API utility

```javascript
import api from "@/utilities/api";
```

### GET Request

```javascript
// Simple GET request
const users = await api.get("/users");

// GET with query parameters
const filteredUsers = await api.get("/users", {
  params: {
    page: 1,
    limit: 10,
    search: "john"
  }
});

// GET without authentication
const publicData = await api.get("/public/data", {
  includeAuth: false
});
```

### POST Request

```javascript
// POST with body
const newUser = await api.post("/users", {
  body: {
    name: "John Doe",
    email: "john@example.com"
  }
});

// POST with query parameters
const result = await api.post("/users", {
  body: { name: "John" },
  params: { notify: true }
});
```

### PUT Request

```javascript
// Update resource
const updatedUser = await api.put("/users/123", {
  body: {
    name: "Jane Doe",
    email: "jane@example.com"
  }
});
```

### PATCH Request

```javascript
// Partial update
const patchedUser = await api.patch("/users/123", {
  body: {
    email: "newemail@example.com"
  }
});
```

### DELETE Request

```javascript
// Delete resource
await api.delete("/users/123");

// Delete with query parameters
await api.delete("/users/123", {
  params: { force: true }
});
```

## Advanced Usage

### Custom Headers

```javascript
const data = await api.get("/endpoint", {
  headers: {
    "X-Custom-Header": "value",
    "Accept-Language": "en-US"
  }
});
```

### Error Handling

```javascript
try {
  const data = await api.get("/users");
  console.log("Success:", data);
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized - token is automatically cleared
    console.error("Unauthorized - redirecting to login");
    // The token has already been cleared from cookies
    // You can redirect to login page here
  } else if (error.status === 404) {
    // Handle not found
    console.error("Resource not found");
  } else {
    // Handle other errors
    console.error("Error:", error.message);
    console.error("Error data:", error.data);
  }
}
```

### Bearer Token Authentication

The API utility automatically includes Bearer tokens for protected routes:

```javascript
// Protected route - Bearer token automatically included from cookies
const userProfile = await api.get("/me");

// Protected route with custom token (overrides cookie token)
const userProfile = await api.get("/me", {
  token: "your-custom-token-here"
});

// Public route - no Bearer token included
const publicData = await api.get("/public/data", {
  includeAuth: false
});
```

### Handling 401 Errors (Authentication Failures)

When a 401 error occurs, the API utility automatically:
1. Clears the token from cookies
2. Calls your custom `onAuthError` callback if provided
3. Sets `error.isAuthError = true` on the error object

```javascript
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utilities/api";
import { ROUTES } from "@/constants/routes";

const MyComponent = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const fetchProtectedData = async () => {
    try {
      const data = await api.get("/protected-endpoint", {
        onAuthError: (response, errorData) => {
          // Custom handler for 401 errors
          console.warn("Token expired or invalid", errorData);
          logout();
          router.push(ROUTES.PUBLIC.LOGIN);
        }
      });
      return data;
    } catch (error) {
      if (error.isAuthError) {
        // Token was already cleared, handle logout/redirect
        logout();
        router.push(ROUTES.PUBLIC.LOGIN);
      } else {
        // Handle other errors
        console.error("Error:", error.message);
      }
    }
  };
};
```

### Without Authentication

```javascript
// Public endpoint - no auth token included
const publicData = await api.get("/public/data", {
  includeAuth: false
});
```

### Raw Request (for custom use cases)

```javascript
const data = await api.request("/custom-endpoint", {
  method: "POST",
  body: { custom: "data" },
  headers: { "X-Custom": "header" },
  params: { query: "param" }
});
```

## Examples

### Fetching User Profile

```javascript
import api from "@/utilities/api";

const fetchUserProfile = async (userId) => {
  try {
    const user = await api.get(`/users/${userId}`);
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};
```

### Creating a Company

```javascript
import api from "@/utilities/api";

const createCompany = async (companyData) => {
  try {
    const company = await api.post("/companies", {
      body: companyData
    });
    return company;
  } catch (error) {
    console.error("Failed to create company:", error);
    throw error;
  }
};
```

### Updating a Job

```javascript
import api from "@/utilities/api";

const updateJob = async (jobId, updates) => {
  try {
    const job = await api.patch(`/jobs/${jobId}`, {
      body: updates
    });
    return job;
  } catch (error) {
    console.error("Failed to update job:", error);
    throw error;
  }
};
```

### Paginated Listing

```javascript
import api from "@/utilities/api";

const fetchJobs = async (page = 1, limit = 10) => {
  try {
    const jobs = await api.get("/jobs", {
      params: {
        page,
        limit,
        sort: "created_at",
        order: "desc"
      }
    });
    return jobs;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    throw error;
  }
};
```

## Features

- ✅ **Automatic Bearer token injection** - Tokens from cookies are automatically included in headers
- ✅ **401 Error Handling** - Automatically clears expired/invalid tokens
- ✅ **Token Override Support** - Pass tokens directly when needed
- ✅ **Consistent error handling** - Standardized error objects with status codes
- ✅ **Query parameter handling** - Easy URL parameter management
- ✅ **JSON request/response handling** - Automatic serialization/deserialization
- ✅ **Support for all HTTP methods** - GET, POST, PUT, PATCH, DELETE
- ✅ **Custom headers support** - Add any custom headers you need
- ✅ **Works in both client and server components** - Universal compatibility
- ✅ **Type-safe error objects** - Error objects include status, statusText, data, and isAuthError flags

## Environment Variables

The API base URL is configured via environment variables:

- **Client-side**: `NEXT_PUBLIC_API_BASE_URL` (required)
- **Server-side**: `API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL` (fallback)

The utility will automatically use the correct base URL based on the execution context.

