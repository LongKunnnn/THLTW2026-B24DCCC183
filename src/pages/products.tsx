import React, { useState } from 'react';
import { Table, Tag, Space, Input, Select, Slider, Card, Button, Modal, Form, InputNumber, message } from 'antd';
import { useModel } from 'umi';

const ProductsPage = () => {
  const { products, setProducts } = useModel('useStore');
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  const getStatus = (qty: number) => {
    if (qty > 10) return <Tag color="green">Còn hàng</Tag>;
    if (qty > 0) return <Tag color="orange">Sắp hết</Tag>;
    return <Tag color="red">Hết hàng</Tag>;
  };

  const filteredData = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (filterCategory === 'All' || p.category === filterCategory) &&
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  const handleEdit = (record: any) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const onSave = () => {
    const values = form.getFieldsValue();
    setProducts(products.map((p: any) => p.id === editingProduct.id ? { ...p, ...values } : p));
    setIsModalOpen(false);
    message.success('Cập nhật thành công');
  };

  const columns = [
    { title: 'STT', render: (_:any, __:any, index:number) => index + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name', sorter: (a:any, b:any) => a.name.localeCompare(b.name) },
    { title: 'Danh mục', dataIndex: 'category' },
    { title: 'Giá', dataIndex: 'price', render: (v:number) => v.toLocaleString() + 'đ', sorter: (a:any, b:any) => a.price - b.price },
    { title: 'Số lượng', dataIndex: 'quantity', sorter: (a:any, b:any) => a.quantity - b.quantity },
    { title: 'Trạng thái', render: (record:any) => getStatus(record.quantity) },
    { title: 'Thao tác', render: (record:any) => <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button> }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card title="Bộ lọc tìm kiếm" style={{ marginBottom: 20 }}>
        <Space size="large">
          <Input placeholder="Tìm tên sản phẩm..." onChange={e => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Select defaultValue="All" style={{ width: 150 }} onChange={setFilterCategory}>
            <Select.Option value="All">Tất cả danh mục</Select.Option>
            <Select.Option value="Laptop">Laptop</Select.Option>
            <Select.Option value="Điện thoại">Điện thoại</Select.Option>
          </Select>
          <div style={{ width: 300 }}>
            <span>Khoảng giá:</span>
            <Slider range max={50000000} defaultValue={[0, 50000000]} onAfterChange={setPriceRange} />
          </div>
        </Space>
      </Card>
      
      <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 5 }} />

      <Modal title="Sửa sản phẩm" visible={isModalOpen} onOk={onSave} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm"><Input /></Form.Item>
          <Form.Item name="price" label="Giá"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quantity" label="Số lượng"><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;