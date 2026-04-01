import React, { useState } from 'react';
import {
	Tabs,
	Table,
	Card,
	Form,
	Input,
	Select,
	DatePicker,
	Button,
	message,
	Tag,
	Modal,
	Checkbox,
	Row,
	Col,
	Statistic,
	Space,
	Switch,
	Avatar,
} from 'antd';
import { Column } from '@ant-design/plots';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const ClubManagement: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');
	const [formClub] = Form.useForm();
	const [formApp] = Form.useForm();
	const [rejectReason, setRejectReason] = useState('');
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [isChangeClubModalOpen, setIsChangeClubModalOpen] = useState(false);
	const [selectedTargetClub, setSelectedTargetClub] = useState<string | null>(null);

	// === MOCK DATA & STATES ===
	const [clubs, setClubs] = useState([
		{
			id: 'C01',
			name: 'CLB Lập Trình (PTIT IT)',
			avatar: '💻',
			establishDate: '2020-09-01',
			description: '<strong>Nơi giao lưu code</strong>',
			president: 'Nguyễn Văn A',
			isActive: true,
		},
		{
			id: 'C02',
			name: 'CLB Âm Nhạc',
			avatar: '🎸',
			establishDate: '2021-10-15',
			description: '<strong>Hát hay đàn giỏi</strong>',
			president: 'Trần Thị B',
			isActive: true,
		},
	]);

	const [applications, setApplications] = useState<any[]>([
		{
			id: 'A01',
			fullName: 'Lê Văn C',
			email: 'c@ptit.edu.vn',
			phone: '0987654321',
			gender: 'Nam',
			address: 'Hà Nội',
			strengths: 'Code dạo',
			clubId: 'C01',
			reason: 'Thích học hỏi',
			status: 'Pending',
			rejectReason: '',
		},
		{
			id: 'A02',
			fullName: 'Phạm Thị D',
			email: 'd@ptit.edu.vn',
			phone: '0123456789',
			gender: 'Nữ',
			address: 'Hà Nội',
			strengths: 'Hát',
			clubId: 'C02',
			reason: 'Đam mê',
			status: 'Approved',
			rejectReason: '',
		},
	]);

	const [historyLogs, setHistoryLogs] = useState<any[]>([]);
	const [selectedAppKeys, setSelectedAppKeys] = useState<React.Key[]>([]);
	const [selectedMemberKeys, setSelectedMemberKeys] = useState<React.Key[]>([]);

	// === HELPER FUNCTIONS ===
	const addLog = (action: string, details: string) => {
		setHistoryLogs((prev) => [{ id: Date.now(), action, time: moment().format('HH:mm DD/MM/YYYY'), details }, ...prev]);
	};

	const getClubName = (id: string) => clubs.find((c) => c.id === id)?.name || 'Không xác định';

	// === CHỨC NĂNG 1: CÂU LẠC BỘ ===
	const handleSaveClub = (values: any) => {
		const newClub = { ...values, id: `C${Date.now()}`, establishDate: values.establishDate.format('YYYY-MM-DD') };
		setClubs([...clubs, newClub]);
		message.success('Thêm CLB thành công!');
		formClub.resetFields();
	};

	const clubColumns = [
		{ title: 'Avatar', dataIndex: 'avatar', render: (t: string) => <Avatar size='large'>{t}</Avatar> },
		{ title: 'Tên CLB', dataIndex: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
		{ title: 'Ngày thành lập', dataIndex: 'establishDate' },
		{ title: 'Chủ nhiệm', dataIndex: 'president' },
		{
			title: 'Hoạt động',
			dataIndex: 'isActive',
			render: (act: boolean) => <Tag color={act ? 'green' : 'red'}>{act ? 'Có' : 'Không'}</Tag>,
		},
		{
			title: 'Thao tác',
			render: (_: any, record: any) => (
				<Space>
					<Button size='small' type='link'>
						Sửa
					</Button>
					<Button size='small' type='link' danger onClick={() => setClubs(clubs.filter((c) => c.id !== record.id))}>
						Xóa
					</Button>
					<Button size='small' onClick={() => setActiveTab('3')}>
						Xem Thành viên
					</Button>
				</Space>
			),
		},
	];

	// === CHỨC NĂNG 2: ĐƠN ĐĂNG KÝ ===
	const handleApproveBatch = () => {
		const count = selectedAppKeys.length;
		if (count === 0) return message.warning('Chọn ít nhất 1 đơn!');

		setApplications((apps) =>
			apps.map((app) => (selectedAppKeys.includes(app.id) ? { ...app, status: 'Approved' } : app)),
		);
		addLog('Duyệt đơn', `Đã duyệt ${count} đơn đăng ký`);
		message.success(`Đã duyệt ${count} đơn!`);
		setSelectedAppKeys([]);
	};

	const handleRejectBatchConfirm = () => {
		if (!rejectReason.trim()) return message.error('Bắt buộc nhập lý do từ chối!');

		const count = selectedAppKeys.length;
		setApplications((apps) =>
			apps.map((app) => (selectedAppKeys.includes(app.id) ? { ...app, status: 'Rejected', rejectReason } : app)),
		);
		addLog('Từ chối đơn', `Đã từ chối ${count} đơn. Lý do: ${rejectReason}`);
		message.success(`Đã từ chối ${count} đơn!`);
		setIsRejectModalOpen(false);
		setRejectReason('');
		setSelectedAppKeys([]);
	};

	const appColumns = [
		{ title: 'Họ tên', dataIndex: 'fullName', sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName) },
		{ title: 'Email', dataIndex: 'email' },
		{ title: 'CLB Đăng ký', render: (_: any, r: any) => getClubName(r.clubId) },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (s: string) => <Tag color={s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'orange'}>{s}</Tag>,
		},
		{ title: 'Ghi chú', dataIndex: 'rejectReason' },
	];

	// === CHỨC NĂNG 3: QUẢN LÝ THÀNH VIÊN ===
	const approvedMembers = applications.filter((a) => a.status === 'Approved');

	const handleChangeClubConfirm = () => {
		if (!selectedTargetClub) return message.error('Vui lòng chọn CLB muốn chuyển đến!');
		const count = selectedMemberKeys.length;

		setApplications((apps) =>
			apps.map((app) => (selectedMemberKeys.includes(app.id) ? { ...app, clubId: selectedTargetClub } : app)),
		);
		addLog('Đổi CLB', `Đã chuyển ${count} thành viên sang CLB mới`);
		message.success(`Chuyển CLB thành công cho ${count} thành viên!`);
		setIsChangeClubModalOpen(false);
		setSelectedMemberKeys([]);
	};

	// === CHỨC NĂNG 4: THỐNG KÊ (Chart Data) ===
	const chartData = clubs.flatMap((club) => {
		const appsInClub = applications.filter((a) => a.clubId === club.id);
		return [
			{ clubName: club.name, status: 'Pending', count: appsInClub.filter((a) => a.status === 'Pending').length },
			{ clubName: club.name, status: 'Approved', count: appsInClub.filter((a) => a.status === 'Approved').length },
			{ clubName: club.name, status: 'Rejected', count: appsInClub.filter((a) => a.status === 'Rejected').length },
		];
	});

	const chartConfig = {
		data: chartData,
		isGroup: true,
		xField: 'clubName',
		yField: 'count',
		seriesField: 'status',
		color: ['#faad14', '#52c41a', '#f5222d'],
		label: {
			position: 'middle' as const,
			layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }, { type: 'adjust-color' }],
		},
	};

	return (
		<div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
			<Card title='Hệ Thống Quản Lý Câu Lạc Bộ'>
				<Tabs activeKey={activeTab} onChange={setActiveTab}>
					{/* TAB 1: CÂU LẠC BỘ */}
					<Tabs.TabPane tab='1. Danh sách CLB' key='1'>
						<Row gutter={24}>
							<Col span={8}>
								<Card title='Thêm/Sửa CLB' size='small'>
									<Form form={formClub} layout='vertical' onFinish={handleSaveClub}>
										<Form.Item name='name' label='Tên CLB' rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name='avatar' label='Ảnh đại diện (Emoji/URL)'>
											<Input placeholder='VD: ⚽' />
										</Form.Item>
										<Form.Item name='president' label='Chủ nhiệm'>
											<Input />
										</Form.Item>
										<Form.Item name='establishDate' label='Ngày thành lập'>
											<DatePicker style={{ width: '100%' }} />
										</Form.Item>
										<Form.Item name='description' label='Mô tả (HTML)'>
											<TextArea rows={3} />
										</Form.Item>
										<Form.Item name='isActive' label='Hoạt động' valuePropName='checked' initialValue={true}>
											<Switch />
										</Form.Item>
										<Button type='primary' htmlType='submit' block>
											Lưu Câu Lạc Bộ
										</Button>
									</Form>
								</Card>
							</Col>
							<Col span={16}>
								<Table dataSource={clubs} columns={clubColumns} rowKey='id' pagination={{ pageSize: 5 }} />
							</Col>
						</Row>
					</Tabs.TabPane>

					{/* TAB 2: ĐƠN ĐĂNG KÝ */}
					<Tabs.TabPane tab='2. Đơn đăng ký' key='2'>
						<div style={{ marginBottom: 16 }}>
							<Button
								type='primary'
								onClick={handleApproveBatch}
								disabled={selectedAppKeys.length === 0}
								style={{ marginRight: 8, backgroundColor: '#52c41a' }}
							>
								Duyệt {selectedAppKeys.length} đơn đã chọn
							</Button>
							<Button
								type='primary'
								danger
								onClick={() => setIsRejectModalOpen(true)}
								disabled={selectedAppKeys.length === 0}
							>
								Từ chối {selectedAppKeys.length} đơn đã chọn
							</Button>
						</div>
						<Table
							rowSelection={{ selectedRowKeys: selectedAppKeys, onChange: setSelectedAppKeys }}
							dataSource={applications}
							columns={appColumns}
							rowKey='id'
						/>
						{/* Modal Từ chối */}
						<Modal
							title='Xác nhận từ chối đơn'
							visible={isRejectModalOpen}
							onOk={handleRejectBatchConfirm}
							onCancel={() => setIsRejectModalOpen(false)}
						>
							<p>Bạn đang từ chối {selectedAppKeys.length} đơn đăng ký.</p>
							<Input.TextArea
								placeholder='Bắt buộc nhập lý do từ chối...'
								rows={4}
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
							/>
						</Modal>
					</Tabs.TabPane>

					{/* TAB 3: THÀNH VIÊN */}
					<Tabs.TabPane tab='3. Quản lý Thành viên' key='3'>
						<div style={{ marginBottom: 16 }}>
							<Button
								type='primary'
								onClick={() => setIsChangeClubModalOpen(true)}
								disabled={selectedMemberKeys.length === 0}
							>
								Đổi CLB cho {selectedMemberKeys.length} thành viên
							</Button>
						</div>
						<Table
							rowSelection={{ selectedRowKeys: selectedMemberKeys, onChange: setSelectedMemberKeys }}
							dataSource={approvedMembers}
							columns={appColumns.filter((c) => c.title !== 'Ghi chú')} // Ẩn cột ghi chú bên bảng thành viên
							rowKey='id'
						/>
						{/* Modal Đổi CLB */}
						<Modal
							title={`Chuyển CLB cho ${selectedMemberKeys.length} thành viên`}
							visible={isChangeClubModalOpen}
							onOk={handleChangeClubConfirm}
							onCancel={() => setIsChangeClubModalOpen(false)}
						>
							<p>Chọn Câu lạc bộ mới:</p>
							<Select style={{ width: '100%' }} placeholder='Chọn CLB' onChange={setSelectedTargetClub}>
								{clubs.map((c) => (
									<Option key={c.id} value={c.id}>
										{c.name}
									</Option>
								))}
							</Select>
						</Modal>
					</Tabs.TabPane>

					{/* TAB 4: THỐNG KÊ & BÁO CÁO */}
					<Tabs.TabPane tab='4. Báo cáo & Lịch sử' key='4'>
						<Row gutter={16} style={{ marginBottom: 24 }}>
							<Col span={6}>
								<Card>
									<Statistic title='Tổng số CLB' value={clubs.length} />
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic
										title='Đơn Pending'
										value={applications.filter((a) => a.status === 'Pending').length}
										valueStyle={{ color: '#faad14' }}
									/>
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic
										title='Thành viên (Approved)'
										value={approvedMembers.length}
										valueStyle={{ color: '#52c41a' }}
									/>
								</Card>
							</Col>
							<Col span={6}>
								<Card>
									<Statistic
										title='Đơn bị loại (Rejected)'
										value={applications.filter((a) => a.status === 'Rejected').length}
										valueStyle={{ color: '#f5222d' }}
									/>
								</Card>
							</Col>
						</Row>

						<Row gutter={24}>
							<Col span={14}>
								<Card title='Biểu đồ đơn đăng ký theo CLB'>
									<Column {...chartConfig} />
								</Card>
							</Col>
							<Col span={10}>
								<Card title='Lịch sử thao tác'>
									<Table
										dataSource={historyLogs}
										rowKey='id'
										pagination={{ pageSize: 4 }}
										columns={[
											{ title: 'Thời gian', dataIndex: 'time', width: 150 },
											{ title: 'Hành động', dataIndex: 'action', render: (a: string) => <b>{a}</b> },
											{ title: 'Chi tiết', dataIndex: 'details' },
										]}
									/>
								</Card>
							</Col>
						</Row>
					</Tabs.TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default ClubManagement;
