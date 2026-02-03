import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import "./Register.css";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

function Main() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchCounts();
      fetchWishlist();
    }

    fetchProducts();
  }, []);



  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/`);
      const data = res.data.map((p) => ({
        ...p,
        image: p.image
          ? `http://127.0.0.1:8000${p.image}`
          : `https://via.placeholder.com/250x200?text=${encodeURIComponent(p.name)}`,
      }));
      setProducts(data.slice(0, 12));
    } catch {
      Swal.fire("Error", "Failed to load products", "error");
    }
  };

 
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const res = await fetch(`${API_BASE}/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setWishlist(data.map((item) => item.product.id));
    } catch {
      setWishlist([]);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("access");

      const cartRes = await fetch(`${API_BASE}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wishlistRes = await fetch(`${API_BASE}/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!cartRes.ok || !wishlistRes.ok) throw new Error();

      setCartCount((await cartRes.json()).length);
      setWishlistCount((await wishlistRes.json()).length);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  };


  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    try {
      const res = await fetch(`${API_BASE}/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });

      if (!res.ok) throw new Error();

      fetchCounts();
      Swal.fire("Success", "Added to cart", "success");
    } catch {
      Swal.fire("Error", "Failed to add to cart", "error");
    }
  };


  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    const isAlreadyWishlisted = wishlist.includes(product.id);

    try {
      const res = await fetch(`${API_BASE}/wishlist/toggle/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      if (!res.ok) throw new Error();

      setWishlist((prev) =>
        isAlreadyWishlisted
          ? prev.filter((id) => id !== product.id)
          : [...prev, product.id]
      );

      Swal.fire(
        "Success",
        isAlreadyWishlisted
          ? "Removed from wishlist"
          : "Added to wishlist",
        "success"
      );

      fetchCounts();
    } catch {
      Swal.fire("Error", "Wishlist update failed", "error");
    }
  };

  const handleBuyNow = (e, product) => {
  e.stopPropagation();

  const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    navigate("/payment", { state: { product } });
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    Swal.fire("Logged out", "", "success").then(() => navigate("/login"));
  };

  return (
    <motion.div className="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div id="home" className="container-main">

        <Navbar 
          user={user} 
          cartLength={cartCount} 
          wishlistLength={wishlistCount} 
          onLogout={handleLogout} 
        />

        <motion.div className="main-intro" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="main-h1">Welcome to <b>Cortex</b> Store</h1>
          <h3 className="main-h3">Your one-stop shop for high-end gaming laptops!</h3>
          <video className="video-bg" autoPlay muted loop playsInline>
            <source src="/videos/bg-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Products grid remains same */}
        <div className="main-grid-box">
          <div className="grid-box-main">
            <h2 className='featured'>Featured Products</h2>

            <div className="main-products-grid">
              {products.length === 0 ? (
                <p style={{ color: '#fff', textAlign: 'center' }}>Loading products...</p>
              ) : (
                products.map((product, index) => (
                  <motion.div
                    className="product-box"
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="wishlist-div">
                      <button
                          onClick={(e) => handleWishlistToggle(e, product)}
                          className={`wishlist-button ${
                            wishlist.includes(product.id) ? "active" : ""
                          }`}
                        >
                          ♥
                      </button>
                    </div>

                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="prodect-image"
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 0.0 }}
                    />

                    <h2 className="prodect-h2">{product.name}</h2>
                    <p className="prodect-p">{product.specs}</p>

                    <div className="price-reat">
                      <p className="prodect-price"><b>₹{product.price.toLocaleString()}</b></p>
                      <p className="prodect-price-p2">⭐ {product.rating}</p>
                    </div>

                    <div className="btn-flex">
                      <button
                        type="button"
                        className="add-cart-btn"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        Add to Cart
                      </button>

                      <button className="add-cart-btn" style={{ backgroundColor: 'purple', color: 'white' }} onClick={(e) => handleBuyNow(e, product)}>
                        Buy Now
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <motion.div style={{ textAlign: 'center', marginTop: '20px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <button onClick={() => navigate('/products')} className="add-cart-btn" style={{ backgroundColor: 'purple', color: 'white' }}>
                View All Products
              </button>
            </motion.div>

          </div>
        </div>

        <motion.div id="about" className="main-about" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2>About Us</h2>
          <p>
            Cortex Store is a premium destination for gamers, tech enthusiasts, and professionals
            who demand the best in high-performance laptops and gaming accessories.
          </p>
        </motion.div>

        <motion.div id="contact" className="main-contact" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2>Contact Us</h2>
          <p>Email: support@cortexstore.com</p>
          <p>Phone: +91 6282777134</p>
          <p>Address: 123 Gaming Street, Cyber City, India</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Main;
