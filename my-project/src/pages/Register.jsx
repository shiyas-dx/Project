import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      confirm_password,
    } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (first_name.trim().length < 2) {
      Swal.fire("Error", "First name must be at least 2 characters", "error");
      return false;
    }

    if (last_name.trim().length < 1) {
      Swal.fire("Error", "Last name is required", "error");
      return false;
    }

    if (username.trim().length < 3) {
      Swal.fire("Error", "Username must be at least 3 characters", "error");
      return false;
    }

    if (!emailRegex.test(email)) {
      Swal.fire("Error", "Invalid email address", "error");
      return false;
    }

    if (password.length < 8) {
      Swal.fire("Error", "Password must be at least 8 characters", "error");
      return false;
    }

    if (password !== confirm_password) {
      Swal.fire("Error", "Passwords do not match", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.post("/account/register/", formData);

      Swal.fire({
        title: "Success!",
        text: "Account created successfully. Please login.",
        icon: "success",
      }).then(() => navigate("/login"));
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data || "Registration failed",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/brands/register_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <motion.div
        className="relative w-full max-w-xl p-10 rounded-3xl backdrop-blur-xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white text-center p-5 mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            <div className="relative group">
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
                placeholder="First Name"
              />
              <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
                First Name
              </label>
            </div>
            
            
            <div className="relative group">
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
                placeholder="Last Name"
              />
              <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
                Last Name
              </label>
            </div>
          </div>

          
          <div className="relative group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
              placeholder="Username"
            />
            <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
              Username
            </label>
          </div>

          
          <div className="relative group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
              placeholder="Email"
            />
            <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
              Email
            </label>
          </div>

          
          <div className="relative group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
              placeholder="Password"
            />
            <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
              Password
            </label>
          </div>

        
          <div className="relative group">
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300"
              placeholder="Confirm Password"
            />
            <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:-top-2 group-focus-within:text-xs group-focus-within:text-cyan-400">
              Confirm Password
            </label>
          </div>

          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-3xl hover:shadow-lg transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Register
          </motion.button>
          
          <div className="bg-d-none p-4">
            <p className="text-center text-gray-300">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-cyan-400 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Register;
