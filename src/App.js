import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockDetails, setStockDetails] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchWarehouses();
    fetchStockDetails();
  }, []);

  const fetchStocks = async () => {
    try {
      const stockRes = await axios.get("http://127.0.0.1:8000/stocks");
      setItems(stockRes.data);
      setFilteredItems(stockRes.data);
    } catch (error) {
      console.error("Stokları çekerken hata:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehouseRes = await axios.get("http://127.0.0.1:8000/warehouses");
      setWarehouses(warehouseRes.data);
    } catch (error) {
      console.error("Depoları çekerken hata:", error);
    }
  };

  const fetchStockDetails = async () => {
    try {
      const stockDetailRes = await axios.get("http://127.0.0.1:8000/stock_details");
      setStockDetails(stockDetailRes.data);
    } catch (error) {
      console.error("Stok detaylarını çekerken hata:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredItems(items.filter((item) => item.Name.toLowerCase().includes(term)));
    setShowDropdown(true);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowDropdown(false);
  };

  const handleTransfer = async () => {
    if (!selectedItem || !sourceWarehouseId || !targetWarehouseId || !quantity) {
      alert("Lütfen tüm alanları doldurun ve ürün seçin.");
      return;
    }

    try {
      const transferUrl = `http://127.0.0.1:8000/transfer_stock/${selectedItem.Id}?source_warehouse_id=${sourceWarehouseId}&target_warehouse_id=${targetWarehouseId}&quantity=${quantity}`;
      const res = await axios.put(transferUrl);
      alert(res.data.detail);

      fetchStocks();
      fetchStockDetails();
    } catch (error) {
      alert(error.response?.data?.detail || "Bilinmeyen hata!");
    }
  };

  const handleSupplierPurchase = async () => {
    if (!selectedItem || !quantity) {
      alert("Lütfen bir ürün ve miktar seçin.");
      return;
    }

    try {
      const supplierUrl = `http://127.0.0.1:8000/transfer_stock/${selectedItem.Id}?source_warehouse_id=0&target_warehouse_id=2&quantity=${quantity}`;
      const res = await axios.put(supplierUrl);
      alert(res.data.detail);

      fetchStocks();
      fetchStockDetails();
    } catch (error) {
      alert(error.response?.data?.detail || "Bilinmeyen hata!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📦 Stok Yönetim Paneli</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Kaynak Depo */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">🏢 Kaynak Depo</h2>
          <select
            value={sourceWarehouseId}
            onChange={(e) => setSourceWarehouseId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Depo Seçin</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.Id} value={warehouse.Id}>
                {warehouse.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Hedef Depo */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">📍 Hedef Depo</h2>
          <select
            value={targetWarehouseId}
            onChange={(e) => setTargetWarehouseId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Depo Seçin</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.Id} value={warehouse.Id}>
                {warehouse.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Ürün Seçimi */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">🔍 Ürün Seçimi</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Ürün Ara..."
            className="w-full p-2 border rounded"
          />
          {showDropdown && (
            <ul className="border rounded mt-2 bg-white shadow-md max-h-40 overflow-y-auto">
              {filteredItems.map((item) => (
                <li key={item.Id} onClick={() => handleSelectItem(item)} className="cursor-pointer p-2 hover:bg-gray-200">
                  {item.Name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2">
            <label className="block mb-1">📦 Miktar:</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button onClick={handleTransfer} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          🚚 Transfer Yap
        </button>
        <button onClick={handleSupplierPurchase} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          🛒 Tedarikçiden Alım Yap (Dora)
        </button>
      </div>
    </div>
  );
}

export default App;
