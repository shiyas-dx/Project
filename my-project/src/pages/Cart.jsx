import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import "./Register.css";
import api from "../api/axios";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart/");

      const cartFixed = res.data.map((item) => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.image
            ? `http://127.0.0.1:8000${item.product.image}`
            : "https://via.placeholder.com/250x200",
        },
      }));

      setCart(cartFixed);
    } catch {
      Swal.fire("Error", "Failed to load cart", "error");
    }
  };

  const updateQuantity = async (productId, delta) => {
  try {
    await api.post("/cart/add/", { product_id: productId, quantity: delta });
    fetchCart();
  } catch {
    Swal.fire("Error", "Failed to update quantity", "error");
  }
};
const handleRemove = async (productId, name) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: `Remove ${name} from cart?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Remove",
  });

  if (!confirm.isConfirmed) return;

  try {
    await api.post("/cart/remove/", { product_id: productId });
    fetchCart();
    Swal.fire("Removed!", `${name} removed from cart.`, "success");
  } catch {
    Swal.fire("Error", "Failed to remove item", "error");
  }
};


  const handleBuyNow = () => {
    if (cart.length > 0) {
      navigate("/payment", { state: { cart } });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    Swal.fire("Logged Out!", "You have been logged out.", "success").then(() =>
      navigate("/login")
    );
  };
  
  return (
    <motion.div
      className="register-cart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Navbar cartLength={cart.length} wishlistLength={0} onLogout={handleLogout} />

      <motion.div
        className="container-main-cart"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="main-cart-box">
          <h1 className="register-head">Your Cart 🛒</h1>

          {cart.length === 0 ? (
            <p className="no-item-cart">No items in your cart.</p>
          ) : (
            <div className="main-prodects">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  className="prodect-box"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={item.product.image} alt={item.product.name} className="prodect-image" />
                  <div className="details-product">
                    <h2 className="prodect-h2">{item.product.name}</h2>
                    <h4 className="prodect-p">{item.product.specs}</h4>

                    <div className="quantity-section">
                          <button
                            onClick={() => item.quantity > 1 && updateQuantity(item.product.id, -1)}
                            className="qty-btn"
                          >
                            -
                          </button>

                          <span className="quantity">{item.quantity}</span>

                          <button
                            onClick={() => updateQuantity(item.product.id, +1)}
                            className="qty-btn"
                          >
                            +
                          </button>


                    </div>

                    <p className="prodect-price">
                      <b>₹{(item.product.price * item.quantity).toLocaleString()}</b>
                    </p>

                    <button
                      onClick={() => handleRemove(item.product.id, item.product.name)}
                      className="main-cart-button"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBuyNow}
              className="back-to-home"
              style={{ marginTop: "20px" }}
            >
              Buy All Items
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/main")}
            className="back-to-home"
            style={{ marginTop: "20px" }}
          >
            ← Back to Store
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Cart;
