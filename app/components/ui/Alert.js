"use client";

/**
 * Reusable Alert component with props support
 * 
 * @param {Object} props
 * @param {string} props.type - Alert type: 'error' | 'success' | 'info' | 'warning'
 * @param {string} props.message - Alert message (if not using children)
 * @param {React.ReactNode} props.children - Alert content (overrides message if provided)
 * @param {Function} props.onClose - Close handler function (optional)
 * @param {boolean} props.dismissible - Show close button
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export default function Alert({
  type = "error",
  message = "",
  children,
  onClose,
  dismissible = false,
  className = "",
  style = {},
}) {
  // Alert type configurations
  const alertConfig = {
    error: {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      color: "#dc2626",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      icon: "✗",
    },
    success: {
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      color: "#059669",
      border: "1px solid rgba(16, 185, 129, 0.2)",
      icon: "✓",
    },
    info: {
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      color: "#2563eb",
      border: "1px solid rgba(59, 130, 246, 0.2)",
      icon: "ℹ",
    },
    warning: {
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      color: "#d97706",
      border: "1px solid rgba(245, 158, 11, 0.2)",
      icon: "⚠",
    },
  };

  const config = alertConfig[type] || alertConfig.error;

  // Base alert styles
  const alertStyles = {
    backgroundColor: config.backgroundColor,
    color: config.color,
    borderRadius: 14,
    padding: children ? "16px 20px" : "14px 18px",
    fontSize: 15,
    fontWeight: 500,
    border: config.border,
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    ...style,
  };

  return (
    <div
      className={`alert alert-${type} ${className}`}
      style={alertStyles}
      role="alert"
    >
      {(dismissible || onClose) && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            color: config.color,
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}

      {children ? (
        children
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "16px" }}>{config.icon}</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

