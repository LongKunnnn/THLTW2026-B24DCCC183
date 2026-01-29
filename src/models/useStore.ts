import { useState, useEffect } from 'react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const INITIAL_ORDERS = [
  { id: 'DH001', customerName: 'Nguyễn Văn A', phone: '0912345678', address: '123 Nguyễn Huệ, Q1, TP.HCM', products: [{ productId: 1, name: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }], totalAmount: 25000000, status: 'Chờ xử lý', createdAt: '2024-01-15' }
];

export default () => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const updateStock = (orderProducts: any, type: 'reduce' | 'refund') => {
    setProducts((prev: any) => prev.map((p: any) => {
      const item = orderProducts.find((op: any) => op.productId === p.id);
      if (item) {
        return { ...p, quantity: type === 'reduce' ? p.quantity - item.quantity : p.quantity + item.quantity };
      }
      return p;
    }));
  };

  return { products, setProducts, orders, setOrders, updateStock };
};