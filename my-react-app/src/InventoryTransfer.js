import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryTransfer = () => {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [targetWarehouse, setTargetWarehouse] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/stocks').then(res => setItems(res.data));
    axios.get('http://127.0.0.1:8000/warehouses').then(res => setWarehouses(res.data));
  }, []);

  const transferStock = () => {
    axios.put(`http://127.0.0.1:8000/transfer_stock/${selectedItem}`, null, {
      params: {
        source_warehouse_id: sourceWarehouse,
        target_warehouse_id: targetWarehouse,
        quantity: quantity
      }
    })
    .then(res => setMessage(res.data.message))
    .catch(err => setMessage(err.response.data.detail));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Stok Transferi</h1>

      <div className="mb-4">
        <label>Ürün Seçimi:</label>
        <select className="ml-2 border" onChange={(e) => setSelectedItem(e.target.value)}>
          <option value="">Ürün seçin</option>
          {items.map(item => (
            <option key={item.Id} value={item.Id}>{item.Name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label>Kaynak Depo:</label>
        <select className="ml-2 border" onChange={(e) => setSourceWarehouse(e.target.value)}>
          <option value="">Depo seçin</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.Id} value={warehouse.Id}>{warehouse.Name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label>Hedef Depo:</label>
        <select className="ml-2 border" onChange={(e) => setTargetWarehouse(e.target.value)}>
          <option value="">Depo seçin</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.Id} value={warehouse.Id}>{warehouse.Name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label>Miktar:</label>
        <input className="ml-2 border" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>

      <button className="bg-blue-500 text-white px-4 py-2" onClick={transferStock}>
        Transfer Yap
      </button>

      {message && <div className="mt-4">{message}</div>}
    </div>
  );
};

export default InventoryTransfer;
