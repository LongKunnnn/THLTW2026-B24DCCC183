import React, { useState } from 'react';
import { Input, Card, Tabs, Table, Button, Form, Select, InputNumber, Space, Tag, message, Typography, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// --- CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES) ---
type Difficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface KnowledgeBlock { id: string; name: string; }
interface Subject { id: string; code: string; name: string; credits: number; }
interface Question { id: string; code: string; subjectId: string; blockId: string; content: string; difficulty: Difficulty; }
interface ExamStructureRule { blockId: string; difficulty: Difficulty; count: number; }
interface Exam { id: string; title: string; subjectId: string; questions: Question[]; createdAt: string; }

// --- DỮ LIỆU MẪU GIẢ LẬP DATABASE ---
const initialBlocks: KnowledgeBlock[] = [
  { id: 'b1', name: 'Tổng quan' },
  { id: 'b2', name: 'Chuyên sâu' },
];

const initialSubjects: Subject[] = [
  { id: 's1', code: 'IT001', name: 'Nhập môn Lập trình', credits: 3 },
  { id: 's2', code: 'IT002', name: 'Lập trình Hướng đối tượng', credits: 4 },
];

const initialQuestions: Question[] = [
  { id: 'q1', code: 'Q001', subjectId: 's2', blockId: 'b1', content: 'OOP là viết tắt của từ gì?', difficulty: 'Dễ' },
  { id: 'q2', code: 'Q002', subjectId: 's2', blockId: 'b1', content: 'Nêu 4 tính chất cơ bản của OOP?', difficulty: 'Trung bình' },
  { id: 'q3', code: 'Q003', subjectId: 's2', blockId: 'b2', content: 'Phân biệt Abstract Class và Interface trong Java?', difficulty: 'Khó' },
  { id: 'q4', code: 'Q004', subjectId: 's2', blockId: 'b2', content: 'Trình bày cách implement Design Pattern Singleton?', difficulty: 'Rất khó' },
  { id: 'q5', code: 'Q005', subjectId: 's2', blockId: 'b1', content: 'Class là gì? Object là gì?', difficulty: 'Dễ' },
];

const StudyManagement: React.FC = () => {
  // Giả lập Database bằng State
  const [blocks] = useState<KnowledgeBlock[]>(initialBlocks);
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [questions] = useState<Question[]>(initialQuestions);
  const [exams, setExams] = useState<Exam[]>([]);

  const [form] = Form.useForm();

  // --- LOGIC TẠO ĐỀ THI TỰ ĐỘNG ---
  const handleGenerateExam = (values: any) => {
    const { subjectId, title, rules } = values;
    
    if (!rules || rules.length === 0) {
      return message.warning('Vui lòng thêm ít nhất 1 cấu trúc đề thi!');
    }

    let selectedQuestions: Question[] = [];
    let hasError = false;

    // Duyệt qua từng yêu cầu cấu trúc
    for (const rule of rules as ExamStructureRule[]) {
      if (!rule || !rule.blockId || !rule.difficulty || !rule.count) continue;

      // Lọc câu hỏi trong ngân hàng thỏa mãn điều kiện
      const matchedQuestions = questions.filter(q => 
        q.subjectId === subjectId && 
        q.blockId === rule.blockId && 
        q.difficulty === rule.difficulty
      );

      // NẾU KHÔNG ĐỦ CÂU HỎI NHƯ ĐỀ BÀI YÊU CẦU -> BÁO LỖI VÀ DỪNG
      if (matchedQuestions.length < rule.count) {
        const blockName = blocks.find(b => b.id === rule.blockId)?.name;
        message.error(`Lỗi: Ngân hàng chỉ có ${matchedQuestions.length} câu [${rule.difficulty}] thuộc [${blockName}], nhưng cấu trúc yêu cầu ${rule.count} câu.`);
        hasError = true;
        break; // Dừng việc sinh đề
      }

      // Random chọn câu hỏi (Logic cơ bản: xáo trộn mảng và lấy N phần tử đầu)
      const shuffled = [...matchedQuestions].sort(() => 0.5 - Math.random());
      selectedQuestions = [...selectedQuestions, ...shuffled.slice(0, rule.count)];
    }

    if (!hasError) {
      const newExam: Exam = {
        id: `EXAM_${Date.now()}`,
        title: title,
        subjectId: subjectId,
        questions: selectedQuestions,
        createdAt: new Date().toLocaleString()
      };
      setExams([newExam, ...exams]);
      message.success('Tạo đề thi thành công!');
      form.resetFields(['title', 'rules']); // Reset form cấu trúc
    }
  };

  // --- CẤU HÌNH CỘT CHO CÁC BẢNG ---
  const questionColumns: ColumnsType<Question> = [
    { title: 'Mã CH', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Nội dung', dataIndex: 'content', key: 'content' },
    { 
      title: 'Môn học', 
      key: 'subjectId', 
      render: (_, record) => subjects.find(s => s.id === record.subjectId)?.name 
    },
    { 
      title: 'Khối kiến thức', 
      key: 'blockId', 
      render: (_, record) => blocks.find(b => b.id === record.blockId)?.name 
    },
    { 
      title: 'Mức độ', 
      dataIndex: 'difficulty', 
      key: 'difficulty',
      render: (level: Difficulty) => {
        const colors: Record<Difficulty, string> = { 'Dễ': 'green', 'Trung bình': 'blue', 'Khó': 'orange', 'Rất khó': 'red' };
        return <Tag color={colors[level]}>{level}</Tag>;
      }
    },
  ];

  const examColumns: ColumnsType<Exam> = [
    { title: 'Tên đề thi', dataIndex: 'title', key: 'title' },
    { 
      title: 'Môn học', 
      key: 'subjectId', 
      render: (_, record) => subjects.find(s => s.id === record.subjectId)?.name 
    },
    { title: 'Số lượng câu hỏi', key: 'count', render: (_, record) => `${record.questions.length} câu` },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  // --- GIAO DIỆN CHÍNH ---
  return (
    <Card title={<Title level={3} style={{ margin: 0 }}>Hệ Thống Quản Lý Ngân Hàng Câu Hỏi & Đề Thi</Title>} style={{ margin: '20px' }}>
      <Tabs defaultActiveKey="4" size="large">
        
        {/* Tab 1 & 2: Môn học và Khối kiến thức */}
        <Tabs.TabPane tab="1 & 2. Danh mục" key="1">
          <Row gutter={24}>
            <Col span={12}>
              <Card type="inner" title="Danh mục Khối kiến thức">
                <ul>{blocks.map(b => <li key={b.id}>{b.name}</li>)}</ul>
              </Card>
            </Col>
            <Col span={12}>
              <Card type="inner" title="Danh mục Môn học">
                <ul>{subjects.map(s => <li key={s.id}>{s.code} - {s.name} ({s.credits} tín chỉ)</li>)}</ul>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Tab 3: Ngân hàng câu hỏi */}
        <Tabs.TabPane tab="3. Ngân hàng câu hỏi" key="3">
          <Table 
            columns={questionColumns} 
            dataSource={questions} 
            rowKey="id" 
            pagination={{ pageSize: 5 }}
            bordered
          />
        </Tabs.TabPane>

        {/* Tab 4: Quản lý đề thi (Trọng tâm) */}
        <Tabs.TabPane tab="4. Tạo & Quản lý Đề thi" key="4">
          <Row gutter={24}>
            {/* Form tạo cấu trúc */}
            <Col span={12}>
              <Card type="inner" title="Thiết lập cấu trúc & Tạo đề tự động">
                <Form form={form} layout="vertical" onFinish={handleGenerateExam} initialValues={{ subjectId: 's2' }}>
                  <Form.Item name="subjectId" label="Chọn môn học" rules={[{ required: true }]}>
                    <Select options={subjects.map(s => ({ value: s.id, label: s.name }))} />
                  </Form.Item>
                  <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Nhập tên đề thi' }]}>
                    <Input placeholder="VD: Đề thi giữa kỳ OOP" />
                  </Form.Item>

                  {/* Sử dụng Form.List của Antd để người dùng tự thêm cấu trúc linh hoạt */}
                  <Form.List name="rules">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item {...restField} name={[name, 'blockId']} rules={[{ required: true, message: 'Chọn khối' }]}>
                              <Select placeholder="Khối kiến thức" style={{ width: 130 }} options={blocks.map(b => ({ value: b.id, label: b.name }))} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'difficulty']} rules={[{ required: true, message: 'Chọn độ khó' }]}>
                              <Select placeholder="Độ khó" style={{ width: 120 }}>
                                <Select.Option value="Dễ">Dễ</Select.Option>
                                <Select.Option value="Trung bình">Trung bình</Select.Option>
                                <Select.Option value="Khó">Khó</Select.Option>
                                <Select.Option value="Rất khó">Rất khó</Select.Option>
                              </Select>
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'count']} rules={[{ required: true, message: 'Nhập SL' }]}>
                              <InputNumber placeholder="SL" min={1} style={{ width: 70 }} />
                            </Form.Item>
                            <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Thêm quy tắc vào cấu trúc đề
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Button type="primary" htmlType="submit" size="large" block>
                    Tiến Hành Tạo Đề Thi
                  </Button>
                </Form>
              </Card>
            </Col>

            {/* Hiển thị danh sách đề đã tạo */}
            <Col span={12}>
              <Card type="inner" title="Danh sách đề thi đã lưu trữ">
                <Table 
                  columns={examColumns} 
                  dataSource={exams} 
                  rowKey="id" 
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: 'Chưa có đề thi nào được tạo' }}
                  bordered
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

      </Tabs>
    </Card>
  );
};

export default StudyManagement;