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
    const response = await fetch("https://sales-system-production.up.railway.app/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/admin-dashboard";
    } else {
      setErrorMessage(data.message || "Login failed");
      setShowErrorModal(true);
    }
  } catch (error) {
    setErrorMessage("Something went wrong. Please try again.");
    setShowErrorModal(true);
  } finally {
    setIsLoading(false); // hide loading modal
  }
};


  return (
    
    <div
      style={{
        minHeight: "100vh", 
        display: "flex",
      }}
    >
      {/* Left Side - Form */}
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            boxSizing: "border-box",
          }}
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
              <label style={{ fontSize: 14, marginBottom: 4 }}>Email</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setemailOrUsername(e.target.value)}
                placeholder="john.doe@gmail.com"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  outline: "none",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
              <label style={{ fontSize: 14, marginBottom: 4 }}>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                style={{
                  padding: "10px 40px 10px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  outline: "none",
                }}
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
                }}
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
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" style={{ color: "#019147", textDecoration: "none" }}>
                Forgot Password
              </a>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: "#019147",
                color: "#fff",
                padding: "12px",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              Login
            </button>
          </form>

          {/* Signup */}
          <p style={{ fontSize: 14, textAlign: "center", marginTop: 16, color: "#666" }}>
            Don’t have an account?{" "}
            <a href="#" style={{ color: "#019147", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
         
        }}
      >
        <img
          src={sideImage}
          alt="Side Illustration"
          style={{ width: "auto",  maxWidth: 500, objectFit: "cover", }}
        />
      </div>
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
        padding: 24,
        borderRadius: 8,
        maxWidth: 400,
        width: "90%",
        textAlign: "center",
      }}
    >
      <p style={{ marginBottom: 16, color: "#e53935", fontWeight: 600 }}>
        {errorMessage}
      </p>
      <button
        onClick={() => setShowErrorModal(false)}
        style={{
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#019147",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
{isLoading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        textAlign: "center",
        minWidth: 200,
      }}
    >
      {/* Spinner or loading text */}
      <div className="spinner" style={{
          margin: "0 auto 16px",
          width: 40,
          height: 40,
          border: "4px solid #ccc",
          borderTop: "4px solid #019147",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
      }}></div>
      <p style={{ fontWeight: 600, color: "#019147" }}>Loading...</p>
    </div>
  </div>
)}


    </div>
    
  );
}

export default Login;

