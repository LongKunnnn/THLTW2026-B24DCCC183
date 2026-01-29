import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { useModel } from 'umi';

const Dashboard = () => {
  const { products, orders } = useModel('useStore');

  const totalStockVal = products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
  const revenue = orders.filter((o: any) => o.status === 'Hoàn thành').reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Tổng sản phẩm" value={products.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="Giá trị tồn kho" value={totalStockVal} suffix="đ" /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng đơn hàng" value={orders.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="Doanh thu" value={revenue} valueStyle={{ color: '#3f8600' }} suffix="đ" /></Card></Col>
      </Row>
    </div>
  );
};

export default Dashboard;