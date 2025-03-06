import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InventoryList = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/stocks')
            .then(response => {
                setItems(response.data);
            })
            .catch(error => {
                console.error("Ürünler getirilirken hata:", error);
            });
    }, []);

    return (
        <div>
            <h1>Stok Ürünleri</h1>
            <ul>
                {items.map(item => (
                    <li key={item.Id}>{item.Name} - Stok: {item.TransactionUnitMultiplier}</li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;
