import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import "../Register.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    quantity: 0,
    category: "", 
    image: null,
    brand: "",
    description: "", 
    specs: "",       
    rating: 0,
  });

  const DJANGO_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("products/");
      setProducts(data);
    } catch (error) {
      Swal.fire("Error", "Failed to load products.", "error");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.image) {
      return Swal.fire("Error", "Name and Image are required.", "error");
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("brand", newProduct.brand);
    formData.append("specs", newProduct.specs); 
    formData.append("price", parseInt(newProduct.price || 0));
    formData.append("quantity", parseInt(newProduct.quantity || 0));
    formData.append("rating", parseFloat(newProduct.rating || 0));
    formData.append("image", newProduct.image);

    const categoryArray = newProduct.category.split(",").map(c => c.trim());
    const descriptionArray = newProduct.description.split(",").map(d => d.trim());
    
    formData.append("category", JSON.stringify(categoryArray));
    formData.append("description", JSON.stringify(descriptionArray));

    try {
      const { data: added } = await api.post("products/admin/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => [added, ...prev]);
      setNewProduct({ 
        name: "", 
        price: 0, 
        quantity: 0, 
        category: "", 
        image: null, 
        brand: "", 
        description: "", 
        specs: "", 
        rating: 0 
      });
      Swal.fire("Added!", "Product created successfully.", "success");
    } catch (error) {
      console.error("Validation Errors:", error.response?.data);
      Swal.fire("Error", JSON.stringify(error.response?.data), "error");
    }
  };

  const handleProductEdit = async (id, formData) => {
    try {
      const { data } = await api.patch(`products/admin/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      Swal.fire("Updated!", "Product updated.", "success");
    } catch (error) {
      Swal.fire("Error", "Update failed.", "error");
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${DJANGO_BASE_URL}${path}`;
  };

  return (
    <motion.div 
      className="admin-table-section min-h-screen p-4 md:p-6 bg-[#0a0a12]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="admin-header text-3xl md:text-4xl font-bold text-center py-6">Product Management</h1>

      <div className="bg-[#0f0f1a] rounded-2xl p-4 md:p-6 mb-8 border border-[#1a1a2a]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Product Name</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              placeholder="Enter product name" 
              value={newProduct.name} 
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Brand</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              placeholder="Enter brand name" 
              value={newProduct.brand} 
              onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Price ($)</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              type="number" 
              placeholder="0.00" 
              value={newProduct.price} 
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Quantity</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              type="number" 
              placeholder="0" 
              value={newProduct.quantity} 
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Categories (comma separated)</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              placeholder="e.g., Electronics, Gadgets, Accessories" 
              value={newProduct.category} 
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Rating (0-5)</label>
            <input 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all"
              type="number" 
              step="0.1" 
              min="0" 
              max="5" 
              placeholder="0.0" 
              value={newProduct.rating} 
              onChange={(e) => setNewProduct({...newProduct, rating: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Description (comma separated for list items)</label>
            <textarea 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all min-h-[100px] resize-vertical"
              placeholder="Enter product description" 
              value={newProduct.description} 
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Specifications</label>
            <textarea 
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#e0e0ff] placeholder-[#5a5a7a] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all min-h-[120px] resize-vertical"
              placeholder="Enter detailed specifications" 
              value={newProduct.specs} 
              onChange={(e) => setNewProduct({...newProduct, specs: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#7a7a9e] mb-1">Product Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
              className="w-full bg-[#151525] border border-[#22223a] rounded-xl px-4 py-3 text-[#c0c0e0] focus:outline-none focus:ring-1 focus:ring-[#7a3aff] focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1a1a2a] file:text-[#c0c0e0] hover:file:bg-[#222235] transition-all"
            />
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <button 
            onClick={handleAddProduct} 
            className="bg-gradient-to-r from-[#4a3aff] to-[#9a3aff] hover:from-[#5a4aff] hover:to-[#aa4aff] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7a3aff]/20 w-full md:w-auto"
          >
            <span className="text-lg">Add New Product</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1a1a2a]">
        <table className="admin-table min-w-full divide-y divide-[#1a1a2a] bg-[#0f0f1a]">
          <thead className="bg-[#080810]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Specs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#7a7a9e] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151525]">
            <AnimatePresence>
              {products.map((p) => (
                <ProductRow 
                  key={p.id} 
                  product={p} 
                  handleProductEdit={handleProductEdit} 
                  handleProductDelete={async (id) => {
                    if (window.confirm("Are you sure you want to delete this product?")) {
                      try {
                        await api.delete(`products/admin/${id}/`);
                        setProducts(prev => prev.filter(item => item.id !== id));
                        Swal.fire("Deleted!", "Product removed successfully.", "success");
                      } catch (error) {
                        Swal.fire("Error", "Failed to delete product.", "error");
                      }
                    }
                  }}
                  getFullImageUrl={getFullImageUrl}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

function ProductRow({ product, handleProductEdit, handleProductDelete, getFullImageUrl }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({ 
    ...product, 
    image: null,
    category: Array.isArray(product.category) ? product.category.join(', ') : (product.category || ''),
    description: Array.isArray(product.description) ? product.description.join(', ') : (product.description || '')
  });

  const onSave = () => {
    const formData = new FormData();
    formData.append("name", edit.name);
    formData.append("brand", edit.brand);
    formData.append("specs", edit.specs || '');
    formData.append("price", parseInt(edit.price || 0));
    formData.append("quantity", parseInt(edit.quantity || 0));
    formData.append("rating", parseFloat(edit.rating || 0));

    const catData = edit.category
      .split(",")
      .map(c => c.trim())
      .filter(c => c);
    
    const descData = edit.description
      .split(",")
      .map(d => d.trim())
      .filter(d => d);
    
    formData.append("category", JSON.stringify(catData));
    formData.append("description", JSON.stringify(descData));

    if (edit.image instanceof File) {
      formData.append("image", edit.image);
    }

    handleProductEdit(product.id, formData);
    setIsEditing(false);
  };

  const getCategoryDisplay = () => {
    if (!product.category) return '';
    return Array.isArray(product.category) 
      ? product.category.join(', ') 
      : product.category;
  };

  const getDescriptionDisplay = () => {
    if (!product.description) return '';
    return Array.isArray(product.description) 
      ? product.description.join(', ') 
      : product.description;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="hover:bg-[#151525]/70 transition-colors"
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#b0b0d0]">{product.id}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setEdit({ ...edit, image: e.target.files[0] })}
            className="block w-full text-sm text-[#b0b0d0] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1a1a2a] file:text-[#c0c0e0] hover:file:bg-[#222235] transition-all"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#1a1a2a]">
            <img 
              src={getFullImageUrl(product.image)} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            value={edit.name} 
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
            className="w-full bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#e0e0ff] focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
          />
        ) : (
          <div className="font-medium text-[#e0e0ff] max-w-xs truncate">{product.name}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            value={edit.brand} 
            onChange={(e) => setEdit({ ...edit, brand: e.target.value })}
            className="w-full bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#e0e0ff] focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
          />
        ) : (
          <div className="text-[#a0a0c0] max-w-xs truncate">{product.brand}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            type="number" 
            value={edit.price} 
            onChange={(e) => setEdit({ ...edit, price: e.target.value })}
            className="w-24 bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#e0e0ff] focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
          />
        ) : (
          <div className="font-bold text-[#7a9aff]">${parseFloat(product.price).toFixed(2)}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            type="number" 
            value={edit.quantity} 
            onChange={(e) => setEdit({ ...edit, quantity: e.target.value })}
            className="w-20 bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#e0e0ff] focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
          />
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            product.quantity > 10 ? 'bg-green-900/30 text-green-300' : 
            product.quantity > 0 ? 'bg-yellow-900/30 text-yellow-300' : 
            'bg-red-900/30 text-red-300'
          }`}>
            {product.quantity}
          </span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input 
            type="number" 
            step="0.1" 
            min="0" 
            max="5" 
            value={edit.rating} 
            onChange={(e) => setEdit({ ...edit, rating: e.target.value })}
            className="w-16 bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#e0e0ff] focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
          />
        ) : (
          <div>
            <div className="text-[#d4af37] text-lg">
              {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            </div>
            <div className="text-xs text-[#7a7a9e]">{product.rating.toFixed(1)}/5</div>
          </div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap max-w-xs">
        {isEditing ? (
          <input 
            value={edit.category} 
            onChange={(e) => setEdit({ ...edit, category: e.target.value })}
            className="w-full bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#c0c0e0] text-xs focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
            placeholder="e.g., Electronics, Gadgets"
          />
        ) : (
          <div className="text-xs text-[#a0a0c0] truncate">{getCategoryDisplay()}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-normal max-w-xs">
        {isEditing ? (
          <textarea 
            value={edit.description} 
            onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            className="w-full bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#c0c0e0] text-xs focus:outline-none focus:ring-1 focus:ring-[#7a3aff]"
            placeholder="Comma separated items"
          />
        ) : (
          <div className="text-xs text-[#b0b0d0] line-clamp-2">{getDescriptionDisplay()}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-normal max-w-xs">
        {isEditing ? (
          <textarea 
            value={edit.specs || ''} 
            onChange={(e) => setEdit({ ...edit, specs: e.target.value })}
            className="w-full bg-[#151525] border border-[#22223a] rounded-lg px-3 py-2 text-[#c0c0e0] text-xs focus:outline-none focus:ring-1 focus:ring-[#7a3aff] min-h-[60px] resize-vertical"
            placeholder="Product specifications"
          />
        ) : (
          <div className="text-xs text-[#9090b0] line-clamp-2">{product.specs}</div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-wrap gap-2 justify-center">
          {isEditing ? (
            <>
              <button 
                onClick={onSave} 
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-green-500/20"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-gray-500/20"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/20"
              >
                Edit
              </button>
              <button 
                onClick={() => handleProductDelete(product.id)} 
                className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-red-500/20"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export default Products;
