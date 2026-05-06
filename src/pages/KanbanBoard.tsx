import React, { useState, useEffect } from 'react';
import {
	Tabs,
	Card,
	Row,
	Col,
	Statistic,
	Table,
	Tag,
	Button,
	Modal,
	Form,
	Input,
	Select,
	DatePicker,
	Space,
	message,
	Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const COLUMNS = {
	TODO: { id: 'TODO', title: 'Cần làm', color: '#108ee9' },
	IN_PROGRESS: { id: 'IN_PROGRESS', title: 'Đang làm', color: '#faad14' },
	DONE: { id: 'DONE', title: 'Hoàn thành', color: '#87d068' },
};

const KanbanApp: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');
	const [tasks, setTasks] = useState<any[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingTask, setEditingTask] = useState<any>(null);
	const [form] = Form.useForm();

	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
		const savedTasks = localStorage.getItem('th09_kanban_tasks');
		if (savedTasks) {
			setTasks(JSON.parse(savedTasks));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('th09_kanban_tasks', JSON.stringify(tasks));
	}, [tasks]);

	const totalTasks = tasks.length;
	const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
	const overdueTasks = tasks.filter((t) => t.status !== 'DONE' && moment(t.deadline).isBefore(moment(), 'day')).length;

	const onDragEnd = (result: any) => {
		if (!result.destination) return;
		const { source, destination } = result;

		if (source.droppableId !== destination.droppableId) {
			const updatedTasks = tasks.map((task) => {
				if (task.id === result.draggableId) {
					return { ...task, status: destination.droppableId };
				}
				return task;
			});
			setTasks(updatedTasks);
			message.success('Đã cập nhật trạng thái công việc!');
		}
	};

	const handleSaveTask = (values: any) => {
		const formattedValues = {
			...values,
			deadline: values.deadline.format('YYYY-MM-DD'),
		};

		if (editingTask) {
			setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formattedValues } : t)));
			message.success('Cập nhật task thành công!');
		} else {
			setTasks([...tasks, { id: `task-${Date.now()}`, status: 'TODO', ...formattedValues }]);
			message.success('Thêm task mới thành công!');
		}
		setIsModalVisible(false);
		form.resetFields();
	};

	const handleDelete = (id: string) => {
		setTasks(tasks.filter((t) => t.id !== id));
		message.success('Đã xóa công việc');
	};

	const openEditModal = (task: any) => {
		setEditingTask(task);
		form.setFieldsValue({
			...task,
			deadline: moment(task.deadline),
		});
		setIsModalVisible(true);
	};

	const tableColumns = [
		{
			title: 'Tên công việc',
			dataIndex: 'title',
			key: 'title',
			// Tính năng tìm kiếm theo tên trên Table
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder='Tìm tên task'
						value={selectedKeys[0]}
						onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={() => confirm()}
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Space>
						<Button type='primary' onClick={() => confirm()} size='small' style={{ width: 90 }}>
							Tìm
						</Button>
						<Button onClick={() => clearFilters()} size='small' style={{ width: 90 }}>
							Xóa
						</Button>
					</Space>
				</div>
			),
			onFilter: (value: any, record: any) => record.title.toLowerCase().includes(value.toLowerCase()),
		},
		{
			title: 'Mức độ',
			dataIndex: 'priority',
			render: (p: string) => <Tag color={p === 'Cao' ? 'red' : p === 'Trung bình' ? 'orange' : 'green'}>{p}</Tag>,
		},
		{
			title: 'Deadline',
			dataIndex: 'deadline',
			sorter: (a: any, b: any) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf(),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			filters: [
				{ text: 'Cần làm', value: 'TODO' },
				{ text: 'Đang làm', value: 'IN_PROGRESS' },
				{ text: 'Hoàn thành', value: 'DONE' },
			],
			onFilter: (value: any, record: any) => record.status === value,
			render: (s: string) => (
				<Tag color={COLUMNS[s as keyof typeof COLUMNS].color}>{COLUMNS[s as keyof typeof COLUMNS].title}</Tag>
			),
		},
		{ title: 'Tags', dataIndex: 'tags', render: (tags: string[]) => tags?.map((t) => <Tag key={t}>{t}</Tag>) },
		{
			title: 'Thao tác',
			render: (_: any, record: any) => (
				<Space>
					<Button size='small' icon={<EditOutlined />} onClick={() => openEditModal(record)} />
					<Popconfirm title='Xóa task này?' onConfirm={() => handleDelete(record.id)}>
						<Button size='small' danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
			<Card
				title='Hệ Thống Quản Lý Công Việc (Nhánh TH09)'
				bordered={false}
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingTask(null);
							form.resetFields();
							setIsModalVisible(true);
						}}
					>
						Thêm Công Việc
					</Button>
				}
			>
				<Tabs activeKey={activeTab} onChange={setActiveTab} type='card'>
					{/* TAB 1: DASHBOARD */}
					<Tabs.TabPane tab='📊 Dashboard' key='1'>
						<Row gutter={16}>
							<Col span={8}>
								<Card>
									<Statistic title='Tổng số công việc' value={totalTasks} />
								</Card>
							</Col>
							<Col span={8}>
								<Card>
									<Statistic title='Đã hoàn thành' value={completedTasks} valueStyle={{ color: '#3f8600' }} />
								</Card>
							</Col>
							<Col span={8}>
								<Card>
									<Statistic title='Quá hạn (Chưa xong)' value={overdueTasks} valueStyle={{ color: '#cf1322' }} />
								</Card>
							</Col>
						</Row>
					</Tabs.TabPane>

					{/* TAB 2: KANBAN BOARD */}
					<Tabs.TabPane tab='📋 Kanban Board' key='2'>
						{isBrowser && (
							<DragDropContext onDragEnd={onDragEnd}>
								<Row gutter={16} style={{ minHeight: '60vh' }}>
									{Object.values(COLUMNS).map((col) => {
										const colTasks = tasks.filter((t) => t.status === col.id);
										return (
											<Col span={8} key={col.id}>
												<Card
													title={
														<span style={{ color: col.color, fontWeight: 'bold' }}>
															{col.title} ({colTasks.length})
														</span>
													}
													style={{ height: '100%', background: '#fbfbfb' }}
													bodyStyle={{ padding: 8 }}
												>
													<Droppable droppableId={col.id}>
														{(provided) => (
															<div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: 400 }}>
																{colTasks.map((task, index) => (
																	<Draggable key={task.id} draggableId={task.id} index={index}>
																		{(provided) => (
																			<div
																				ref={provided.innerRef}
																				{...provided.draggableProps}
																				{...provided.dragHandleProps}
																				style={{
																					userSelect: 'none',
																					padding: 16,
																					margin: '0 0 8px 0',
																					minHeight: '50px',
																					backgroundColor: '#fff',
																					borderRadius: 4,
																					boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
																					...provided.draggableProps.style,
																				}}
																			>
																				<div style={{ fontWeight: 'bold', marginBottom: 8 }}>{task.title}</div>
																				<div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
																					⏳ {task.deadline}
																				</div>
																				<Tag
																					color={
																						task.priority === 'Cao'
																							? 'red'
																							: task.priority === 'Trung bình'
																							? 'orange'
																							: 'green'
																					}
																				>
																					{task.priority}
																				</Tag>
																			</div>
																		)}
																	</Draggable>
																))}
																{provided.placeholder}
															</div>
														)}
													</Droppable>
												</Card>
											</Col>
										);
									})}
								</Row>
							</DragDropContext>
						)}
					</Tabs.TabPane>

					{/* TAB 3: DANH SÁCH TASK TABLE */}
					<Tabs.TabPane tab='🗂️ Danh sách Task' key='3'>
						<Table dataSource={tasks} columns={tableColumns} rowKey='id' />
					</Tabs.TabPane>
				</Tabs>
			</Card>

			{/* MODAL THÊM / SỬA TASK */}
			<Modal
				title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleSaveTask}>
					<Form.Item name='title' label='Tên công việc' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<TextArea rows={3} />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='deadline' label='Deadline' rules={[{ required: true }]}>
								<DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='priority' label='Mức độ ưu tiên' rules={[{ required: true }]}>
								<Select>
									<Option value='Cao'>Cao</Option>
									<Option value='Trung bình'>Trung bình</Option>
									<Option value='Thấp'>Thấp</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='tags' label='Tags'>
						<Select mode='tags' placeholder='Nhập tag và ấn Enter' style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default KanbanApp;
