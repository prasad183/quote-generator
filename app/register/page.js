"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";
import InteractiveBackground from "@/app/components/ui/InteractiveBackground";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

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
        // Handle successful registration response
        // Expected response: { message: "User registered successfully", user: { id, name, username } }
        if (data.message && data.user) {
          setRegisteredUser(data.user);
          setSuccess(true);
          // Clear form fields
          setName("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          // Redirect to login after showing success message
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError("Unexpected response format from server");
        }
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
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e1b4b 50%, #312e81 75%, #1e293b 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 20s ease infinite",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: "32px",
    padding: "48px 40px",
    boxShadow: "0 40px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2) inset, 0 0 150px rgba(99, 102, 241, 0.15)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "2px solid rgba(99, 102, 241, 0.3)",
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease",
    animation: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const inputStyles = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: 16,
    border: "2px solid rgba(99, 102, 241, 0.3)",
    fontSize: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
    WebkitAppearance: "none",
    appearance: "none",
    color: "#f1f5f9",
    fontWeight: 500,
  };


  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        .register-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
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
        .register-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 50px 120px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4) inset, 0 0 200px rgba(99, 102, 241, 0.25) !important;
        }
        input::placeholder {
          color: #64748b !important;
          opacity: 0.7;
        }
        input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4) !important;
          transform: translateY(-2px);
          background-color: rgba(30, 41, 59, 0.95) !important;
        }
        input:focus::placeholder {
          opacity: 0.5;
        }
        button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.6), 0 0 0 0 rgba(99, 102, 241, 0.7) !important;
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
          .register-container {
            padding: 12px !important;
          }
          .register-card {
            padding: 20px !important;
            border-radius: 20px !important;
            max-width: 100% !important;
          }
          .register-title {
            font-size: 32px !important;
            margin-bottom: 8px !important;
          }
          .register-subtitle {
            font-size: 14px !important;
            margin-bottom: 24px !important;
          }
          .register-input {
            padding: 12px 14px !important;
            font-size: 16px !important;
            border-radius: 10px !important;
          }
          .register-label {
            font-size: 13px !important;
            margin-bottom: 6px !important;
          }
        }
        
        /* Tablet styles (640px - 1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .register-container {
            padding: 16px !important;
          }
          .register-card {
            padding: 36px !important;
            border-radius: 28px !important;
            max-width: 500px !important;
          }
          .register-title {
            font-size: 38px !important;
          }
        }
        
        /* Laptop styles (1024px - 1439px) */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .register-card {
            padding: 44px !important;
            max-width: 480px !important;
          }
        }
        
        /* Desktop styles (>= 1440px) */
        @media (min-width: 1440px) {
          .register-card {
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
      <div style={containerStyles} className="register-container">
        {/* Interactive mouse-following particle background */}
        <InteractiveBackground
          particleCount={30}
          intensity="low"
          zIndex={0}
        />
        <div style={{ ...cardStyles, position: "relative", zIndex: 1 }} className="register-card">
        <h1
          className="register-title"
          style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            color: "#f1f5f9",
            textAlign: "center",
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Create Account
        </h1>
        <p
          className="register-subtitle"
          style={{
            fontSize: 17,
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: 48,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Register to access the Quote Generator
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                className="register-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
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
                className="register-input"
                required
              />
            </div>

            <div>
              <label
                className="register-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
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
                className="register-input"
                required
                minLength={3}
              />
            </div>

            <div>
              <label
                className="register-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
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
                className="register-input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label
                className="register-label"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
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
                className="register-input"
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert type="error" message={error} />
            )}

            {success && registeredUser && (
              <Alert type="success">
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  ✓ Registration successful!
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  <div>User ID: <strong>{registeredUser.id}</strong></div>
                  <div>Name: <strong>{registeredUser.name}</strong></div>
                  <div>Username: <strong>{registeredUser.username}</strong></div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
                  Redirecting to login...
                </div>
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={false}
              loading={loading}
              fullWidth
              loadingText="Creating Account..."
            >
              Register
            </Button>
          </div>
        </form>

        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#818cf8",
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

