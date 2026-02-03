import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar({ cartLength, wishlistLength, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ✅ Read user safely from localStorage
  const [user, setUser] = useState(null);

  useEffect(() => {
      const token = localStorage.getItem("access");
      const storedUser = localStorage.getItem("user");

      // Safe parse
      let parsedUser = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (err) {
        parsedUser = null;
      }

      if (token && parsedUser) {
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    }, [location]);


  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search") || "";
    setSearchQuery(q);
  }, [location.search]);

  const handleHomeClick = () => {
    if (location.pathname !== "/main") {
      navigate("/main");
    } else {
      const homeSection = document.getElementById("home");
      if (homeSection) homeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAboutClick = () => {
    if (location.pathname !== "/main") {
      navigate("/main", { state: { scrollTo: "about" } });
    } else {
      const aboutSection = document.getElementById("about");
      if (aboutSection) aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch(() => setAllProducts([]));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allProducts.filter((p) => {
      const categoryText = Array.isArray(p.category)
        ? p.category.join(" ")
        : p.category;

      return (
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.brand.toLowerCase().includes(value.toLowerCase()) ||
        categoryText.toLowerCase().includes(value.toLowerCase())
      );
    });

    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <motion.header
      className="login-nav"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
    >
      <nav className="main-nav">

        {/* LOGO */}
        <motion.div
          className="register-a-main"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHomeClick}
        >
          Cortex
        </motion.div>

        {/* NAV LINKS */}
        <div className="services">
          <motion.span onClick={handleHomeClick} whileHover={{ scale: 1.1 }}>
            HOME
          </motion.span>
          <motion.span onClick={handleAboutClick} whileHover={{ scale: 1.1 }}>
            ABOUT
          </motion.span>
          <motion.span
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.1 }}
          >
            PRODUCTS
          </motion.span>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="login-register-button"
          ref={dropdownRef}
          style={{ marginLeft: "auto", position: "relative" }}
        >
          <motion.span whileHover={{ scale: 1.05 }} className="welcome-name">
            Welcome, <b>{user?.first_name || "Guest"}</b>
          </motion.span>

          {/* SEARCH */}
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(
                  `/products?search=${encodeURIComponent(searchQuery.trim())}`
                );
                setShowSuggestions(false);
              }
            }}
          >
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by brand, category or name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="register-input-nav"
              />
              <button type="submit" className="search-icon-button">
                🔍︎
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                className="search-suggestions"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      navigate(`/product/${item.id}`, {
                        state: { product: item },
                      });
                      setShowSuggestions(false);
                    }}
                  >
                    <b>{item.name}</b>
                    <span className="suggest-brand">{item.brand}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </form>

          {/* USER MENU */}
          {user ? (
            <div className={`dropdown ${dropdownOpen ? "active" : ""}`}>
              <button
                className="main-cart-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Menu
              </button>

              <ul className="dropdown-list">
                <li onClick={() => navigate("/wishlist")}>
                  ❤️ Wishlist ({wishlistLength})
                </li>
                <li onClick={() => navigate("/cart")}>
                  🛒 Cart ({cartLength})
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="main-cart-button"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="main-cart-button"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

export default Navbar;
