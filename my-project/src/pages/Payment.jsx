import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import api from "../api/axios";
import "./Register.css";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, cart } = location.state || {};

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    setUser(loggedUser);
  }, [navigate]);

  const productsToPay = product ? [product] : cart || [];

  const totalAmount = productsToPay.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );


    const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `http://127.0.0.1:8000${image}`;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire("Error", "You must be logged in to complete payment.", "error");
      return;
    }

    if (!paymentMethod) {
      Swal.fire("Error", "Please select a payment method.", "error");
      return;
    }

    setLoading(true);

    
    const orderPayload = {
      total_amount: totalAmount,
      payment_method: paymentMethod,
      name,
      address,
      pincode,
      items: productsToPay.map((item) => ({
        product: Number(item.id), 
        quantity: Number(item.quantity || 1),
        price: Number(item.price),
      })),
    };

    try {
      const token = localStorage.getItem("access");

     
      const response = await api.post("/orders/create/", orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      Swal.fire({
        title: "✅ Payment successful!",
        html: `
          <strong>Products:</strong><br>
          ${productsToPay
            .map((item) => `- ${item.name} (Qty: ${item.quantity || 1})`)
            .join("<br>")}
          <br><br>
          <strong>Total:</strong> ₹${totalAmount.toLocaleString()}<br><br>
          <strong>Shipping to:</strong><br>
          ${name}<br>
          ${address}, ${pincode}<br><br>
          <strong>Payment Method:</strong> ${paymentMethod}
        `,
        icon: "success",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      }).then(() => navigate("/main"));

    } catch (error) {
      console.error("Order error response:", error.response?.data || error);

      
      Swal.fire({
        title: "Error",
        text: "Something went wrong while processing your order.",
        icon: "error",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    Swal.fire({
      title: "Logged Out!",
      text: "You have been logged out successfully.",
      icon: "success",
      confirmButtonText: "OK",
      background: "rgba(209, 196, 214, 0.2)",
      color: "#fff",
      confirmButtonColor: "#000000ff",
    }).then(() => navigate("/login"));
  };

  if (productsToPay.length === 0) {
    return (
      <motion.div
        className="register-cart"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Navbar
          user={user}
          cartLength={user?.cart?.length || 0}
          wishlistLength={user?.wishlist?.length || 0}
          onLogout={handleLogout}
        />
        <div className="container-main-cart">
          <h2>No items selected for payment.</h2>
          <button onClick={() => navigate("/cart")} className="back-to-home">
            ← Back to Cart
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="register-cart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Navbar
        user={user}
        cartLength={user?.cart?.length || 0}
        wishlistLength={user?.wishlist?.length || 0}
        onLogout={handleLogout}
      />

      <motion.div
        className="container-main-cart"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="register-head">Payment 🛒</h1>

        <motion.div
          className="main-prodects"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {productsToPay.map((item, index) => (
            <motion.div
              key={item.id}
              className="prodect-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <motion.img
                src={
                  getImageUrl(item.image) ||
                  `https://via.placeholder.com/250x200?text=${encodeURIComponent(item.name)}`
                }
                alt={item.name}
                className="prodect-image"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <div className="details-product">
                <h2 className="prodect-h2">{item.name}</h2>
                <p className="prodect-p">{item.specs}</p>
                <p className="prodect-p">
                  Quantity: <b>{item.quantity || 1}</b>
                </p>
                <p className="prodect-p">
                  ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <h2 className="prodect-price">Total: ₹{totalAmount.toLocaleString()}</h2>

        <motion.form
          className="payment-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="prodect-p">Shipping & Payment Details</h3>
          <input
            className="register-input-pay"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="register-input-pay"
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className="register-input-pay"
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
          <select
            className="select-pay"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>

          <br />
          <motion.button
            type="submit"
            className="pay-submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit Payment"}
          </motion.button>
        </motion.form>

        <motion.button
          onClick={() => navigate(product ? "/main" : "/cart")}
          className="back-to-home"
          style={{ marginTop: "20px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          ← Back
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default Payment;
