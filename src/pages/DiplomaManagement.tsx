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
	InputNumber,
	Row,
	Col,
	Statistic,
	Tag,
} from 'antd';
import moment from 'moment';

const { Option } = Select;

const DiplomaManagement: React.FC = () => {
	const [formConfig] = Form.useForm();
	const [formDiploma] = Form.useForm();
	const [formSearch] = Form.useForm();

	const [books, setBooks] = useState([{ year: 2026, currentRegistryNo: 1 }]);
	const [decisions, setDecisions] = useState([
		{
			id: 'QD01',
			no: '123/QD-DHVH',
			date: '2026-03-25',
			summary: 'Tốt nghiệp đợt 1 năm 2026',
			year: 2026,
			searchCount: 0,
		},
	]);

	const [customFields, setCustomFields] = useState<any[]>([
		{ id: 'f1', name: 'Nơi sinh', type: 'String' },
		{ id: 'f2', name: 'Điểm trung bình', type: 'Number' },
		{ id: 'f3', name: 'Ngày nhập học', type: 'Date' },
	]);

	const [diplomas, setDiplomas] = useState<any[]>([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);

	const handleAddCustomField = (values: any) => {
		setCustomFields([...customFields, { id: `f${Date.now()}`, ...values }]);
		message.success('Thêm trường thông tin thành công!');
		formConfig.resetFields();
	};

	const handleIssueDiploma = (values: any) => {
		const decision = decisions.find((d) => d.id === values.decisionId);
		if (!decision) return message.error('Vui lòng chọn quyết định!');

		const bookIndex = books.findIndex((b) => b.year === decision.year);
		if (bookIndex === -1) return message.error('Không tìm thấy sổ văn bằng của năm này!');

		const currentRegNo = books[bookIndex].currentRegistryNo;
		const registryNoStr = `${currentRegNo.toString().padStart(4, '0')}/${decision.year}`;

		const newDiploma = {
			id: Date.now(),
			...values,
			registryNo: registryNoStr,
			dob: values.dob.format('YYYY-MM-DD'),
			dynamicData: values.dynamicData || {},
		};

		setDiplomas([...diplomas, newDiploma]);

		const newBooks = [...books];
		newBooks[bookIndex].currentRegistryNo += 1;
		setBooks(newBooks);

		message.success(`Cấp văn bằng thành công! Số vào sổ: ${registryNoStr}`);
		formDiploma.resetFields();
	};

	const handleSearch = (values: any) => {
		const filledParams = Object.keys(values).filter((key) => values[key] !== undefined && values[key] !== '');
		if (filledParams.length < 2) {
			return message.error('Yêu cầu nhập ít nhất 2 tham số để tra cứu!');
		}

		const results = diplomas.filter((dip) => {
			let match = true;
			if (values.diplomaNo && dip.diplomaNo !== values.diplomaNo) match = false;
			if (values.registryNo && dip.registryNo !== values.registryNo) match = false;
			if (values.studentId && dip.studentId !== values.studentId) match = false;
			if (values.fullName && !dip.fullName.toLowerCase().includes(values.fullName.toLowerCase())) match = false;
			if (values.dob && dip.dob !== values.dob.format('YYYY-MM-DD')) match = false;
			return match;
		});

		setSearchResults(results);

		if (results.length > 0) {
			const decisionIds = [...new Set(results.map((r) => r.decisionId))];
			const newDecisions = decisions.map((d) =>
				decisionIds.includes(d.id) ? { ...d, searchCount: d.searchCount + 1 } : d,
			);
			setDecisions(newDecisions);
		}
	};

	return (
		<div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
			<Card title='Hệ Thống Quản Lý Văn Bằng Tốt Nghiệp (TH04)'>
				<Tabs defaultActiveKey='1'>
					{/* TAB 1: CẤU HÌNH BIỂU MẪU */}
					<Tabs.TabPane tab='1. Cấu hình phụ lục' key='1'>
						<Row gutter={24}>
							<Col span={8}>
								<Card title='Thêm trường thông tin' size='small'>
									<Form form={formConfig} layout='vertical' onFinish={handleAddCustomField}>
										<Form.Item name='name' label='Tên trường thông tin' rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name='type' label='Kiểu dữ liệu' rules={[{ required: true }]}>
											<Select>
												<Option value='String'>Văn bản (String)</Option>
												<Option value='Number'>Số (Number)</Option>
												<Option value='Date'>Ngày tháng (Date)</Option>
											</Select>
										</Form.Item>
										<Button type='primary' htmlType='submit' block>
											Thêm mới
										</Button>
									</Form>
								</Card>
							</Col>
							<Col span={16}>
								<Table
									dataSource={customFields}
									rowKey='id'
									columns={[
										{ title: 'ID', dataIndex: 'id' },
										{ title: 'Tên trường', dataIndex: 'name' },
										{ title: 'Kiểu dữ liệu', dataIndex: 'type', render: (t) => <Tag color='blue'>{t}</Tag> },
									]}
								/>
							</Col>
						</Row>
					</Tabs.TabPane>

					{/* TAB 2: QUẢN LÝ & CẤP VĂN BẰNG */}
					<Tabs.TabPane tab='2. Cấp văn bằng' key='2'>
						<Form form={formDiploma} layout='vertical' onFinish={handleIssueDiploma}>
							<Row gutter={24}>
								<Col span={12}>
									<Card title='Thông tin mặc định' size='small'>
										<Form.Item name='decisionId' label='Quyết định tốt nghiệp' rules={[{ required: true }]}>
											<Select>
												{decisions.map((d) => (
													<Option key={d.id} value={d.id}>
														{d.no} - Năm {d.year}
													</Option>
												))}
											</Select>
										</Form.Item>
										{/* Số vào sổ tự động nên không cần input */}
										<Form.Item name='diplomaNo' label='Số hiệu văn bằng' rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name='studentId' label='Mã sinh viên' rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name='fullName' label='Họ và tên' rules={[{ required: true }]}>
											<Input />
										</Form.Item>
										<Form.Item name='dob' label='Ngày sinh' rules={[{ required: true }]}>
											<DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
										</Form.Item>
									</Card>
								</Col>

								<Col span={12}>
									<Card title='Thông tin phụ lục (Cấu hình động)' size='small'>
										{customFields.map((field) => (
											<Form.Item key={field.id} name={['dynamicData', field.id]} label={field.name}>
												{field.type === 'String' && <Input />}
												{field.type === 'Number' && <InputNumber style={{ width: '100%' }} />}
												{field.type === 'Date' && <DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />}
											</Form.Item>
										))}
										<Button type='primary' htmlType='submit' size='large' block>
											Lưu thông tin văn bằng
										</Button>
									</Card>
								</Col>
							</Row>
						</Form>
					</Tabs.TabPane>

					{/* TAB 3: TRA CỨU */}
					<Tabs.TabPane tab='3. Tra cứu văn bằng' key='3'>
						<Card style={{ marginBottom: 16 }}>
							<Form form={formSearch} layout='inline' onFinish={handleSearch}>
								<Form.Item name='diplomaNo' label='Số hiệu bằng'>
									<Input placeholder='VD: B123' />
								</Form.Item>
								<Form.Item name='registryNo' label='Số vào sổ'>
									<Input placeholder='VD: 0001/2026' />
								</Form.Item>
								<Form.Item name='studentId' label='Mã SV'>
									<Input />
								</Form.Item>
								<Form.Item name='fullName' label='Họ tên'>
									<Input />
								</Form.Item>
								<Form.Item name='dob' label='Ngày sinh'>
									<DatePicker format='YYYY-MM-DD' />
								</Form.Item>
								<Button type='primary' htmlType='submit'>
									Tra cứu
								</Button>
							</Form>
							<p style={{ marginTop: 10, color: 'red' }}>* Vui lòng nhập ít nhất 2 tham số.</p>
						</Card>

						<Table
							dataSource={searchResults}
							rowKey='id'
							columns={[
								{ title: 'Số vào sổ', dataIndex: 'registryNo' },
								{ title: 'Số hiệu', dataIndex: 'diplomaNo' },
								{ title: 'Mã SV', dataIndex: 'studentId' },
								{ title: 'Họ tên', dataIndex: 'fullName' },
								{ title: 'Ngày sinh', dataIndex: 'dob' },
								{
									title: 'QĐ Tốt nghiệp',
									render: (_, record) => decisions.find((d) => d.id === record.decisionId)?.no,
								},
							]}
						/>
					</Tabs.TabPane>

					{/* TAB 4: THỐNG KÊ TRA CỨU */}
					<Tabs.TabPane tab='4. Báo cáo lượt tra cứu' key='4'>
						<Row gutter={16}>
							{decisions.map((d) => (
								<Col span={8} key={d.id}>
									<Card>
										<Statistic title={`QĐ: ${d.no}`} value={d.searchCount} suffix='lượt tra cứu' />
									</Card>
								</Col>
							))}
						</Row>
					</Tabs.TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default DiplomaManagement;
