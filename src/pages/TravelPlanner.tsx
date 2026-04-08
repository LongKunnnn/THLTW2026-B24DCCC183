import React, { useState, useMemo } from 'react';
import {
	Tabs,
	Table,
	Card,
	Form,
	Input,
	Select,
	Button,
	Tag,
	Row,
	Col,
	Statistic,
	InputNumber,
	Rate,
	Alert,
	Empty,
	List,
	Typography,
	message,
	Avatar,
	Divider,
} from 'antd';
import { Pie, Column } from '@ant-design/plots';

const { Option } = Select;
const { Title, Text } = Typography;

const TravelPlanner: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');
	const [formAdmin] = Form.useForm();

	const [destinations, setDestinations] = useState<any[]>([
		{
			id: '1',
			name: 'Vịnh Hạ Long',
			type: 'biển',
			price: 2000000,
			rating: 5,
			image: 'https://picsum.photos/400/250?random=1',
			description: 'Kỳ quan thiên nhiên thế giới',
			food: 500000,
			hotel: 1000000,
			transport: 500000,
		},
		{
			id: '2',
			name: 'Sapa',
			type: 'núi',
			price: 1500000,
			rating: 4.5,
			image: 'https://picsum.photos/400/250?random=2',
			description: 'Xứ sở sương mù',
			food: 400000,
			hotel: 700000,
			transport: 400000,
		},
		{
			id: '3',
			name: 'Đà Nẵng',
			type: 'biển',
			price: 3000000,
			rating: 4.8,
			image: 'https://picsum.photos/400/250?random=3',
			description: 'Thành phố đáng sống',
			food: 800000,
			hotel: 1500000,
			transport: 700000,
		},
	]);

	const [itinerary, setItinerary] = useState<any[]>([]);
	const [budgetLimit, setBudgetLimit] = useState<number>(5000000);

	const currentTotal = useMemo(() => {
		return itinerary.reduce((sum, item) => sum + (item.food + item.hotel + item.transport), 0);
	}, [itinerary]);

	const addToItinerary = (dest: any) => {
		setItinerary([...itinerary, { ...dest, itId: Date.now(), day: itinerary.length + 1 }]);
		message.success(`Đã thêm ${dest.name} vào lịch trình`);
	};

	const handleAddDestination = (values: any) => {
		const newDest = {
			...values,
			id: Date.now().toString(),
			image: `https://picsum.photos/400/250?random=${Date.now()}`,
		};
		setDestinations([...destinations, newDest]);
		formAdmin.resetFields();
	};

	return (
		<div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
			<Card bordered={false} style={{ marginBottom: 16 }}>
				<Title level={3}>Travel Planner - Lập Kế Hoạch Du Lịch (TH06)</Title>
				<Text type='secondary'>Hạn nộp: 17h hôm nay | Nhánh: TH06</Text>
			</Card>

			<Tabs activeKey={activeTab} onChange={setActiveTab} type='card'>
				{/* TRANG CHỦ - KHÁM PHÁ */}
				<Tabs.TabPane tab='🌍 Khám phá' key='1'>
					<Row gutter={[16, 16]}>
						{destinations.map((item) => (
							<Col xs={24} sm={12} md={8} key={item.id}>
								<Card
									hoverable
									cover={<img alt={item.name} src={item.image} style={{ height: 180, objectFit: 'cover' }} />}
									actions={[
										<Button type='primary' onClick={() => addToItinerary(item)}>
											Thêm vào lịch trình
										</Button>,
									]}
								>
									<Card.Meta
										title={item.name}
										description={
											<>
												<Tag color='cyan'>{item.type.toUpperCase()}</Tag>
												<div style={{ marginTop: 8 }}>
													<Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
												</div>
												<div style={{ marginTop: 8, fontWeight: 'bold', color: '#f5222d' }}>
													{item.price.toLocaleString()} VNĐ
												</div>
											</>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
				</Tabs.TabPane>

				{/* LẬP LỊCH TRÌNH */}
				<Tabs.TabPane tab='📅 Lịch trình' key='2'>
					<Row gutter={16}>
						<Col xs={24} md={16}>
							<Card title='Lịch trình của bạn'>
								{itinerary.length === 0 ? (
									<Empty description='Chưa có điểm đến nào' />
								) : (
									<List
										itemLayout='horizontal'
										dataSource={itinerary}
										renderItem={(item, index) => (
											<List.Item
												actions={[
													<Button
														danger
														size='small'
														onClick={() => setItinerary(itinerary.filter((i) => i.itId !== item.itId))}
													>
														Xóa
													</Button>,
												]}
											>
												<List.Item.Meta
													avatar={<Avatar>{index + 1}</Avatar>}
													title={item.name}
													description={`Ngày ${index + 1} - Dự kiến chi phí: ${(
														item.food +
														item.hotel +
														item.transport
													).toLocaleString()} VNĐ`}
												/>
											</List.Item>
										)}
									/>
								)}
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card title='Tổng quan chuyến đi'>
								<Statistic title='Tổng ngân sách dự kiến' value={currentTotal} suffix='VNĐ' />
								<Divider />
								<Text strong>Hạn mức ngân sách:</Text>
								<InputNumber
									style={{ width: '100%', marginTop: 8 }}
									value={budgetLimit}
									onChange={(v) => setBudgetLimit(v || 0)}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								/>
								{currentTotal > budgetLimit && (
									<Alert message='Cảnh báo: Vượt ngân sách!' type='error' showIcon style={{ marginTop: 16 }} />
								)}
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>

				{/* QUẢN LÝ NGÂN SÁCH */}
				<Tabs.TabPane tab='💰 Ngân sách' key='3'>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Card title='Phân bổ ngân sách theo hạng mục'>
								<Pie
									appendPadding={10}
									data={[
										{ type: 'Ăn uống', value: itinerary.reduce((s, i) => s + i.food, 0) },
										{ type: 'Lưu trú', value: itinerary.reduce((s, i) => s + i.hotel, 0) },
										{ type: 'Di chuyển', value: itinerary.reduce((s, i) => s + i.transport, 0) },
									]}
									angleField='value'
									colorField='type'
									radius={0.8}
									label={{ type: 'inner', offset: '-30%', content: '{percentage}' }}
								/>
							</Card>
						</Col>
						<Col xs={24} md={12}>
							<Card title='So sánh ngân sách'>
								<Column
									data={[
										{ name: 'Thực tế', value: currentTotal },
										{ name: 'Giới hạn', value: budgetLimit },
									]}
									xField='name'
									yField='value'
									color={({ name }) => (name === 'Thực tế' && currentTotal > budgetLimit ? '#f5222d' : '#1890ff')}
								/>
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>

				{/* QUẢN TRỊ (ADMIN) */}
				<Tabs.TabPane tab='⚙️ Admin' key='4'>
					<Row gutter={24}>
						<Col xs={24} lg={8}>
							<Card title='Thêm điểm đến mới'>
								<Form form={formAdmin} layout='vertical' onFinish={handleAddDestination}>
									<Form.Item name='name' label='Tên điểm đến' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
									<Form.Item name='type' label='Loại hình'>
										<Select>
											<Option value='biển'>Biển</Option>
											<Option value='núi'>Núi</Option>
											<Option value='thành phố'>Thành phố</Option>
										</Select>
									</Form.Item>
									<Form.Item name='food' label='Chi phí ăn uống'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Form.Item name='hotel' label='Chi phí lưu trú'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Form.Item name='transport' label='Chi phí di chuyển'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Button type='primary' htmlType='submit' block>
										Lưu điểm đến
									</Button>
								</Form>
							</Card>
						</Col>
						<Col xs={24} lg={16}>
							<Card title='Thống kê hệ thống'>
								<Row gutter={16}>
									<Col span={12}>
										<Statistic title='Lịch trình đã tạo' value={45} prefix='📝' />
									</Col>
									<Col span={12}>
										<Statistic title='Địa điểm phổ biến' value='Vịnh Hạ Long' />
									</Col>
								</Row>
								<Table
									style={{ marginTop: 16 }}
									dataSource={destinations}
									size='small'
									columns={[
										{ title: 'Tên', dataIndex: 'name' },
										{ title: 'Loại', dataIndex: 'type', render: (t) => <Tag>{t}</Tag> },
										{
											title: 'Rating',
											dataIndex: 'rating',
											render: (r) => <Rate disabled defaultValue={r} style={{ fontSize: 12 }} />,
										},
									]}
								/>
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default TravelPlanner;
