import React from "react";

class CategoryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Category Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h3 className="text-danger">
            Something went wrong with the category listing.
          </h3>
          <p className="text-muted">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            className="C-button is-bordered"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CategoryErrorBoundary;
