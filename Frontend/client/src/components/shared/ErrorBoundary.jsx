import React, { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Default fallback UI shown when an uncaught error is intercepted by ErrorBoundary
 */
export function DefaultErrorFallback({ error, errorInfo, resetErrorBoundary }) {
  const [showDetails, setShowDetails] = React.useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-error)] via-[var(--color-gold)] to-[var(--color-navy)]" />

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)] flex items-center justify-center text-[var(--color-error)] shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
        </div>

        {/* Text Heading */}
        <div className="space-y-2">
          <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-error)] bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] px-2.5 py-0.5 rounded-full">
            Application Error
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            An unexpected error occurred while rendering this section. You can try refreshing or returning to the home page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-95"
              style={{ backgroundColor: "var(--color-navy)" }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--color-surface-2)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>
          <button
            onClick={handleReload}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Reload Page
          </button>
        </div>

        {/* Expandable Technical Details */}
        {error && (
          <div className="text-left pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition font-mono flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span>{showDetails ? "▼" : "▶"}</span>
              <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
            </button>
            {showDetails && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-error)] overflow-x-auto max-h-48 overflow-y-auto space-y-2">
                <p className="font-semibold">{error.name}: {error.message}</p>
                {error.stack && (
                  <pre className="text-[11px] opacity-80 whitespace-pre-wrap">{error.stack}</pre>
                )}
                {errorInfo?.componentStack && (
                  <pre className="text-[10px] text-[var(--color-text-muted)] opacity-70 whitespace-pre-wrap border-t border-[var(--color-border)] pt-2 mt-2">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ErrorBoundary catches runtime JavaScript errors in child component trees,
 * logs the errors, and displays a graceful fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => !Object.is(key, prevProps.resetKeys?.[idx])
      );
      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback({
            error: this.state.error,
            errorInfo: this.state.errorInfo,
            resetErrorBoundary: this.resetErrorBoundary,
          });
        }
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
