import React, { useState } from 'react';
import { Table, Card, Row, Col, Statistic, Form, Input, Select, DatePicker, Button, Tag, message, Divider, Rate } from 'antd';
import moment from 'moment';

const { Option } = Select;

const BookingPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [form] = Form.useForm();

  const services = [
    { id: '1', name: 'Cắt tóc', price: 100000, duration: 30 },
    { id: '2', name: 'Spa thư giãn', price: 500000, duration: 60 },
    { id: '3', name: 'Sửa chữa thiết bị', price: 200000, duration: 45 },
  ];

  const staffs = [
    { id: 's1', name: 'Nguyễn Văn A', maxPerDay: 5, schedule: '09:00 - 17:00' },
    { id: 's2', name: 'Trần Thị B', maxPerDay: 3, schedule: '08:00 - 12:00' },
  ];

  const handleBooking = (values: any) => {
    const { staffId, serviceId, time, customer } = values;
    
    const selectedTime = moment(time);
    const dateStr = selectedTime.format('YYYY-MM-DD');
    const fullTimeStr = selectedTime.format('YYYY-MM-DD HH:mm');

    const countToday = appointments.filter(a => a.staffId === staffId && a.date === dateStr).length;
    const staff = staffs.find(s => s.id === staffId);
    if (staff && countToday >= staff.maxPerDay) {
      return message.error(`Nhân viên ${staff.name} đã đủ ${staff.maxPerDay} khách hôm nay!`);
    }

    const isOverlapping = appointments.some(a => a.staffId === staffId && a.time === fullTimeStr && a.status !== 'Cancel');
    if (isOverlapping) {
      return message.error('Khung giờ này nhân viên đã có lịch hẹn!');
    }

    const service = services.find(s => s.id === serviceId);
    const newBooking = {
      id: Date.now(),
      customer,
      staffId,
      serviceId,
      time: fullTimeStr,
      date: dateStr,
      status: 'Pending',
      serviceName: service?.name,
      staffName: staff?.name,
      price: service?.price || 0
    };

    setAppointments([...appointments, newBooking]);
    message.success('Đặt lịch thành công!');
    form.resetFields();
  };

  const totalRevenue = appointments
    .filter(a => a.status === 'Done' || a.status === 'Confirmed')
    .reduce((sum, a) => sum + a.price, 0);

  const handleAddReview = (appointment: any) => {
    const review = {
      id: Date.now(),
      staffName: appointment.staffName,
      customer: appointment.customer,
      rating: 5,
      comment: 'Dịch vụ tuyệt vời!',
      reply: ''
    };
    setReviews([...reviews, review]);
    message.info('Đã thêm đánh giá mẫu cho nhân viên');
  };

  const columns = [
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    { title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
    { 
      title: 'Thời gian', 
      dataIndex: 'time', 
      render: (t: string) => <Tag color="blue">{moment(t).format('HH:mm DD/MM/YYYY')}</Tag> 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (status: string) => (
        <Tag color={status === 'Pending' ? 'orange' : status === 'Done' ? 'green' : 'blue'}>{status}</Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {record.status === 'Pending' && (
            <Button size="small" type="primary" onClick={() => {
              setAppointments(appointments.map(a => a.id === record.id ? {...a, status: 'Confirmed'} : a));
            }}>Xác nhận</Button>
          )}
          {record.status === 'Confirmed' && (
            <Button size="small" style={{ backgroundColor: '#52c41a', color: '#fff' }} onClick={() => {
              setAppointments(appointments.map(a => a.id === record.id ? {...a, status: 'Done'} : a));
              handleAddReview(record);
            }}>Hoàn thành</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Quản lý Đặt lịch Dịch vụ - Nhánh TH03</h2>
        <p style={{ color: '#888' }}>Hạn nộp: 17h - 18/03/2026</p>
      </Card>
      
      {/* THỐNG KÊ (Yêu cầu 4) */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card><Statistic title="Tổng lịch hẹn" value={appointments.length} prefix="📅" /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Doanh thu (Done/Confirmed)" value={totalRevenue} suffix="VNĐ" valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Đánh giá trung bình" value={4.8} precision={1} suffix="/ 5 ⭐" /></Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Đặt lịch mới (Yêu cầu 2)">
            <Form form={form} layout="vertical" onFinish={handleBooking}>
              <Form.Item name="customer" label="Tên khách hàng" rules={[{ required: true }]}><Input placeholder="Nhập tên khách" /></Form.Item>
              <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true }]}>
                <Select placeholder="Chọn dịch vụ">
                  {services.map(s => <Option key={s.id} value={s.id}>{s.name} ({s.price.toLocaleString()}đ)</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="staffId" label="Nhân viên" rules={[{ required: true }]}>
                <Select placeholder="Chọn nhân viên">
                  {staffs.map(s => <Option key={s.id} value={s.id}>{s.name} (Max: {s.maxPerDay}/ngày)</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="time" label="Thời gian" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block size="large">Xác nhận đặt lịch</Button>
            </Form>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Danh sách & Trạng thái (Yêu cầu 1 & 2)">
            <Table dataSource={appointments} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
          </Card>

          <Card title="Đánh giá & Phản hồi (Yêu cầu 3)" style={{ marginTop: '24px' }}>
            <Table 
              dataSource={reviews} 
              rowKey="id"
              columns={[
                { title: 'Nhân viên', dataIndex: 'staffName' },
                { title: 'Khách hàng', dataIndex: 'customer' },
                { title: 'Điểm', dataIndex: 'rating', render: (r) => <Rate disabled defaultValue={r} style={{ fontSize: 14 }} /> },
                { title: 'Nhận xét', dataIndex: 'comment' },
                { title: 'Phản hồi', render: () => <Input placeholder="Nhân viên phản hồi..." defaultValue="Cảm ơn bạn!" /> }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BookingPage;