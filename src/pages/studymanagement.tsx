import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Space, Popconfirm, message } from 'antd';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

// --- Định nghĩa Kiểu dữ liệu ---
interface Subject { id: string; name: string; }
interface StudyLog { id: string; subjectId: string; date: string; duration: number; content: string; note: string; }
interface Goal { id: string; subjectId: string; month: string; targetDuration: number; }

const Bai2: React.FC = () => {
  // --- States ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // States cho tính năng Sửa
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);

  // Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Forms
  const [subjectForm] = Form.useForm();
  const [logForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  // --- LocalStorage Logic ---
  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    const savedLogs = localStorage.getItem('logs');
    const savedGoals = localStorage.getItem('goals');

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    else setSubjects([
      { id: '1', name: 'Toán' }, { id: '2', name: 'Văn' }, 
      { id: '3', name: 'Anh' }, { id: '4', name: 'Khoa học' }, { id: '5', name: 'Công nghệ' }
    ]);
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [subjects, logs, goals]);

  // --- Logic Môn Học ---
  const openEditSubject = (record: Subject) => {
    setEditingSubject(record);
    subjectForm.setFieldsValue({ name: record.name });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (values: any) => {
    if (editingSubject) {
      // Cập nhật
      setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: values.name } : s));
      message.success('Đã cập nhật môn học!');
    } else {
      // Thêm mới
      const newSubject = { id: Date.now().toString(), name: values.name };
      setSubjects([...subjects, newSubject]);
      message.success('Đã thêm môn học!');
    }
    handleCloseSubjectModal();
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setLogs(logs.filter(l => l.subjectId !== id)); 
    setGoals(goals.filter(g => g.subjectId !== id)); 
    message.success('Đã xóa môn học!');
  };

  const handleCloseSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    subjectForm.resetFields();
  };

  // --- Logic Tiến Độ ---
  const openEditLog = (record: StudyLog) => {
    setEditingLog(record);
    logForm.setFieldsValue({
      subjectId: record.subjectId,
      date: dayjs(record.date, 'YYYY-MM-DD HH:mm'),
      duration: record.duration,
      content: record.content,
      note: record.note
    });
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (values: any) => {
    const logData = {
      subjectId: values.subjectId,
      date: values.date.format('YYYY-MM-DD HH:mm'),
      duration: values.duration,
      content: values.content,
      note: values.note || ''
    };

    if (editingLog) {
      // Cập nhật
      setLogs(logs.map(l => l.id === editingLog.id ? { ...l, ...logData } : l));
      message.success('Đã cập nhật tiến độ!');
    } else {
      // Thêm mới
      setLogs([...logs, { ...logData, id: Date.now().toString() }]);
      message.success('Đã lưu tiến độ!');
    }
    handleCloseLogModal();
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
    message.success('Đã xóa tiến độ!');
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
    setEditingLog(null);
    logForm.resetFields();
  };

  // --- Logic Mục Tiêu ---
  const handleSaveGoal = (values: any) => {
    const newGoal = {
      id: Date.now().toString(),
      subjectId: values.subjectId,
      month: values.month.format('YYYY-MM'),
      targetDuration: values.targetDuration
    };
    const existingIndex = goals.findIndex(g => g.subjectId === newGoal.subjectId && g.month === newGoal.month);
    if (existingIndex >= 0) {
      const updatedGoals = [...goals];
      updatedGoals[existingIndex] = newGoal;
      setGoals(updatedGoals);
    } else {
      setGoals([...goals, newGoal]);
    }
    setIsGoalModalOpen(false);
    goalForm.resetFields();
    message.success('Đã lưu mục tiêu!');
  };

  const getGoalStatus = (goal: Goal) => {
    const currentMonthLogs = logs.filter(l => l.subjectId === goal.subjectId && l.date.startsWith(goal.month));
    const totalDuration = currentMonthLogs.reduce((sum, log) => sum + log.duration, 0);
    const isAchieved = totalDuration >= goal.targetDuration;
    return { totalDuration, isAchieved };
  };

  return (
    <Card title="Bài 2: Quản Lý Tiến Độ Học Tập" style={{ margin: '20px' }}>
      <Tabs defaultActiveKey="1">
        
        {/* TAB 1: MÔN HỌC */}
        <TabPane tab="Quản lý Môn học" key="1">
          <Button type="primary" onClick={() => setIsSubjectModalOpen(true)} style={{ marginBottom: 16 }}>Thêm Môn Học</Button>
          <Table dataSource={subjects} rowKey="id" pagination={{ pageSize: 5 }}>
            <Table.Column title="Tên Môn" dataIndex="name" key="name" />
            <Table.Column title="Hành động" key="action" render={(_, record: Subject) => (
              <Space>
                <Button type="link" onClick={() => openEditSubject(record)}>Sửa</Button>
                <Popconfirm title="Xóa môn học này?" onConfirm={() => handleDeleteSubject(record.id)}>
                  <Button danger type="link">Xóa</Button>
                </Popconfirm>
              </Space>
            )} />
          </Table>
        </TabPane>

        {/* TAB 2: TIẾN ĐỘ */}
        <TabPane tab="Tiến độ Học tập" key="2">
          <Button type="primary" onClick={() => setIsLogModalOpen(true)} style={{ marginBottom: 16 }}>Thêm Tiến Độ</Button>
          <Table dataSource={logs} rowKey="id" pagination={{ pageSize: 5 }}>
            <Table.Column title="Môn" dataIndex="subjectId" key="subjectId" render={(id) => subjects.find(s => s.id === id)?.name || 'N/A'} />
            <Table.Column title="Thời gian" dataIndex="date" key="date" />
            <Table.Column title="Thời lượng (phút)" dataIndex="duration" key="duration" />
            <Table.Column title="Nội dung" dataIndex="content" key="content" />
            <Table.Column title="Ghi chú" dataIndex="note" key="note" />
            <Table.Column title="Hành động" key="action" render={(_, record: StudyLog) => (
              <Space>
                <Button type="link" onClick={() => openEditLog(record)}>Sửa</Button>
                <Popconfirm title="Xóa tiến độ này?" onConfirm={() => handleDeleteLog(record.id)}>
                  <Button danger type="link">Xóa</Button>
                </Popconfirm>
              </Space>
            )} />
          </Table>
        </TabPane>

        {/* TAB 3: MỤC TIÊU */}
        <TabPane tab="Mục tiêu Hàng tháng" key="3">
          <Button type="primary" onClick={() => setIsGoalModalOpen(true)} style={{ marginBottom: 16 }}>Thiết lập Mục tiêu</Button>
          <Table dataSource={goals} rowKey="id" pagination={{ pageSize: 5 }}>
            <Table.Column title="Môn" dataIndex="subjectId" key="subjectId" render={(id) => subjects.find(s => s.id === id)?.name || 'N/A'} />
            <Table.Column title="Tháng" dataIndex="month" key="month" />
            <Table.Column title="Mục tiêu (phút)" dataIndex="targetDuration" key="targetDuration" />
            <Table.Column title="Đã học (phút)" key="current" render={(_, record: Goal) => getGoalStatus(record).totalDuration} />
            <Table.Column title="Trạng thái" key="status" render={(_, record: Goal) => {
              const { isAchieved } = getGoalStatus(record);
              return <Tag color={isAchieved ? 'green' : 'volcano'}>{isAchieved ? 'Đã Đạt' : 'Chưa Đạt'}</Tag>;
            }} />
          </Table>
        </TabPane>

      </Tabs>

      {/* --- CÁC MODALS --- */}
      <Modal 
        title={editingSubject ? "Sửa Môn Học" : "Thêm Môn Học"} 
        visible={isSubjectModalOpen} 
        onCancel={handleCloseSubjectModal} 
        onOk={() => subjectForm.submit()}
      >
        <Form form={subjectForm} onFinish={handleSaveSubject} layout="vertical">
          <Form.Item name="name" label="Tên môn học" rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}>
            <Input placeholder="VD: Toán, Lập trình Web..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={editingLog ? "Sửa Tiến Độ Học Tập" : "Thêm Tiến Độ Học Tập"} 
        visible={isLogModalOpen} 
        onCancel={handleCloseLogModal} 
        onOk={() => logForm.submit()}
      >
        <Form form={logForm} onFinish={handleSaveLog} layout="vertical">
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Chọn môn học!' }]}>
            <Select options={subjects.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="date" label="Thời gian học" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung đã học" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title="Thiết lập Mục tiêu Hàng tháng" 
        visible={isGoalModalOpen} 
        onCancel={() => setIsGoalModalOpen(false)} 
        onOk={() => goalForm.submit()}
      >
        <Form form={goalForm} onFinish={handleSaveGoal} layout="vertical">
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
            <Select options={subjects.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="month" label="Chọn tháng" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetDuration" label="Mục tiêu thời gian (phút)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Bai2;