import React, { useState, useMemo, useEffect } from 'react';
import {
	Tabs,
	Card,
	List,
	Tag,
	Input,
	Row,
	Col,
	Button,
	Table,
	Modal,
	Form,
	Popconfirm,
	Select,
	Typography,
	Avatar,
	Space,
	message,
	Divider,
} from 'antd';
import {
	SearchOutlined,
	EyeOutlined,
	CalendarOutlined,
	UserOutlined,
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { debounce } from 'lodash';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// --- KHO DỮ LIỆU MẪU (MOCK DATA) ---
const initialTags = [
	{ id: 't1', name: 'React' },
	{ id: 't2', name: 'JavaScript' },
	{ id: 't3', name: 'Ant Design' },
];

const initialPosts = Array.from({ length: 15 }).map((_, i) => ({
	id: `p${i + 1}`,
	title: `Hướng dẫn học Lập trình Web phần ${i + 1}`,
	slug: `huong-dan-hoc-web-${i + 1}`,
	excerpt: 'Đây là bài viết hướng dẫn chi tiết các bước cơ bản để làm quen với công nghệ Web hiện đại...',
	content: `## Xin chào mọi người!\n\nHôm nay chúng ta sẽ tìm hiểu về **React** và cách xây dựng component.\n\n* Bước 1: Khởi tạo project\n* Bước 2: Viết code\n\n\`\`\`javascript\nconsole.log("Hello PTIT!");\n\`\`\``,
	image: `https://picsum.photos/400/200?random=${i}`,
	date: moment().subtract(i, 'days').format('YYYY-MM-DD'),
	author: 'Đặng Hoàng Long',
	tags: i % 2 === 0 ? ['React', 'JavaScript'] : ['Ant Design'],
	status: i % 3 === 0 ? 'Draft' : 'Published',
	views: Math.floor(Math.random() * 1000),
}));

const PersonalBlog: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');

	// States quản lý dữ liệu
	const [posts, setPosts] = useState<any[]>(initialPosts);
	const [tags, setTags] = useState<any[]>(initialTags);

	// States cho Home & Detail (Yêu cầu 1 & 2)
	const [viewingPost, setViewingPost] = useState<any | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// States cho Admin (Yêu cầu 4 & 5)
	const [isPostModalVisible, setIsPostModalVisible] = useState(false);
	const [isTagModalVisible, setIsTagModalVisible] = useState(false);
	const [editingPost, setEditingPost] = useState<any>(null);
	const [editingTag, setEditingTag] = useState<any>(null);
	const [formPost] = Form.useForm();
	const [formTag] = Form.useForm();

	const handleSearchChange = useMemo(
		() => debounce((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), 300),
		[],
	);

	const filteredPosts = posts.filter((p) => {
		if (p.status !== 'Published') return false;
		const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
		return matchSearch && matchTag;
	});

	const handleViewPost = (post: any) => {
		// Tự động tăng lượt xem
		const updatedPosts = posts.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p));
		setPosts(updatedPosts);
		setViewingPost({ ...post, views: post.views + 1 });
	};

	const getRelatedPosts = (currentPost: any) => {
		return posts
			.filter(
				(p) =>
					p.id !== currentPost.id &&
					p.status === 'Published' &&
					p.tags.some((t: string) => currentPost.tags.includes(t)),
			)
			.slice(0, 3);
	};

	const handleSavePost = (values: any) => {
		if (editingPost) {
			setPosts(posts.map((p) => (p.id === editingPost.id ? { ...p, ...values } : p)));
			message.success('Cập nhật bài viết thành công!');
		} else {
			setPosts([
				{
					id: `p${Date.now()}`,
					...values,
					views: 0,
					date: moment().format('YYYY-MM-DD'),
					author: 'Admin',
				},
				...posts,
			]);
			message.success('Thêm bài viết thành công!');
		}
		setIsPostModalVisible(false);
		formPost.resetFields();
	};

	const handleDeletePost = (id: string) => {
		setPosts(posts.filter((p) => p.id !== id));
		message.success('Đã xóa bài viết');
	};

	const getTagUsageCount = (tagName: string) => posts.filter((p) => p.tags.includes(tagName)).length;

	const handleSaveTag = (values: any) => {
		if (editingTag) {
			setTags(tags.map((t) => (t.id === editingTag.id ? { ...t, ...values } : t)));
		} else {
			setTags([...tags, { id: `t${Date.now()}`, name: values.name }]);
		}
		setIsTagModalVisible(false);
		formTag.resetFields();
		message.success('Đã lưu thẻ tag');
	};

	return (
		<div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
			<Title level={2}>Hệ Thống Blog Cá Nhân (TH07)</Title>

			<Tabs
				activeKey={activeTab}
				onChange={(key) => {
					setActiveTab(key);
					setViewingPost(null);
				}}
			>
				{/* TAB 1: TRANG CHỦ & CHI TIẾT BÀI VIẾT */}
				<Tabs.TabPane tab='Trang chủ' key='1'>
					{viewingPost ? (
						/* --- CHI TIẾT BÀI VIẾT --- */
						<div style={{ maxWidth: 800, margin: '0 auto' }}>
							<Button icon={<ArrowLeftOutlined />} onClick={() => setViewingPost(null)} style={{ marginBottom: 16 }}>
								Quay lại danh sách
							</Button>
							<img
								src={viewingPost.image}
								alt='cover'
								style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
							/>
							<Title level={1} style={{ marginTop: 16 }}>
								{viewingPost.title}
							</Title>
							<Space split={<Divider type='vertical' />} style={{ marginBottom: 16, color: '#888' }}>
								<Text>
									<UserOutlined /> {viewingPost.author}
								</Text>
								<Text>
									<CalendarOutlined /> {viewingPost.date}
								</Text>
								<Text>
									<EyeOutlined /> {viewingPost.views} lượt xem
								</Text>
							</Space>
							<div style={{ marginBottom: 24 }}>
								{viewingPost.tags.map((t: string) => (
									<Tag color='blue' key={t}>
										{t}
									</Tag>
								))}
							</div>
							<div style={{ fontSize: 16, lineHeight: 1.8 }} className='markdown-body'>
								<ReactMarkdown>{viewingPost.content}</ReactMarkdown>
							</div>

							<Divider />
							<Title level={4}>Bài viết liên quan</Title>
							<Row gutter={16}>
								{getRelatedPosts(viewingPost).map((rp) => (
									<Col span={8} key={rp.id}>
										<Card
											hoverable
											size='small'
											cover={<img alt='rel' src={rp.image} height={100} style={{ objectFit: 'cover' }} />}
											onClick={() => handleViewPost(rp)}
										>
											<Card.Meta title={rp.title} />
										</Card>
									</Col>
								))}
							</Row>
						</div>
					) : (
						<div>
							<Row justify='space-between' align='middle' style={{ marginBottom: 24 }}>
								<Col span={8}>
									<Input
										placeholder='Tìm kiếm bài viết (Debounce 300ms)...'
										prefix={<SearchOutlined />}
										onChange={handleSearchChange}
										allowClear
									/>
								</Col>
								<Col>
									Lọc theo thẻ:
									{tags.map((t) => (
										<Tag
											key={t.id}
											color={selectedTag === t.name ? '#f50' : 'default'}
											style={{ cursor: 'pointer', marginLeft: 8 }}
											onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
										>
											{t.name}
										</Tag>
									))}
								</Col>
							</Row>

							<List
								grid={{ gutter: 24, xs: 1, sm: 2, md: 3 }}
								pagination={{ pageSize: 9, position: 'bottom' }}
								dataSource={filteredPosts}
								renderItem={(item) => (
									<List.Item>
										<Card
											hoverable
											cover={<img alt='cover' src={item.image} style={{ height: 200, objectFit: 'cover' }} />}
											onClick={() => handleViewPost(item)}
										>
											<Card.Meta
												title={item.title}
												description={
													<>
														<Paragraph ellipsis={{ rows: 2 }}>{item.excerpt}</Paragraph>
														<Space style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
															<span>
																<CalendarOutlined /> {item.date}
															</span>
															<span>
																<EyeOutlined /> {item.views}
															</span>
														</Space>
														<div>
															{item.tags.map((t: string) => (
																<Tag color='blue' key={t}>
																	{t}
																</Tag>
															))}
														</div>
													</>
												}
											/>
										</Card>
									</List.Item>
								)}
							/>
						</div>
					)}
				</Tabs.TabPane>

				{/* TAB 2: GIỚI THIỆU */}
				<Tabs.TabPane tab='Giới thiệu' key='2'>
					<div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', padding: '40px 0' }}>
						<Avatar size={120} src='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' />
						<Title level={2} style={{ marginTop: 16 }}>
							Đặng Hoàng Long
						</Title>
						<Text type='secondary'>Web Developer / Blogger</Text>
						<Paragraph style={{ marginTop: 16, fontSize: 16 }}>
							Xin chào! Mình là sinh viên công nghệ thông tin đam mê lập trình Web. Blog này là nơi mình chia sẻ những
							kiến thức, dự án và kinh nghiệm học tập hàng ngày.
						</Paragraph>
						<div style={{ marginTop: 24 }}>
							<Title level={4}>Kỹ năng</Title>
							<Tag color='cyan'>ReactJS</Tag>
							<Tag color='cyan'>NodeJS</Tag>
							<Tag color='cyan'>Ant Design</Tag>
							<Tag color='cyan'>UmiJS</Tag>
						</div>
					</div>
				</Tabs.TabPane>

				{/* TAB 3: QUẢN LÝ BÀI VIẾT (ADMIN) */}
				<Tabs.TabPane tab='Quản lý Bài viết' key='3'>
					<Button
						type='primary'
						style={{ marginBottom: 16 }}
						onClick={() => {
							setEditingPost(null);
							formPost.resetFields();
							setIsPostModalVisible(true);
						}}
					>
						+ Thêm bài viết mới
					</Button>
					<Table
						dataSource={posts}
						rowKey='id'
						columns={[
							{ title: 'Tiêu đề', dataIndex: 'title', width: '30%' },
							{
								title: 'Trạng thái',
								dataIndex: 'status',
								render: (s) => <Tag color={s === 'Published' ? 'green' : 'orange'}>{s}</Tag>,
								filters: [
									{ text: 'Nháp', value: 'Draft' },
									{ text: 'Đã đăng', value: 'Published' },
								],
								onFilter: (value, record) => record.status === value,
							},
							{ title: 'Thẻ', dataIndex: 'tags', render: (tags) => tags.map((t: string) => <Tag key={t}>{t}</Tag>) },
							{ title: 'Lượt xem', dataIndex: 'views', sorter: (a, b) => a.views - b.views },
							{ title: 'Ngày tạo', dataIndex: 'date' },
							{
								title: 'Thao tác',
								render: (_, record) => (
									<Space>
										<Button
											size='small'
											icon={<EditOutlined />}
											onClick={() => {
												setEditingPost(record);
												formPost.setFieldsValue(record);
												setIsPostModalVisible(true);
											}}
										/>
										<Popconfirm title='Bạn có chắc muốn xóa?' onConfirm={() => handleDeletePost(record.id)}>
											<Button size='small' danger icon={<DeleteOutlined />} />
										</Popconfirm>
									</Space>
								),
							},
						]}
					/>
					<Modal
						title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết mới'}
						visible={isPostModalVisible}
						onCancel={() => setIsPostModalVisible(false)}
						onOk={() => formPost.submit()}
						width={800}
					>
						<Form form={formPost} layout='vertical' onFinish={handleSavePost}>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item name='title' label='Tiêu đề' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='slug' label='Slug' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='image' label='Ảnh đại diện (URL)'>
										<Input />
									</Form.Item>
								</Col>
								<Col span={6}>
									<Form.Item name='status' label='Trạng thái' initialValue='Draft'>
										<Select>
											<Option value='Draft'>Nháp</Option>
											<Option value='Published'>Đã đăng</Option>
										</Select>
									</Form.Item>
								</Col>
								<Col span={6}>
									<Form.Item name='tags' label='Thẻ Tag' initialValue={[]}>
										<Select mode='multiple'>
											{tags.map((t) => (
												<Option key={t.name} value={t.name}>
													{t.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col span={24}>
									<Form.Item name='excerpt' label='Tóm tắt'>
										<Input.TextArea rows={2} />
									</Form.Item>
								</Col>
								<Col span={24}>
									<Form.Item name='content' label='Nội dung (Markdown)' rules={[{ required: true }]}>
										<Input.TextArea rows={6} />
									</Form.Item>
								</Col>
							</Row>
						</Form>
					</Modal>
				</Tabs.TabPane>

				{/* TAB 4: QUẢN LÝ THẺ (ADMIN) */}
				<Tabs.TabPane tab='Quản lý Thẻ (Tags)' key='4'>
					<Button
						type='primary'
						style={{ marginBottom: 16 }}
						onClick={() => {
							setEditingTag(null);
							formTag.resetFields();
							setIsTagModalVisible(true);
						}}
					>
						+ Thêm thẻ mới
					</Button>
					<Table
						dataSource={tags}
						rowKey='id'
						columns={[
							{ title: 'Tên thẻ', dataIndex: 'name' },
							{
								title: 'Số bài viết sử dụng',
								render: (_, record) => <Tag color='blue'>{getTagUsageCount(record.name)} bài viết</Tag>,
							},
							{
								title: 'Thao tác',
								render: (_, record) => (
									<Space>
										<Button
											size='small'
											icon={<EditOutlined />}
											onClick={() => {
												setEditingTag(record);
												formTag.setFieldsValue(record);
												setIsTagModalVisible(true);
											}}
										/>
										<Popconfirm title='Xóa thẻ này?' onConfirm={() => setTags(tags.filter((t) => t.id !== record.id))}>
											<Button
												size='small'
												danger
												icon={<DeleteOutlined />}
												disabled={getTagUsageCount(record.name) > 0}
											/>
										</Popconfirm>
									</Space>
								),
							},
						]}
					/>
					<Modal
						title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ'}
						visible={isTagModalVisible}
						onCancel={() => setIsTagModalVisible(false)}
						onOk={() => formTag.submit()}
					>
						<Form form={formTag} layout='vertical' onFinish={handleSaveTag}>
							<Form.Item name='name' label='Tên thẻ' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Form>
					</Modal>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default PersonalBlog;
