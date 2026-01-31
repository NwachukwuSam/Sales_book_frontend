import logo from "../assets/logo.png";
import logoI from "../assets/logoTwo.jpg";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const WelcomeTwo = () => {
    const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen flex">
      
     
      <div className="w-1/2 bg-[#F4FAF7] relative flex items-center justify-center">
        
        <div className="absolute inset-0">
          <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/70" />
        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-2 z-10">
          <img src={logo} alt="Pasorido logo" className="h-10" />
        </div>
      </div>

      <div className="w-1/2 bg-[#0A8F3E] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-xl">
          <motion.img
                  src={logoI}
                  alt="logo"
                  style={{ width: 220, marginBottom: 24 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
        </div>
      </div>

    </div>
  );
};

export default WelcomeTwo;