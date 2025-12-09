"use client";

/**
 * Reusable Button component with props support
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type: 'button' | 'submit' | 'reset'
 * @param {string} props.variant - Button variant: 'primary' | 'secondary' | 'outline'
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.fullWidth - Full width button
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.loadingText - Text to show when loading
 */
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  style = {},
  loadingText = "Loading...",
  ...props
}) {
  // Base button styles
  const baseStyles = {
    padding: "16px 32px",
    border: "none",
    fontSize: 17,
    borderRadius: 16,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden",
    minHeight: "56px",
    touchAction: "manipulation",
    letterSpacing: "0.5px",
    textTransform: "none",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled || loading ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  // Variant-specific styles
  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
      backgroundSize: "200% 200%",
      color: "white",
      boxShadow: "0 12px 40px rgba(99, 102, 241, 0.5), 0 0 0 0 rgba(99, 102, 241, 0.6)",
    },
    secondary: {
      background: "rgba(255, 255, 255, 0.95)",
      color: "#0f172a",
      border: "2px solid rgba(255, 255, 255, 0.6)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    },
    outline: {
      background: "rgba(255, 255, 255, 0.15)",
      color: "#0f172a",
      border: "2px solid rgba(255, 255, 255, 0.4)",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    },
  };

  // Combine all styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <>
      <style>{`
        .btn-${variant}:hover:not(:disabled):not([disabled]) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.6), 0 0 0 0 rgba(99, 102, 241, 0.7) !important;
          background-position: 100% 0;
        }
        .btn-${variant}:active:not(:disabled):not([disabled]) {
          transform: translateY(-1px) scale(0.98);
        }
        .btn-${variant}::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .btn-${variant}:hover::before {
          left: 100%;
        }
        .btn-${variant}[disabled],
        .btn-${variant}:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Mobile styles */
        @media (max-width: 639px) {
          .btn-${variant} {
            padding: 14px 20px !important;
            font-size: 15px !important;
            border-radius: 10px !important;
            min-height: 48px !important;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .btn-${variant}:active {
            transform: scale(0.98);
          }
        }
      `}</style>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`btn-${variant} ${className}`}
        style={combinedStyles}
        {...props}
      >
        {loading ? loadingText : children}
      </button>
    </>
  );
}

