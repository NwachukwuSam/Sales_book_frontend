import logo from "../assets/logo.png";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        textAlign: "center",
        padding: "0 0px",
      }}
    >
      <motion.img
        src={logo}
        alt="logo"
        style={{ width: 220, marginBottom: 24 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.h4
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{
          fontSize: "clamp(0.8rem, 3.5vw, 1rem)",
          fontWeight: 600,
          color: "#019147",
          marginTop:-24,
          fontStyle: "italic",
        }}
      >
        Welcome to Your Favorite Sales Book
      </motion.h4>
    </div>
  );
}

export default Welcome;
