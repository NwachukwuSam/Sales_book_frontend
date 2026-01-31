import { useState } from "react";
import logo from "../assets/logo.png";
import sideImage from "../assets/sideImage.png";
import '../App.css';

function Login() {
  const [emailOrUsername, setemailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showErrorModal, setShowErrorModal] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://sales-book.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      if (response.ok) {
      
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("loginResponse", JSON.stringify(data));
        
       
        if (data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (data.user.role === "cashier") {
          window.location.href = "/cashier-dashboard";
        }
      } else {
        setErrorMessage(data.message || "Login failed. Please check your credentials.");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh", 
        display: "flex",
        flexDirection: "row",
        // Responsive layout
        "@media (maxWidth: 768px)": {
          flexDirection: "column",
        },
      }}
      className="login-container"
    >
      {/* Left Side - Form - Now takes full width on mobile */}
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          boxSizing: "border-box",
          
          "@media (maxWidth: 768px)": {
            width: "100%",
            minHeight: "100vh",
          },
        }}
        className="login-form-container"
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            boxSizing: "border-box",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          className="login-form"
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={logo} alt="logo" style={{ height: 40 }} />
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Login</h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            Login to access your sales account
          </p>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 14, marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setemailOrUsername(e.target.value)}
                placeholder="john.doe@gmail.com"
                style={{
                  padding: "12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                className="login-input"
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
              <label style={{ fontSize: 14, marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                style={{
                  padding: "12px 40px 12px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                className="login-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "70%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#666",
                  padding: 4,
                }}
                className="show-password-btn"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                Remember me
              </label>
              <a href="#" style={{ color: "#019147", textDecoration: "none", fontWeight: 500 }}>
                Forgot Password
              </a>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: "#019147",
                color: "#fff",
                padding: "14px",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                transition: "background-color 0.3s",
                marginTop: 8,
              }}
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Signup */}
          <p style={{ fontSize: 14, textAlign: "center", marginTop: 24, color: "#666" }}>
            Don't have an account?{" "}
            <a href="#" style={{ color: "#019147", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Image - Hidden on mobile */}
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          // Hide on mobile
          "@media (maxWidth: 768px)": {
            display: "none",
          },
        }}
        className="login-image-container"
      >
        <img
          src={sideImage}
          alt="Side Illustration"
          style={{ 
            width: "auto",  
            maxWidth: 500, 
            objectFit: "cover",
            maxHeight: "80vh",
          }}
          className="login-image"
        />
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 8,
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ marginBottom: 24, fontSize: 48 }}>⚠️</div>
            <p style={{ marginBottom: 24, color: "#e53935", fontWeight: 600, fontSize: 16 }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              style={{
                padding: "12px 24px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#019147",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                width: "100%",
                transition: "background-color 0.3s",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 12,
              textAlign: "center",
              minWidth: 200,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            {/* Spinner */}
            <div 
              style={{
                margin: "0 auto 20px",
                width: 48,
                height: 48,
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #019147",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            ></div>
            <p style={{ fontWeight: 600, color: "#019147", fontSize: 16 }}>Logging you in...</p>
          </div>
        </div>
      )}

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .login-input:focus {
          border-color: #019147 !important;
        }
        
        .login-button:hover {
          background-color: #017a3b !important;
        }
        
        @media (max-width: 768px) {
          .login-form-container {
            width: 100% !important;
            padding: 20px !important;
          }
          
          .login-form {
            box-shadow: none !important;
            padding: 20px !important;
          }
          
          .login-image-container {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .login-form {
            padding: 16px !important;
          }
          
          h2 {
            font-size: 20px !important;
          }
          
          p {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;