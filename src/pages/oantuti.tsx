import React, { useState } from 'react';
import { Card, Button, Typography, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

type Choice = 'Kéo' | 'Búa' | 'Bao';
type GameResult = 'Thắng' | 'Thua' | 'Hòa';

interface HistoryRecord {
  key: number; // Thuộc tính key bắt buộc khi dùng Table của Ant Design
  round: number;
  playerChoice: Choice;
  computerChoice: Choice;
  result: GameResult;
}

const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];

const RockPaperScissors: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [round, setRound] = useState<number>(1);

  const determineWinner = (player: Choice, computer: Choice): GameResult => {
    if (player === computer) return 'Hòa';
    if (
      (player === 'Kéo' && computer === 'Bao') ||
      (player === 'Búa' && computer === 'Kéo') ||
      (player === 'Bao' && computer === 'Búa')
    ) {
      return 'Thắng';
    }
    return 'Thua';
  };

  const handlePlay = (playerChoice: Choice) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = determineWinner(playerChoice, computerChoice);

    const newRecord: HistoryRecord = {
      key: round,
      round,
      playerChoice,
      computerChoice,
      result,
    };

    // Thêm kết quả mới vào đầu mảng lịch sử
    setHistory([newRecord, ...history]);
    setRound(round + 1);
  };

  // Cấu hình các cột cho Table Ant Design
  const columns: ColumnsType<HistoryRecord> = [
    { title: 'Ván', dataIndex: 'round', key: 'round', align: 'center' },
    { 
      title: 'Bạn chọn', 
      dataIndex: 'playerChoice', 
      key: 'playerChoice', 
      align: 'center', 
      render: (text) => <Text strong>{text}</Text> 
    },
    { title: 'Máy chọn', dataIndex: 'computerChoice', key: 'computerChoice', align: 'center' },
    { 
      title: 'Kết quả', 
      dataIndex: 'result', 
      key: 'result', 
      align: 'center',
      render: (result: GameResult) => {
        let color = result === 'Thắng' ? 'success' : result === 'Thua' ? 'error' : 'default';
        return <Tag color={color}>{result}</Tag>;
      }
    },
  ];

  return (
    <Card 
      title={<Title level={3} style={{ textAlign: 'center', margin: 0 }}>Trò Chơi Oẳn Tù Tì</Title>} 
      style={{ maxWidth: 600, margin: '50px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        <Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
          Hãy chọn <Text strong>Kéo, Búa, hoặc Bao</Text> để phân thắng bại với máy tính!
        </Paragraph>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {choices.map((choice) => (
            <Button 
              key={choice} 
              type="primary" 
              size="large"
              shape="round"
              onClick={() => handlePlay(choice)}
            >
              Chọn {choice}
            </Button>
          ))}
        </div>

        {/* Hiển thị kết quả ván vừa chơi */}
        {history.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <Title 
              level={4} 
              type={history[0].result === 'Thắng' ? 'success' : history[0].result === 'Thua' ? 'danger' : 'warning'}
              style={{ marginTop: 0 }}
            >
              Kết quả ván {history[0].round}: Bạn {history[0].result}!
            </Title>
            <Text style={{ fontSize: '16px' }}>
              Bạn chọn <Tag color="blue" style={{ margin: '0 5px' }}>{history[0].playerChoice}</Tag> 
              vs Máy chọn <Tag style={{ margin: '0 5px' }}>{history[0].computerChoice}</Tag>
            </Text>
          </div>
        )}

        {/* Bảng lịch sử đấu */}
        {history.length > 0 && (
          <Table 
            columns={columns} 
            dataSource={history} 
            pagination={{ pageSize: 5 }} 
            bordered
            size="middle"
          />
        )}

      </Space>
    </Card>
  );
};

export default RockPaperScissors; // Đã chốt hạ export default ở đây