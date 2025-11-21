"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Ensure cookies are sent
        });
        if (response.ok) {
          const data = await response.json();
          // Handle response: { user: { id, name, username } }
          if (data.user) {
            // Already logged in, redirect to home
            router.push("/");
          }
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login response
        // Expected response: { message: "Login successful", user: { id, name, username } }
        if (data.message && data.user) {
          setLoggedInUser(data.user);
          setSuccess(true);
          // Clear form fields
          setUsername("");
          setPassword("");
          // Show success message briefly before redirecting
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        } else {
          // If response format is unexpected, still redirect but log it
          console.warn("Unexpected response format:", data);
          router.push("/");
          router.refresh();
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 20s ease infinite",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: "32px",
    padding: "48px 40px",
    boxShadow: "0 40px 100px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 0 150px rgba(102, 126, 234, 0.2)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease",
    animation: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const inputStyles = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: 16,
    border: "2px solid rgba(102, 126, 234, 0.25)",
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
    WebkitAppearance: "none",
    appearance: "none",
    color: "#1e293b",
    fontWeight: 500,
  };

  const buttonStyles = {
    width: "100%",
    padding: "16px 32px",
    border: "none",
    fontSize: 17,
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    fontWeight: 700,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "200% 200%",
    color: "white",
    boxShadow: "0 12px 40px rgba(102, 126, 234, 0.5), 0 0 0 0 rgba(102, 126, 234, 0.6)",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden",
    minHeight: "56px",
    touchAction: "manipulation",
    letterSpacing: "0.5px",
    textTransform: "none",
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .login-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 50px 120px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.4) inset, 0 0 200px rgba(102, 126, 234, 0.25) !important;
        }
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.15), 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          transform: translateY(-2px);
          background-color: #ffffff !important;
        }
        button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.6), 0 0 0 0 rgba(102, 126, 234, 0.7) !important;
          background-position: 100% 0;
        }
        button:active {
          transform: translateY(-1px) scale(0.98);
        }
        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        button:hover::before {
          left: 100%;
        }
        
        /* Mobile styles (< 640px) */
        @media (max-width: 639px) {
          .login-container {
            padding: 12px !important;
          }
          .login-card {
            padding: 20px !important;
            border-radius: 20px !important;
            max-width: 100% !important;
          }
          .login-title {
            font-size: 32px !important;
            margin-bottom: 8px !important;
          }
          .login-subtitle {
            font-size: 14px !important;
            margin-bottom: 24px !important;
          }
          .login-input {
            padding: 12px 14px !important;
            font-size: 16px !important;
            border-radius: 10px !important;
          }
          .login-button {
            padding: 14px 20px !important;
            font-size: 15px !important;
            border-radius: 10px !important;
          }
          .login-label {
            font-size: 13px !important;
            margin-bottom: 6px !important;
          }
        }
        
        /* Tablet styles (640px - 1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .login-container {
            padding: 16px !important;
          }
          .login-card {
            padding: 36px !important;
            border-radius: 28px !important;
            max-width: 500px !important;
          }
          .login-title {
            font-size: 38px !important;
          }
        }
        
        /* Laptop styles (1024px - 1439px) */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .login-card {
            padding: 44px !important;
            max-width: 480px !important;
          }
        }
        
        /* Desktop styles (>= 1440px) */
        @media (min-width: 1440px) {
          .login-card {
            padding: 48px !important;
            max-width: 480px !important;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, input {
            min-height: 44px;
          }
          button:active {
            transform: scale(0.98);
          }
        }
      `}</style>
      <div style={containerStyles} className="login-container">
        <div style={cardStyles} className="login-card">
        <h1
          className="login-title"
          style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            color: "#1a1a2e",
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Welcome Back
        </h1>
        <p
          className="login-subtitle"
          style={{
            fontSize: 17,
            color: "#64748b",
            textAlign: "center",
            marginBottom: 48,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Login to access the Quote Generator
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                className="login-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000000",
                  marginBottom: 8,
                }}
              >
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter your username"
                style={inputStyles}
                className="login-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                className="login-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000000",
                  marginBottom: 8,
                }}
              >
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                style={inputStyles}
                className="login-input"
                required
              />
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#dc2626",
                  borderRadius: 14,
                  padding: "14px 18px",
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {error}
              </div>
            )}

            {success && loggedInUser && (
              <div
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#059669",
                  borderRadius: 14,
                  padding: "16px 20px",
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  ✓ Login successful!
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  <div>Welcome back, <strong>{loggedInUser.name}</strong>!</div>
                  <div style={{ marginTop: 4 }}>User ID: <strong>{loggedInUser.id}</strong> | Username: <strong>{loggedInUser.username}</strong></div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
                  Redirecting to dashboard...
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="login-button"
              style={{
                ...buttonStyles,
                opacity: loading || success ? 0.6 : 1,
                cursor: loading || success ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : success ? "Login Successful!" : "Login"}
            </button>
          </div>
        </form>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#11998e",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

