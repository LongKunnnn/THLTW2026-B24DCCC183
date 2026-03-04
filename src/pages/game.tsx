import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message } from 'antd';

const { Title, Text, Paragraph } = Typography;

const Bai1: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  
  const [feedback, setFeedback] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  const initGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts(0);
    setFeedback('');
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleGuess = () => {
    if (gameOver) return;
    
    const numGuess = parseInt(guess, 10);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      message.warning('Vui lòng nhập một số hợp lệ từ 1 đến 100!');
      return;
    }

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    if (numGuess === targetNumber) {
      setFeedback('Chúc mừng! Bạn đã đoán đúng!');
      setGameOver(true);
    } else if (currentAttempts >= 10) {
      // Đảm bảo thông báo hiển thị đúng y chang đề bài yêu cầu
      setFeedback(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
      setGameOver(true);
    } else if (numGuess < targetNumber) {
      setFeedback('Bạn đoán quá thấp!');
    } else {
      setFeedback('Bạn đoán quá cao!');
    }
    setGuess('');
  };

  return (
    <Card title="Bài 1: Trò Chơi Đoán Số" style={{ maxWidth: 450, margin: '50px auto' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        
        {/* Đã bổ sung hiển thị luật chơi theo đúng yêu cầu */}
        <Paragraph>
          Hệ thống đã sinh ra một số ngẫu nhiên từ 1 đến 100.<br/>
          Người chơi có 10 lượt dự đoán mỗi lượt chơi, trong từng lượt, người chơi sẽ nhập số mà họ dự đoán.
        </Paragraph>
        
        <Text strong>Số lượt đã đoán: {attempts} / 10</Text>
        
        <Input 
          type="number"
          placeholder="Nhập số dự đoán của bạn..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onPressEnter={handleGuess}
          disabled={gameOver}
        />
        
        <Button type="primary" onClick={handleGuess} disabled={gameOver} block>
          Đoán
        </Button>
        
        {/* Phần hiển thị thông báo phản hồi */}
        {feedback && (
          <Title level={5} type={feedback.includes('Chúc mừng') ? 'success' : feedback.includes('hết lượt') ? 'danger' : 'warning'}>
            {feedback}
          </Title>
        )}
        
        {gameOver && <Button onClick={initGame} block>Chơi lại</Button>}
      </Space>
    </Card>
  );
};

export default Bai1;