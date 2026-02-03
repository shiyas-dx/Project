import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const Users = () => {
  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("admin/users/");
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        Swal.fire("Error", "Failed to fetch users.", "error");
      }
    };
    fetchUsers();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    const action = isBlocked ? "unblock" : "block";

    const confirm = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} user`,
      cancelButtonText: "Cancel",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#ff00cc",
    });

    if (confirm.isConfirmed) {
      try {
        
        const response = await api.patch(`admin/users/${userId}/block/`);
        
        
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, blocked: response.data.blocked } : u
        ));

        Swal.fire("Success", response.data.detail, "success");
      } catch (err) {
        
        const errorMessage = err.response?.data?.detail || `Failed to ${action} user.`;
        
        Swal.fire({
          icon: "error",
          title: "Action Denied",
          text: errorMessage,
          background: "#111",
          color: "#fff",
        });
      }
    }
  };

  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit User',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Firstname" value="${user.firstname}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Username" value="${user.username}">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Email" value="${user.email}">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          firstname: document.getElementById('swal-input1').value,
          username: document.getElementById('swal-input2').value,
          email: document.getElementById('swal-input3').value
        };
      },
      showCancelButton: true,
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#007bff"
    });

    if (formValues) {
      try {
        const response = await api.patch(`admin/users/${user.id}/edit/`, formValues);

        setUsers(prev => prev.map(u => u.id === user.id ? response.data : u));

        Swal.fire('Success', 'User updated successfully', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to update user', 'error');
      }
    }
  };

  const handleViewOrders = async (userId) => {
    try {
      const response = await api.get(`admin/users/${userId}/orders/`);

      const orders = response.data;

      if (orders.length === 0) {
        Swal.fire("No Orders", "This user has no orders.", "info");
        return;
      }

      let ordersHtml = orders.map(o => `
        <div style="text-align:left; margin-bottom:10px; padding:10px; border:1px solid #333; border-radius:6px;">
          <p><b>Order ID:</b> ${o.id}</p>
          <p><b>Total:</b> ₹${o.total_amount}</p>
          <p><b>Status:</b> ${o.status}</p>
          <p><b>Payment:</b> ${o.payment_method}</p>
          <p><b>Date:</b> ${o.created_at}</p>
        </div>
      `).join("");

      Swal.fire({
        title: "User Orders",
        html: `<div style="max-height:400px; overflow-y:auto;">${ordersHtml}</div>`,
        width: 600,
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#ffa500"
      });

    } catch (err) {
      Swal.fire("Error", "Failed to load user orders", "error");
    }
  };


  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="admin-table-section">
      <h1 style={{display:"flex" ,justifyContent:"center", paddingBottom:"20px"}}>Users</h1>
      {users.length === 0 ? <p>No users found.</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Firstname</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {users.map(u => (
                <motion.tr key={u.id} variants={rowVariants} initial="hidden" animate="visible" exit="exit">
                  <td>{u.id}</td>
                  <td>{u.firstname}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>


                  <td style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleBlockToggle(u.id, u.blocked)}
                      style={{
                        backgroundColor: u.blocked ? "#00cc66" : "#ff0044",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 10px",
                        cursor: "pointer"
                      }}
                    >
                      {u.blocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => handleEditUser(u)}
                      style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 10px",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewOrders(u.id)}
                      style={{
                        backgroundColor: "#ffa500",
                        color: "#000",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 10px",
                        cursor: "pointer"
                      }}
                    >
                      Orders
                    </button>

                  </td>


                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
