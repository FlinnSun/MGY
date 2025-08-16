import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Timeline, 
  Progress,
  Alert,
  Typography,
  Divider,
  Tag,
  Spin
} from 'antd';
import {
  ReadOutlined,
  CheckSquareOutlined,
  HeartOutlined,
  MoonOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BookOutlined,
  SmileOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    readingTime: 0,
    moodAverage: 0,
    weeklyGoal: 0,
    streak: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  const quotes = [
    '每一次努力都是进步的开始！',
    '相信自己，你比想象中更强大！',
    '今天的小进步，明天的大成就！',
    '专注当下，享受学习的过程！',
    '你的坚持会带来意想不到的收获！'
  ];

  useEffect(() => {
    // 设置励志语录
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 模拟数据加载
      setTimeout(() => {
        setStats({
          totalTasks: 12,
          completedTasks: 8,
          readingTime: 45,
          moodAverage: 4.2,
          weeklyGoal: 75,
          streak: 5
        });
        
        setRecentActivities([
          {
            time: '2小时前',
            action: '完成了阅读任务《科学小故事》',
            type: 'reading'
          },
          {
            time: '4小时前',
            action: '记录了今日情绪状态',
            type: 'mood'
          },
          {
            time: '昨天',
            action: '完成了3个学习任务',
            type: 'task'
          },
          {
            time: '昨天',
            action: '睡眠质量评分：4分',
            type: 'sleep'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: '开始阅读',
      description: '使用阅读助手提升理解效率',
      icon: <ReadOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      action: () => navigate('/reading'),
      color: '#e6f7ff'
    },
    {
      title: '管理任务',
      description: '查看和管理今日待办事项',
      icon: <CheckSquareOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      action: () => navigate('/tasks'),
      color: '#f6ffed'
    },
    {
      title: '记录情绪',
      description: '记录当前情绪状态',
      icon: <HeartOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
      action: () => navigate('/mood'),
      color: '#fff0f6'
    },
    {
      title: '睡眠助手',
      description: '改善睡眠质量',
      icon: <MoonOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      action: () => navigate('/sleep'),
      color: '#f9f0ff'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOutlined style={{ color: '#1890ff' }} />;
      case 'mood': return <SmileOutlined style={{ color: '#eb2f96' }} />;
      case 'task': return <CheckSquareOutlined style={{ color: '#52c41a' }} />;
      case 'sleep': return <MoonOutlined style={{ color: '#722ed1' }} />;
      default: return <ClockCircleOutlined />;
    }
  };

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Paragraph>正在加载您的学习数据...</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24, textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, color: 'white' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
          欢迎回来！
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, margin: 0 }}>
          {motivationalQuote}
        </Paragraph>
      </div>

      <Alert
        message="今日提醒"
        description="记得按时完成阅读任务，保持良好的学习节奏。如果感到疲劳，可以使用睡眠助手功能。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="今日任务完成率"
              value={completionRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: completionRate >= 80 ? '#3f8600' : '#cf1322' }}
            />
            <Progress 
              percent={completionRate} 
              size="small" 
              style={{ marginTop: 8 }}
              strokeColor={completionRate >= 80 ? '#52c41a' : '#faad14'}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {stats.completedTasks}/{stats.totalTasks} 个任务
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="今日阅读时间"
              value={stats.readingTime}
              suffix="分钟"
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">目标: 60分钟</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="连续打卡"
              value={stats.streak}
              suffix="天"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="orange">保持势头！</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="本周目标"
              value={stats.weeklyGoal}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={stats.weeklyGoal} 
              size="small" 
              showInfo={false}
              strokeColor="#722ed1"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 快速操作 */}
        <Col xs={24} lg={16}>
          <Card title="快速操作" style={{ height: '100%' }}>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card 
                    className="hover-card"
                    style={{ 
                      backgroundColor: action.color,
                      border: 'none',
                      height: 120
                    }}
                    styles={{ 
                      body: {
                        padding: 16,
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                    onClick={action.action}
                  >
                    <div style={{ marginRight: 16 }}>
                      {action.icon}
                    </div>
                    <div>
                      <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                        {action.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {action.description}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={8}>
          <Card title="最近活动" style={{ height: '100%' }}>
            <Timeline
              items={recentActivities.map((activity, index) => ({
                key: index,
                dot: getActivityIcon(activity.type),
                children: (
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      {activity.action}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 励志语句 */}
      <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          "每一次小小的进步，都是通向成功的重要一步！"
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
          继续保持，你正在变得更好！
        </Paragraph>
      </Card>
    </div>
  );
}

export default HomePage;