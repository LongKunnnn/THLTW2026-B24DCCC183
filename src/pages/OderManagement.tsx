import React, { useState, useMemo } from 'react';
import {
	Table,
	Card,
	Form,
	Input,
	Select,
	Button,
	Tag,
	Modal,
	Space,
	Row,
	Col,
	message,
	Popconfirm,
	Typography,
	DatePicker,
} from 'antd';
import moment from 'moment';

const { Option } = Select;
const { Title, Text } = Typography;

const OrderManagement: React.FC = () => {
	const [form] = Form.useForm();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [searchText, setSearchText] = useState('');
	const [filterStatus, setFilterStatus] = useState<string | null>(null);

	const customers = [
		{ id: 'KH01', name: 'Nguyễn Văn A' },
		{ id: 'KH02', name: 'Trần Thị B' },
		{ id: 'KH03', name: 'Lê Văn C' },
	];

	const products = [
		{ id: 'P1', name: 'Laptop Dell XPS', price: 25000000 },
		{ id: 'P2', name: 'Chuột Logitech', price: 500000 },
		{ id: 'P3', name: 'Bàn phím cơ', price: 1500000 },
		{ id: 'P4', name: 'Màn hình LG 24inch', price: 3000000 },
	];

	const [orders, setOrders] = useState<any[]>([
		{
			id: '1',
			orderId: 'DH001',
			customerId: 'KH01',
			orderDate: '2026-04-10',
			productIds: ['P1', 'P2'],
			total: 25500000,
			status: 'Hoàn thành',
		},
		{
			id: '2',
			orderId: 'DH002',
			customerId: 'KH02',
			orderDate: '2026-04-14',
			productIds: ['P3'],
			total: 1500000,
			status: 'Chờ xác nhận',
		},
		{
			id: '3',
			orderId: 'DH003',
			customerId: 'KH03',
			orderDate: '2026-04-15',
			productIds: ['P4', 'P2'],
			total: 3500000,
			status: 'Đang giao',
		},
	]);

	const openModal = (record?: any) => {
		setEditingId(record ? record.id : null);
		if (record) {
			form.setFieldsValue({
				...record,
				orderDate: moment(record.orderDate),
			});
		} else {
			form.resetFields();
			form.setFieldsValue({ status: 'Chờ xác nhận', orderDate: moment() });
		}
		setIsModalOpen(true);
	};

	const handleSave = (values: any) => {
		// Tính tổng tiền tự động dựa vào danh sách sản phẩm được chọn
		const calculatedTotal = values.productIds.reduce((sum: number, pId: string) => {
			const prod = products.find((p) => p.id === pId);
			return sum + (prod ? prod.price : 0);
		}, 0);

		const orderData = {
			...values,
			orderDate: values.orderDate.format('YYYY-MM-DD'),
			total: calculatedTotal,
		};

		if (editingId) {
			setOrders(orders.map((o) => (o.id === editingId ? { ...o, ...orderData } : o)));
			message.success('Cập nhật đơn hàng thành công!');
		} else {
			setOrders([{ id: Date.now().toString(), ...orderData }, ...orders]);
			message.success('Thêm đơn hàng thành công!');
		}
		setIsModalOpen(false);
	};

	const handleCancelOrder = (id: string) => {
		setOrders(orders.map((o) => (o.id === id ? { ...o, status: 'Hủy' } : o)));
		message.success('Đã hủy đơn hàng!');
	};

	const filteredOrders = useMemo(() => {
		return orders.filter((o) => {
			const customerName = customers.find((c) => c.id === o.customerId)?.name || '';
			const matchSearch =
				o.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
				customerName.toLowerCase().includes(searchText.toLowerCase());
			const matchStatus = filterStatus ? o.status === filterStatus : true;
			return matchSearch && matchStatus;
		});
	}, [orders, searchText, filterStatus]);

	const columns = [
		{ title: 'Mã ĐH', dataIndex: 'orderId', key: 'orderId', width: 100 },
		{
			title: 'Khách hàng',
			dataIndex: 'customerId',
			render: (id: string) => customers.find((c) => c.id === id)?.name || id,
		},
		{
			title: 'Ngày đặt',
			dataIndex: 'orderDate',
			sorter: (a: any, b: any) => moment(a.orderDate).unix() - moment(b.orderDate).unix(),
		},
		{
			title: 'Tổng tiền',
			dataIndex: 'total',
			render: (val: number) => (
				<Text strong type='danger'>
					{val.toLocaleString()} đ
				</Text>
			),
			sorter: (a: any, b: any) => a.total - b.total,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status: string) => {
				const color =
					status === 'Hoàn thành' ? 'green' : status === 'Đang giao' ? 'blue' : status === 'Hủy' ? 'red' : 'orange';
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			render: (_: any, record: any) => (
				<Space>
					<Button type='link' onClick={() => openModal(record)}>
						Sửa
					</Button>
					<Popconfirm
						title='Bạn có chắc chắn muốn hủy đơn hàng này?'
						onConfirm={() => handleCancelOrder(record.id)}
						disabled={record.status !== 'Chờ xác nhận'}
					>
						<Button type='link' danger disabled={record.status !== 'Chờ xác nhận'}>
							Hủy đơn
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
			<Card bordered={false}>
				<Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
					<Col>
						<Title level={3} style={{ margin: 0 }}>
							Quản Lý Đơn Hàng (KTGK)
						</Title>
					</Col>
					<Col>
						<Button type='primary' onClick={() => openModal()}>
							+ Thêm Đơn Hàng
						</Button>
					</Col>
				</Row>

				{/* BỘ LỌC & TÌM KIẾM */}
				<Row gutter={16} style={{ marginBottom: 16 }}>
					<Col span={8}>
						<Input.Search
							placeholder='Tìm theo Mã ĐH hoặc Tên Khách hàng'
							allowClear
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</Col>
					<Col span={6}>
						<Select
							placeholder='Lọc theo trạng thái'
							style={{ width: '100%' }}
							allowClear
							onChange={(val) => setFilterStatus(val)}
						>
							<Option value='Chờ xác nhận'>Chờ xác nhận</Option>
							<Option value='Đang giao'>Đang giao</Option>
							<Option value='Hoàn thành'>Hoàn thành</Option>
							<Option value='Hủy'>Hủy</Option>
						</Select>
					</Col>
				</Row>

				{/* BẢNG DỮ LIỆU */}
				<Table columns={columns} dataSource={filteredOrders} rowKey='id' pagination={{ pageSize: 5 }} />
			</Card>

			{/* MODAL THÊM / SỬA */}
			<Modal
				title={editingId ? 'Sửa Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleSave}>
					<Form.Item
						name='orderId'
						label='Mã Đơn Hàng'
						rules={[
							{ required: true, message: 'Vui lòng nhập mã đơn hàng!' },
							// Custom Validator: Kiểm tra trùng mã đơn hàng
							() => ({
								validator(_, value) {
									if (!value) return Promise.resolve();
									const isExist = orders.some((o) => o.orderId === value && o.id !== editingId);
									if (isExist) return Promise.reject(new Error('Mã đơn hàng đã tồn tại trong hệ thống!'));
									return Promise.resolve();
								},
							}),
						]}
					>
						<Input placeholder='VD: DH004' />
					</Form.Item>

					<Form.Item
						name='customerId'
						label='Khách Hàng'
						rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
					>
						<Select placeholder='Chọn khách hàng'>
							{customers.map((c) => (
								<Option key={c.id} value={c.id}>
									{c.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						name='productIds'
						label='Sản Phẩm'
						rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 sản phẩm!' }]}
					>
						<Select mode='multiple' placeholder='Chọn sản phẩm (Tự động tính tiền)'>
							{products.map((p) => (
								<Option key={p.id} value={p.id}>
									{p.name} - {p.price.toLocaleString()}đ
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						name='orderDate'
						label='Ngày Đặt Hàng'
						rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
					>
						<DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
					</Form.Item>

					<Form.Item
						name='status'
						label='Trạng Thái'
						rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
					>
						<Select>
							<Option value='Chờ xác nhận'>Chờ xác nhận</Option>
							<Option value='Đang giao'>Đang giao</Option>
							<Option value='Hoàn thành'>Hoàn thành</Option>
							<Option value='Hủy'>Hủy</Option>
						</Select>
					</Form.Item>

					<Row justify='end'>
						<Space>
							<Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
							<Button type='primary' htmlType='submit'>
								Lưu Đơn Hàng
							</Button>
						</Space>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default OrderManagement;
