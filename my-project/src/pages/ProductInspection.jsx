import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import api from "../api/axios";
import "./Register.css";

function ProductInspection() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(location.state?.product || null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `https://backend-api-s44j.onrender.com${image}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }

    // Reset product state when ID changes
    setProduct(null);
    
    fetchProduct();
    fetchCounts();
    fetchSimilarProducts();
  }, [navigate, id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`products/${id}/`);
      setProduct(res.data);
    } catch (error) {
      Swal.fire("Error", "Product not found.", "error");
      navigate("/products");
    }
  };

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("access");
      const cartRes = await api.get("cart/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wishlistRes = await api.get("wishlist/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartCount(cartRes.data.length);
      setWishlistCount(wishlistRes.data.length);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const res = await api.get("products/");
      // Filter out current product and take first 4
      const filtered = res.data
        .filter(p => p.id !== Number(id))
        .slice(0, 4)
        .map(p => ({
          ...p,
          image: p.image ? `https://backend-api-s44j.onrender.com${p.image}` : `https://via.placeholder.com/250x200?text=${encodeURIComponent(p.name)}`
        }));
      setSimilarProducts(filtered);
    } catch (err) {
      console.warn("Failed to load similar products");
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

  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your cart.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access");

      const res = await api.post(
        "cart/add/",
        { product_id: product.id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchCounts();

      Swal.fire({
        title: "Added to Cart!",
        text: `${product.name} has been added to your cart.`,
        icon: "success",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your wishlist.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("access");

      await api.post(
        "wishlist/toggle/",
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCounts();

      Swal.fire({
        title: "Wishlist Updated!",
        text: product.name,
        icon: "success",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update wishlist",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleBuyNow = () => {
    navigate("/payment", { state: { product: { ...product, quantity: 1 } } });
  };

  const handleSimilarProductClick = (prod) => {
    // Navigate to the new product page with the product state
    navigate(`/product/${prod.id}`, { state: { product: prod } });
  };

  const handleAddSimilarToCart = async (prod, e) => {
    e.stopPropagation();
    
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your cart.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("access");
      await api.post(
        "cart/add/",
        { product_id: prod.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCounts();
      
      Swal.fire({
        title: "Added to Cart!",
        text: `${prod.name} has been added to your cart.`,
        icon: "success",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSimilarWishlistToggle = async (prod, e) => {
    e.stopPropagation();
    
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your wishlist.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("access");
      await api.post(
        "wishlist/toggle/",
        { product_id: prod.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCounts();
      
      Swal.fire({
        title: "Wishlist Updated!",
        text: prod.name,
        icon: "success",
        confirmButtonText: "OK",
        background: "rgba(209, 196, 214, 0.2)",
        color: "#fff",
        confirmButtonColor: "#000000ff",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update wishlist",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!product) {
    return (
      <motion.div className="register-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <Navbar
          user={user}
          cartLength={cartCount}
          wishlistLength={wishlistCount}
          onLogout={handleLogout}
        />
        <div className="container-main-cart">
          <h2 className="register-head">Product not found</h2>
          <p>Product ID: {id}</p>
          <motion.button onClick={() => navigate("/products")} className="back-to-home">
            ← Back to Store
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="register-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <Navbar
        user={user}
        cartLength={cartCount}
        wishlistLength={wishlistCount}
        onLogout={handleLogout}
      />

      <motion.div className="container-main-cart" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="main-ins-box">
          <motion.h1 className="register-head" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {product.name}
          </motion.h1>

          <div className="product-ins-box">
            <motion.img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="inspection-image"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 100 }}
            />

            <div className="details-product-ins">
              <motion.p className="prodect-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
                {product.specs}
              </motion.p>

              <motion.p className="prodect-specs-ins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
                {product.description}
              </motion.p>

              <motion.p className="prodect-price" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
                <b>₹{product.price.toLocaleString()}</b>
              </motion.p>

              <motion.p className="prodect-price-p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
                ⭐ Rating: {product.rating}
              </motion.p>

              <motion.div className="div-btn-ins" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
                <div className="cart-buttons">
                  <motion.button className="add-cart-btn-ins" onClick={handleAddToCart} disabled={loading}>
                    {loading ? "Adding..." : "Add to Cart"}
                  </motion.button>

                  <motion.button
                    className="add-cart-btn-ins"
                    style={{ backgroundColor: "purple", color: "white" }}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </motion.button>

                  <motion.button
                    className="add-cart-btn-ins"
                    style={{ backgroundColor: "#ff0057", color: "#fff" }}
                    onClick={handleWishlistToggle}
                  >
                    Add to Wishlist
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="grid-box-main" style={{ width: '100%', marginTop: '60px' }}>
            <h2 className="featured">Similar Products</h2>
            <div className="main-products-grid">
              {similarProducts.map((prod, index) => (
                <motion.div
                  key={prod.id}
                  className="product-box"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSimilarProductClick(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="wishlist-div">
                    <button
                      className="wishlist-button"
                      onClick={(e) => handleSimilarWishlistToggle(prod, e)}
                    >
                      ♥
                    </button>
                  </div>

                  <motion.img
                    src={prod.image}
                    alt={prod.name}
                    className="prodect-image"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />

                  <h2 className="prodect-h2">{prod.name}</h2>
                  <p className="prodect-p">{prod.specs}</p>

                  <div className="price-reat">
                    <p className="prodect-price"><b>₹{prod.price.toLocaleString()}</b></p>
                    <p className="prodect-price-p2">⭐ {prod.rating}</p>
                  </div>

                  <div className="btn-flex">
                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={(e) => handleAddSimilarToCart(prod, e)}
                    >
                      Add to Cart
                    </button>

                    <button 
                      className="add-cart-btn" 
                      style={{ backgroundColor: 'purple', color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/payment", { state: { product: { ...prod, quantity: 1 } } });
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.button className="back-to-home" onClick={() => navigate("/products")}>
          ← Back to Store
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default ProductInspection;
