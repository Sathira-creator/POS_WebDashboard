import React, { useEffect } from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';


const InventoryPage = () => {

    const {allProducts, setAllProducts , currentPage, setCurrentPage, totalPages, setTotalPages} = useAppContext();
  

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

  const handleSearch = async() => {

    try{
        const {data} = await axios.get('/api/inventory/search', {
                params: {
                page: currentPage,
                name: form.name,
                category: form.category,
                type: form.type,
                barcode: form.barcode,
                supplier: form.supplier,
                price: form.price,
                qty: form.qty
            }
            });

        if(data.success){
            setFilteredProducts(data.results);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        }else {
            toast.error(data.message)
        }
    
    }catch(error){
        toast.error(error.message)

    }
    
  };

  const fetchAllProducts = async (type)=>{
        try {
            const {data} = await axios.get('/api/inventory/list', {
                params: {
                page: currentPage,
                type: type
            }
            });

            if(data.success){
                setAllProducts(data.inventory);
                setTotalPages(data.totalPages);
                setTotalItems(data.totalItems);
                setStockSummary(data.summary);
            }else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
      search? handleSearch() : fetchAllProducts(filter);
    }, [currentPage, filter]);



  const baseData = search
    ? filteredProducts
    : allProducts;

  // table data
  const tableData = baseData;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleAdd = async() => {
    if (isEditing) {
      // UPDATE
      const {data} = await axios.post('/api/inventory/update', {name: form.name, category: form.category, type: form.type, barcode: form.barcode, price: Number(form.price), qty: Number(form.qty), supplier: form.supplier})

      // setAllProducts(updated);
      setIsEditing(false);
      setSelectedId(null);
    } else{

      //ADD new item
    const {data} = await axios.post('/api/inventory/add', {name: form.name, category: form.category, type: form.type, barcode: form.barcode, price: Number(form.price), qty: Number(form.qty), supplier: form.supplier})

            if (data.success){
                toast.success(data.message);
                
            } else {
                toast.error(data.message)
            }
  }

    //RESET FORM
    setForm({ name: "", category: "", type: "", barcode: "", price: "", qty: "", supplier: "" });
  };

  const handleEdit = () => {
    setSearch(false);
    const selectedProduct = allProducts.find((p) => p._id === selectedId);

    if (!selectedProduct){
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

  const handleDelete = async() => {
    setSearch(false);
    if (!selectedId) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this item? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      // call your backend delete endpoint
      const { data } = await axios.delete('/api/inventory/delete', {
        params: {
          selectedId: selectedId
        }
      });

      if (data.success) {
        toast.success(data.message || "Item deleted successfully!");
        
        // update UI state instantly without needing a full-page reload
        const filtered = allProducts.filter((p) => p._id !== selectedId);
        setAllProducts(filtered);
        setSelectedId(null);
        
        // Refresh counts and totals from the database
        fetchAllProducts(filter);
      } else {
        toast.error(data.message || "Could not delete the item.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const inStock = stockSummary.inStock;
  const lowStock = stockSummary.lowStock;
  const outStock = stockSummary.outStock;

  

  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-30 mb-6">
        <div className="bg-green-400 text-center p-6 rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() =>{ 
          setSearch(false);
          setCurrentPage(1);
          setFilter("inStock")
          }}>
          <h2 className="font-bold">IN STOCK</h2>
          <p className="text-3xl font-bold">{inStock} Items</p>
        </div>
        <div className="bg-yellow-300 text-center p-6 rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
          setSearch(false);
          setCurrentPage(1);
          setFilter("lowStock")
        }}>
          <h2 className="font-bold">LOW STOCK</h2>
          <p className="text-3xl font-bold">{lowStock} Items</p>
        </div>
        <div className="bg-red-400 text-center p-6 rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
          setSearch(false);
          setCurrentPage(1);
          setFilter("outStock")
        } }>
          <h2 className="font-bold">OUT OF STOCK</h2>
          <p className="text-3xl font-bold">{outStock} Items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Table */}
        <div className="bg-cyan-100 p-4 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-300">
              <tr>
                <th className="p-2">Item</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Price</th>
                <th className="p-2">Barcode</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Category</th>
                <th className="p-2">ProductType</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((p) => (
                <tr 
                  key={p._id}
                  onClick={() => setSelectedId(p._id)}
                  className={`cursor-pointer border-b transition-colors ${
                    selectedId === p._id ? 'bg-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.qty}</td>
                  <td className="p-2">${p.price}</td>
                  <td className="p-2">{p.barcode}</td>
                  <td className="p-2">{p.supplier}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.type}</td>
                </tr>
              ))}
              
            </tbody>
            
          </table>
          <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                className="bg-gray-300 disabled:opacity-50 px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Prev
              </button>

              <span className="font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="bg-gray-300 disabled:opacity-50 px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          {/* EDIT AND DELETE BUTTONS */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleEdit}
              className="bg-green-400 px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors cursor-pointer"
            >
              EDIT
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-400 px-6 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors cursor-pointer"
            >
              REMOVE
            </button>

            <button
              onClick={() => {
                setCurrentPage(1);
                setSearch(true)
              }}
              className="bg-gray-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-500 transition-colors ml-auto cursor-pointer"
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-cyan-200 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">{search? `SEARCH` : `ADD PRODUCT`}</h2>

          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="w-full p-2 mb-2" />

          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-2 mb-2" />

          <input name="type" value={form.type} onChange={handleChange} placeholder="Product Type" className="w-full p-2 mb-2" />

          <input 
            name="barcode" 
            value={form.barcode} 
            onChange={handleChange} 
            placeholder="Barcode" 
            className="w-full p-2 mb-2 rounded border disabled:bg-gray-200 disabled:cursor-not-allowed" 
            disabled={isEditing} //uneditable when updating an item
          />

          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-2 mb-2" />

          <input name="qty" value={form.qty} onChange={handleChange} placeholder="Quantity" className="w-full p-2 mb-2" />

          <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" className="w-full p-2 mb-4" />

          <button onClick={search? handleSearch : handleAdd} className="bg-green-400 w-full py-2 rounded-lg font-bold hover:bg-green-500 transition-colors cursor-pointer">
            {search? `SEARCH` : (isEditing? `UPDATE` : `ADD`)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage