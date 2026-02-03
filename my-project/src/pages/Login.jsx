import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/account/login/", {
        username: formData.usernameOrEmail,
        password: formData.password,
      });

      
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      console.log(res.data.user)
      Swal.fire({
      title: "Login Success!",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      if (res.data.user?.is_staff) {
        navigate("/admin");
      } else {
        navigate("/main");
      }
    });

    } catch (err) {
      Swal.fire({
        title: "Error!",
        text:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Invalid username or password",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/brands/register_bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      
      <motion.div
        className="w-full max-w-lg mx-auto p-10 rounded-2xl backdrop-blur-xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center p-8 mb-8">
            Login
          </h2>

          
          <div className="input-field relative">
            <div className="relative group">
              <input
                type="text"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white text-base placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
                placeholder="Username or Email"
              />
              <label className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-300 group-focus-within:text-xs group-focus-within:-translate-y-6 group-focus-within:text-cyan-400">
                Username
              </label>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          </div>

          
          <div className="input-field relative">
            <div className="relative group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white text-base placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
                placeholder="Password"
              />
              <label className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-300 group-focus-within:text-xs group-focus-within:-translate-y-6 group-focus-within:text-cyan-400">
                Password
              </label>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl text-lg font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:shadow-lg hover:shadow-cyan-500/25"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.button>

          <div className="register bg-d-none text-center mt-6 text-white">
            <p className="text-lg">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 underline"
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
