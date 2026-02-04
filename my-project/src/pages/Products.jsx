import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import api from "../api/axios";
import "./Register.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery =
    new URLSearchParams(location.search).get("search") || "";


  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }

    fetchProducts();
    fetchCounts();
  }, [searchQuery]);


  const fetchProducts = async () => {
    try {
      setLoading(true);

   
      const res = await api.get(`products/?search=${searchQuery}`);
      console.log("PRODUCT API RESPONSE 👉", res.data);

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load products", "error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const [cartRes, wishlistRes] = await Promise.all([
        api.get("cart/"),
        api.get("wishlist/"),
      ]);

      setCartCount(cartRes.data.length || 0);
      setWishlistCount(wishlistRes.data.length || 0);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    Swal.fire("Logged out", "You have been logged out", "success");
    navigate("/login");
  };


  const productsByBrand = useMemo(() => {
    return products.reduce((acc, product) => {
      const brand = product.brand?.trim() || "Other";

      if (!acc[brand]) acc[brand] = [];
      acc[brand].push(product);

      return acc;
    }, {});
  }, [products]);


  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!product.category) return acc;

      const categories = Array.isArray(product.category)
        ? product.category
        : [product.category];

      categories.forEach((cat) => {
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
      });

      return acc;
    }, {});
  }, [products]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ padding: "60px 0" }}
    >
      <Navbar
        user={user}
        cartLength={cartCount}
        wishlistLength={wishlistCount}
        onLogout={handleLogout}
      />

      {loading && (
        <p style={{ textAlign: "center", color: "#fff", marginTop: 60 }}>
          Loading products...
        </p>
      )}

      {!loading && products.length === 0 && (
        <p style={{ textAlign: "center", color: "#fff", marginTop: 60 }}>
          No products found
        </p>
      )}

      
      {!loading && products.length > 0 && (
        <>
          <h1 style={{ textAlign: "center", color: "#727eebff", paddingTop: 50 }}>
            Products by Brand
          </h1>

          {Object.keys(productsByBrand).map((brand, index) => (
            <motion.div
              key={brand}
              className="container-main-product"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="main-intro-product">
                <h2 className="main-h3">{brand}</h2>
              </div>

              <div className="main-products-grid">
                {productsByBrand[brand].map((product) => (
                  <motion.div
                    key={product.id}
                    className="product-box"
                    whileHover={{ scale: 1.05 }}
                    onClick={() =>
                      navigate(`/product/${product.id}`, {
                        state: { product },
                      })
                    }
                  >
                    <img
                      src={
                        product.image
                          ? `https://backend-api-s44j.onrender.com${product.image}`
                          : "/placeholder.png"
                      }
                      alt={product.name}
                      className="prodect-image"
                    />

                    <h2 className="prodect-h2">{product.name}</h2>
                    <p className="prodect-p">{product.specs}</p>

                    <div className="price-reat">
                      <p className="prodect-price">
                        <b>₹{product.price?.toLocaleString()}</b>
                      </p>
                      <p className="prodect-price-p2">
                        ⭐ {product.rating || "0"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* ================= CATEGORY SECTION ================= */}
      {!loading && Object.keys(productsByCategory).length > 0 && (
        <>
          <h1
            style={{
              textAlign: "center",
              color: "#fff",
              marginTop: 50,
              marginBottom: 20,
            }}
          >
            Products by Category
          </h1>

          {Object.keys(productsByCategory).map((category, index) => (
            <motion.div
              key={category}
              className="container-main-product"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="main-intro-product">
                <h2 className="main-h3">{category}</h2>
              </div>

              <div className="main-products-grid">
                {productsByCategory[category].map((product) => (
                  <motion.div
                    key={product.id}
                    className="product-box"
                    whileHover={{ scale: 1.05 }}
                    onClick={() =>
                      navigate(`/product/${product.id}`, {
                        state: { product },
                      })
                    }
                  >
                    <img
                      src={
                        product.image
                          ? `https://backend-api-s44j.onrender.com${product.image}`
                          : "/placeholder.png"
                      }
                      alt={product.name}
                      className="prodect-image"
                    />

                    <h2 className="prodect-h2">{product.name}</h2>
                    <p className="prodect-p">{product.specs}</p>

                    <div className="price-reat">
                      <p className="prodect-price">
                        <b>₹{product.price?.toLocaleString()}</b>
                      </p>
                      <p className="prodect-price-p2">
                        ⭐ {product.rating || "0"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}

export default Products;
