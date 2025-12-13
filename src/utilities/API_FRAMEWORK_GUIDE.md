# API Framework Guide

This guide explains how to use the API framework for consistent loading, error, and success state management across all API integrations.

## Framework Components

### 1. Base API Utility (`src/utilities/api.js`)
- Handles HTTP requests with Bearer token authentication
- Automatic error handling and response parsing
- 401 error handling with token cleanup

### 2. Reusable Hooks

#### `useApi` Hook (`src/utilities/useApi.js`)
For single API operations (GET by ID, POST, PUT, DELETE, etc.)

#### `useApiList` Hook (`src/utilities/useApiList.js`)
For list operations with pagination support

## State Management Pattern

All API operations should follow this pattern:

### ✅ Loading State
- Set `loading = true` at the start of API call
- Set `loading = false` in `finally` block
- Show loader in UI when `loading === true`

### ✅ Error State
- Set `error = null` at the start
- Set `error = error object` in catch block
- Show error message using `message.error()`
- Display error in UI when `error !== null`

### ✅ Success State
- Process response data on success
- Show success message using `message.success()`
- Update UI with data when operation succeeds

## Implementation Pattern

### Standard Pattern for All API Operations

```javascript
const myApiOperation = useCallback(async (params) => {
  // 1. Set loading state
  setLoading(true);
  setError(null);

  try {
    // 2. Make API call
    const response = await apiService.someOperation(params);

    // 3. Process success response
    // - Update data state
    // - Show success message
    message.success("Operation completed successfully");
    
    // 4. Refresh data if needed
    await fetchData();

    return response;
  } catch (error) {
    // 5. Handle error
    console.error("Error:", error);
    setError(error);
    message.error(error.message || "Operation failed");
    throw error;
  } finally {
    // 6. Always reset loading state
    setLoading(false);
  }
}, [dependencies]);
```

## Example: Category Hook Implementation

```javascript
export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryService.getCategories(params);
      
      if (response.success && response.data) {
        setCategories(transformData(response.data));
      }
    } catch (error) {
      setError(error);
      message.error(error.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryService.createCategory(categoryData);
      message.success("Category created successfully");
      await fetchCategories(); // Refresh list
      return response;
    } catch (error) {
      setError(error);
      message.error(error.message || "Failed to create category");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
  };
};
```

## Component Usage

```javascript
const MyComponent = () => {
  const { categories, loading, error, fetchCategories } = useCategory();

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <Spin />; // Show loader
  }

  if (error) {
    return <Alert message={error.message} type="error" />; // Show error
  }

  return (
    <div>
      {/* Show data */}
      {categories.map(cat => <div key={cat.id}>{cat.name}</div>)}
    </div>
  );
};
```

## Checklist for API Integration

When integrating any new API, ensure:

- [ ] **Loading State**: `setLoading(true)` at start, `setLoading(false)` in finally
- [ ] **Error State**: `setError(null)` at start, `setError(error)` in catch
- [ ] **Error Message**: Show error message using `message.error()`
- [ ] **Success Message**: Show success message using `message.success()` (if applicable)
- [ ] **Data Update**: Update state with response data on success
- [ ] **UI Feedback**: Show loader when loading, error when error, data when success
- [ ] **Error Handling**: Proper try-catch-finally blocks
- [ ] **State Reset**: Reset error state at start of new operation

## Benefits

1. **Consistency**: All API calls follow the same pattern
2. **User Experience**: Users always see loading states and error messages
3. **Maintainability**: Easy to debug and maintain
4. **Reusability**: Pattern can be applied to any API integration
5. **Error Handling**: Centralized error handling with user-friendly messages





