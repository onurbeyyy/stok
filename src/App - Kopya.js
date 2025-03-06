import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockDetails, setStockDetails] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // **Verileri getir**
  useEffect(() => {
    fetchStocks();
    fetchWarehouses();
    fetchStockDetails();
  }, []);

  // **Stokları ve detayları getir**
  const fetchStocks = async () => {
    try {
      const stockRes = await axios.get('http://127.0.0.1:8000/stocks');
      setItems(stockRes.data);
      setFilteredItems(stockRes.data);
    } catch (error) {
      console.error("Stokları çekerken hata:", error);
    }
  };

  // **Depoları getir**
  const fetchWarehouses = async () => {
    try {
      const warehouseRes = await axios.get('http://127.0.0.1:8000/warehouses');
      setWarehouses(warehouseRes.data);
    } catch (error) {
      console.error("Depoları çekerken hata:", error);
    }
  };

  // **Stok detaylarını getir**
  const fetchStockDetails = async () => {
    try {
      const stockDetailRes = await axios.get('http://127.0.0.1:8000/stock_details');
      setStockDetails(stockDetailRes.data);
    } catch (error) {
      console.error("Stok detaylarını çekerken hata:", error);
    }
  };

  // **Ürün arama**
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredItems(items.filter(item => item.Name.toLowerCase().includes(term)));
    setShowDropdown(true);
  };

  // **Ürün seçme**
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowDropdown(false);
  };

  // **Transfer işlemi**
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

  // **Tedarikçiden Dora Depoya Ürün Alma**
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
    <div className="p-4 grid grid-cols-2 gap-4">
      {/* Kaynak Depo */}
      <div>
        <h1 className="text-xl font-bold mb-4">Kaynak Depo</h1>
        <select value={sourceWarehouseId} onChange={(e) => setSourceWarehouseId(e.target.value)}>
          <option value="">Depo Seçin</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.Id} value={warehouse.Id}>{warehouse.Name}</option>
          ))}
        </select>
        {selectedItem && stockDetails[selectedItem.Id] && stockDetails[selectedItem.Id][sourceWarehouseId] !== undefined ? (
          <p>{selectedItem.Name} - Stok: {stockDetails[selectedItem.Id][sourceWarehouseId]}</p>
        ) : <p>Stok bilgisi mevcut değil</p>}
      </div>

      {/* Hedef Depo */}
      <div>
        <h1 className="text-xl font-bold mb-4">Hedef Depo</h1>
        <select value={targetWarehouseId} onChange={(e) => setTargetWarehouseId(e.target.value)}>
          <option value="">Depo Seçin</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.Id} value={warehouse.Id}>{warehouse.Name}</option>
          ))}
        </select>
        {selectedItem && stockDetails[selectedItem.Id] && stockDetails[selectedItem.Id][targetWarehouseId] !== undefined ? (
          <p>{selectedItem.Name} - Stok: {stockDetails[selectedItem.Id][targetWarehouseId]}</p>
        ) : <p>Stok bilgisi mevcut değil</p>}
      </div>

      {/* Ürün Transferi */}
      <div className="col-span-2">
        <h1 className="text-xl font-bold mb-4">Ürün Transferi</h1>
        <div>
          <label>Ürün Ara:</label>
          <input type="text" value={searchTerm} onChange={handleSearch} onFocus={() => setShowDropdown(true)} />
          {showDropdown && (
            <ul className="border rounded shadow bg-white">
              {filteredItems.map(item => (
                <li key={item.Id} onClick={() => handleSelectItem(item)} className="cursor-pointer p-2 hover:bg-gray-200">
                  {item.Name} - Toplam Stok: {stockDetails[item.Id] ? Object.values(stockDetails[item.Id]).reduce((a, b) => a + b, 0) : 0}
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedItem && (
          <p>Seçilen Ürün: {selectedItem.Name}</p>
        )}
        <div>
          <label>Miktar:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>

        {/* Ana Transfer Butonu */}
        <button onClick={handleTransfer} className="bg-blue-500 text-white p-2 rounded mr-2">
          Transfer Yap
        </button>

        {/* Tedarikçiden Alım Butonu */}
        <button
          onClick={handleSupplierPurchase}
          className={`p-2 rounded ${selectedItem ? "bg-yellow-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
          disabled={!selectedItem}
        >
          Tedarikçiden Alım Yap (Dora)
        </button>
      </div>
    </div>
  );
}

export default App;
