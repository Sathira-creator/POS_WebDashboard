import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const withCreds = { withCredentials: true };

const InventoryPage = () => {
  const { allProducts, setAllProducts, currentPage, setCurrentPage, totalPages, setTotalPages, navigate } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [stockSummary, setStockSummary] = useState({ inStock: 0, lowStock: 0, outStock: 0 });

  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    barcode: "",
    price: "",
    qty: "",
    supplier: "",
  });

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState(false);

  // Helper to get active shop headers
  const getHeaders = () => {
    const activeShopId = localStorage.getItem('activeShopId');
    if (!activeShopId) {
      toast.error("No active shop selected.");
      navigate('/');
      return null;
    }
    return { 'x-shop-id': activeShopId };
  };

  const handleSearch = async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const { data } = await axios.get('/api/inventory/search', {
        headers,
        params: {
          page: currentPage,
          name: form.name,
          category: form.category,
          type: form.type,
          barcode: form.barcode,
          supplier: form.supplier,
          price: form.price,
          qty: form.qty
        },
        ...withCreds
      });

      if (data.success) {
        setFilteredProducts(data.results);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchAllProducts = async (type) => {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const { data } = await axios.get('/api/inventory/list', {
        headers,
        params: {
          page: currentPage,
          type: type
        },
        ...withCreds
      });

      if (data.success) {
        setAllProducts(data.inventory);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setStockSummary(data.summary);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    search ? handleSearch() : fetchAllProducts(filter);
  }, [currentPage, filter]);

  const baseData = search ? filteredProducts : allProducts;
  const tableData = baseData;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;

      if (isEditing) {
        // UPDATE
        const { data } = await axios.post('/api/inventory/update', {
          selectedId,
          name: form.name,
          category: form.category,
          type: form.type,
          barcode: form.barcode,
          price: Number(form.price),
          qty: Number(form.qty),
          supplier: form.supplier
        }, { headers, ...withCreds });

        if (data.success) {
          toast.success(data.message || "Item updated successfully!");
          setIsEditing(false);
          setSelectedId(null);
          fetchAllProducts(filter);
        } else {
          toast.error(data.message);
        }
      } else {
        // ADD new item
        const { data } = await axios.post('/api/inventory/add', {
          name: form.name,
          category: form.category,
          type: form.type,
          barcode: form.barcode,
          price: Number(form.price),
          qty: Number(form.qty),
          supplier: form.supplier
        }, { headers, ...withCreds });

        if (data.success) {
          toast.success(data.message);
          fetchAllProducts(filter);
        } else {
          toast.error(data.message);
        }
      }

      // RESET FORM
      setForm({ name: "", category: "", type: "", barcode: "", price: "", qty: "", supplier: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = () => {
    setSearch(false);
    const selectedProduct = allProducts.find((p) => p._id === selectedId);

    if (!selectedProduct) {
      toast.error("Please select a product to edit.");
      return;
    }

    setForm({
      name: selectedProduct.name,
      category: selectedProduct.category,
      type: selectedProduct.type,
      barcode: selectedProduct.barcode,
      price: selectedProduct.price,
      qty: selectedProduct.qty,
      supplier: selectedProduct.supplier,
    });

    setIsEditing(true);
  };

  const handleDelete = async () => {
    setSearch(false);
    if (!selectedId) {
      toast.error("Please select an item to delete.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to delete this item? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      const headers = getHeaders();
      if (!headers) return;

      const { data } = await axios.delete('/api/inventory/delete', {
        headers,
        params: { selectedId },
        ...withCreds
      });

      if (data.success) {
        toast.success(data.message || "Item deleted successfully!");
        
        const filtered = allProducts.filter((p) => p._id !== selectedId);
        setAllProducts(filtered);
        setSelectedId(null);
        
        fetchAllProducts(filter);
      } else {
        toast.error(data.message || "Could not delete the item.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const inStock = stockSummary.inStock;
  const lowStock = stockSummary.lowStock;
  const outStock = stockSummary.outStock;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* In Stock */}
        <div 
          onClick={() => { 
            setSearch(false);
            setCurrentPage(1);
            setFilter("inStock");
          }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold tracking-wider text-emerald-600 uppercase mb-1">In Stock</p>
            <p className="text-3xl font-black text-[#0D1B2A]">{inStock} <span className="text-sm font-semibold text-gray-400">Items</span></p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>

        {/* Low Stock */}
        <div 
          onClick={() => {
            setSearch(false);
            setCurrentPage(1);
            setFilter("lowStock");
          }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold tracking-wider text-amber-600 uppercase mb-1">Low Stock</p>
            <p className="text-3xl font-black text-[#0D1B2A]">{lowStock} <span className="text-sm font-semibold text-gray-400">Items</span></p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => {
            setSearch(false);
            setCurrentPage(1);
            setFilter("outStock");
          }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold tracking-wider text-rose-600 uppercase mb-1">Out of Stock</p>
            <p className="text-3xl font-black text-[#0D1B2A]">{outStock} <span className="text-sm font-semibold text-gray-400">Items</span></p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Container (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#0D1B2A] to-[#1B365D] text-white text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold rounded-l-xl">Item</th>
                  <th className="p-4 font-semibold text-center">Qty</th>
                  <th className="p-4 font-semibold text-center">Price</th>
                  <th className="p-4 font-semibold">Barcode</th>
                  <th className="p-4 font-semibold">Supplier</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold rounded-r-xl">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tableData.map((p) => (
                  <tr 
                    key={p._id}
                    onClick={() => setSelectedId(p._id)}
                    className={`cursor-pointer transition-all duration-150 ${
                      selectedId === p._id 
                        ? 'bg-[#E6F4FE] border-l-4 border-[#0070F3]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-4 font-bold text-[#0D1B2A]">{p.name}</td>
                    <td className="p-4 text-center font-semibold text-gray-700">{p.qty}</td>
                    <td className="p-4 text-center font-semibold text-gray-700">Rs.{Number(p.price).toFixed(2)}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{p.barcode}</td>
                    <td className="p-4 text-gray-600">{p.supplier}</td>
                    <td className="p-4 text-gray-600">{p.category}</td>
                    <td className="p-4 text-gray-600">{p.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tableData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <p className="font-semibold text-base">No inventory items found</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Previous
            </button>

            <span className="font-bold text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage >= (totalPages || 1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={handleEdit}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
            >
              EDIT
            </button>

            <button
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
            >
              REMOVE
            </button>

            <button
              onClick={() => {
                setCurrentPage(1);
                setSearch(true);
              }}
              className="bg-[#0D1B2A] hover:bg-[#1B365D] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all ml-auto cursor-pointer active:scale-98"
            >
              SEARCH MODE
            </button>
          </div>
        </div>

        {/* Input Form Container (Spans 1 column) */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-[#0D1B2A]">
              {search ? `Search Inventory` : (isEditing ? `Edit Product` : `Add New Product`)}
            </h2>
            {isEditing && (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setForm({ name: "", category: "", type: "", barcode: "", price: "", qty: "", supplier: "" });
                }}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Graphic Hoodie" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Apparel" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Type</label>
              <input name="type" value={form.type} onChange={handleChange} placeholder="e.g. Merch" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barcode</label>
              <input 
                name="barcode" 
                value={form.barcode} 
                onChange={handleChange} 
                placeholder="Scan or type barcode" 
                className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0070F3] transition-colors" 
                disabled={isEditing} 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (Rs.)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="0" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier</label>
              <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier Name" className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#0070F3] transition-colors mb-2" />
            </div>

            <button 
              onClick={search ? handleSearch : handleAdd} 
              className="w-full bg-gradient-to-r from-[#0070F3] to-[#208AEF] hover:from-[#005bb5] hover:to-[#1a73cc] text-white py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98 uppercase tracking-wider"
            >
              {search ? `Execute Search` : (isEditing ? `Update Product` : `Add Product`)}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InventoryPage;