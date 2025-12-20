# API Framework Usage Examples

This document provides practical examples of using the API framework with proper loading, error, and success states.

## Example 1: Using useApi Hook (Single Operations)

```javascript
import { useApi } from "@/utilities/useApi";
import { userService } from "@/utilities/apiServices";

const UserProfile = ({ userId }) => {
  const {
    data: user,
    loading,
    error,
    execute,
    isSuccess,
    isError,
  } = useApi(
    () => userService.getUserById(userId),
    {
      autoExecute: true,
      showErrorMessage: true,
      errorMessage: "Failed to load user profile",
      onSuccess: (data) => {
        console.log("User loaded:", data);
      },
    }
  );

  if (loading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" />;
  if (isSuccess) return <div>{user.name}</div>;
};
```

## Example 2: Using useApiList Hook (List Operations)

```javascript
import { useApiList } from "@/utilities/useApiList";
import { categoryService } from "@/utilities/apiServices";

const CategoryList = () => {
  const {
    data: categories,
    loading,
    error,
    pagination,
    execute,
    refresh,
  } = useApiList(
    (params) => categoryService.getCategories(params),
    {
      autoExecute: true,
      showErrorMessage: true,
      transformData: (items) => items.map(item => ({
        id: item.id,
        name: item.name,
      })),
    }
  );

  if (loading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" />;

  return (
    <Table
      dataSource={categories}
      loading={loading}
      pagination={pagination}
    />
  );
};
```

## Example 3: Manual State Management (Current Pattern)

```javascript
const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (params = {}) => {
    // ✅ Set loading state
    setLoading(true);
    // ✅ Reset error state
    setError(null);

    try {
      // ✅ Make API call
      const response = await categoryService.getCategories(params);

      // ✅ Process success response
      if (response.success && response.data) {
        setCategories(transformData(response.data));
      }
    } catch (err) {
      // ✅ Handle error
      setError(err);
      message.error(err.message || "Failed to fetch categories");
    } finally {
      // ✅ Always reset loading
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    // ✅ Set loading state
    setLoading(true);
    // ✅ Reset error state
    setError(null);

    try {
      // ✅ Make API call
      const response = await categoryService.createCategory({
        name: categoryData.categoryName,
      });

      // ✅ Show success message
      message.success("Category created successfully");

      // ✅ Refresh list
      await fetchCategories();

      return response;
    } catch (err) {
      // ✅ Handle error
      setError(err);
      message.error(err.message || "Failed to create category");
      throw err;
    } finally {
      // ✅ Always reset loading
      setLoading(false);
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,  // ✅ Expose loading state
    error,    // ✅ Expose error state
    fetchCategories,
    createCategory,
  };
};
```

## Example 4: Component with All States

```javascript
const CategoryPage = () => {
  const { categories, loading, error, fetchCategories } = useCategory();

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Loading State - Show loader
  if (loading && categories.length === 0) {
    return (
      <div className="text-center p-5">
        <Spin size="large" />
        <p>Loading categories...</p>
      </div>
    );
  }

  // ✅ Error State - Show error message
  if (error && categories.length === 0) {
    return (
      <Alert
        message="Error"
        description={error.message || "Failed to load categories"}
        type="error"
        showIcon
        action={
          <Button onClick={() => fetchCategories()}>Retry</Button>
        }
      />
    );
  }

  // ✅ Success State - Show data
  return (
    <div>
      <Table
        dataSource={categories}
        loading={loading} // Show loading spinner in table
        // ... other props
      />
    </div>
  );
};
```

## State Management Checklist

For every API operation, ensure:

### ✅ Loading State
- [ ] Set `loading = true` at start
- [ ] Set `loading = false` in finally block
- [ ] Show loader in UI (Spin component or table loading prop)

### ✅ Error State
- [ ] Set `error = null` at start
- [ ] Set `error = error object` in catch block
- [ ] Show error message using `message.error()`
- [ ] Display error in UI (Alert component)

### ✅ Success State
- [ ] Process response data
- [ ] Show success message using `message.success()` (if applicable)
- [ ] Update state with data
- [ ] Refresh related data if needed

## Best Practices

1. **Always use try-catch-finally** for API calls
2. **Reset error state** at the start of each operation
3. **Show user-friendly error messages** - don't expose technical details
4. **Provide retry options** for failed operations
5. **Show loading indicators** - users should know something is happening
6. **Handle empty states** - show appropriate message when no data
7. **Success feedback** - confirm successful operations with messages








