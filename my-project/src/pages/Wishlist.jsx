import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import "./Register.css";
import api from "../api/axios";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }

    fetchWishlist();
    fetchCartCount();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist/");

      const wishlistFixed = res.data.map((item) => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.image
            ? `https://backend-api-s44j.onrender.com${item.product.image}`
            : "https://via.placeholder.com/250x200",
        },
      }));

      setWishlist(wishlistFixed);
    } catch {
      Swal.fire("Error", "Failed to load wishlist", "error");
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart/");
      setCartCount(res.data.length);
    } catch {
      setCartCount(0);
    }
  };

  const handleAddToCart = async (productId, productName) => {
    if (loading) return;
    setLoading(true);

    try {
      // Add to cart
      await api.post("/cart/add/", { product_id: productId, quantity: 1 });

      // Remove from wishlist
      await api.post("/wishlist/remove/", { product_id: productId });

      await fetchWishlist();
      await fetchCartCount();

      Swal.fire({
        title: "Added to Cart!",
        text: `${productName} moved to cart.`,
        icon: "success",
        confirmButtonColor: "#000000ff",
      });
    } catch {
      Swal.fire("Error", "Failed to add item to cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId, productName) => {
    const confirm = await Swal.fire({
      title: "Remove from Wishlist?",
      text: `Do you want to remove ${productName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post("/wishlist/remove/", { product_id: productId });
      fetchWishlist();

      Swal.fire("Removed!", `${productName} removed from wishlist.`, "success");
    } catch {
      Swal.fire("Error", "Failed to remove item", "error");
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
      <div className="container-main-cart">
        <Navbar
          cartLength={cartCount}
          wishlistLength={wishlist.length}
          onLogout={handleLogout}
        />

        <motion.div
          className="main-cart-box"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="register-head">Your Wishlist ❤️</h1>

          {wishlist.length === 0 ? (
            <p className="no-item-cart">No items in your wishlist.</p>
          ) : (
            <div className="main-prodects">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="prodect-box"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={item.product.image} alt={item.product.name} className="prodect-image" />

                  <div className="details-product">
                    <h2 className="prodect-h2">{item.product.name}</h2>
                    <h4 className="prodect-p">{item.product.specs}</h4>
                    <p className="prodect-price">
                      <b>₹{item.product.price.toLocaleString()}</b>
                    </p>

                    <div className="cart-buttons">
                      <button
                        disabled={loading}
                        onClick={() =>
                          handleAddToCart(item.product.id, item.product.name)
                        }
                        className="main-cart-button"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() =>
                          handleRemove(item.product.id, item.product.name)
                        }
                        className="main-cart-button"
                        style={{ backgroundColor: "#ff4d4d" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Wishlist;
