"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Ensure cookies are sent
        });
        if (response.ok) {
          router.push("/");
        }
      } catch (err) {
        // Not logged in, stay on register page
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(data.error || "Registration failed");
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: "48px",
    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 0 100px rgba(102, 126, 234, 0.15)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    animation: "fadeIn 0.6s ease-out",
  };

  const inputStyles = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: 16,
    border: "2px solid rgba(102, 126, 234, 0.2)",
    fontSize: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  };

  const buttonStyles = {
    width: "100%",
    padding: "16px 24px",
    border: "none",
    fontSize: 16,
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontWeight: 600,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0.5)",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
          transform: translateY(-2px);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5) !important;
        }
        button:active {
          transform: translateY(0);
        }
      `}</style>
      <div style={containerStyles}>
        <div style={cardStyles}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 12,
            color: "#1a1a2e",
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Create Account
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            textAlign: "center",
            marginBottom: 40,
            fontWeight: 400,
          }}
        >
          Register to access the Quote Generator
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000000",
                  marginBottom: 8,
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your full name"
                style={inputStyles}
                required
              />
            </div>

            <div>
              <label
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
                placeholder="Choose a username"
                style={inputStyles}
                required
                minLength={3}
              />
            </div>

            <div>
              <label
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
                placeholder="Enter password (min 6 characters)"
                style={inputStyles}
                required
                minLength={6}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000000",
                  marginBottom: 8,
                }}
              >
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm your password"
                style={inputStyles}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "rgba(248, 113, 113, 0.18)",
                  color: "#b45309",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  backgroundColor: "rgba(134, 239, 172, 0.3)",
                  color: "#166534",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                }}
              >
                ✓ Registration successful! Redirecting to login...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyles,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : "Register"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#11998e",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

