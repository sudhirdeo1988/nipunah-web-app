# Categories API Endpoint Specification

## GET /categories

Fetch categories with pagination, sorting, search, and date filtering support.

### Endpoint
```
GET /categories
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Field to sort by: `"name"` or `"createdAt"` (default: `"name"`) | `"name"` |
| `order` | string | No | Sort order: `"asc"` or `"desc"` (default: `"asc"`) | `"asc"` |
| `search` | string | No | Search query to filter by category name | `"technology"` |
| `createdDate` | string | No | Date for filtering by creation date (format: `YYYY-MM-DD`) | `"2024-01-15"` |

### Example Requests

#### Basic Request
```
GET /categories?page=1&limit=10
```

#### With Sorting
```
GET /categories?page=1&limit=10&sortBy=name&order=asc
```

#### With Search
```
GET /categories?page=1&limit=10&search=technology
```

#### With Date Filter
```
GET /categories?page=1&limit=10&createdDate=2024-01-15
```

#### Complete Example (All Parameters)
```
GET /categories?page=1&limit=10&sortBy=createdAt&order=desc&search=tech&createdDate=2024-01-15
```

### Response Format

```json
{
  "success": true,
  "data": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12,
    "items": [
      {
        "id": 1,
        "name": "Technology",
        "createdAt": "1733275564",
        "updatedAt": "1733275564",
        "subCategories": {
          "total": 20,
          "page": 1,
          "limit": 5,
          "totalPages": 4,
          "items": [
            {
              "id": 1,
              "name": "Web Development",
              "createdAt": "1733275564",
              "updatedAt": "1733275564",
              "categoryId": 1
            }
          ]
        }
      }
    ]
  }
}
```

### Date Filter Behavior

- **`createdDate`**: Filter categories created on this specific date
- Date format must be `YYYY-MM-DD` (e.g., `"2024-01-15"`)
- Date should be compared against the `createdAt` field (Unix timestamp)
- Filter should match categories created on the entire day (00:00:00 to 23:59:59)

### Implementation Notes

1. **Date Comparison**: The backend should convert `createdDate` (YYYY-MM-DD format) to Unix timestamp range for comparison with the `createdAt` field.

2. **Date Matching**: When `createdDate` is provided:
   - Convert date to start of day (00:00:00) and end of day (23:59:59)
   - Filter: `createdAt >= startOfDay` AND `createdAt <= endOfDay`
   - Example: `createdDate=2024-01-15` should match all categories created on January 15, 2024

3. **Combined Filters**: All filters (pagination, sorting, search, date) should work together:
   - First apply date filter
   - Then apply search filter
   - Then apply sorting
   - Finally apply pagination

### Error Responses

```json
{
  "success": false,
  "message": "Invalid date format. Expected YYYY-MM-DD",
  "error": "VALIDATION_ERROR"
}
```

### Backend Implementation Example (Node.js/Express)

```javascript
// Example backend implementation
app.get('/categories', async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    order = 'asc',
    search,
    createdDateFrom,
    createdDateTo
  } = req.query;

  // Build query
  let query = {};

  // Date filter
  if (createdDate) {
    const filterDate = new Date(createdDate);
    const startOfDay = new Date(filterDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filterDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.createdAt = {
      $gte: Math.floor(startOfDay.getTime() / 1000), // Unix timestamp
      $lte: Math.floor(endOfDay.getTime() / 1000)     // Unix timestamp
    };
  }

  // Search filter
  if (search) {
    query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = order === 'asc' ? 1 : -1;

  // Calculate skip
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Get total count
    const total = await Category.countDocuments(query);

    // Get categories
    const items = await Category.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('subCategories'); // If using subcategories

    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

