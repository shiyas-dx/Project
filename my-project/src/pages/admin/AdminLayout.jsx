import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import "../Register.css";

const AdminLayout = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    Swal.fire({
      title: "Logged Out!",
      text: "You have been logged out successfully.",
      icon: "success",
      confirmButtonColor: "#000",
      background: "#111",
      color: "#fff",
    }).then(() => navigate("/login"));
  };

  const sidebarVariants = {
    hidden: { x: -250, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 20 } },
  };

  const mainVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="admin-layout-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="admin-layout">
        <motion.aside
          className="admin-sidebar"
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 style={{display:"flex" ,justifyContent:"center"}}>ADMIN 👑</h2>
          <nav className="sidebar-admin-">
            {["Dashboard", "Orders", "Users", "Products"].map((tab) => (
              <NavLink
                key={tab}
                to={`/admin/${tab.toLowerCase() === "dashboard" ? "" : tab.toLowerCase()}`}
                end={tab.toLowerCase() === "dashboard"}  
                
                className={({ isActive }) => `admin-tab-btn ${isActive ? "active" : ""}`}
              >
                {tab}
              </NavLink>

            ))}
          </nav>
          <button className="admin-tab-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </motion.aside>

        <motion.main className="admin-content" variants={mainVariants} initial="hidden" animate="visible">
          <Outlet />
        </motion.main>
      </div>
    </motion.div>
  );
};

export default AdminLayout;
