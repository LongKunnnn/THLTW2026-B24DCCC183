import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const ProductManager: React.FC = () => {
  // 1. Khởi tạo dữ liệu mẫu
  const initialData: Product[] = [
    { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
    { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
    { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
    { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
  ];

  const [products, setProducts] = useState<Product[]>(initialData);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 4. Xử lý tìm kiếm Realtime
  const handleSearch = (value: string) => {
    const filtered = products.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Cập nhật lại danh sách hiển thị khi danh sách gốc thay đổi
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // 2. Thêm sản phẩm mới
  const handleAddProduct = (values: any) => {
    const newProduct: Product = {
      id: Date.now(), // Tạo ID tạm thời
      ...values,
    };
    setProducts([...products, newProduct]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Thêm sản phẩm thành công!');
  };

  // 3. Xóa sản phẩm
  const handleDelete = (id: number) => {
    const newProducts = products.filter(item => item.id !== id);
    setProducts(newProducts);
    message.success('Đã xóa sản phẩm!');
  };

  // Định nghĩa các cột cho Table
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => val.toLocaleString('vi-VN') + ' đ'
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Product) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="QUẢN LÝ SẢN PHẨM" style={{ margin: 20 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        {/* Tìm kiếm */}
        <Input
          placeholder="Tìm tên sản phẩm..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        {/* Nút Thêm */}
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          Thêm sản phẩm
        </Button>
      </Space>

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />

      {/* Modal Thêm Sản Phẩm */}
      <Modal
        title="Thêm sản phẩm mới"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[
              { required: true, message: 'Vui lòng nhập giá!' },
              { type: 'number', min: 1, message: 'Giá phải là số dương!' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { 
                validator: (_, value) => 
                  value > 0 && Number.isInteger(value) 
                    ? Promise.resolve() 
                    : Promise.reject('Số lượng phải là số nguyên dương!') 
              }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManager;