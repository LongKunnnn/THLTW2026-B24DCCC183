import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, DatePicker, Tag, InputNumber } from 'antd';
import { useModel } from 'umi';
import dayjs from 'dayjs';

const OrdersPage = () => {
  const { products, orders, setOrders, updateStock } = useModel('useStore');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (newStatus === 'Hoàn thành' && order.status !== 'Hoàn thành') {
      updateStock(order.products, 'reduce');
    } else if (newStatus === 'Đã hủy' && order.status === 'Hoàn thành') {
      updateStock(order.products, 'refund');
    }
    setOrders(orders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
    message.success('Cập nhật trạng thái thành công');
  };

  const onCreateOrder = (values: any) => {
    const newOrder = {
      id: 'DH' + Date.now(),
      ...values,
      products: selectedItems,
      totalAmount: selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'Chờ xử lý',
      createdAt: dayjs().format('YYYY-MM-DD')
    };
    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Tạo đơn hàng thành công');
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (v: number) => v.toLocaleString() + 'đ' },
    { title: 'Trạng thái', render: (record: any) => (
      <Select defaultValue={record.status} onChange={(v) => handleStatusChange(record.id, v)}>
        <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
        <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
        <Select.Option value="Đã hủy">Đã hủy</Select.Option>
      </Select>
    )},
    { title: 'Ngày tạo', dataIndex: 'createdAt' },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 20 }}>Tạo đơn hàng mới</Button>
      <Table columns={columns} dataSource={orders} rowKey="id" />

      <Modal title="Tạo đơn hàng mới" visible={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} width={800}>
        <Form form={form} layout="vertical" onFinish={onCreateOrder}>
          <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^[0-9]{10,11}$/, message: 'SĐT 10-11 số' }]}><Input /></Form.Item>
          <Form.Item label="Chọn sản phẩm">
            <Select 
              mode="multiple" 
              placeholder="Chọn sản phẩm" 
              onChange={(ids) => {
                const items = ids.map((id: number) => {
                  const p = products.find((prod: any) => prod.id === id);
                  return { productId: p.id, name: p.name, price: p.price, quantity: 1 };
                });
                setSelectedItems(items);
              }}
            >
              {products.map((p: any) => <Select.Option key={p.id} value={p.id} disabled={p.quantity === 0}>{p.name} (Kho: {p.quantity})</Select.Option>)}
            </Select>
          </Form.Item>
          {selectedItems.map((item, index) => (
            <div key={item.productId} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span>{item.name}</span>
              <InputNumber 
                min={1} 
                max={products.find((p:any) => p.id === item.productId)?.quantity} 
                defaultValue={1} 
                onChange={(v) => {
                  const newItems = [...selectedItems];
                  newItems[index].quantity = v;
                  setSelectedItems(newItems);
                }}
              />
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage;