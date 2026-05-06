import React, { useState } from 'react';
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
	Popconfirm,
	Timeline,
	Drawer,
	Progress,
	Segmented,
	InputNumber,
	Space,
	message,
	Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import moment from 'moment';

const { Option } = Select;
const { Title, Text } = Typography;

// --- DỮ LIỆU MẪU (MOCK DATA) ---
const initialWorkouts = [
	{
		id: 'w1',
		date: '2026-04-25',
		type: 'Cardio',
		duration: 45,
		calories: 400,
		notes: 'Chạy bộ công viên',
		status: 'Hoàn thành',
	},
	{
		id: 'w2',
		date: '2026-04-26',
		type: 'Strength',
		duration: 60,
		calories: 300,
		notes: 'Đẩy ngực',
		status: 'Hoàn thành',
	},
	{ id: 'w3', date: '2026-04-28', type: 'Yoga', duration: 30, calories: 150, notes: 'Giãn cơ', status: 'Hoàn thành' },
];

const initialMetrics = [
	{ id: 'm1', date: '2026-04-25', weight: 70, height: 175, restingHR: 65, sleep: 7.5 },
	{ id: 'm2', date: '2026-04-28', weight: 69.5, height: 175, restingHR: 62, sleep: 8 },
];

const initialGoals = [
	{
		id: 'g1',
		name: 'Giảm 2kg',
		type: 'Giảm cân',
		target: 68,
		current: 69.5,
		deadline: '2026-05-30',
		status: 'Đang thực hiện',
	},
	{
		id: 'g2',
		name: 'Chạy 5km',
		type: 'Cải thiện sức bền',
		target: 5,
		current: 5,
		deadline: '2026-04-20',
		status: 'Đã đạt',
	},
];

const initialExercises = [
	{
		id: 'e1',
		name: 'Push Up',
		muscle: 'Chest',
		difficulty: 'Trung bình',
		description: 'Chống đẩy tập ngực và tay sau',
		calPerHour: 400,
	},
	{ id: 'e2', name: 'Squat', muscle: 'Legs', difficulty: 'Dễ', description: 'Ngồi xổm tập mông đùi', calPerHour: 500 },
];

const FitnessTracker: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');

	// States
	const [workouts, setWorkouts] = useState<any[]>(initialWorkouts);
	const [metrics, setMetrics] = useState<any[]>(initialMetrics);
	const [goals, setGoals] = useState<any[]>(initialGoals);
	const [exercises, setExercises] = useState<any[]>(initialExercises);

	// Forms & UI States
	const [formWorkout] = Form.useForm();
	const [formMetric] = Form.useForm();
	const [formGoal] = Form.useForm();
	const [formExercise] = Form.useForm();

	const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
	const [isMetricModalOpen, setMetricModalOpen] = useState(false);
	const [isGoalDrawerOpen, setGoalDrawerOpen] = useState(false);
	const [isExerciseModalOpen, setExerciseModalOpen] = useState(false);
	const [exerciseDetailModal, setExerciseDetailModal] = useState<any>(null);

	const [editingItem, setEditingItem] = useState<any>(null);
	const [goalFilter, setGoalFilter] = useState<string>('Tất cả');

	// --- HÀM TÍNH TOÁN BMI (YÊU CẦU 3) ---
	const calculateBMI = (weight: number, height: number) => (weight / Math.pow(height / 100, 2)).toFixed(1);
	const getBMITag = (bmi: number) => {
		if (bmi < 18.5) return <Tag color='blue'>Thiếu cân ({bmi})</Tag>;
		if (bmi <= 24.9) return <Tag color='green'>Bình thường ({bmi})</Tag>;
		if (bmi <= 29.9) return <Tag color='gold'>Thừa cân ({bmi})</Tag>;
		return <Tag color='red'>Béo phì ({bmi})</Tag>;
	};

	// --- LOGIC XỬ LÝ (CRUD CHUNG) ---
	const handleSave = (values: any, type: string) => {
		const formattedValues = {
			...values,
			date: values.date?.format('YYYY-MM-DD'),
			deadline: values.deadline?.format('YYYY-MM-DD'),
		};
		const updateList = (list: any[], setList: any, isDrawer = false) => {
			if (editingItem)
				setList(list.map((item) => (item.id === editingItem.id ? { ...item, ...formattedValues } : item)));
			else setList([{ id: Date.now().toString(), ...formattedValues }, ...list]);
			message.success('Lưu thành công!');
			if (isDrawer) setGoalDrawerOpen(false);
		};

		if (type === 'workout') {
			updateList(workouts, setWorkouts);
			setWorkoutModalOpen(false);
			formWorkout.resetFields();
		}
		if (type === 'metric') {
			updateList(metrics, setMetrics);
			setMetricModalOpen(false);
			formMetric.resetFields();
		}
		if (type === 'goal') {
			updateList(goals, setGoals, true);
			formGoal.resetFields();
		}
		if (type === 'exercise') {
			updateList(exercises, setExercises);
			setExerciseModalOpen(false);
			formExercise.resetFields();
		}
	};

	const handleDelete = (id: string, type: string) => {
		if (type === 'workout') setWorkouts(workouts.filter((w) => w.id !== id));
		if (type === 'metric') setMetrics(metrics.filter((m) => m.id !== id));
		if (type === 'goal') setGoals(goals.filter((g) => g.id !== id));
		if (type === 'exercise') setExercises(exercises.filter((e) => e.id !== id));
		message.success('Đã xóa thành công!');
	};

	const openForm = (type: string, record: any = null) => {
		setEditingItem(record);
		const formToUse =
			type === 'workout' ? formWorkout : type === 'metric' ? formMetric : type === 'goal' ? formGoal : formExercise;
		if (record)
			formToUse.setFieldsValue({
				...record,
				date: record.date ? moment(record.date) : null,
				deadline: record.deadline ? moment(record.deadline) : null,
			});
		else formToUse.resetFields();

		if (type === 'workout') setWorkoutModalOpen(true);
		if (type === 'metric') setMetricModalOpen(true);
		if (type === 'goal') setGoalDrawerOpen(true);
		if (type === 'exercise') setExerciseModalOpen(true);
	};

	// --- RENDER ---
	return (
		<div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
			<Card title='FitTrack - Hệ Thống Theo Dõi Sức Khỏe (TH08)'>
				<Tabs activeKey={activeTab} onChange={setActiveTab} type='card'>
					{/* TAB 1: DASHBOARD */}
					<Tabs.TabPane tab='📊 Dashboard' key='1'>
						<Row gutter={16}>
							<Col span={6}>
								<Card>
									<Statistic title='Buổi tập tháng này' value={workouts.length} prefix={<FireOutlined />} />
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic title='Calo đã đốt' value={workouts.reduce((s, w) => s + w.calories, 0)} suffix='kcal' />
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic
										title='Streak (Ngày liên tiếp)'
										value={3}
										suffix='ngày'
										valueStyle={{ color: '#faad14' }}
									/>
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic
										title='Mục tiêu hoàn thành'
										value={Math.round((goals.filter((g) => g.status === 'Đã đạt').length / (goals.length || 1)) * 100)}
										suffix='%'
										valueStyle={{ color: '#52c41a' }}
									/>
								</Card>
							</Col>
						</Row>
						<Row gutter={24} style={{ marginTop: 24 }}>
							<Col span={16}>
								<Card title='Sự thay đổi cân nặng'>
									<Line data={metrics} xField='date' yField='weight' point={{ size: 5, shape: 'diamond' }} />
								</Card>
							</Col>
							<Col span={8}>
								<Card title='5 buổi tập gần nhất'>
									<Timeline>
										{workouts.slice(0, 5).map((w) => (
											<Timeline.Item key={w.id} color={w.status === 'Hoàn thành' ? 'green' : 'red'}>
												<p>
													<b>{w.date}</b>: {w.type} ({w.duration} phút)
												</p>
												<p style={{ color: '#888' }}>{w.notes}</p>
											</Timeline.Item>
										))}
									</Timeline>
								</Card>
							</Col>
						</Row>
					</Tabs.TabPane>

					{/* TAB 2: NHẬT KÝ TẬP LUYỆN */}
					<Tabs.TabPane tab='🏃 Nhật ký tập luyện' key='2'>
						<Button type='primary' onClick={() => openForm('workout')} style={{ marginBottom: 16 }}>
							+ Thêm buổi tập
						</Button>
						<Table
							dataSource={workouts}
							rowKey='id'
							columns={[
								{ title: 'Ngày', dataIndex: 'date' },
								{
									title: 'Loại bài tập',
									dataIndex: 'type',
									filters: [
										{ text: 'Cardio', value: 'Cardio' },
										{ text: 'Strength', value: 'Strength' },
										{ text: 'Yoga', value: 'Yoga' },
									],
									onFilter: (value: any, record) => record.type === value,
								},
								{ title: 'Thời lượng', dataIndex: 'duration', render: (v) => `${v} phút` },
								{ title: 'Calo đốt', dataIndex: 'calories', render: (v) => `${v} kcal` },
								{
									title: 'Trạng thái',
									dataIndex: 'status',
									render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'red'}>{s}</Tag>,
								},
								{
									title: 'Thao tác',
									render: (_, record) => (
										<Space>
											<Button size='small' onClick={() => openForm('workout', record)} icon={<EditOutlined />} />
											<Popconfirm title='Xóa buổi tập này?' onConfirm={() => handleDelete(record.id, 'workout')}>
												<Button size='small' danger icon={<DeleteOutlined />} />
											</Popconfirm>
										</Space>
									),
								},
							]}
						/>
					</Tabs.TabPane>

					{/* TAB 3: CHỈ SỐ SỨC KHỎE */}
					<Tabs.TabPane tab='❤️ Chỉ số sức khỏe' key='3'>
						<Button type='primary' onClick={() => openForm('metric')} style={{ marginBottom: 16 }}>
							+ Thêm chỉ số
						</Button>
						<Table
							dataSource={metrics}
							rowKey='id'
							columns={[
								{ title: 'Ngày', dataIndex: 'date' },
								{ title: 'Cân nặng (kg)', dataIndex: 'weight' },
								{ title: 'Chiều cao (cm)', dataIndex: 'height' },
								{ title: 'Nhịp tim nghỉ', dataIndex: 'restingHR', render: (v) => `${v} bpm` },
								{ title: 'Giấc ngủ', dataIndex: 'sleep', render: (v) => `${v} giờ` },
								{ title: 'BMI & Phân loại', render: (_, r) => getBMITag(parseFloat(calculateBMI(r.weight, r.height))) },
								{
									title: 'Thao tác',
									render: (_, record) => (
										<Space>
											<Button size='small' onClick={() => openForm('metric', record)} icon={<EditOutlined />} />
											<Popconfirm title='Xóa chỉ số này?' onConfirm={() => handleDelete(record.id, 'metric')}>
												<Button size='small' danger icon={<DeleteOutlined />} />
											</Popconfirm>
										</Space>
									),
								},
							]}
						/>
					</Tabs.TabPane>

					{/* TAB 4: QUẢN LÝ MỤC TIÊU */}
					<Tabs.TabPane tab='🎯 Quản lý mục tiêu' key='4'>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
							<Segmented
								options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']}
								value={goalFilter}
								onChange={(v) => setGoalFilter(v as string)}
							/>
							<Button type='primary' onClick={() => openForm('goal')}>
								+ Thêm mục tiêu
							</Button>
						</div>
						<Row gutter={16}>
							{goals
								.filter((g) => goalFilter === 'Tất cả' || g.status === goalFilter)
								.map((g) => (
									<Col span={8} key={g.id}>
										<Card
											title={g.name}
											extra={<Tag color={g.status === 'Đã đạt' ? 'green' : 'orange'}>{g.status}</Tag>}
											actions={[
												<Popconfirm title='Xóa mục tiêu?' onConfirm={() => handleDelete(g.id, 'goal')}>
													<DeleteOutlined style={{ color: 'red' }} />
												</Popconfirm>,
											]}
										>
											<p>
												<b>Loại:</b> {g.type} | <b>Deadline:</b> {g.deadline}
											</p>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													marginBottom: 8,
												}}
											>
												<span>Tiến độ:</span>
												<InputNumber
													size='small'
													value={g.current}
													onChange={(val) => setGoals(goals.map((x) => (x.id === g.id ? { ...x, current: val } : x)))}
												/>{' '}
												/ {g.target}
											</div>
											<Progress
												percent={Math.min(100, Math.round((g.current / g.target) * 100))}
												status={g.current >= g.target ? 'success' : 'active'}
											/>
										</Card>
									</Col>
								))}
						</Row>
					</Tabs.TabPane>

					{/* TAB 5: THƯ VIỆN BÀI TẬP */}
					<Tabs.TabPane tab='📚 Thư viện bài tập' key='5'>
						<Button type='primary' onClick={() => openForm('exercise')} style={{ marginBottom: 16 }}>
							+ Thêm bài tập
						</Button>
						<Row gutter={16}>
							{exercises.map((e) => (
								<Col span={8} key={e.id}>
									<Card
										hoverable
										title={e.name}
										extra={<Tag color={e.difficulty === 'Khó' ? 'red' : 'green'}>{e.difficulty}</Tag>}
										onClick={() => setExerciseDetailModal(e)}
										style={{ marginBottom: 16 }}
									>
										<p>
											<b>Nhóm cơ:</b> {e.muscle}
										</p>
										<p>{e.description}</p>
										<p style={{ color: '#f5222d', fontWeight: 'bold' }}>~ {e.calPerHour} kcal/giờ</p>
									</Card>
								</Col>
							))}
						</Row>
					</Tabs.TabPane>
				</Tabs>
			</Card>

			{/* --- CÁC MODALS & DRAWERS GỘP CHUNG BÊN DƯỚI NÀY --- */}
			{/* Modal Tập luyện */}
			<Modal
				title='Cập nhật buổi tập'
				visible={isWorkoutModalOpen}
				onOk={() => formWorkout.submit()}
				onCancel={() => setWorkoutModalOpen(false)}
			>
				<Form form={formWorkout} layout='vertical' onFinish={(v) => handleSave(v, 'workout')}>
					<Form.Item name='date' label='Ngày' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='type' label='Loại'>
						<Select>
							<Option value='Cardio'>Cardio</Option>
							<Option value='Strength'>Strength</Option>
							<Option value='Yoga'>Yoga</Option>
							<Option value='HIIT'>HIIT</Option>
						</Select>
					</Form.Item>
					<Form.Item name='duration' label='Thời lượng (phút)'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='calories' label='Calo đốt'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='status' label='Trạng thái' initialValue='Hoàn thành'>
						<Select>
							<Option value='Hoàn thành'>Hoàn thành</Option>
							<Option value='Bỏ lỡ'>Bỏ lỡ</Option>
						</Select>
					</Form.Item>
					<Form.Item name='notes' label='Ghi chú'>
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal Chỉ số */}
			<Modal
				title='Cập nhật chỉ số'
				visible={isMetricModalOpen}
				onOk={() => formMetric.submit()}
				onCancel={() => setMetricModalOpen(false)}
			>
				<Form form={formMetric} layout='vertical' onFinish={(v) => handleSave(v, 'metric')}>
					<Form.Item name='date' label='Ngày' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='weight' label='Cân nặng (kg)'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='height' label='Chiều cao (cm)'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='restingHR' label='Nhịp tim (bpm)'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='sleep' label='Giờ ngủ'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>

			{/* Drawer Mục tiêu (Yêu cầu 4) */}
			<Drawer
				title='Thêm/Sửa mục tiêu'
				placement='right'
				onClose={() => setGoalDrawerOpen(false)}
				visible={isGoalDrawerOpen}
				width={400}
				extra={
					<Button type='primary' onClick={() => formGoal.submit()}>
						Lưu
					</Button>
				}
			>
				<Form form={formGoal} layout='vertical' onFinish={(v) => handleSave(v, 'goal')}>
					<Form.Item name='name' label='Tên mục tiêu' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='type' label='Loại'>
						<Select>
							<Option value='Giảm cân'>Giảm cân</Option>
							<Option value='Tăng cơ'>Tăng cơ</Option>
							<Option value='Cải thiện sức bền'>Cải thiện sức bền</Option>
						</Select>
					</Form.Item>
					<Form.Item name='target' label='Giá trị cần đạt'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='current' label='Đã đạt được' initialValue={0}>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='deadline' label='Deadline'>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='status' label='Trạng thái' initialValue='Đang thực hiện'>
						<Select>
							<Option value='Đang thực hiện'>Đang thực hiện</Option>
							<Option value='Đã đạt'>Đã đạt</Option>
							<Option value='Đã hủy'>Đã hủy</Option>
						</Select>
					</Form.Item>
				</Form>
			</Drawer>

			{/* Modal Bài tập */}
			<Modal
				title='Thêm bài tập'
				visible={isExerciseModalOpen}
				onOk={() => formExercise.submit()}
				onCancel={() => setExerciseModalOpen(false)}
			>
				<Form form={formExercise} layout='vertical' onFinish={(v) => handleSave(v, 'exercise')}>
					<Form.Item name='name' label='Tên bài tập'>
						<Input />
					</Form.Item>
					<Form.Item name='muscle' label='Nhóm cơ'>
						<Select>
							<Option value='Chest'>Chest</Option>
							<Option value='Legs'>Legs</Option>
							<Option value='Back'>Back</Option>
							<Option value='Core'>Core</Option>
						</Select>
					</Form.Item>
					<Form.Item name='difficulty' label='Độ khó'>
						<Select>
							<Option value='Dễ'>Dễ</Option>
							<Option value='Trung bình'>Trung bình</Option>
							<Option value='Khó'>Khó</Option>
						</Select>
					</Form.Item>
					<Form.Item name='calPerHour' label='Calo/Giờ'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal Xem chi tiết bài tập */}
			<Modal
				title='Chi tiết bài tập'
				visible={!!exerciseDetailModal}
				onCancel={() => setExerciseDetailModal(null)}
				footer={[<Button onClick={() => setExerciseDetailModal(null)}>Đóng</Button>]}
			>
				{exerciseDetailModal && (
					<div>
						<Title level={4}>{exerciseDetailModal.name}</Title>
						<p>
							<b>Nhóm cơ:</b> <Tag>{exerciseDetailModal.muscle}</Tag>
						</p>
						<p>
							<b>Độ khó:</b>{' '}
							<Tag color={exerciseDetailModal.difficulty === 'Khó' ? 'red' : 'green'}>
								{exerciseDetailModal.difficulty}
							</Tag>
						</p>
						<p>
							<b>Mô tả:</b> {exerciseDetailModal.description}
						</p>
						<p>
							<b>Lượng calo đốt:</b> ~{exerciseDetailModal.calPerHour} kcal/giờ
						</p>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default FitnessTracker;
